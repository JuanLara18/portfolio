import json, os

data = json.load(open('src/data/blogData.json', encoding='utf-8'))
new = ['dev-environments-for-ai-teams', 'knowledge-as-a-product', 'enterprise-agent-governance-lifecycle']
byslug = {p['slug']: p for p in data['posts']}
issues = []
dates = []
for s in new:
    p = byslug.get(s)
    if not p:
        issues.append('%s: not in blogData' % s); continue
    dates.append(p['date'])
    hp = 'public' + p.get('headerImage', '')
    if not os.path.exists(hp): issues.append('%s: header missing %s' % (s, hp))
    wp = hp.rsplit('.', 1)[0] + '.webp'
    if not os.path.exists(wp): issues.append('%s: webp missing' % s)
    ap = 'public/blog/audio/%s/%s.mp3' % (p['category'], s)
    if not os.path.exists(ap): issues.append('%s: EN mp3 missing' % s)
    aj = 'public/blog/audio/%s/%s.json' % (p['category'], s)
    if not os.path.exists(aj): issues.append('%s: EN json missing' % s)
    wc = p.get('estimatedWordCount', 0)
    if wc < 4000: issues.append('%s: low word count %s' % (s, wc))
    print('OK %s | %s | %d words | %s' % (s, p['date'], wc, p.get('headerImage')))

if len(dates) != len(set(dates)):
    issues.append('duplicate dates: %s' % dates)
print('\nISSUES:', issues if issues else 'none')
