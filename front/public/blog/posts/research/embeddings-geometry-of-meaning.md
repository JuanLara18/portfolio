---
title: "Embeddings: The Geometry of Meaning"
date: "2025-10-22"
excerpt: "How do you teach a computer what 'king' means? You don't explain—you show it where 'king' lives in a space where meaning has coordinates. A deep dive into embeddings, from Word2Vec to modern transformers, and why representing concepts as vectors changed everything."
tags: ["Deep Learning", "NLP", "Embeddings", "Word2Vec", "Representation Learning"]
headerImage: "/blog/headers/embeddings-header.jpg"
---

# Embeddings: The Geometry of Meaning

## A Discovery Nobody Planned For

In 2013, a team at Google published a paper with the modest title "Efficient Estimation of Word Representations in Vector Space." They were trying to solve a practical problem: how do you train better language models faster? They built a neural network — Word2Vec — and trained it on billions of words from Google News. The network learned to predict which words tended to appear near which other words.

Then they looked at what the network had actually learned.

Buried in the resulting vector space was something they had not engineered, not anticipated, and could not entirely explain: arithmetic of meaning. When they took the vector for "king," subtracted the vector for "man," and added the vector for "woman," the result pointed almost exactly to the vector for "queen."

$$\vec{\text{king}} - \vec{\text{man}} + \vec{\text{woman}} \approx \vec{\text{queen}}$$

The same displacement — the same direction in space — connected "actor" to "actress," "brother" to "sister," "prince" to "princess." Something the researchers described neutrally as a "dimension of gender" had crystallized spontaneously out of statistical patterns in text. The network had never been told what gender was. It had never been shown a definition or a rule. It had only been shown which words tended to neighbor which other words.

**Gender had become a direction in high-dimensional space.**

Not a label, not a flag, not a category. A direction — an arrow you can follow through meaning. And the network had discovered it on its own.

This was not the only structure hiding in the vectors. Capital cities aligned with their countries along a consistent direction. Verb tenses shifted along a different axis. Comparative adjectives — "good," "better," "best" — traced a trajectory through the space that tracked degree. Relationships that linguists had spent decades cataloguing in handcrafted databases had emerged, automatically, from nothing more than statistics over text.

The word embedding had arrived. And with it, a new way of thinking about what computation can discover about meaning.

## The Problem That Made Embeddings Necessary

Before you can appreciate what embeddings accomplish, you need to sit with the problem they solve.

Computers are numerical machines. To process language, they need language reduced to numbers. The obvious approach — the approach that dominated NLP for decades — was one-hot encoding. You list every word in your vocabulary. You assign each word an index. You represent each word as a vector with a single 1 in its index position and 0 everywhere else.

```python
vocabulary = ["cat", "dog", "king", "queen", "apple"]

cat   = [1, 0, 0, 0, 0]
dog   = [0, 1, 0, 0, 0]
king  = [0, 0, 1, 0, 0]
queen = [0, 0, 0, 1, 0]
apple = [0, 0, 0, 0, 1]
```

Clean. Unambiguous. Each word occupies its own unique position. And completely useless for capturing anything about what words mean.

Here is the problem: in one-hot space, every word is equidistant from every other word. The distance between "cat" and "dog" is identical to the distance between "cat" and "apple." The angle between any two one-hot vectors is exactly 90 degrees. Mathematically, every word is orthogonal to every other word — maximally dissimilar, regardless of how closely related they actually are.

$$\text{sim}(\text{"cat"}, \text{"dog"}) = \text{sim}(\text{"cat"}, \text{"apple"}) = 0$$

This is not merely inconvenient. It is structurally catastrophic for learning. If a model learns something useful about "cat" — that it appears before "purrs," after "the," near "scratch" — it cannot transfer any of that knowledge to "kitten" or "feline," because those representations share nothing structural. Every word is an island. The representation encodes no relationships, contains no similarities, preserves no semantic structure. It is a naming scheme masquerading as a representation.

**You cannot learn from structure you haven't encoded.** One-hot encoding encodes no structure at all.

## Words and the Company They Keep

The solution came not from computer science but from linguistics — specifically, from a 1957 observation by the British linguist J.R. Firth: *"You shall know a word by the company it keeps."*

Firth's claim was philosophical before it was computational. He was arguing that the meaning of a word is not some Platonic essence attached to it independently of use. Meaning is relational. It emerges from patterns of co-occurrence, from context, from the texture of language in practice. A word is defined by the company it keeps — by what surrounds it, what it follows, what it precedes.

This is the **distributional hypothesis**: semantic similarity correlates with distributional similarity. Words that appear in similar contexts tend to mean similar things.

Think about what this implies. You have never seen the word "gleaming" before. But you've seen it used next to "silver," "surface," "blade," "light." You've seen it in contexts where other words like "shining" or "brilliant" also appeared. The distributional patterns have given you a rough sense of the word — its register, its connotations, its place in the network of language — before you've ever encountered a definition.

This is how children learn language. This is how you navigate unfamiliar vocabulary in foreign texts. And, as it turns out, this is how Word2Vec works.

The distributional hypothesis transforms the problem of learning meaning into the problem of learning context. Instead of trying to define what "dog" means in some abstract sense, you ask: what does "dog" tend to appear near? What contexts surround it? What words occupy similar neighborhoods?

If you can learn representations that encode this distributional information — that place words with similar contexts near each other in some continuous space — you get semantics almost for free.

## How Word2Vec Actually Learns

Word2Vec implements this insight with elegant simplicity. The training objective is a prediction task: given a word, predict which words tend to appear near it.

In the **Skip-gram** variant, you slide a window across text and create training pairs — center word, context word — from every position:

```
Text: "the quick brown fox jumps over the lazy dog"
Window size: 2

Center: "fox"  → Contexts: ["quick", "brown", "jumps", "over"]
Center: "jumps" → Contexts: ["brown", "fox", "over", "the"]
```

The network takes a center word and tries to predict each of its context words. Two embedding matrices exist simultaneously: one for words acting as centers, one for words acting as context. The network trains by adjusting both matrices so that center and context embeddings of co-occurring words have high dot products — meaning they point in similar directions.

```python
# The core of what Word2Vec is doing:
# For each (center_word, context_word) pair seen in text:
#   - Pull center_vec = W_center[center_word]
#   - Pull context_vec = W_context[context_word]
#   - Maximize dot product: center_vec · context_vec
#   - Also sample k random "negative" words and minimize their dot products

def train_pair(center_vec, context_vec, negative_vecs, lr=0.025):
    # Positive: actual context word should be similar
    pos_score = sigmoid(center_vec @ context_vec)
    center_grad = (pos_score - 1) * context_vec

    # Negative: random words should be dissimilar
    for neg_vec in negative_vecs:
        neg_score = sigmoid(center_vec @ neg_vec)
        center_grad += neg_score * neg_vec

    center_vec -= lr * center_grad
```

Computing the full softmax over a vocabulary of hundreds of thousands of words would be prohibitively expensive. The key practical trick is **negative sampling**: instead of normalizing over the entire vocabulary, you contrast each positive pair against a small sample of random words. Maximize similarity to real neighbors; minimize similarity to random ones. The full training objective is:

$$\log \sigma(\mathbf{v}_c^T \mathbf{v}_t) + \sum_{i=1}^{k} \mathbb{E}_{w_i \sim P_n} \left[ \log \sigma(-\mathbf{v}_{w_i}^T \mathbf{v}_t) \right]$$

This turns what would be an expensive global normalization problem into cheap local contrastive learning. Training on billions of words becomes feasible in hours.

What the network is learning, mechanistically, is this: push together the embeddings of words that co-occur; pull apart the embeddings of words that don't. Run this process over enough text and the geometry that results encodes semantic relationships — not because anyone programmed it to, but because semantic similarity correlates with co-occurrence similarity, and co-occurrence similarity is exactly what the training objective rewards.

## The Geometry That Emerged

The king-queen result was not an isolated curiosity. As researchers probed the Word2Vec embedding space, they found structured geometry everywhere.

Capital cities and their countries occupied consistent positions relative to each other, with all the (country → capital) arrows pointing in roughly the same direction:

$$\vec{\text{Paris}} - \vec{\text{France}} \approx \vec{\text{Berlin}} - \vec{\text{Germany}} \approx \vec{\text{Tokyo}} - \vec{\text{Japan}}$$

Past tense followed a direction:

$$\vec{\text{walked}} - \vec{\text{walk}} \approx \vec{\text{ran}} - \vec{\text{run}} \approx \vec{\text{swam}} - \vec{\text{swim}}$$

Superlatives followed another:

$$\vec{\text{biggest}} - \vec{\text{big}} \approx \vec{\text{fastest}} - \vec{\text{fast}}$$

The structure was not noise. It was systematic. Mikolov's team published a benchmark of analogy questions — "Athens is to Greece as Baghdad is to ___" — and Word2Vec answered them with roughly 60% accuracy using pure vector arithmetic. No lookup table, no handcrafted rules, no linguistic database. Just vector subtraction and addition.

This is the moment that made the field pause. Something had been discovered, not engineered. The geometry wasn't put there — it crystallized from patterns in text. The question of why this happens turns out to have a relatively clean answer: if two words appear in systematically similar sets of contexts, their vectors will be systematically similar. Relationships between words that manifest consistently in co-occurrence patterns will manifest as consistent geometric displacements. The training objective is essentially a pressure toward encoding structure, and the structure it encodes reflects real regularities in language.

It was, in a phrase, semantics as geometry. And it worked astonishingly well.

## The Problem Word2Vec Couldn't Solve

There is a word that exposes Word2Vec's fundamental limitation: "bank."

In "she deposited her savings at the bank," bank means a financial institution. In "they camped on the river bank," bank means a sloped edge of land. In "a bank of clouds moved over the valley," bank means an accumulation. Three different senses, one word, wildly different meanings.

Word2Vec assigns a single vector to "bank." That vector is trained on all uses of the word — financial, geographical, meteorological — and ends up as a statistical average of them. In high dimensions, you can partially compensate: the averaged vector sits in a position that's somewhat close to "deposit" and somewhat close to "river" and somewhat close to "clouds." But it is not truly close to any of them. It captures the center of gravity of the word's usage, which is not quite the same as capturing any specific meaning.

This is the **polysemy problem**, and it's not limited to unusual cases. Virtually every common word in English is polysemous. "Run," "light," "head," "right," "set" — the most frequent words tend to have the most senses, because frequency and versatility compound over time. A static embedding space, where each word occupies exactly one point, structurally cannot represent this.

The limitation runs deeper than polysemy. Even words without competing senses shift meaning depending on context. "Large" means something different modifying "army" versus "smile" versus "commitment." The meaning is always relational, always context-dependent. But Word2Vec looks up a word's vector in a table, always returning the same number regardless of context.

This was the problem that contextual embeddings were built to solve.

## The Turn Toward Context

ELMo, published in 2018, was the first widely adopted approach to contextual embeddings. The key idea: rather than learning a fixed vector per word, train a deep bidirectional language model and use its internal representations — which are computed fresh for each input sentence — as embeddings. The same word processed in different sentences would produce different vectors.

This worked. The ELMo vectors for "bank" in a sentence about finance genuinely differed from those in a sentence about rivers. The model had learned to distinguish senses through context.

BERT, also 2018, took this further with the Transformer architecture's full self-attention mechanism. Where ELMo stacked two independent language models (left-to-right and right-to-left) and concatenated their outputs, BERT processed the entire sequence at once with bidirectional attention. Every token's representation was influenced by every other token in the sentence, all layers, all positions simultaneously.

```python
# Static embeddings (Word2Vec):
vec = embeddings["bank"]  # Same vector every time, regardless of context

# Contextual embeddings (BERT):
sentence_a = "She walked to the bank to withdraw cash."
sentence_b = "He fished from the sandy bank all morning."

# "bank" gets a different vector depending on the surrounding sentence
vec_a = bert.encode(sentence_a)[6]   # influenced by "withdraw," "cash"
vec_b = bert.encode(sentence_b)[5]   # influenced by "fished," "sandy"

# These vectors are meaningfully different
cosine_similarity(vec_a, vec_b)  # Much lower than 1.0
```

The mechanism that enabled this — masked language modeling, where the model learns to predict randomly hidden words using context from both sides — transformed representation learning. BERT didn't just encode words; it encoded words-in-context, which is much closer to how human readers process language.

The result was an improvement so dramatic it restructured the entire field. BERT simultaneously set new records on eleven NLP benchmarks. On several tasks, it exceeded previous state of the art by margins that made the previous approaches look like rough approximations.

## Is the Geometry Discovered or Imposed?

Here is a question worth sitting with: when Word2Vec reveals that "gender is a direction in embedding space," what exactly has been discovered?

One interpretation: the geometry is real. The structure of language encodes real conceptual structure, and the model uncovers it. Gender genuinely is a coherent dimension along which many concepts vary. Royalty, occupation, kinship — these domains are organized by gender in consistent ways. The vector arithmetic captures something true about the world.

A different interpretation: the geometry is a projection of human bias. The text Word2Vec trains on reflects how human beings talk — including their stereotypes, their historical power structures, their cultural assumptions. If "nurse" sits closer to "woman" and "engineer" sits closer to "man" in the embedding space, that is not a discovery about the nature of nursing or engineering. It is a record of how those words were used in the training corpus, which reflects patterns of employment, representation, and language that encode social inequity. The geometry is real, but it is the geometry of human bias, not of some neutral semantic space.

Both interpretations are partially correct, and their tension illuminates a fundamental ambiguity in what embeddings represent. They are models of language, not of the world. The world they implicitly model is the world as rendered in text — with all the selection, emphasis, and distortion that entails.

This connects to the deeper **symbol grounding problem**: do embeddings represent meaning at all, in any philosophically robust sense? The distributional hypothesis — meaning is use — is Wittgenstein's *Philosophical Investigations* in computational form. But Wittgenstein also recognized that language games are embedded in forms of life, in practices, in the world. A model that has only ever seen text has never seen a cat, touched velvet, smelled rain, felt fear. It has seen every description of those things, every comparison, every figurative use. But is that enough?

Multimodal embeddings take a first step toward an answer. CLIP, OpenAI's model from 2021, trains a shared embedding space over text-image pairs. An image of a cat and the phrase "a cat" get pulled toward each other during training. The result is a space where language is grounded, partially, in visual experience. The embedding for "cat" is no longer just statistical patterns over text — it reflects what cats actually look like. Whether this constitutes genuine grounding or just a richer set of distributional patterns is a question that remains genuinely open.

What is clear is that the geometry emerging from text alone is incomplete in specific ways — it can capture relational structure between concepts without grounding any concept in perceptual reality. Whether that matters for practical tasks (often, it doesn't) or for genuine understanding (possibly, it does) is one of the more interesting open questions in the field.

## Representation as the Hidden Variable

Years after first working with Word2Vec, what still strikes me is how much of the progress in deep learning has been, at its core, progress in representation. The transformer revolution was not fundamentally about attention mechanisms — it was about learning richer, more context-sensitive representations. The scaling laws that have governed language model development describe, among other things, how representation quality grows with data and parameters.

The right representation makes hard problems tractable. The wrong representation makes tractable problems hard. One-hot vectors made it impossible to generalize across synonyms or close paraphrases. Static word embeddings made it impossible to disambiguate polysemous words. Contextual embeddings enabled disambiguation but struggled with long documents. Each architectural advance has been, in part, a search for better representations — for spaces where the geometry more faithfully captures the structure of the problem.

This is not a coincidence. It reflects something about how learning works: if a model can access a representation where the relevant regularities are clearly expressed, it can learn from far less data, generalize more robustly, and fail more gracefully. The choice of representation encodes assumptions about what relationships matter. Those assumptions are never neutral.

The king-queen analogy emerged without being programmed because the training objective rewarded encoding the regularities that produce it. The bias patterns emerged without being programmed for the same reason. The model learned what was latent in the text.

What is latent in the text is, in the end, a record of human thought — with its regularities, its insights, its inconsistencies, and its blind spots. Embeddings, at their best, are a precise and searchable mirror of that record. Understanding what they capture — and what they necessarily miss — is not just a technical question. It is a question about what we have written, and what that writing reveals about us.

---

## Going Deeper

Embeddings are where linguistics, linear algebra, and cognitive science meet. The resources below will take you from understanding the basic mechanism to asking deeper questions about what it means for meaning to have geometry.

**Books:**

- **[Speech and Language Processing](https://web.stanford.edu/~jurafsky/slp3/) — Dan Jurafsky & James Martin**
  - The definitive NLP textbook, available free online. The chapters on vector semantics and embeddings are the clearest pedagogical treatment anywhere — Jurafsky builds from distributional hypothesis to Word2Vec to contextual embeddings with patience and rigor. Read chapter 6 to understand *why* distributional representations work before accepting that they do.
- **[Natural Language Processing with Transformers](https://www.google.com/search?q=Tunstall+Lewis+NLP+with+Transformers) — Lewis Tunstall, Leandro von Werra & Thomas Wolf**
  - The Hugging Face team's practical companion to modern NLP. Excellent on how contextual embeddings (BERT, RoBERTa, etc.) are used in practice — fine-tuning, domain adaptation, sentence similarity, semantic search. The chapter on embeddings for retrieval is particularly good.
- **[Mathematics for Machine Learning](https://mml-book.github.io/) — Deisenroth, Faisal & Ong**
  - Free online. Builds the linear algebra and geometry you need to reason clearly about what's happening in embedding spaces — inner products, vector norms, projections, dimensionality reduction.
- **[Representation Learning: A Review and New Perspectives](https://www.google.com/search?q=Bengio+representation+learning+review) — Yoshua Bengio et al.**
  - A survey paper that functions like a short book — it frames the entire field of representation learning and situates embeddings within it. Reading this makes clear that Word2Vec wasn't a trick but part of a larger program.

**Videos:**

- **[Word Vector Representations: word2vec](https://www.youtube.com/results?search_query=Stanford+CS224N+word2vec+lecture) — Stanford CS224N**
  - Christopher Manning's lecture on word vectors. Manning is one of the original architects of distributional semantics and explains the intuitions with clarity born from decades of thinking about them. The progression from co-occurrence matrices to Word2Vec is handled beautifully.
- **[Illustrated Word2Vec](https://www.youtube.com/results?search_query=illustrated+word2vec+explained) — Jay Alammar**
  - Several video adaptations of Alammar's influential blog post exist. The visual metaphors — windows sliding over text, vectors being nudged toward each other — make the training process genuinely intuitive.
- **[Visualizing High-Dimensional Data with t-SNE](https://www.youtube.com/results?search_query=t-SNE+visualizing+high+dimensional+data) — Google Tech Talks**
  - Laurens van der Maaten's original talk on t-SNE, the algorithm most commonly used to project embedding spaces into 2D. Understanding how and why t-SNE works — and what it distorts — is essential for interpreting those beautiful word cluster plots.
- **[Sentence Transformers and Semantic Search](https://www.youtube.com/results?search_query=sentence+transformers+semantic+search+explained) — Various**
  - Several practitioners have produced clear tutorials bridging theory and production for sentence embeddings and semantic search.

**Online Resources:**

- [Embedding Projector](https://projector.tensorflow.org/) — Google. An interactive 3D visualization of word embedding spaces. Load pre-trained Word2Vec or GloVe vectors and explore the geometry firsthand — find clusters, test analogies, see how neighbors change with different projection methods.
- [Sentence-Transformers Documentation](https://www.sbert.net/) — UKP Lab. The canonical library for computing sentence and document embeddings. The documentation doubles as a tutorial, covering semantic similarity, clustering, and paraphrase mining.
- [Gensim](https://radimrehurek.com/gensim/) — The reference Python library for training Word2Vec, Doc2Vec, and FastText on custom corpora. Excellent tutorials for building domain-specific embeddings when pre-trained vectors don't cover your vocabulary.

**Papers That Matter:**

- **Mikolov, T., et al. (2013). *Efficient Estimation of Word Representations in Vector Space*. [arXiv:1301.3781](https://arxiv.org/abs/1301.3781)**
  - The Word2Vec paper. Surprisingly short and readable for a paper with this much impact. The analogy arithmetic results are presented almost casually — the authors clearly knew they had something.
- **Pennington, J., Socher, R., & Manning, C. D. (2014). *GloVe: Global Vectors for Word Representation*. EMNLP 2014.**
  - GloVe uses global word co-occurrence statistics instead of local windows. A clean demonstration that the same geometric structure emerges from different training objectives, suggesting the geometry is real rather than an artifact of the specific method.
- **Bojanowski, P., et al. (2017). *Enriching Word Vectors with Subword Information*. [arXiv:1607.04606](https://arxiv.org/abs/1607.04606)**
  - FastText, the extension of Word2Vec that learns character n-gram embeddings. Crucial for handling morphologically rich languages and rare or unseen words.
- **Reimers, N., & Gurevych, I. (2019). *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)**
  - The paper that made dense semantic search practical. Sentence-BERT uses a Siamese network architecture to produce standalone sentence vectors comparable with simple cosine similarity. Enabled the modern semantic search stack.
- **Conneau, A., et al. (2017). *Word Translation Without Parallel Data*. [arXiv:1710.04087](https://arxiv.org/abs/1710.04087)**
  - A striking paper: the geometry of word embedding spaces is so consistent across languages that you can learn to map between them without ever seeing a translated pair. A remarkable testament to how real the structure is.

**A Question to Sit With:**

The distributional hypothesis — "you shall know a word by the company it keeps" — is a claim about meaning: that semantic content is exhausted by context of use. This is a philosophical position, not just an engineering choice. It echoes Wittgenstein's "meaning is use." But if two words always appear in identical contexts, are they truly synonymous? Can a word have meaning that never manifests in its distribution? What aspects of human meaning — private associations, sensory grounding, emotional connotation — might be permanently invisible to any model that learns from text alone?
