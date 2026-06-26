import re

dir_ = "/sessions/hopeful-keen-hamilton/mnt/UX UI/Code ver 3/"

snippet_nibox = '''    <a href="./qranty-thong-bao.html" class="nav-item">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 1.5C6 1.5 4.5 3.5 4.5 6.5V9.5L2.5 12.5H15.5L13.5 9.5V6.5C13.5 3.5 12 1.5 9 1.5Z"/>
          <path d="M7 14.5C7 15.6 7.9 16.5 9 16.5C10.1 16.5 11 15.6 11 14.5"/>
        </svg>
      </div>
      <span class="ni-label">Thông báo</span>
    </a>

'''

snippet_navicon = '''    <a href="./qranty-thong-bao.html" class="nav-item">
      <div class="nav-icon-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 1.5C6 1.5 4.5 3.5 4.5 6.5V9.5L2.5 12.5H15.5L13.5 9.5V6.5C13.5 3.5 12 1.5 9 1.5Z"/>
          <path d="M7 14.5C7 15.6 7.9 16.5 9 16.5C10.1 16.5 11 15.6 11 14.5"/>
        </svg>
      </div>
      <span class="nav-label">Thông báo</span>
    </a>

'''

ni_files = [
    "qranty-thao-tac-nhanh.html",
    "qranty-dashboard.html",
    "qranty-kho-hang.html",
    "qranty-kho-hang-v2.html",
    "qranty-repair-kanban.html",
    "qranty-bao-hanh.html",
    "qranty-khach-hang.html",
]

results = {}

for fname in ni_files:
    path = dir_ + fname
    with open(path, encoding='utf-8') as f:
        content = f.read()
    # find the sb-divider line that precedes Cài đặt
    lines = content.split('\n')
    # find last occurrence of '<div class="sb-divider"></div>' before a line with Cài đặt</span>
    divider_idx = None
    for i, line in enumerate(lines):
        if 'sb-divider' in line and '</div>' in line and '<div' in line:
            # check if Cài đặt follows within next ~10 lines
            for j in range(i, min(i+12, len(lines))):
                if 'Cài đặt</span>' in lines[j]:
                    divider_idx = i
                    break
        if divider_idx is not None:
            break
    if divider_idx is None:
        results[fname] = "FAIL: no sb-divider found before Cài đặt"
        continue
    # insert snippet lines before divider_idx
    snippet_lines = snippet_nibox.rstrip('\n').split('\n')
    new_lines = lines[:divider_idx] + snippet_lines + [''] + lines[divider_idx:]
    new_content = '\n'.join(new_lines)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    results[fname] = "OK"

# sidebar.html special case
path = dir_ + "qranty-sidebar.html"
with open(path, encoding='utf-8') as f:
    content = f.read()
lines = content.split('\n')
target_idx = None
for i, line in enumerate(lines):
    if 'sb-section-label' in line and 'Hệ thống' in line:
        target_idx = i
        break
if target_idx is None:
    results["qranty-sidebar.html"] = "FAIL: Hệ thống section label not found"
else:
    snippet_lines = snippet_navicon.rstrip('\n').split('\n')
    new_lines = lines[:target_idx] + snippet_lines + [''] + lines[target_idx:]
    new_content = '\n'.join(new_lines)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    results["qranty-sidebar.html"] = "OK"

for k, v in results.items():
    print(k, v)
