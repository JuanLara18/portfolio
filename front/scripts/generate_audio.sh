#!/usr/bin/env bash
# One-shot blog audio generator: ensures Ollama is up, then runs EN + ES.
#
# Usage (from anywhere):
#   front/scripts/generate_audio.sh              # incremental, both langs
#   front/scripts/generate_audio.sh --only slug  # single post
#   front/scripts/generate_audio.sh --force      # ignore cache
#
# Extra flags are forwarded to generate_blog_audio.py unchanged.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$SCRIPT_DIR/audio-experiments"
mkdir -p "$LOG_DIR"

OLLAMA_URL_BASE="${OLLAMA_URL_BASE:-http://localhost:11434}"
OLLAMA_LOG="$LOG_DIR/ollama.log"

ping_ollama() {
  curl -sf --max-time 3 "$OLLAMA_URL_BASE/api/tags" > /dev/null 2>&1
}

ensure_ollama() {
  if ping_ollama; then
    echo "[ollama] already running"
    return 0
  fi
  if ! command -v ollama > /dev/null 2>&1; then
    echo "[ollama] ERROR: 'ollama' binary not on PATH" >&2
    exit 1
  fi
  echo "[ollama] starting..."
  nohup ollama serve > "$OLLAMA_LOG" 2>&1 &
  disown || true
  for i in $(seq 1 30); do
    if ping_ollama; then
      echo "[ollama] ready after ${i}s"
      return 0
    fi
    sleep 1
  done
  echo "[ollama] ERROR: did not become ready in 30s. See $OLLAMA_LOG" >&2
  exit 1
}

run_lang() {
  local lang="$1"; shift
  echo "[gen] --lang $lang $*"
  (cd "$FRONT_DIR" && python -u scripts/generate_blog_audio.py --lang "$lang" "$@")
}

ensure_ollama
run_lang en "$@"
run_lang es "$@"
echo "[done] blog audio generated"
