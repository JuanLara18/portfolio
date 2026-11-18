"""Embed every blog section with nomic-embed-text (local Ollama). Caches to sections_emb.npz."""
import json, re, sys, os, urllib.request, urllib.error
import numpy as np

root, out = sys.argv[1], sys.argv[2]
blog = json.load(open(root + '/front/src/data/blogData.json', encoding='utf-8'))['posts']
SKIP = re.compile(r'going deeper|further reading|references|prerequisites|gotchas|testing|closing|conclusion|wrapping|what comes next|where (this|the) series', re.I)

secs = []
for p in blog:
    t = open(f"{root}/front/public/blog/posts/{p['category']}/{p['slug']}.md", encoding='utf-8').read()
    t = re.sub(r'^---.*?---', '', t, flags=re.S)
    t = re.sub(r'```.*?```', ' ', t, flags=re.S)
    t = re.sub(r'\$\$.*?\$\$', ' ', t, flags=re.S)
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', ' ', t)
    t = re.sub(r'\]\([^)]*\)', ']', t)
    parts = re.split(r'^## (.+)$', t, flags=re.M)
    for i in range(1, len(parts), 2):
        h, body = parts[i].strip(), parts[i + 1]
        if SKIP.search(h): continue
        words = body.split()
        if len(words) < 120: continue
        secs.append(dict(slug=p['slug'], heading=h, words=len(words), text=(h + '. ' + ' '.join(words))[:3500]))

def embed(batch):
    req = urllib.request.Request('http://localhost:11434/api/embed', method='POST',
        data=json.dumps({'model': 'nomic-embed-text', 'input': ['clustering: ' + s['text'] for s in batch],
                         'options': {'num_ctx': 2048}, 'truncate': True}).encode(),
        headers={'Content-Type': 'application/json'})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=600).read())['embeddings']
    except urllib.error.HTTPError as e:
        raise

def embed_safe(batch):
    try:
        return embed(batch)
    except urllib.error.HTTPError:
        if len(batch) > 1:
            m = len(batch) // 2
            return embed_safe(batch[:m]) + embed_safe(batch[m:])
        s = dict(batch[0]); s['text'] = s['text'][:len(s['text']) * 2 // 3]
        return embed_safe([s])

E = []
for i in range(0, len(secs), 32):
    E += embed_safe(secs[i:i + 32])
    print(i, end=' ', flush=True)
E = np.array(E, dtype=np.float32)
E /= np.linalg.norm(E, axis=1, keepdims=True)
np.savez(os.path.join(out, 'sections_emb.npz'), E=E)
json.dump([{k: s[k] for k in ('slug', 'heading', 'words')} for s in secs], open(os.path.join(out, 'sections_meta.json'), 'w'))
print('\ndone', E.shape)
