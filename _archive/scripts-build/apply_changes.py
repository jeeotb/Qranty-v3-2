import re, glob, random

FILES = [
 "qranty-cai-dat.html","qranty-thong-bao.html","qranty-dashboard.html",
 "qranty-thao-tac-nhanh.html","qranty-kho-hang.html","qranty-kho-hang-v2.html",
 "qranty-repair-kanban.html","qranty-bao-hanh.html","qranty-khach-hang.html",
 "qranty-sidebar.html"
]

BADGE_CSS = """
.mode-status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: var(--s50); color: var(--p700); margin-left: 4px; }
.mode-status-badge svg { width: 12px; height: 12px; }
.mode-status-badge.store { background: var(--success-bg); color: #15803d; }
"""

BADGE_HTML = '<span class="mode-status-badge" id="modeStatusBadge"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/><path d="M6.5 9.5L8.2 11.3L11.5 7.3"/></svg> Trung tâm bảo hành</span>'

UPDATE_BADGE_FN = """
function updateModeStatusBadge() {
  var badge = document.getElementById('modeStatusBadge');
  if (!badge) return;
  var isStore = document.body.classList.contains('mode-store');
  badge.classList.toggle('store', isStore);
  if (isStore) {
    badge.innerHTML = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5 3.3 2.8h11.4l.8 3.7"/><path d="M2.5 6.5h13v8a.8.8 0 0 1-.8.8H3.3a.8.8 0 0 1-.8-.8z"/><path d="M6.5 15.3v-4h5v4"/></svg> Cửa hàng';
  } else {
    badge.innerHTML = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/><path d="M6.5 9.5L8.2 11.3L11.5 7.3"/></svg> Trung tâm bảo hành';
  }
}
"""

CONFIRM_MODAL_HTML = """
<!-- Confirm mode switch modal -->
<div class="fin-slide-backdrop" id="confirmModeBackdrop" onclick="if(event.target===this) closeConfirmModeModal()">
  <div class="fin-slide-panel" style="width:380px;max-width:92vw;top:50%;right:50%;transform:translate(50%,-50%);bottom:auto;border-radius:var(--r);">
    <div class="fin-slide-hdr" style="border-radius:var(--r) var(--r) 0 0;">
      <div class="fin-slide-hdr-title">Xác nhận đổi chế độ làm việc</div>
      <div class="fin-slide-hdr-sub" id="confirmModeBody">Đổi sang chế độ khác sẽ thay đổi giao diện và quyền truy cập cho toàn bộ nhân viên. Nhập mã xác nhận để tiếp tục:</div>
    </div>
    <div class="fin-slide-body">
      <div class="confirm-code-display" id="confirmModeCode">0000</div>
      <input type="text" class="input confirm-code-input" id="confirmModeInput" placeholder="Nhập mã xác nhận" oninput="checkConfirmModeInput()" autocomplete="off">
    </div>
    <div class="fin-slide-footer">
      <button class="btn-secondary" onclick="closeConfirmModeModal()">Huỷ</button>
      <button class="btn-primary" id="confirmModeBtn" disabled onclick="doConfirmModeSwitch()">Xác nhận</button>
    </div>
  </div>
</div>
"""

CONFIRM_MODAL_CSS = """
.confirm-code-display { text-align: center; font-family: 'SF Mono', Consolas, monospace; font-size: 32px; font-weight: 900; letter-spacing: .25em; color: var(--p700); background: var(--s50); border-radius: var(--r-sm); padding: 14px 0; margin-bottom: 14px; }
.confirm-code-input { text-align: center; font-family: 'SF Mono', Consolas, monospace; font-size: 16px; font-weight: 800; letter-spacing: .2em; }
"""

CONFIRM_MODE_JS = """
var __pendingModeSwitch = null;
var __pendingModeCode = null;
function confirmModeSwitch(mode, e) {
  if (e) e.stopPropagation();
  var current = document.body.classList.contains('mode-store') ? 'store' : 'bh';
  if (mode === current) return;
  __pendingModeSwitch = mode;
  __pendingModeCode = String(Math.floor(1000 + Math.random() * 9000));
  var label = mode === 'store' ? 'Cửa hàng' : 'Trung tâm bảo hành';
  document.getElementById('confirmModeBody').textContent = 'Đổi sang ' + label + ' sẽ thay đổi giao diện và quyền truy cập cho toàn bộ nhân viên. Nhập mã xác nhận để tiếp tục:';
  document.getElementById('confirmModeCode').textContent = __pendingModeCode;
  var input = document.getElementById('confirmModeInput');
  input.value = '';
  var btn = document.getElementById('confirmModeBtn');
  btn.disabled = true;
  document.getElementById('confirmModeBackdrop').classList.add('open');
}
function checkConfirmModeInput() {
  var input = document.getElementById('confirmModeInput');
  var btn = document.getElementById('confirmModeBtn');
  btn.disabled = (input.value !== __pendingModeCode);
}
function closeConfirmModeModal() {
  document.getElementById('confirmModeBackdrop').classList.remove('open');
  __pendingModeSwitch = null;
  __pendingModeCode = null;
}
function doConfirmModeSwitch() {
  if (!__pendingModeSwitch) return;
  setAppMode(__pendingModeSwitch);
  closeConfirmModeModal();
}
"""

GENERIC_MODE_JS = """
function setAppMode(mode, e) {
  if (e) e.stopPropagation();
  document.body.classList.toggle('mode-store', mode === 'store');
  document.querySelectorAll('.sb-mode-opt').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  localStorage.setItem('qranty-mode', mode);
  updateModeStatusBadge();
}
(function initAppMode() {
  var saved = localStorage.getItem('qranty-mode') || 'bh';
  document.body.classList.toggle('mode-store', saved === 'store');
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.sb-mode-opt').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.mode === saved);
    });
    updateModeStatusBadge();
  });
})();
"""

def insert_badge(html, fname):
    pattern = re.compile(r'(<span class="tb-breadcrumb">.*?</span>)', re.DOTALL)
    m = pattern.search(html)
    if not m:
        print(f"  WARN: no tb-breadcrumb found in {fname}")
        return html, False
    insertion = m.group(1) + "\n      " + BADGE_HTML
    html = html[:m.start()] + insertion + html[m.end():]
    return html, True

def insert_css(html):
    idx = html.find("</style>")
    if idx == -1:
        return html, False
    css_block = BADGE_CSS + CONFIRM_MODAL_CSS
    html = html[:idx] + css_block + "\n" + html[idx:]
    return html, True

def patch_sb_mode_opt_onclick(html):
    html2 = html.replace('onclick="setAppMode(\'bh\', event)"', 'onclick="confirmModeSwitch(\'bh\', event)"')
    html2 = html2.replace('onclick="setAppMode(\'store\', event)"', 'onclick="confirmModeSwitch(\'store\', event)"')
    return html2

def insert_modal_html(html):
    idx = html.rfind("</body>")
    if idx == -1:
        idx = len(html)
    html = html[:idx] + CONFIRM_MODAL_HTML + "\n" + html[idx:]
    return html

def insert_js(html, fname, has_setAppMode):
    idx = html.rfind("</script>")
    if idx == -1:
        print(f"  WARN: no </script> found in {fname}")
        return html
    js_to_add = UPDATE_BADGE_FN + CONFIRM_MODE_JS
    if not has_setAppMode:
        js_to_add += GENERIC_MODE_JS
    html = html[:idx] + js_to_add + html[idx:]
    return html

def hook_existing_setAppMode_initAppMode(html):
    html = re.sub(
        r"(localStorage\.setItem\('qranty-mode', mode\);)",
        r"\1\n  updateModeStatusBadge();",
        html
    )
    html = re.sub(
        r"(syncSettingsUI\(saved\);)",
        r"\1\n    updateModeStatusBadge();",
        html
    )
    return html

for fname in FILES:
    with open(fname, "r", encoding="utf-8") as f:
        html = f.read()

    has_setAppMode = "function setAppMode" in html

    html, ok = insert_badge(html, fname)
    html, ok2 = insert_css(html)

    html = patch_sb_mode_opt_onclick(html)
    html = insert_modal_html(html)

    if has_setAppMode:
        html = hook_existing_setAppMode_initAppMode(html)

    html = insert_js(html, fname, has_setAppMode)

    with open(fname, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{fname}: badge={ok}, css={ok2}, has_setAppMode={has_setAppMode}")

print("DONE")
