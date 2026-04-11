#!/usr/bin/env python3
"""
upload_audio.py — Push generated MP3s to an S3-compatible bucket (Cloudflare R2).

The blog's narrated audio grows unbounded as posts are added. Cloudflare R2
gives us public object storage with **zero egress charges**, which keeps the
git repository small (only JSON sidecars stay in-tree) and sidesteps the
1 GB GitHub Pages deploy cap.

This script is idempotent: it compares each local MP3's MD5 against the
remote object's ETag and uploads only what changed. Safe to re-run after
every `generate_blog_audio.py` call.

Configuration (environment variables, typically loaded from front/.env.local):

    R2_ACCOUNT_ID          Cloudflare account ID (S3 endpoint host prefix)
    R2_ACCESS_KEY_ID       API token access key
    R2_SECRET_ACCESS_KEY   API token secret
    R2_BUCKET              Bucket name

If any of those are missing, `has_credentials()` returns False and callers
(notably `sync.py`) should skip the upload step with a warning instead of
failing — local development without an R2 account still works end-to-end.

Usage:
    python scripts/upload_audio.py              # upload both EN and ES
    python scripts/upload_audio.py --lang en    # single language
    python scripts/upload_audio.py --dry-run    # list what would upload
"""
from __future__ import annotations

import argparse
import hashlib
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
FRONT_DIR = SCRIPT_DIR.parent
AUDIO_SOURCES = {
    "en": (FRONT_DIR / "public" / "blog" / "audio", "audio"),
    "es": (FRONT_DIR / "public" / "blog" / "audio-es", "audio-es"),
}

REQUIRED_VARS = ("R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET")


def load_dotenv_if_present() -> None:
    """Load front/.env.local into os.environ if python-dotenv is installed."""
    env_path = FRONT_DIR / ".env.local"
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(env_path, override=False)


def has_credentials() -> bool:
    load_dotenv_if_present()
    return all(os.environ.get(v) for v in REQUIRED_VARS)


def _make_client():
    import boto3  # lazy import — only needed when actually uploading

    account_id = os.environ["R2_ACCOUNT_ID"]
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
    )


def _md5_hex(path: Path) -> str:
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def upload_lang(
    lang: str,
    *,
    dry_run: bool = False,
    verbose: bool = True,
) -> tuple[int, int]:
    """Upload all MP3s for one language. Returns (uploaded, skipped)."""
    src_dir, key_prefix = AUDIO_SOURCES[lang]
    if not src_dir.exists():
        if verbose:
            print(f"  {lang}: no source directory ({src_dir}) — nothing to upload")
        return 0, 0

    mp3s = sorted(src_dir.rglob("*.mp3"))
    if not mp3s:
        if verbose:
            print(f"  {lang}: 0 mp3 files")
        return 0, 0

    client = None if dry_run else _make_client()
    bucket = os.environ["R2_BUCKET"]
    uploaded = 0
    skipped = 0

    for mp3 in mp3s:
        rel = mp3.relative_to(src_dir).as_posix()
        key = f"{key_prefix}/{rel}"
        local_md5 = _md5_hex(mp3)

        if client is not None:
            try:
                head = client.head_object(Bucket=bucket, Key=key)
                remote_etag = head.get("ETag", "").strip('"')
                if remote_etag == local_md5:
                    skipped += 1
                    continue
            except client.exceptions.ClientError as e:
                code = e.response.get("Error", {}).get("Code", "")
                if code not in ("404", "NoSuchKey", "NotFound"):
                    raise

        if dry_run:
            print(f"  WOULD UPLOAD {key} ({mp3.stat().st_size // 1024} KB)")
            uploaded += 1
            continue

        if verbose:
            print(f"  uploading {key}")
        with mp3.open("rb") as f:
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=f,
                ContentType="audio/mpeg",
                CacheControl="public, max-age=31536000, immutable",
            )
        uploaded += 1

    if verbose:
        print(f"  {lang}: {uploaded} uploaded, {skipped} skipped (already current)")
    return uploaded, skipped


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--lang", choices=("en", "es"), help="Only upload one language")
    p.add_argument("--dry-run", action="store_true", help="Preview without uploading")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    load_dotenv_if_present()

    if not has_credentials():
        missing = [v for v in REQUIRED_VARS if not os.environ.get(v)]
        print(f"ERROR: missing env vars: {', '.join(missing)}", file=sys.stderr)
        print(
            "       add them to front/.env.local (see scripts/README.md § R2 setup)",
            file=sys.stderr,
        )
        return 1

    langs = [args.lang] if args.lang else ["en", "es"]
    total_up = 0
    total_skip = 0
    for lang in langs:
        print(f"\n[{lang}] uploading to R2 bucket '{os.environ['R2_BUCKET']}'")
        up, sk = upload_lang(lang, dry_run=args.dry_run)
        total_up += up
        total_skip += sk

    print(f"\nOK: {total_up} uploaded, {total_skip} skipped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
