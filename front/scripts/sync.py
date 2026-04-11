#!/usr/bin/env python3
"""
sync.py — Blog content consistency orchestrator.

One entry point that keeps every moving part of the blog pipeline aligned:
deletes orphan audio left behind by renames or category moves, validates
Mermaid diagrams, optimizes new images, regenerates narration audio
(EN + ES), and rebuilds the blog data manifest — all with a hash-aware
incremental core so re-runs are cheap.

Usage (from front/ or via npm):
    npm run sync                 # full pipeline
    npm run sync:fast            # skip Spanish audio (quick text iteration)
    npm run sync:check           # validate only; no side effects; used in CI
    python scripts/sync.py --only <slug>
    python scripts/sync.py --force
    python scripts/sync.py --dry-run
    python scripts/sync.py --skip-upload  # skip R2 upload (offline runs)

Exit codes:
    0 — all steps succeeded
    1 — content is inconsistent (--check) or a required step failed
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
FRONT_DIR = SCRIPT_DIR.parent
POSTS_DIR = FRONT_DIR / "public" / "blog" / "posts"
AUDIO_DIRS = {
    "en": FRONT_DIR / "public" / "blog" / "audio",
    "es": FRONT_DIR / "public" / "blog" / "audio-es",
}
MANIFEST_NAMES = {"manifest.json", "manifest-es.json"}


# ---------- pretty output ----------

def step(n: int, total: int, msg: str) -> None:
    print(f"\n[{n}/{total}] {msg}")


def info(msg: str) -> None:
    print(f"  {msg}")


def warn(msg: str) -> None:
    print(f"  WARN: {msg}")


def fail(msg: str) -> None:
    print(f"  FAIL: {msg}", file=sys.stderr)


# ---------- subprocess helper ----------

def run(cmd: list[str], *, cwd: Path = FRONT_DIR, check: bool = True) -> int:
    info(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=str(cwd))
    if check and result.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(cmd)}")
    return result.returncode


# ---------- step 1: discover posts ----------

def discover_posts() -> set[tuple[str, str]]:
    """Return {(category, slug)} for every markdown post."""
    if not POSTS_DIR.exists():
        return set()
    return {(md.parent.name, md.stem) for md in POSTS_DIR.rglob("*.md")}


# ---------- step 2: orphan audio cleanup ----------

def _slug_from_audio_file(path: Path) -> str | None:
    name = path.name
    for suffix in (".narration.json", ".mp3", ".json"):
        if name.endswith(suffix):
            return name[: -len(suffix)]
    return None


def find_orphans(canonical: set[tuple[str, str]]) -> list[Path]:
    orphans: list[Path] = []
    for root in AUDIO_DIRS.values():
        if not root.exists():
            continue
        for f in root.rglob("*"):
            if not f.is_file() or f.name in MANIFEST_NAMES:
                continue
            slug = _slug_from_audio_file(f)
            if slug is None:
                continue
            category = f.parent.name
            if (category, slug) not in canonical:
                orphans.append(f)
    return orphans


# ---------- step 3: mermaid validation ----------

def validate_mermaid() -> None:
    run(["node", "scripts/validate-mermaid.js"])


# ---------- step 4: image optimization ----------

def optimize_images() -> None:
    # Tolerate non-zero: optimizer emits warnings that shouldn't block content sync.
    rc = run(["node", "scripts/optimize-images.js"], check=False)
    if rc != 0:
        warn(f"optimize-images exited {rc}; continuing")


# ---------- step 5 & 6: audio generation ----------

def generate_audio(lang: str, extra: list[str]) -> None:
    cmd = [sys.executable, "-u", "scripts/generate_blog_audio.py", "--lang", lang, *extra]
    run(cmd)


def _spawn_detached(cmd: list[str], log_path: Path) -> subprocess.Popen:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    stdout = open(log_path, "ab")
    kwargs: dict = {"stdout": stdout, "stderr": subprocess.STDOUT}
    if os.name == "nt":
        kwargs["creationflags"] = (
            subprocess.DETACHED_PROCESS  # type: ignore[attr-defined]
            | subprocess.CREATE_NEW_PROCESS_GROUP  # type: ignore[attr-defined]
        )
    else:
        kwargs["start_new_session"] = True
    return subprocess.Popen(cmd, **kwargs)


def ensure_ollama() -> bool:
    """Return True iff Ollama is reachable (starting it if needed)."""
    sys.path.insert(0, str(SCRIPT_DIR))
    from translate_ollama import ping_ollama, wait_for_ollama

    if ping_ollama():
        info("ollama already running")
        return True
    ollama_bin = shutil.which("ollama")
    if not ollama_bin:
        warn("ollama binary not on PATH — skipping Spanish audio")
        return False
    info("starting ollama serve...")
    log = SCRIPT_DIR / "audio-experiments" / "ollama.log"
    try:
        _spawn_detached([ollama_bin, "serve"], log)
    except OSError as e:
        warn(f"failed to launch ollama: {e}")
        return False
    if wait_for_ollama(30):
        info("ollama ready")
        return True
    warn("ollama did not become ready in 30s — skipping Spanish audio")
    return False


# ---------- step 7: upload audio to R2 ----------

def upload_audio_to_r2() -> bool:
    """Return True if the upload ran, False if skipped (no credentials)."""
    sys.path.insert(0, str(SCRIPT_DIR))
    import upload_audio  # noqa: E402

    if not upload_audio.has_credentials():
        warn("R2 credentials not configured — skipping upload (see scripts/README.md)")
        return False
    for lang in ("en", "es"):
        upload_audio.upload_lang(lang, verbose=True)
    return True


# ---------- step 8: blog data ----------

def build_blog_data() -> None:
    run(["node", "scripts/build-blog-data.js"])


# ---------- main ----------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Blog content consistency orchestrator.")
    p.add_argument("--fast", action="store_true", help="Skip Spanish audio generation")
    p.add_argument(
        "--check",
        action="store_true",
        help="Validate content only; no side effects. Exits 1 on inconsistency.",
    )
    p.add_argument("--dry-run", action="store_true", help="Preview actions without changing files")
    p.add_argument("--only", help="Scope audio regeneration to a single post slug")
    p.add_argument("--force", action="store_true", help="Bypass the audio hash cache")
    p.add_argument(
        "--skip-upload",
        action="store_true",
        help="Skip uploading audio to R2 even if credentials are configured",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    total = 3 if args.check else 8

    step(1, total, "discovering posts")
    canonical = discover_posts()
    info(f"{len(canonical)} post(s) found")

    step(2, total, "scanning for orphan audio files")
    orphans = find_orphans(canonical)
    if orphans:
        info(f"{len(orphans)} orphan(s):")
        for f in orphans:
            info(f"  - {f.relative_to(FRONT_DIR)}")
        if args.check:
            fail("orphan audio present; run `npm run sync` to clean")
            return 1
        if args.dry_run:
            info("(dry-run: not deleting)")
        else:
            for f in orphans:
                f.unlink()
            info(f"deleted {len(orphans)} orphan file(s)")
    else:
        info("none")

    step(3, total, "validating Mermaid diagrams")
    validate_mermaid()

    if args.check:
        print("\nOK: content is consistent")
        return 0

    audio_extra: list[str] = []
    if args.only:
        audio_extra += ["--only", args.only]
    if args.force:
        audio_extra += ["--force"]

    step(4, total, "optimizing images")
    if args.dry_run:
        info("(dry-run)")
    else:
        optimize_images()

    step(5, total, "generating English audio narration")
    if args.dry_run:
        info("(dry-run)")
    else:
        generate_audio("en", audio_extra)

    if args.fast:
        step(6, total, "skipping Spanish audio (--fast)")
    else:
        step(6, total, "generating Spanish audio narration")
        if args.dry_run:
            info("(dry-run)")
        elif ensure_ollama():
            generate_audio("es", audio_extra)

    step(7, total, "uploading audio to R2")
    if args.dry_run or args.skip_upload:
        info("(skipped)")
    else:
        upload_audio_to_r2()

    step(8, total, "rebuilding blog data manifest")
    if args.dry_run:
        info("(dry-run)")
    else:
        build_blog_data()

    print("\nOK: sync complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
