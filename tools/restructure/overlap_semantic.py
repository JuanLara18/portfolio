import csv, json, sys
from collections import defaultdict, Counter
import numpy as np

root, sp = sys.argv[1], sys.argv[2]
E = np.load(sp + '/sections_emb.npz')['E']
M = json.load(open(sp + '/sections_meta.json'))
inv = {r['slug']: r for r in csv.DictReader(open(root + '/docs/blog-inventory.csv', encoding='utf-8'))}
S = E @ E.T
slug = np.array([m['slug'] for m in M])
S[slug[:, None] == slug[None, :]] = -1
best = S.max(axis=1); arg = S.argmax(axis=1)
pct = np.percentile(best, [50, 75, 90, 95, 98, 99])
print('best cross-post match percentiles 50/75/90/95/98/99:', pct.round(3))
HI = float(sys.argv[3]) if len(sys.argv) > 3 else float(np.percentile(best, 95))
MID = float(np.percentile(best, 80))
print(f'HI (same content) = {HI:.3f}   MID (same topic) = {MID:.3f}')

idx = defaultdict(list)
for i, m in enumerate(M): idx[m['slug']].append(i)

def tag(s):
    return 'SAME ' if s >= HI else ('topic' if s >= MID else 'own  ')

print('\n== A. Proposed merges: each source section, best match in target, best anywhere ==')
for s, r in inv.items():
    if r['disposition'] != 'merge': continue
    t = r['target']
    cov = sum(M[i]['words'] for i in idx[s] if S[i, idx[t]].max() >= MID)
    tot = sum(M[i]['words'] for i in idx[s])
    print(f'\n{s} -> {t}: {cov}/{tot} words have at least a topic match in the target')
    for i in idx[s]:
        j = max(idx[t], key=lambda j: S[i, j]); k = arg[i]
        extra = f'   | best: {M[k]["slug"]} "{M[k]["heading"][:35]}" {S[i, k]:.2f}' if M[k]['slug'] != t else ''
        print(f'  {tag(S[i, j])} {S[i, j]:.2f} {M[i]["words"]:5d}w {M[i]["heading"][:52]:52s} ~ {M[j]["heading"][:38]}{extra}')

print('\n== B. Posts whose content mostly exists elsewhere (share of words in SAME sections) ==')
rows = []
for s, ii in idx.items():
    tot = sum(M[i]['words'] for i in ii)
    same = [i for i in ii if best[i] >= HI]
    w = sum(M[i]['words'] for i in same)
    where = Counter(M[arg[i]]['slug'] for i in same).most_common(3)
    rows.append((w / tot, s, tot, where))
for f, s, tot, where in sorted(rows, reverse=True)[:30]:
    d = inv.get(s, {}).get('disposition', '-')
    print(f'  {f:4.0%}  {s[:55]:55s} [{d}]  covered by: ' + ', '.join(f'{a} ({n})' for a, n in where))

print('\n== C. Post pairs with the most SAME sections ==')
pairs = defaultdict(list)
for i in range(len(M)):
    for j in np.where(S[i] >= HI)[0]:
        if i < j:
            pairs[tuple(sorted((M[i]['slug'], M[j]['slug'])))].append(float(S[i, j]))
for (a, b), v in sorted(pairs.items(), key=lambda kv: -len(kv[1]))[:30]:
    print(f'  {len(v):2d}  {a}  <>  {b}   [{inv.get(a, {}).get("disposition", "-")}/{inv.get(b, {}).get("disposition", "-")}]')
