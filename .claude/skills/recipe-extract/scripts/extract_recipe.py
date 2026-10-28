"""Print a recipe page's structured data. Feed it page HTML on stdin:

curl -sL --max-time 30 -A "$UA" "<URL>" | python3 extract_recipe.py

Prints the schema.org Recipe object (exact amounts, times, nutrition), candidate
photo URLs, and the visible recipe-card text (ingredient group headings and
per-ingredient notes that the JSON-LD leaves out).
"""

import html
import json
import re
import sys

raw = sys.stdin.read()
print("HTML length:", len(raw))

KEEP = (
    "name", "description", "author", "datePublished", "recipeYield", "prepTime",
    "cookTime", "totalTime", "recipeIngredient", "recipeInstructions",
    "recipeCategory", "recipeCuisine", "keywords", "nutrition", "image",
)

blocks = re.findall(r"<script[^>]*application/ld\+json[^>]*>(.*?)</script>", raw, re.S)
docs = []
for b in blocks:
    try:
        docs.append(json.loads(b))
    except Exception as e:
        print("JSON-LD parse error:", e)


def walk(o):
    """Yield every dict in a JSON-LD document."""
    if isinstance(o, dict):
        yield o
        for v in o.values():
            yield from walk(v)
    elif isinstance(o, list):
        for v in o:
            yield from walk(v)


def is_type(node, wanted):
    t = node.get("@type")
    return t == wanted or (isinstance(t, list) and wanted in t)


nodes = [n for d in docs for n in walk(d)]
by_id = {n["@id"]: n for n in nodes if isinstance(n.get("@id"), str)}
recipes = [n for n in nodes if is_type(n, "Recipe")]

for r in recipes:
    print("=== JSON-LD RECIPE ===")
    print(json.dumps({k: r[k] for k in KEEP if k in r}, indent=2, ensure_ascii=False))

if not recipes:
    print("No Recipe JSON-LD found -- fall back to WebFetch or the card text below")

# Photo: JSON-LD image (often an @id reference into the graph), then og:image.
print("=== PHOTO CANDIDATES ===")
seen = []
for r in recipes:
    img = r.get("image")
    for cand in img if isinstance(img, list) else [img]:
        if isinstance(cand, str):
            seen.append(by_id.get(cand, {}).get("url", cand))
        elif isinstance(cand, dict):
            seen.append(cand.get("url") or by_id.get(cand.get("@id", ""), {}).get("url"))
og = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', raw)
if og:
    seen.append(og.group(1))
for url in dict.fromkeys(u for u in seen if u):
    print(url)

# Recipe-card text, for what the JSON-LD omits (ingredient groups, notes, equipment).
m = re.search(r'<div[^>]+id="wprm-recipe-container-', raw) or re.search(
    r'<div[^>]+class="[^"]*wprm-recipe-container', raw
)
if m:
    chunk = raw[m.start(): m.start() + 80000]
    chunk = re.sub(r"<(script|style|svg)[^>]*>.*?</\1>", " ", chunk, flags=re.S)
    chunk = re.sub(r"<br\s*/?>", "\n", chunk)
    chunk = re.sub(r"</(li|p|div|h\d)>", "\n", chunk)
    text = html.unescape(re.sub(r"<[^>]+>", " ", chunk))
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n", text).strip()
    for stop in ("Leave a star rating", "©"):  # cut before the comment section
        i = text.find(stop)
        if i > 0:
            text = text[:i]
    print("=== RECIPE CARD TEXT ===")
    print(text[:6000])
else:
    print("No WP Recipe Maker card found")

# Sites without a recipe card keep their notes in the article, and structured data
# leaves them out -- scan for the headings those notes live under.
plain = re.sub(r"<(script|style|svg|noscript)[^>]*>.*?</\1>", " ", raw, flags=re.S)
plain = re.sub(r"<br\s*/?>", "\n", plain)
plain = re.sub(r"</(li|p|div|h\d)>", "\n", plain)
plain = html.unescape(re.sub(r"<[^>]+>", " ", plain))
plain = re.sub(r"[ \t]+", " ", plain)
plain = re.sub(r"\n\s*\n+", "\n", plain)
heading = re.compile(
    r"^ ?(special equipment|equipment|notes|recipe notes|cook.s notes|"
    r"make.{0,6}ahead[^\n]{0,30}|storage[^\n]{0,30}|tips[^\n]{0,30}|variations?[^\n]{0,20}) ?$",
    re.I | re.M,
)
hits = list(heading.finditer(plain))[:6]
if hits:
    print("=== NOTES-ISH SECTIONS (verify before using) ===")
    for h in hits:
        print("--", h.group(1).strip())
        print(plain[h.end(): h.end() + 700].strip())
