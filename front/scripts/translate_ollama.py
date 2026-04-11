"""
Ollama-based translator for blog narration text.

Translates English narration (already stripped of code/diagrams/math) into
neutral Latin American Spanish while preserving technical terms in English.

The translator chunks long inputs at paragraph boundaries so each Ollama
call stays within the model's effective context.
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "gemma4:latest")

# Keep ~3500 chars per chunk — small enough for consistent rule-following on 7-8B models.
MAX_CHUNK_CHARS = 3500

SYSTEM_PROMPT = """You are a professional translator for a technical ML and AI blog written in a conversational but technical register. Translate English to neutral Latin American Spanish (understandable in Colombia, Mexico, and across Latin America).

Strict rules:
1. Keep these technical terms and proper nouns in English exactly as written: embedding, embeddings, transformer, transformers, attention, self-attention, cross-attention, multi-head attention, fine-tuning, fine-tune, prompt, prompts, token, tokens, tokenizer, LLM, LLMs, RAG, pipeline, pipelines, dataset, datasets, benchmark, benchmarks, feature engineering, training, inference, backend, frontend, framework, open source, state-of-the-art, chain-of-thought, few-shot, zero-shot, in-context, ground truth, softmax, encoder, decoder, feedforward, backpropagation, gradient, gradients, loss, epoch, epochs, batch, batches, checkpoint, GPU, CPU, TPU, API, SDK, cluster, throughput, latency, latent space, hidden state, attention weights, context window, knowledge base, vector database, semantic search, retrieval, chunk, chunks, chunking, overfitting, underfitting, regularization, dropout, layer normalization, residual connection.
   Words like "model", "library", "feature" used in a general sense should be translated naturally (modelo, biblioteca, característica).
2. Keep proper nouns, paper titles, product names, and organization names in English: "Attention is All You Need", GPT-4, GPT-5, ChatGPT, Claude, BERT, T5, LLaMA, DALL-E, AlphaFold, Google, OpenAI, Anthropic, Meta, Microsoft, etc.
3. Translate everything else into natural Spanish. ALWAYS use "tú" (informal, second person singular) — never "usted". Examples: "you need" -> "necesitas", "understand why" -> "entiende por qué", "you can build" -> "puedes construir". Keep the conversational tone. Short punchy English sentences should remain short punchy Spanish sentences.
4. Translate these placeholders exactly:
   - "[Diagram omitted — see the written post.]" -> "[Diagrama omitido — ver el post escrito.]"
   - "[Code example omitted — see the written post.]" -> "[Ejemplo de código omitido — ver el post escrito.]"
   - "[Equation omitted — see the written post.]" -> "[Ecuación omitida — ver el post escrito.]"
   - "[Table omitted — see the written post.]" -> "[Tabla omitida — ver el post escrito.]"
5. Preserve paragraph structure — empty lines between paragraphs must stay as empty lines.
6. Do NOT use any markdown formatting in the output. No asterisks, no underscores for emphasis, no backticks, no italics, no bold. English technical terms should appear as plain text without any surrounding symbols. Example: write "usando solo mecanismos de attention" NOT "usando solo mecanismos de *attention*".
7. Do NOT summarize, do NOT add commentary, do NOT add headers, do NOT add explanations, do NOT add a preamble like "Here is the translation:". Output ONLY the Spanish translation, nothing else."""


class OllamaError(RuntimeError):
    pass


def _call_ollama(prompt: str, *, model: str, system: str, temperature: float = 0.2) -> str:
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 4096,
            "top_p": 0.9,
        },
    }
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise OllamaError(f"Ollama HTTP {e.code}: {body}") from e
    except urllib.error.URLError as e:
        raise OllamaError(f"Cannot reach Ollama at {OLLAMA_URL}: {e}") from e
    return data.get("response", "").strip()


def _split_into_chunks(text: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Split text into chunks on blank-line boundaries, never exceeding max_chars."""
    paragraphs = re.split(r"\n\s*\n", text.strip())
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        para_len = len(para) + 2  # account for joining blank line
        if current and current_len + para_len > max_chars:
            chunks.append("\n\n".join(current))
            current = [para]
            current_len = para_len
        else:
            current.append(para)
            current_len += para_len
    if current:
        chunks.append("\n\n".join(current))
    return chunks


_MARKDOWN_EMPH_RE = re.compile(r"(?<!\w)[*_]{1,3}([^*_\n]+?)[*_]{1,3}(?!\w)")
_BACKTICK_RE = re.compile(r"`([^`\n]+)`")
_LEADING_PREAMBLE_RE = re.compile(
    r"^(?:here'?s?\s+the\s+(?:spanish\s+)?translation[:\s]*|aquí\s+está\s+la\s+traducción[:\s]*|aquí\s+tienes\s+la\s+traducción[:\s]*|traducción[:\s]*)",
    re.IGNORECASE,
)


def _clean_translation(text: str) -> str:
    """Strip markdown artifacts some models insert despite instructions."""
    text = _MARKDOWN_EMPH_RE.sub(r"\1", text)
    text = _BACKTICK_RE.sub(r"\1", text)
    text = _LEADING_PREAMBLE_RE.sub("", text.lstrip()).lstrip()
    # Collapse 3+ newlines to a single blank line.
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def translate_narration(
    text: str,
    *,
    model: str = DEFAULT_MODEL,
    system: str = SYSTEM_PROMPT,
    verbose: bool = False,
) -> str:
    """Translate an English narration string into Spanish using Ollama."""
    chunks = _split_into_chunks(text)
    out_parts: list[str] = []
    for i, chunk in enumerate(chunks, 1):
        if verbose:
            print(f"  chunk {i}/{len(chunks)} ({len(chunk)} chars)...", flush=True)
        t0 = time.time()
        translated = _call_ollama(chunk, model=model, system=system)
        translated = _clean_translation(translated)
        if verbose:
            print(f"    done in {time.time() - t0:.1f}s ({len(translated)} chars)")
        out_parts.append(translated)
    return "\n\n".join(out_parts).strip() + "\n"


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("input", help="Input narration text file")
    parser.add_argument("-o", "--output", help="Output file (default: stdout)")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    with open(args.input, encoding="utf-8") as f:
        src = f.read()

    result = translate_narration(src, model=args.model, verbose=args.verbose)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(result)
        print(f"Wrote {args.output}")
    else:
        print(result)
