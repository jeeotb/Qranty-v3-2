import re

# --- TASK 2.1: qranty-cai-dat.html: replace settings-row with toggle by read-only info row ---
fn = "qranty-cai-dat.html"
with open(fn, encoding="utf-8") as f:
    html = f.read()

old_row = re.search(
    r'<div class="settings-row">\s*<div class="settings-row-text">.*?</div>\s*<label class="toggle-switch">.*?</label>\s*</div>',
    html, re.DOTALL
)
assert old_row, "settings-row with toggle not found"

new_row = '''<div class="settings-row">
                <div class="settings-row-text">
                  <div class="settings-row-title">
                    Chế độ bán hàng
                    <span class="settings-mode-tag store" id="modeTagStore" style="display:none">Đang bật</span>
                    <span class="settings-mode-tag bh" id="modeTagBH">Chưa bật</span>
                  </div>
                  <div class="settings-row-desc">
                    Mở thêm các tính năng quản lý tài chính cho hoạt động bán hàng: công nợ khách hàng, doanh thu, giá nhập/giá bán và dòng tiền nhập – xuất. Khi tắt, Qranty chỉ hoạt động như một trung tâm bảo hành đơn giản. Việc chuyển đổi chế độ được thực hiện bởi Super admin qua menu tài khoản ở thanh điều hướng.
                  </div>
                </div>
              </div>'''

html = html[:old_row.start()] + new_row + html[old_row.end():]

with open(fn, "w", encoding="utf-8") as f:
    f.write(html)
print("cai-dat.html: settings-row replaced")

# --- TASK 3: qranty-sidebar.html nav restructure ---
fn = "qranty-sidebar.html"
with open(fn, encoding="utf-8") as f:
    html = f.read()

old_block = re.search(
    r'\n\s*<!-- Lô sản phẩm -->\s*<a href="\./qranty-kho-hang-v2\.html" class="nav-item">.*?<span class="nav-label">Lô sản phẩm</span>\s*</a>\n',
    html, re.DOTALL
)
assert old_block, "Lô sản phẩm block not found"
html = html[:old_block.start()] + "\n" + html[old_block.end():]

with open(fn, "w", encoding="utf-8") as f:
    f.write(html)
print("sidebar.html: Lô sản phẩm block removed")
