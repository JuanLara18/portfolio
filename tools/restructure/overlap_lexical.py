"""Section-level overlap across the whole blog (TF-IDF cosine).

Usage: python overlap.py <repo root> <out dir>
Writes sections.json (for drill-down) and prints:
  1. corpus-wide post pairs ranked by shared near-duplicate sections
  2. each proposed merge: source sections and their best match in the target
"""
import csv, json, re, sys, os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

root, out = sys.argv[1], sys.argv[2]
blog = json.load(open(root + '/front/src/data/blogData.json', encoding='utf-8'))['posts']
SKIP = re.compile(r'going deeper|further reading|prerequisites|gotchas|testing|closing|conclusion|wrapping|what comes next|where (this|the) series', re.I)

secs = []  # (slug, heading, text)
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
        words = len(body.split())
        if words < 120: continue
        secs.append((p['slug'], h, body, words))

vec = TfidfVectorizer(stop_words='english', sublinear_tf=True, min_df=2, max_df=0.3, ngram_range=(1, 2), max_features=120000)
X = vec.fit_transform([s[2] for s in secs])
S = (X @ X.T).toarray()
np.fill_diagonal(S, 0)
slugs = np.array([s[0] for s in secs])
same = slugs[:, None] == slugs[None, :]
S[same] = 0

# post-level vectors: mean of normalized section vectors
from collections import defaultdict
idx = defaultdict(list)
for i, s in enumerate(secs): idx[s[0]].append(i)
names = sorted(idx)
P = np.vstack([np.asarray(X[idx[n]].mean(axis=0)) for n in names])
P = P / np.linalg.norm(P, axis=1, keepdims=True)
PS = P @ P.T; np.fill_diagonal(PS, 0)

HI = 0.30
pairs = {}
ii, jj = np.where(np.triu(S) >= HI)
for i, j in zip(ii, jj):
    k = tuple(sorted((secs[i][0], secs[j][0])))
    pairs.setdefault(k, []).append((round(float(S[i, j]), 2), secs[i][1] if secs[i][0] == k[0] else secs[j][1], secs[j][1] if secs[i][0] == k[0] else secs[i][1]))
pos = {n: i for i, n in enumerate(names)}
ranked = sorted(pairs.items(), key=lambda kv: (-len(kv[1]), -PS[pos[kv[0][0]], pos[kv[0][1]]]))

print(f'sections: {len(secs)}  posts: {len(names)}  section pairs >= {HI}: {len(ii)}')
print(f'section similarity percentiles (cross-post best match): ', np.percentile(S.max(axis=1), [50, 75, 90, 95, 99]).round(2))
print('\n== 1. Post pairs sharing near-duplicate sections ==')
for (a, b), lst in ranked[:45]:
    print(f'{len(lst):2d} sec  post-sim {PS[pos[a], pos[b]]:.2f}  {a}  <>  {b}')
    for s, ha, hb in sorted(lst, reverse=True)[:3]:
        print(f'        {s:.2f}  "{ha[:55]}"  ~  "{hb[:55]}"')

print('\n== Top post-level similarity ==')
iu = np.triu_indices(len(names), 1)
order = np.argsort(-PS[iu])[:30]
for o in order:
    a, b = names[iu[0][o]], names[iu[1][o]]
    print(f'  {PS[iu[0][o], iu[1][o]]:.2f}  {a}  <>  {b}')

inv = list(csv.DictReader(open(root + '/docs/blog-inventory.csv', encoding='utf-8')))
print('\n== 2. Proposed merges ==')
for r in inv:
    if r['disposition'] != 'merge': continue
    src, tgt = r['slug'], r['target']
    print(f"\n{src}  ->  {tgt}   post-sim {PS[pos[src], pos[tgt]]:.2f}  (rank of target among src's neighbours: "
          f"{int((PS[pos[src]] > PS[pos[src], pos[tgt]]).sum()) + 1})")
    nb = np.argsort(-PS[pos[src]])[:4]
    print('   nearest posts:', ', '.join(f'{names[n]} {PS[pos[src], n]:.2f}' for n in nb))
    for i in idx[src]:
        best = max(idx[tgt], key=lambda j: S[i, j])
        anyb = int(np.argmax(S[i]))
        flag = 'COVERED' if S[i, best] >= HI else ('partial' if S[i, best] >= 0.20 else 'UNIQUE ')
        print(f"   {flag} {S[i, best]:.2f} {secs[i][3]:5d}w  {secs[i][1][:60]:60s} ~ {secs[best][1][:45]}"
              + (f"   | elsewhere: {secs[anyb][0]} {S[i, anyb]:.2f}" if S[i, anyb] > S[i, best] + 0.1 else ''))

json.dump([dict(slug=s[0], heading=s[1], words=s[3]) for s in secs], open(os.path.join(out, 'sections.json'), 'w'))
