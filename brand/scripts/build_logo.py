"""Build the logo masters from brand/tokens.json.

    python brand/scripts/build_logo.py          (or `npm run brand:logo` in front/)

Writes brand/logo/*.svg. The name is outlined from IBM Plex Serif Medium
(brand/fonts, OFL) with the font's GPOS kerning applied, so every SVG renders
identically on machines without the font. Requires: fontTools.
"""
import json
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

BRAND = Path(__file__).resolve().parents[1]
T = json.loads((BRAND / "tokens.json").read_text(encoding="utf-8"))
OUT = BRAND / "logo"
OUT.mkdir(exist_ok=True)

NIGHT, DAY = T["color"]["night"], T["color"]["day"]
MODES = {"night": (NIGHT["bg"], NIGHT["text"], NIGHT["contrast"]), "day": (DAY["bg"], DAY["text"], DAY["contrast"])}
REG, SMALL = T["logo"]["regular"], T["logo"]["small"]
LOCK = T["logo"]["lockup"]
NAME = T["name"]


def symbol(g, ink, node, transform=""):
    t = f' transform="{transform}"' if transform else ""
    return (f'<g{t}><path d="{g["path"]}" fill="none" stroke="{ink}" stroke-width="{g["stroke"]}"/>'
            f'<circle cx="{g["top"][0]}" cy="{g["top"][1]}" r="{g["inkRadius"]}" fill="{ink}"/>'
            f'<circle cx="{g["end"][0]}" cy="{g["end"][1]}" r="{g["inkRadius"]}" fill="{ink}"/>'
            f'<circle cx="{g["node"][0]}" cy="{g["node"][1]}" r="{g["nodeRadius"]}" fill="{node}"/></g>')


def bounds(g):
    xs = [g["top"][0] - g["inkRadius"], g["end"][0] - g["inkRadius"], g["node"][0] + g["nodeRadius"]]
    ys = [g["top"][1] - g["inkRadius"], g["end"][1] + g["inkRadius"], g["node"][1] + g["nodeRadius"]]
    return min(xs), min(ys), max(xs), max(ys)


def svg(w, h, body, title=NAME):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" width="{w:.0f}" height="{h:.0f}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def write(name, text):
    (OUT / name).write_text(text, encoding="utf-8", newline="\n")


# ---- outline the name, with GPOS kerning ------------------------------------
font = TTFont(BRAND / "fonts" / "IBMPlexSerif-Medium.ttf")
UPM, CAP = font["head"].unitsPerEm, font["OS/2"].sCapHeight
glyphs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
gpos = font["GPOS"].table
KERN = [gpos.LookupList.Lookup[i] for fr in gpos.FeatureList.FeatureRecord if fr.FeatureTag == "kern"
        for i in fr.Feature.LookupListIndex]


def kern(left, right):
    for lk in KERN:
        for st in lk.SubTable:
            st = st.ExtSubTable if lk.LookupType == 9 else st
            if type(st).__name__ != "PairPos" or left not in st.Coverage.glyphs:
                continue
            if st.Format == 1:
                for rec in st.PairSet[st.Coverage.glyphs.index(left)].PairValueRecord:
                    if rec.SecondGlyph == right:
                        return getattr(rec.Value1, "XAdvance", 0) or 0
            else:
                v = st.Class1Record[st.ClassDef1.classDefs.get(left, 0)].Class2Record[st.ClassDef2.classDefs.get(right, 0)].Value1
                if getattr(v, "XAdvance", 0):
                    return v.XAdvance
    return 0


def outline(text, size, x0, baseline, tracking):
    s, x, pen = size / UPM, 0.0, SVGPathPen(glyphs)
    names = [cmap[ord(c)] for c in text]
    for i, g in enumerate(names):
        glyphs[g].draw(TransformPen(pen, (s, 0, 0, -s, x0 + x * s, baseline)))
        x += hmtx[g][0]
        if i + 1 < len(names):
            x += kern(g, names[i + 1]) + tracking * UPM
    return pen.getCommands(), x * s


# ---- lockup: symbol + name --------------------------------------------------
F = 100.0
x0, y0, x1, y1 = bounds(REG)
S = F * LOCK["symbolScale"]
k = S / T["logo"]["grid"]
pad = 2 * REG["nodeRadius"] * k                     # clear space = node diameter
baseline = pad + (y1 - y0) * k - 0.012 * F          # nodes overshoot the baseline slightly
sym_tf = f"translate({pad - x0 * k:.2f} {baseline + 0.012 * F - y1 * k:.2f}) scale({k:.4f})"
text_x = pad + (x1 - x0) * k + LOCK["gap"] * F
d, adv = outline(NAME, F, text_x, baseline, LOCK["nameTracking"])
W, H = text_x + adv + pad, baseline + pad + 0.012 * F
for mode, (bg, ink, node) in MODES.items():
    body = symbol(REG, ink, node, sym_tf) + f'<path d="{d}" fill="{ink}"/>'
    write(f"lockup-{mode}.svg", svg(W, H, body))
    write(f"lockup-{mode}-bg.svg", svg(W, H, f'<rect width="100%" height="100%" fill="{bg}"/>' + body))

# ---- name alone, closed by the period node ----------------------------------
cap = CAP / UPM * F
d2, adv2 = outline(NAME, F, pad, pad + cap, LOCK["nameTracking"])
r = 0.068 * F
cx = pad + adv2 + 0.05 * F + r
W2, H2 = cx + r + pad, pad + cap + pad
for mode, (bg, ink, node) in MODES.items():
    write(f"wordmark-{mode}.svg", svg(W2, H2, f'<path d="{d2}" fill="{ink}"/><circle cx="{cx:.2f}" cy="{pad + cap - r:.2f}" r="{r:.2f}" fill="{node}"/>'))

# ---- symbol -----------------------------------------------------------------
G = T["logo"]["grid"]
for mode, (bg, ink, node) in MODES.items():
    write(f"symbol-{mode}.svg", svg(G, G, symbol(REG, ink, node)))
write("symbol-mono-black.svg", svg(G, G, symbol(REG, "#000000", "#000000")))
write("symbol-mono-white.svg", svg(G, G, symbol(REG, "#FFFFFF", "#FFFFFF")))

# ---- icon masters (always on the night tile) --------------------------------
bg, ink, node = MODES["night"]
write("favicon.svg", svg(G, G, f'<rect width="{G}" height="{G}" rx="10" fill="{bg}"/>' + symbol(SMALL, ink, node)))
write("icon-master.svg", svg(G, G, f'<rect width="{G}" height="{G}" fill="{bg}"/>' + symbol(REG, ink, node, "translate(7.2 7.2) scale(0.7)")))
write("icon-maskable-master.svg", svg(G, G, f'<rect width="{G}" height="{G}" fill="{bg}"/>' + symbol(REG, ink, node, "translate(10.8 10.8) scale(0.55)")))

print(f"brand:logo  {len(list(OUT.glob('*.svg')))} SVG masters in {OUT.relative_to(BRAND.parent)}")
