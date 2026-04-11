"""
Markdown -> narration text preprocessor (experimental).

Goal: turn a blog post's markdown into clean, narratable English text that
a TTS engine can read naturally. We DO NOT try to read code, diagrams,
tables, or raw LaTeX. We replace those with short spoken placeholders so
the listener knows something was skipped.

This is a prototype for the audio feature. Refine the heuristics as we
see real output.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path


# --- Section-level strippers ---------------------------------------------

FENCED_BLOCK_RE = re.compile(r"^```([a-zA-Z0-9_-]*)\s*\n(.*?)\n```", re.DOTALL | re.MULTILINE)
DISPLAY_MATH_RE = re.compile(r"\$\$(.+?)\$\$", re.DOTALL)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
FRONTMATTER_RE = re.compile(r"\A---\n.*?\n---\n", re.DOTALL)
TABLE_BLOCK_RE = re.compile(r"(?:^\|.*\|\s*\n)+", re.MULTILINE)
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\([^)]*\)")
HEADER_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*$", re.MULTILINE)
LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
INLINE_MATH_RE = re.compile(r"\$([^$\n]+)\$")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
ITAL_RE = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)")
UNDERSCORE_EMPH_RE = re.compile(r"(?<!_)_([^_\n]+)_(?!_)")
STRIKE_RE = re.compile(r"~~([^~]+)~~")
HTML_TAG_RE = re.compile(r"<[^>]+>")
LIST_BULLET_RE = re.compile(r"^(\s*)[-*+]\s+", re.MULTILINE)
LIST_NUM_RE = re.compile(r"^(\s*)\d+\.\s+", re.MULTILINE)
BLOCKQUOTE_RE = re.compile(r"^>\s?", re.MULTILINE)
MULTI_BLANK_RE = re.compile(r"\n{3,}")


# Skip entire sections by heading title (case-insensitive, exact match).
# Going Deeper is a references section — not useful audio.
SKIP_SECTIONS = {"going deeper", "references", "further reading"}


def strip_frontmatter(text: str) -> str:
    return FRONTMATTER_RE.sub("", text, count=1)


def replace_fenced_blocks(text: str) -> str:
    def repl(match: re.Match) -> str:
        lang = (match.group(1) or "").strip().lower()
        if lang == "mermaid":
            return "\n\n[Diagram omitted — see the written post.]\n\n"
        # Any code fence
        return "\n\n[Code example omitted — see the written post.]\n\n"

    return FENCED_BLOCK_RE.sub(repl, text)


def replace_display_math(text: str) -> str:
    return DISPLAY_MATH_RE.sub("\n\n[Equation omitted — see the written post.]\n\n", text)


def replace_tables(text: str) -> str:
    return TABLE_BLOCK_RE.sub("\n[Table omitted — see the written post.]\n\n", text)


def replace_images(text: str) -> str:
    def repl(match: re.Match) -> str:
        alt = match.group(1).strip()
        if alt:
            return f"(Figure: {alt}.)"
        return ""

    return IMAGE_RE.sub(repl, text)


def strip_skipped_sections(text: str) -> str:
    """Remove entire sections whose H2 heading is in SKIP_SECTIONS."""
    lines = text.splitlines()
    out: list[str] = []
    skipping = False
    for line in lines:
        m = re.match(r"^(#{1,6})\s+(.*?)\s*$", line)
        if m:
            level = len(m.group(1))
            title = m.group(2).strip().lower()
            if level <= 2 and title in SKIP_SECTIONS:
                skipping = True
                continue
            if skipping and level <= 2:
                skipping = False  # new top-level section ends the skip
        if not skipping:
            out.append(line)
    return "\n".join(out)


def rewrite_headers(text: str) -> str:
    """Turn headers into prosody cues — a pause + the heading as a sentence."""
    def repl(match: re.Match) -> str:
        title = match.group(2).strip().rstrip(".:")
        # Paragraph break before/after gives TTS a natural pause.
        return f"\n\n{title}.\n\n"

    return HEADER_RE.sub(repl, text)


def strip_inline_markup(text: str) -> str:
    text = LINK_RE.sub(r"\1", text)
    text = INLINE_CODE_RE.sub(lambda m: _speak_inline_code(m.group(1)), text)
    text = INLINE_MATH_RE.sub(lambda m: _speak_inline_math(m.group(1)), text)
    text = BOLD_RE.sub(r"\1", text)
    text = ITAL_RE.sub(r"\1", text)
    text = UNDERSCORE_EMPH_RE.sub(r"\1", text)
    text = STRIKE_RE.sub(r"\1", text)
    text = HTML_TAG_RE.sub("", text)
    return text


_TRICKY_SYMBOL_RE = re.compile(r"[_{}\\^<>=/|]")


def _speak_inline_code(token: str) -> str:
    """Inline code: keep short readable identifiers, drop syntax-heavy ones.

    Examples:
    - `attention` -> 'attention'
    - `numpy.array` -> 'numpy.array'
    - `h_t` -> '' (has _, TTS would say 'h underscore t')
    - `X.shape[0]` -> '' (brackets)
    """
    token = token.strip()
    if not token:
        return ""
    if len(token) > 40:
        return ""  # long snippet, drop
    if _TRICKY_SYMBOL_RE.search(token):
        return ""  # symbols would be read awkwardly
    return token


def _speak_inline_math(expr: str) -> str:
    """Short inline math we keep; LaTeX-heavy we drop entirely.

    Dropping (vs. a placeholder like "an expression") avoids injecting a
    repetitive English phrase into the narration — the surrounding prose
    usually carries enough meaning on its own, and dropped tokens are
    cleaned up by normalize_whitespace.
    """
    expr = expr.strip()
    if len(expr) > 30 or _TRICKY_SYMBOL_RE.search(expr):
        return ""
    return expr


def strip_lists_and_quotes(text: str) -> str:
    text = LIST_BULLET_RE.sub("", text)
    text = LIST_NUM_RE.sub("", text)
    text = BLOCKQUOTE_RE.sub("", text)
    return text


def normalize_whitespace(text: str) -> str:
    # Dropped inline tokens (code/math) leave orphaned spaces and stray
    # punctuation. Clean those up before collapsing blank lines.
    text = re.sub(r"[ \t]+([.,;:!?])", r"\1", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"^[ \t]+", "", text, flags=re.MULTILINE)
    text = MULTI_BLANK_RE.sub("\n\n", text)
    return text.strip() + "\n"


# --- Pipeline -------------------------------------------------------------


def markdown_to_narration(md: str) -> str:
    text = strip_frontmatter(md)
    text = HTML_COMMENT_RE.sub("", text)
    text = replace_fenced_blocks(text)   # before anything else (protect code)
    text = replace_display_math(text)
    text = replace_tables(text)
    text = strip_skipped_sections(text)  # after frontmatter strip
    text = replace_images(text)
    text = rewrite_headers(text)
    text = strip_inline_markup(text)
    text = strip_lists_and_quotes(text)
    text = normalize_whitespace(text)
    return text


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: md_to_speech.py <input.md> [output.txt]", file=sys.stderr)
        sys.exit(1)
    src = Path(sys.argv[1])
    md = src.read_text(encoding="utf-8")
    narration = markdown_to_narration(md)
    if len(sys.argv) >= 3:
        Path(sys.argv[2]).write_text(narration, encoding="utf-8")
    else:
        sys.stdout.write(narration)


if __name__ == "__main__":
    main()
