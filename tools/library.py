# Builds Katha's free library: public-domain books in English, Hindi and Telugu from Project Gutenberg.
# Writes docs/books/<id>.txt (clean text, no headers) and docs/books/catalog.json.
#   python tools/library.py            (run by the "Build library" GitHub workflow)
import csv, io, json, os, re, time, urllib.request

OUT = "docs/books"; os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "KathaLibrary/1.0 (Bubbles; https://bubbles.foo.ng/Katha/)"}
MIRRORS = ["https://gutenberg.pglaf.org", "https://aleph.gutenberg.org", "https://www.gutenberg.org"]
def get(url, tries=2):
    # Gutenberg's main site often refuses cloud servers, so files come from its official mirrors
    urls = [url.replace("https://www.gutenberg.org", m) for m in MIRRORS] if "/cache/epub/" in url else [url]
    for u in urls:
        for i in range(tries):
            try:
                with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r: return r.read()
            except Exception as e:
                print("  retry", u, e); time.sleep(3 * (i + 1))
    return None

print("catalog…", flush=True)
rows = list(csv.DictReader(io.StringIO(get("https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv").decode("utf-8"))))
cat = {r["Text#"]: r for r in rows if r.get("Type") == "Text"}

# Most-downloaded English books, from Gutenberg's own popularity listing
popular = []
for start in range(1, 400, 25):
    html = (get(f"https://www.gutenberg.org/ebooks/search/?query=l.en&sort_order=downloads&start_index={start}") or b"").decode("utf-8", "ignore")
    for i in re.findall(r'href="/ebooks/(\d+)"', html):
        if i not in popular: popular.append(i)
    time.sleep(2)
print("popular english:", len(popular), flush=True)
if len(popular) < 100:  # popularity list unavailable: early Gutenberg numbers are the best-known classics
    popular += sorted((i for i, r in cat.items() if r.get("Language", "").strip() == "en" and i not in popular), key=int)

GENRES = [("Poetry", ["poetry", "poems", "verse"]), ("Drama", ["drama", "plays", "tragedies", "comedies"]),
          ("Science Fiction", ["science fiction"]), ("True Crime", ["crime nonfiction", "true crime", "trials", "murder--case"]), ("Mystery", ["detective", "mystery", "crime"]), ("Horror", ["horror", "gothic", "ghost"]),
          ("Adventure", ["adventure", "sea stories", "western"]), ("Romance", ["love stories", "romance"]), ("Children", ["children", "juvenile", "fairy tales", "nursery"]),
          ("Humour", ["humor", "humour", "satire"]), ("Philosophy", ["philosophy", "ethics"]), ("Religion", ["religion", "bible", "hindu", "buddh", "sacred"]),
          ("History", ["history", "war"]), ("Travel", ["travel", "voyages", "description and travel"]), ("Biography", ["biography", "autobiography", "memoir"]), ("Science", ["science", "mathematics", "natural history"]),
          ("Short Stories", ["short stories"]), ("Mythology", ["mythology", "legend", "folklore", "epic"]), ("Fiction", ["fiction", "novel"])]
def genre(r):
    s = (r.get("Subjects", "") + " " + r.get("Bookshelves", "")).lower()
    for g, keys in GENRES:
        if any(k in s for k in keys): return g
    return "Literature"
def author(r):
    a = (r.get("Authors") or "").split(";")[0]
    a = re.sub(r",?\s*\d{3,4}\??-\d{0,4}\??.*$", "", a).strip()
    if "," in a: last, first = a.split(",", 1); a = f"{first.strip()} {last.strip()}"
    return re.sub(r"\s*\[.*?\]", "", a)

pick = []
for code, cap in (("te", 150), ("hi", 80)):
    ids = [i for i, r in cat.items() if code in [x.strip() for x in r.get("Language", "").split(";")]]
    pick += [(i, code) for i in sorted(ids, key=int)[:cap]]
TARGET = 400
# make sure the shelves people ask for are well stocked: horror, mysteries and real crime cases
ranked = popular + sorted((i for i in cat if i not in popular), key=int)
for g, cap in (("Horror", 40), ("Mystery", 45), ("True Crime", 25)):
    got = 0
    for i in ranked:
        r = cat.get(i)
        if not r or r.get("Language", "").strip() != "en" or genre(r) != g or any(i == p for p, _ in pick): continue
        pick.append((i, "en")); got += 1
        if got >= cap: break
for i in popular:
    if len(pick) >= TARGET: break
    if i in cat and cat[i].get("Language", "").strip() == "en" and all(i != p for p, _ in pick): pick.append((i, "en"))
print("picked:", len(pick), flush=True)

START = re.compile(r"\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG.*?\*\*\*", re.I | re.S)
END = re.compile(r"\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG.*", re.I | re.S)
old = {b["id"]: b for b in json.load(open(f"{OUT}/catalog.json"))} if os.path.exists(f"{OUT}/catalog.json") else {}
catalog = []
for n, (i, code) in enumerate(pick, 1):
    r = cat[i]; path = f"{OUT}/{i}.txt"
    if not os.path.exists(path):
        raw = get(f"https://www.gutenberg.org/cache/epub/{i}/pg{i}.txt")
        if not raw: continue
        t = raw.decode("utf-8", "ignore")
        m = START.search(t); t = t[m.end():] if m else t
        t = END.sub("", t)
        t = re.sub(r"^\s*(Produced by|Transcriber'?s? [Nn]ote|E-text prepared by).*?\n\s*\n", "", t, flags=re.S)
        t = t.strip()
        if len(t) < 2000 or len(t) > 3_000_000: continue
        open(path, "w", encoding="utf-8").write(t)
        time.sleep(1.5)
    title = re.sub(r"\s+", " ", r["Title"]).split("\n")[0].strip()
    catalog.append({"id": i, "t": title[:140], "a": author(r), "l": code, "g": genre(r), "k": round(os.path.getsize(path) / 1024)})
    if n % 25 == 0: print(f"  {n}/{len(pick)}", flush=True)
keep = {b["id"] for b in catalog}
for f in os.listdir(OUT):
    if f.endswith(".txt") and f[:-4] not in keep: os.remove(f"{OUT}/{f}")
json.dump(catalog, open(f"{OUT}/catalog.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print("library:", len(catalog), dict(Counter(b["l"] for b in catalog)), dict(Counter(b["g"] for b in catalog)))
