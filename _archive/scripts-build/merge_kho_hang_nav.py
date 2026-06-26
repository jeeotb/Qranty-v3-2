import re

MERGED = '''    <a href="./qranty-kho-hang-v2.html" class="nav-item">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="14" height="5" rx="1.2"/><rect x="2" y="9" width="14" height="7" rx="1.2"/><path d="M6 12.5h6"/>
        </svg>
      </div>
      <span class="ni-label">Kho hàng</span>
    </a>
'''

files = [
    "qranty-cai-dat.html",
    "qranty-thong-bao.html",
    "qranty-dashboard.html",
    "qranty-thao-tac-nhanh.html",
    "qranty-kho-hang.html",
    "qranty-repair-kanban.html",
]

pattern = re.compile(
    r'( *)<a [^>]*class="nav-item[^"]*"[^>]*>.*?Kho hàng &amp; Linh kiện.*?</a>\s*'
    r'<a [^>]*class="nav-item"[^>]*>.*?Lô sản phẩm.*?</a>\n?',
    re.DOTALL
)

for f in files:
    with open(f, encoding="utf-8") as fh:
        content = fh.read()

    m = pattern.search(content)
    if not m:
        print(f"{f}: PATTERN NOT FOUND - manual review needed")
        continue

    new_content = content[:m.start()] + MERGED + content[m.end():]

    with open(f, "w", encoding="utf-8") as fh:
        fh.write(new_content)

    print(f"{f}: replaced ({m.end()-m.start()} chars -> {len(MERGED)} chars)")
