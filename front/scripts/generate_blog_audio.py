"""
Generate narrated MP3 audio for every blog post in front/public/blog/posts/.

Supports two languages via --lang:
  en (default): English narration, voice en-US-AndrewMultilingualNeural,
                output to public/blog/audio/
  es:           Translates the English narration to Spanish via Ollama
                (gemma4 by default), uses es-CO-GonzaloNeural, outputs to
                public/blog/audio-es/.

Pipeline (per post):
  1. Read markdown.
  2. Preprocess -> narration_en (strips code, diagrams, math, tables, etc).
  3. Compute sourceHash = sha256(narration_en).
  4. For lang=es: translate narration_en -> narration_es (cached by sourceHash).
     For lang=en: text = narration_en.
  5. audioHash = sha256(text).
  6. If existing sidecar.hash == audioHash and voice matches: skip (cache hit).
  7. Otherwise: edge-tts(text, voice) -> mp3, probe duration, write sidecar.
  8. Rewrite manifest.json / manifest-es.json with all known records.

The Spanish translation is cached in a sibling .narration.json file so
re-runs don't re-invoke the LLM unless the English source changed.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import sys
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

# Local imports
sys.path.insert(0, str(Path(__file__).parent))
from md_to_speech import markdown_to_narration  # noqa: E402

SCRIPT_DIR = Path(__file__).parent
FRONT_DIR = SCRIPT_DIR.parent
POSTS_DIR = FRONT_DIR / "public" / "blog" / "posts"


@dataclass
class LangConfig:
    lang: str
    voice: str
    audio_dir: Path
    manifest_path: Path
    url_prefix: str  # e.g. "/blog/audio" or "/blog/audio-es"
    translate: bool = False


LANG_CONFIGS: dict[str, LangConfig] = {
    "en": LangConfig(
        lang="en",
        voice="en-US-AndrewMultilingualNeural",
        audio_dir=FRONT_DIR / "public" / "blog" / "audio",
        manifest_path=FRONT_DIR / "public" / "blog" / "audio" / "manifest.json",
        url_prefix="/blog/audio",
        translate=False,
    ),
    "es": LangConfig(
        lang="es",
        voice="es-CO-GonzaloNeural",
        audio_dir=FRONT_DIR / "public" / "blog" / "audio-es",
        manifest_path=FRONT_DIR / "public" / "blog" / "audio-es" / "manifest-es.json",
        url_prefix="/blog/audio-es",
        translate=True,
    ),
}

RATE = "+0%"
PITCH = "+0Hz"


@dataclass
class PostAudio:
    slug: str
    category: str
    lang: str
    voice: str
    hash: str                # hash of the text fed to TTS
    sourceHash: str          # hash of the original English narration
    durationSec: float
    byteSize: int
    narrationWordCount: int
    audioUrl: str
    translationModel: str = ""


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


async def synthesize(text: str, out_path: Path, voice: str) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice, rate=RATE, pitch=PITCH)
    with out_path.open("wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])


def probe_duration(mp3_path: Path) -> float:
    return float(MP3(str(mp3_path)).info.length)


def category_from_md(md_path: Path) -> str:
    return md_path.parent.name


def slug_from_md(md_path: Path) -> str:
    return md_path.stem


def get_or_create_translation(
    narration_en: str,
    source_hash: str,
    out_dir: Path,
    slug: str,
    model: str,
    verbose: bool,
) -> tuple[str, str]:
    """Return (translated_text, model) — cached by source_hash."""
    from translate_ollama import translate_narration  # lazy import (only needed for es)

    cache_path = out_dir / f"{slug}.narration.json"
    cached = load_json(cache_path)
    if cached and cached.get("sourceHash") == source_hash and cached.get("model") == model:
        return cached["text"], model

    if verbose:
        print(f"    translating via ollama ({model})...", flush=True)
    translated = translate_narration(narration_en, model=model, verbose=verbose)
    out_dir.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(
        json.dumps(
            {
                "sourceHash": source_hash,
                "model": model,
                "translatedAt": int(time.time()),
                "text": translated,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return translated, model


async def process_post(
    md_path: Path,
    *,
    cfg: LangConfig,
    translate_model: str,
    force: bool,
    dry_run: bool,
    verbose: bool,
) -> tuple[PostAudio | None, str]:
    category = category_from_md(md_path)
    slug = slug_from_md(md_path)
    md = md_path.read_text(encoding="utf-8")
    narration_en = markdown_to_narration(md)
    source_hash = sha256_text(narration_en)
    out_dir = cfg.audio_dir / category
    mp3_path = out_dir / f"{slug}.mp3"
    sidecar_path = out_dir / f"{slug}.json"

    # Quick skip: if source hash matches existing sidecar AND voice matches, don't
    # even touch translation or TTS.
    existing = load_json(sidecar_path)
    if (
        not force
        and existing is not None
        and existing.get("sourceHash") == source_hash
        and existing.get("voice") == cfg.voice
        and mp3_path.exists()
    ):
        record = PostAudio(
            slug=slug,
            category=category,
            lang=cfg.lang,
            voice=cfg.voice,
            hash=existing.get("hash", source_hash),
            sourceHash=source_hash,
            durationSec=float(existing.get("durationSec", 0.0)),
            byteSize=int(existing.get("byteSize", mp3_path.stat().st_size)),
            narrationWordCount=int(existing.get("narrationWordCount", 0)),
            audioUrl=f"{cfg.url_prefix}/{category}/{slug}.mp3",
            translationModel=existing.get("translationModel", ""),
        )
        return record, "cached"

    if dry_run:
        return None, "would-regenerate"

    if not narration_en.strip():
        return None, "empty-narration"

    # Build the text to synthesize. For Spanish, translate first.
    translation_model = ""
    if cfg.translate:
        text, translation_model = get_or_create_translation(
            narration_en, source_hash, out_dir, slug, translate_model, verbose
        )
    else:
        text = narration_en

    audio_hash = sha256_text(text)
    word_count = len(text.split())

    await synthesize(text, mp3_path, cfg.voice)
    duration = probe_duration(mp3_path)
    size = mp3_path.stat().st_size

    record = PostAudio(
        slug=slug,
        category=category,
        lang=cfg.lang,
        voice=cfg.voice,
        hash=audio_hash,
        sourceHash=source_hash,
        durationSec=duration,
        byteSize=size,
        narrationWordCount=word_count,
        audioUrl=f"{cfg.url_prefix}/{category}/{slug}.mp3",
        translationModel=translation_model,
    )
    sidecar_path.write_text(json.dumps(asdict(record), indent=2), encoding="utf-8")
    return record, "generated"


def format_duration(seconds: float) -> str:
    mins, secs = divmod(int(round(seconds)), 60)
    return f"{mins}:{secs:02d}"


async def main_async(args: argparse.Namespace) -> int:
    cfg = LANG_CONFIGS[args.lang]
    all_md: list[Path] = sorted(POSTS_DIR.rglob("*.md"))

    filtered = [p for p in all_md if not args.only or p.stem == args.only]
    if args.only and not filtered:
        print(f"No post matches --only={args.only!r}", file=sys.stderr)
        return 2
    if args.limit:
        filtered = filtered[: args.limit]
    filter_set = {p.resolve() for p in filtered}

    print(f"Language: {args.lang}  voice: {cfg.voice}")
    print(f"Scanning {len(all_md)} post(s); generation candidates: {len(filtered)}")
    cfg.audio_dir.mkdir(parents=True, exist_ok=True)

    records: list[PostAudio] = []
    stats: dict[str, int] = {}
    total_bytes = 0
    total_seconds = 0.0
    t0 = time.time()

    out_of_filter = [p for p in all_md if p.resolve() not in filter_set]
    in_filter = [p for p in all_md if p.resolve() in filter_set]

    # Load existing sidecars for posts we're not processing this run so the
    # manifest stays complete.
    for md in out_of_filter:
        sidecar = load_json(cfg.audio_dir / md.parent.name / f"{md.stem}.json")
        if sidecar:
            records.append(
                PostAudio(
                    slug=sidecar["slug"],
                    category=sidecar["category"],
                    lang=sidecar.get("lang", cfg.lang),
                    voice=sidecar.get("voice", cfg.voice),
                    hash=sidecar.get("hash", ""),
                    sourceHash=sidecar.get("sourceHash", ""),
                    durationSec=float(sidecar.get("durationSec", 0.0)),
                    byteSize=int(sidecar.get("byteSize", 0)),
                    narrationWordCount=int(sidecar.get("narrationWordCount", 0)),
                    audioUrl=sidecar.get("audioUrl", ""),
                    translationModel=sidecar.get("translationModel", ""),
                )
            )
            stats["cached"] = stats.get("cached", 0) + 1
        else:
            stats["skipped-not-in-filter"] = stats.get("skipped-not-in-filter", 0) + 1

    # Parallel workers over in-filter posts.
    sem = asyncio.Semaphore(args.concurrency)
    total_in = len(in_filter)
    done = 0
    lock = asyncio.Lock()

    async def worker(md: Path) -> None:
        nonlocal done, total_bytes, total_seconds
        async with sem:
            rel = md.relative_to(POSTS_DIR)
            try:
                record, status = await process_post(
                    md,
                    cfg=cfg,
                    translate_model=args.translate_model,
                    force=args.force,
                    dry_run=args.dry_run,
                    verbose=args.verbose,
                )
            except Exception as e:  # noqa: BLE001
                async with lock:
                    done += 1
                    print(f"[{done:3d}/{total_in}] {rel} ... FAILED: {e}")
                return
            async with lock:
                done += 1
                stats[status] = stats.get(status, 0) + 1
                if record is not None:
                    records.append(record)
                    total_bytes += record.byteSize
                    total_seconds += record.durationSec
                    print(
                        f"[{done:3d}/{total_in}] {rel} ... {status} "
                        f"({format_duration(record.durationSec)}, "
                        f"{record.byteSize / 1024:.0f} KB, {record.narrationWordCount} words)"
                    )
                else:
                    print(f"[{done:3d}/{total_in}] {rel} ... {status}")

    # For Spanish, concurrency=1 makes sense because Ollama is single-GPU bound.
    await asyncio.gather(*(worker(md) for md in in_filter))

    elapsed = time.time() - t0

    if not args.dry_run:
        manifest = {
            "lang": cfg.lang,
            "voice": cfg.voice,
            "generatedAt": int(time.time()),
            "posts": {
                f"{r.category}/{r.slug}": asdict(r)
                for r in sorted(records, key=lambda r: (r.category, r.slug))
            },
        }
        cfg.manifest_path.parent.mkdir(parents=True, exist_ok=True)
        cfg.manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print("\n--- Summary ---")
    for k, v in stats.items():
        if v:
            print(f"  {k}: {v}")
    print(f"  total audio: {format_duration(total_seconds)}")
    print(f"  total size:  {total_bytes / (1024 * 1024):.1f} MB")
    print(f"  elapsed:     {elapsed:.1f}s")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lang", choices=["en", "es"], default="en")
    parser.add_argument("--force", action="store_true", help="Regenerate even if hash matches")
    parser.add_argument("--dry-run", action="store_true", help="Report what would change; don't call TTS")
    parser.add_argument("--only", type=str, help="Process only the post with this slug (stem)")
    parser.add_argument("--limit", type=int, help="Process at most N posts")
    parser.add_argument("--concurrency", type=int, default=4, help="Parallel TTS requests (default: 4)")
    parser.add_argument(
        "--translate-model",
        type=str,
        default="gemma4:latest",
        help="Ollama model for Spanish translation",
    )
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    # For Spanish, force lower concurrency since Ollama is the bottleneck.
    if args.lang == "es" and args.concurrency > 1:
        print(f"(--lang es) lowering concurrency {args.concurrency} -> 1 (Ollama is single-GPU)")
        args.concurrency = 1

    sys.exit(asyncio.run(main_async(args)))


if __name__ == "__main__":
    main()
