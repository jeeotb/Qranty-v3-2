import re

with open("sidebar.js", "r", encoding="utf-8") as f:
    js = f.read()

# Extract current SIDEBAR_HTML template literal
m = re.search(r"var SIDEBAR_HTML = `(.*?)`;\n\n  document.currentScript", js, re.S)
html = m.group(1)

# New nav items (converted from qranty-sidebar.html nav-icon-box/nav-label -> ni-box/ni-label)
thao_tac_nhanh = '''
    <a href="./qranty-thao-tac-nhanh.html" class="nav-item" data-page="thao-tac-nhanh">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M9 1L2 9h4l-1 6 7-8H8l1-6z" fill="currentColor"/>
        </svg>
      </div>
      <span class="ni-label">Thao tác nhanh</span>
    </a>
'''

tong_quan = '''
    <a href="./qranty-dashboard.html" class="nav-item" data-page="dashboard">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="8" width="4" height="7" rx="1.2" fill="white"/>
          <rect x="6" y="5" width="4" height="10" rx="1.2" fill="rgba(255,255,255,.75)"/>
          <rect x="11" y="2" width="4" height="13" rx="1.2" fill="rgba(255,255,255,.55)"/>
          <path d="M2 7L6 4L10 6L14 2" stroke="rgba(255,255,255,.8)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <span class="ni-label">Tổng quan</span>
    </a>
'''

san_pham = '''
    <a href="#" class="nav-item" data-page="san-pham">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="5" width="12" height="9" rx="1.5" class="ic-default"/>
          <rect x="2" y="5" width="12" height="4" rx="1.5" class="ic-light"/>
          <rect x="5" y="2" width="6" height="4" rx="1" class="ic-default"/>
          <rect x="6.5" y="7.5" width="3" height="2.5" rx=".8" fill="var(--n800)"/>
        </svg>
      </div>
      <span class="ni-label">Sản phẩm</span>
    </a>
'''

bao_hanh = '''
    <a href="./qranty-bao-hanh.html" class="nav-item" data-page="bao-hanh">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5L14 4V9C14 12.3 11.3 14.9 8 15.5C4.7 14.9 2 12.3 2 9V4L8 1.5Z" class="ic-default"/>
          <path d="M8 3.5L12 5.5V9C12 11.2 10.2 13 8 13.5C5.8 13 4 11.2 4 9V5.5L8 3.5Z" class="ic-light"/>
          <path d="M5.5 8.5L7.2 10.2L10.5 6.8" stroke="var(--n800)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <span class="ni-label">Bảo hành</span>
      <span class="nav-badge">15</span>
    </a>
'''

khach_hang = '''
    <a href="./qranty-khach-hang.html" class="nav-item" data-page="khach-hang">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6" cy="5" r="2.8" class="ic-default"/>
          <path d="M1 14C1 11.2 3.2 9 6 9C8.8 9 11 11.2 11 14" class="ic-default"/>
          <circle cx="11.5" cy="5.5" r="2" class="ic-light"/>
          <path d="M10 14C10 12.1 11.1 10.5 12.8 9.7C14 10.4 15 11.8 15 14" class="ic-light"/>
        </svg>
      </div>
      <span class="ni-label">Khách hàng</span>
    </a>
'''

sua_chua = '''
    <a href="./qranty-repair-kanban.html" class="nav-item" data-page="repair-kanban">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10.5 2C9 2 7.5 3 7.5 4.5C7.5 5 7.6 5.4 7.9 5.8L2.5 11.2C2 11.7 2 12.5 2.5 13L3 13.5C3.5 14 4.3 14 4.8 13.5L10.2 8.1C10.6 8.4 11 8.5 11.5 8.5C13 8.5 14 7 14 5.5L12.2 7.3L10.3 5.4L12.1 3.6C11.6 2.7 11.1 2 10.5 2Z" class="ic-default"/>
          <path d="M10.5 2C9 2 7.5 3 7.5 4.5C7.5 5 7.6 5.4 7.9 5.8L2.5 11.2C2 11.7 2 12.5 2.5 13L3 13.5C3.5 14 4.3 14 4.8 13.5L10.2 8.1C10.6 8.4 11 8.5 11.5 8.5" class="ic-light"/>
          <circle cx="3.5" cy="12.5" r="1" fill="var(--n800)"/>
        </svg>
      </div>
      <span class="ni-label">Sửa chữa</span>
    </a>
'''

qr_code = '''
    <a href="#" class="nav-item" data-page="qr-code">
      <div class="ni-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" class="ic-default"/>
          <rect x="2.5" y="2.5" width="2" height="2" fill="var(--n800)"/>
          <rect x="10" y="1" width="5" height="5" rx="1" class="ic-default"/>
          <rect x="11.5" y="2.5" width="2" height="2" fill="var(--n800)"/>
          <rect x="1" y="10" width="5" height="5" rx="1" class="ic-default"/>
          <rect x="2.5" y="11.5" width="2" height="2" fill="var(--n800)"/>
          <rect x="10" y="10" width="1.5" height="1.5" rx=".4" class="ic-light"/>
          <rect x="12.5" y="10" width="1.5" height="1.5" rx=".4" class="ic-light"/>
          <rect x="10" y="12.5" width="1.5" height="1.5" rx=".4" class="ic-light"/>
          <rect x="12.5" y="12.5" width="1.5" height="1.5" rx=".4" class="ic-default"/>
          <line x1="8" y1="7.5" x2="8" y2="14.5" stroke="var(--n600)" stroke-width=".8"/>
          <line x1="7" y1="7.5" x2="9" y2="7.5" stroke="var(--n600)" stroke-width=".8"/>
          <line x1="7" y1="14.5" x2="9" y2="14.5" stroke="var(--n600)" stroke-width=".8"/>
        </svg>
      </div>
      <span class="ni-label">QR Code</span>
    </a>
'''

# Build new sb-nav block: groups "Quản lý" then "Vận hành" then "Nội bộ" (mapping sidebar.html's 2 groups into the existing structure's group labels)
new_nav = '''  <div class="sb-nav">
    <div class="sb-group">Quản lý</div>
''' + thao_tac_nhanh + tong_quan + '''
    <div class="sb-group">Vận hành</div>
''' + san_pham + '''
    <a href="./qranty-kho-hang-v2.html" class="nav-item" data-page="kho-hang">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="14" height="5" rx="1.2"/><rect x="2" y="9" width="14" height="7" rx="1.2"/><path d="M6 12.5h6"/>
        </svg>
      </div>
      <span class="ni-label">Kho hàng</span>
    </a>
''' + bao_hanh + khach_hang + sua_chua + qr_code + '''
    <div class="sb-group">Nội bộ</div>

    <a href="#" class="nav-item fin-only" data-page="cong-no">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 1.8h5l3.2 3.2v10.7H5z"/>
          <path d="M10 1.8v3.2h3.2"/>
          <path d="M7 9.6h4M7 12.4h4"/>
        </svg>
      </div>
      <span class="ni-label">Công nợ</span>
    </a>

    <a href="./qranty-thong-bao.html" class="nav-item" data-page="thong-bao">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 1.5C6 1.5 4.5 3.5 4.5 6.5V9.5L2.5 12.5H15.5L13.5 9.5V6.5C13.5 3.5 12 1.5 9 1.5Z"/>
          <path d="M7 14.5C7 15.6 7.9 16.5 9 16.5C10.1 16.5 11 15.6 11 14.5"/>
        </svg>
      </div>
      <span class="ni-label">Thông báo</span>
    </a>

    <div class="sb-divider"></div>

    <a href="./qranty-cai-dat.html" class="nav-item" data-page="cai-dat">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="9" r="2.4"/>
          <path d="M9 1.8v2.3M9 13.9v2.3M16.2 9h-2.3M4.1 9H1.8M14.1 3.9l-1.6 1.6M5.5 12.5 3.9 14.1M14.1 14.1l-1.6-1.6M5.5 5.5 3.9 3.9"/>
        </svg>
      </div>
      <span class="ni-label">Cài đặt</span>
    </a>
  </div>'''

# Replace the old sb-nav block within html
old_nav_pattern = re.compile(r"  <div class=\"sb-nav\">.*?\n  </div>", re.S)
new_html = old_nav_pattern.sub(new_nav, html, count=1)

# Escape backticks and ${...} in new_html (none expected, but safe)
new_html_escaped = new_html.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
# Undo double-escaping of backslash applied to original unchanged parts isn't an issue since we only transform whole html;
# but original html had no backslashes likely. We'll just escape backticks/${ without double backslash handling for simplicity.
new_html_escaped = new_html.replace("`", "\\`").replace("${", "\\${")

new_js = js[:m.start(1)] + new_html_escaped + js[m.end(1):]

# Update aliasMap
old_alias = """  var aliasMap = {
    'kho-hang-v2': 'kho-hang',
    'kho-hang': 'kho-hang',
    'thao-tac-nhanh': 'thuc-hien-nhanh',
    'thuc-hien-nhanh': 'thuc-hien-nhanh'
  };"""

new_alias = """  var aliasMap = {
    'kho-hang-v2': 'kho-hang',
    'kho-hang': 'kho-hang',
    'thao-tac-nhanh': 'thao-tac-nhanh',
    'thuc-hien-nhanh': 'thao-tac-nhanh',
    'dashboard': 'dashboard',
    'bao-hanh': 'bao-hanh',
    'repair-kanban': 'repair-kanban',
    'sua-chua': 'repair-kanban',
    'khach-hang': 'khach-hang',
    'qr-code': 'qr-code',
    'san-pham': 'san-pham'
  };"""

new_js = new_js.replace(old_alias, new_alias)

with open("sidebar.js", "w", encoding="utf-8") as f:
    f.write(new_js)

print("done")
