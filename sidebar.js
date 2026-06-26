(function() {
  var SIDEBAR_HTML = `<style data-sidebar-toggle>
/* Collapse button: move to top */
.sb-collapse-edge { top: 14px !important; transform: none !important; }
body.sb-collapsed .sb-collapse-edge { top: 14px !important; transform: none !important; }

/* ── Store switcher button — dark-theme override (all modules) ── */
.qr-store-wrap { position: relative; z-index: 300; }
.qr-store-switcher {
  display: flex !important; align-items: center; gap: 8px;
  width: 100%; padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.1) !important;
  background: rgba(255,255,255,.06) !important;
  cursor: pointer; text-align: left;
  transition: background .13s ease, border-color .13s ease;
  overflow: hidden;
}
.qr-store-switcher:hover { background: rgba(255,255,255,.11) !important; border-color: rgba(255,255,255,.2) !important; }
.qr-store-switcher.open { background: rgba(255,255,255,.13) !important; border-color: rgba(255,255,255,.22) !important; }
.qr-store-name { color: #fff !important; font-weight: 700; font-size: 12.5px; }
.qr-store-sub  { color: rgba(255,255,255,.5) !important; font-size: 10.5px; font-weight: 600; }
.qr-store-chevron { color: rgba(255,255,255,.4) !important; transition: transform .16s ease; }
.qr-store-switcher.open .qr-store-chevron { transform: rotate(180deg); }

/* ── Store dropdown menu ─────────────────────────────────────── */
.qr-store-menu {
  position: absolute; left: 0; right: 0; top: calc(100% + 6px);
  background: #152238;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06);
  padding: 6px; z-index: 99999;
  isolation: isolate;
  opacity: 0; visibility: hidden; transform: translateY(-8px) scale(.98);
  transform-origin: top center;
  transition: opacity .18s ease, transform .18s ease, visibility .18s ease;
  min-width: 200px;
}
.qr-store-menu.open { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }

.qr-store-search {
  width: 100%; height: 32px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.07); color: #fff;
  padding: 0 10px; font-size: 12px; font-weight: 600;
  margin-bottom: 6px; font-family: inherit;
}
.qr-store-search::placeholder { color: rgba(255,255,255,.3); }
.qr-store-search:focus { outline: none; border-color: var(--brand); background: rgba(255,255,255,.1); }

.qr-store-item {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 8px; border-radius: 8px; cursor: pointer;
  transition: background .12s;
}
.qr-store-item:hover { background: rgba(255,255,255,.07); }
.qr-store-item.active { background: rgba(37,99,235,.2); }
.qr-store-item-avatar {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 12px; flex-shrink: 0;
  letter-spacing: -.3px;
}
.qr-store-item-avatar[data-color="blue"]   { background: linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; }
.qr-store-item-avatar[data-color="teal"]   { background: linear-gradient(135deg,#0d9488,#0f766e); color:#fff; }
.qr-store-item-avatar[data-color="purple"] { background: linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; }
.qr-store-item-avatar[data-color="amber"]  { background: linear-gradient(135deg,#d97706,#b45309); color:#fff; }
.qr-store-item-text { flex: 1; min-width: 0; }
.qr-store-item-name { color: #fff; font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.35; }
.qr-store-item-sub  { color: rgba(255,255,255,.45); font-size: 11px; font-weight: 500; line-height: 1.3; margin-top: 1px; }
.qr-store-item-check { flex: 0 0 auto; color: #60a5fa; display: flex; }
.qr-store-menu-divider { height: 1px; background: rgba(255,255,255,.08); margin: 6px 2px; }
.qr-store-manage {
  display: flex; align-items: center; gap: 8px; padding: 7px 8px;
  border-radius: 8px; cursor: pointer; color: rgba(255,255,255,.38);
  font-size: 12px; font-weight: 600; transition: all .12s;
}
.qr-store-manage:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.75); }

/* ── Collapsed: dropdown pops out to the RIGHT (fixed to viewport) ── */
body.sb-collapsed .qr-store-switcher { padding: 8px; justify-content: center; gap: 0; border-radius: 8px; }
body.sb-collapsed .qr-store-menu {
  position: fixed !important;
  left: var(--sidebar-w-collapsed) !important;
  top: 10px !important;
  right: auto !important;
  width: 240px;
  border-radius: 12px;
  transform-origin: top left;
}

/* Collapsed state: smaller label font */
body.sb-collapsed .ni-label { font-size: 8px !important; font-weight: 600; letter-spacing: .01em; }

/* ── Brand logo area ── */
.sb-brand { display: flex; align-items: center; gap: 8px; padding: 0 2px; user-select: none; }
.sb-brand-logo { height: 32px; width: 32px; object-fit: contain; display: block; flex-shrink: 0; }
.sb-brand-name {
  font-family: 'Nunito', sans-serif;
  font-weight: 800; font-size: 17px;
  color: #fff; letter-spacing: -.2px; line-height: 1;
  white-space: nowrap;
}
body.sb-collapsed .sb-brand { justify-content: center; padding: 0; }
body.sb-collapsed .sb-brand-name { display: none; }

.sb-mode-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 12px; }
.sb-mode-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; color: #fff;
}
.sb-mode-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
body:not(.mode-store) .sb-mode-badge-dot { background: #A78BFA; }
body.mode-store .sb-mode-badge-dot { background: #4ADE80; }
.sb-mode-toggle { position: relative; width: 40px; height: 24px; flex-shrink: 0; }
.sb-mode-toggle input { opacity: 0; width: 0; height: 0; }
.sb-mode-toggle-slider {
  position: absolute; inset: 0; border-radius: 999px; cursor: pointer;
  background: rgba(255,255,255,.2);
  transition: background .2s ease;
}
.sb-mode-toggle-slider::before {
  content: ''; position: absolute;
  width: 18px; height: 18px; left: 3px; top: 3px;
  background: #fff; border-radius: 50%;
  transition: transform .22s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}
.sb-mode-toggle input:checked + .sb-mode-toggle-slider { background: #4ADE80; }
.sb-mode-toggle input:checked + .sb-mode-toggle-slider::before { transform: translateX(16px); }

/* ── Account menu: profile header ── */
.sba-profile-hdr {
  display: flex; align-items: center; gap: 11px;
  padding: 13px 10px 11px;
}
.sba-profile-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(145deg, var(--brand), #1d4ed8);
  box-shadow: 0 3px 10px rgba(37,99,235,.45);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 900; color: #fff; letter-spacing: -.3px;
}
.sba-profile-info { flex: 1; min-width: 0; }
.sba-profile-name { font-size: 13px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sba-profile-email { font-size: 10.5px; color: rgba(255,255,255,.45); font-weight: 500; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sba-plan-badge {
  display: inline-flex; align-items: center; gap: 4px; margin-top: 5px;
  background: rgba(37,99,235,.28); border: 1px solid rgba(96,165,250,.35);
  color: #93c5fd; font-size: 10px; font-weight: 800; letter-spacing: .04em;
  padding: 2px 8px; border-radius: 999px;
}

/* ── Account menu: info section ── */
.sba-info-section {
  padding: 2px 10px 8px;
}
.sba-info-label {
  font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(255,255,255,.28); margin-bottom: 6px; padding: 0 1px;
}
.sba-info-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,.06);
  gap: 8px;
}
.sba-info-key { font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.4); }
.sba-info-val { font-size: 11.5px; font-weight: 700; color: #fff; text-align: right; }
.sba-info-val--plan { color: #60a5fa; }
</style>
<aside class="sidebar">
  <button class="sb-collapse-edge" onclick="toggleSidebar()" title="Thu gọn">
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4 6 9l5 5"/></svg>
  </button>
  <div class="sb-logo">
    <div class="qr-store-wrap">
      <div class="sb-brand">
        <img class="sb-brand-logo" src="./icon qranty.png" alt="Qranty">
        <span class="sb-brand-name">Qranty</span>
      </div>

      <div class="qr-store-menu" id="storeMenu">
        <input class="qr-store-search" placeholder="Tìm chi nhánh...">

        <div class="qr-store-item active" onclick="switchStore(this)">
          <div class="qr-store-item-avatar" data-color="blue">Q1</div>
          <div class="qr-store-item-text">
            <div class="qr-store-item-name">Qranty Quận 1</div>
            <div class="qr-store-item-sub">Chủ cửa hàng · TP.HCM</div>
          </div>
          <div class="qr-store-item-check">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 7 13 14.5 4.5"/></svg>
          </div>
        </div>
        <div class="qr-store-item" onclick="switchStore(this)">
          <div class="qr-store-item-avatar" data-color="teal">TĐ</div>
          <div class="qr-store-item-text">
            <div class="qr-store-item-name">Qranty Thủ Đức</div>
            <div class="qr-store-item-sub">Quản lý · TP.HCM</div>
          </div>
        </div>
        <div class="qr-store-item" onclick="switchStore(this)">
          <div class="qr-store-item-avatar" data-color="purple">HN</div>
          <div class="qr-store-item-text">
            <div class="qr-store-item-name">Qranty Hà Nội</div>
            <div class="qr-store-item-sub">Nhân viên · Hà Nội</div>
          </div>
        </div>

        <div class="qr-store-menu-divider"></div>
        <div class="qr-store-manage">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="2.4"/><path d="M9 1.8v2.3M9 13.9v2.3M16.2 9h-2.3M4.1 9H1.8M14.1 3.9l-1.6 1.6M5.5 12.5 3.9 14.1M14.1 14.1l-1.6-1.6M5.5 5.5 3.9 3.9"/></svg>
          Quản lý chi nhánh
        </div>
      </div>
    </div>
  </div>

  <div class="sb-nav">
    <div class="sb-group">Quản lý</div>

    <a href="./qranty-thao-tac-nhanh.html" class="nav-item" data-page="thao-tac-nhanh">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.2 1.5 3.5 9.8h4.3l-.8 6.7 6.7-8.3H9.4z"/>
        </svg>
      </div>
      <span class="ni-label">Thao tác nhanh</span>
    </a>

    <a href="./qranty-nhap-hang.html" class="nav-item" data-page="nhap-hang">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 2v10M5 8l4 4 4-4M2 16h14"/>
        </svg>
      </div>
      <span class="ni-label">Nhập kho</span>
    </a>

    <a href="./qranty-dashboard.html" class="nav-item" data-page="dashboard">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="9.5" width="3.6" height="6.5" rx="1"/>
          <rect x="7.2" y="5.5" width="3.6" height="10.5" rx="1"/>
          <rect x="12.4" y="2" width="3.6" height="14" rx="1"/>
        </svg>
      </div>
      <span class="ni-label">Tổng quan</span>
    </a>

    <div class="sb-group">Vận hành</div>

    <a href="./qranty-kho-hang-v2.html" class="nav-item" data-page="kho-hang">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="14" height="5" rx="1.2"/><rect x="2" y="9" width="14" height="7" rx="1.2"/><path d="M6 12.5h6"/>
        </svg>
      </div>
      <span class="ni-label">Kho hàng</span>
    </a>

    <a href="./qranty-bao-hanh.html" class="nav-item" data-page="bao-hanh">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/>
          <path d="M6.5 9.5L8.2 11.3L11.5 7.3"/>
        </svg>
      </div>
      <span class="ni-label">Bảo hành</span>
    </a>

    <a href="./qranty-khach-hang.html" class="nav-item" data-page="khach-hang">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="7" cy="6" r="2.6"/>
          <path d="M2 15.5c0-3 2.2-5 5-5s5 2 5 5"/>
          <circle cx="13.2" cy="6.5" r="1.9"/>
          <path d="M11.8 10.7c2 .2 3.7 1.8 3.7 4.8"/>
        </svg>
      </div>
      <span class="ni-label">Khách hàng</span>
    </a>

    <a href="./qranty-nha-cung-cap.html" class="nav-item" data-page="nha-cung-cap">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1.5 6.5 2.6 2.5h12.8l1.1 4"/>
          <path d="M2 6.5h14v8.2a.9.9 0 0 1-.9.9H2.9a.9.9 0 0 1-.9-.9z"/>
          <path d="M6.5 6.5v9M11.5 6.5v9"/>
        </svg>
      </div>
      <span class="ni-label">Nhà cung cấp</span>
    </a>

    <a href="./qranty-repair-kanban.html" class="nav-item" data-page="repair-kanban">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11.3 2.7a3 3 0 0 0-4.1 4.1l-5 5v2.5h2.5l5-5a3 3 0 0 0 4.1-4.1l-2 2-1.9-1.9z"/>
        </svg>
      </div>
      <span class="ni-label">Sửa chữa</span>
    </a>

    <a href="./qranty-qr-code.html" class="nav-item" data-page="qr-code">
      <div class="ni-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
      </div>
      <span class="ni-label">QR Code</span>
    </a>

    <div class="sb-group">Nội bộ</div>

    <a href="./qranty-tai-chinh.html" class="nav-item fin-only" data-page="tai-chinh">
      <div class="ni-box">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 1.8h5l3.2 3.2v10.7H5z"/>
          <path d="M10 1.8v3.2h3.2"/>
          <path d="M7 9.6h4M7 12.4h4"/>
        </svg>
      </div>
      <span class="ni-label">Tài chính</span>
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
  </div>

  <div class="sb-account">
    <button class="sb-account-trigger" id="accountTrigger" onclick="toggleAccountMenu(event)" title="Ngô Quốc Hậu · haunq1997@gmail.com">
      <div class="sb-account-avatar">NH</div>
      <div class="sb-account-text">
        <div class="sb-account-name">Ngô Quốc Hậu</div>
        <div class="sb-account-email">haunq1997@gmail.com</div>
      </div>
      <div class="sb-account-chevron">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 8.5L7 5.5L10 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      </div>
    </button>

    <div class="sb-account-menu" id="accountMenu">

      <!-- Profile header -->
      <div class="sba-profile-hdr">
        <div class="sba-profile-avatar">NH</div>
        <div class="sba-profile-info">
          <div class="sba-profile-name">Ngô Quốc Hậu</div>
          <div class="sba-profile-email">haunq1997@gmail.com</div>
          <span class="sba-plan-badge">
            <svg width="9" height="9" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/><path d="M6.5 9.5L8.2 11.3L11.5 7.3"/></svg>
            Admin
          </span>
        </div>
      </div>

      <!-- Basic info -->
      <div class="sba-info-section">
        <div class="sba-info-label">THÔNG TIN CƠ BẢN</div>
        <div class="sba-info-row">
          <span class="sba-info-key">Tên cửa hàng</span>
          <span class="sba-info-val">Quốc Hậu</span>
        </div>
        <div class="sba-info-row">
          <span class="sba-info-key">Số điện thoại</span>
          <span class="sba-info-val">0917314687</span>
        </div>
        <div class="sba-info-row">
          <span class="sba-info-key">Gói dịch vụ</span>
          <span class="sba-info-val sba-info-val--plan">Admin</span>
        </div>
        <div class="sba-info-row" style="border-bottom:none">
          <span class="sba-info-key">Chi nhánh</span>
          <span class="sba-info-val">Qranty Quận 1</span>
        </div>
      </div>

      <div class="sb-account-divider"></div>

      <a href="./qranty-cai-dat.html" class="sb-account-item" data-page="cai-dat">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="2.4"/><path d="M9 1.8v2.3M9 13.9v2.3M16.2 9h-2.3M4.1 9H1.8M14.1 3.9l-1.6 1.6M5.5 12.5 3.9 14.1M14.1 14.1l-1.6-1.6M5.5 5.5 3.9 3.9"/></svg>
        Tài khoản & Cài đặt
      </a>
      <a href="#" class="sb-account-item">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7.2"/><path d="M6.7 7a2.3 2.3 0 0 1 4.4.9c0 1.5-2.1 1.8-2.1 3.4"/><path d="M9 13.4v.01"/></svg>
        Trợ giúp
      </a>
      <a href="#" class="sb-account-item">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7.2"/><path d="M7.2 6.2v5.6l4.8-2.8z" fill="currentColor" stroke="none"/></svg>
        Hướng dẫn sử dụng
      </a>
      <a href="#" class="sb-account-item">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3.5" width="14" height="11" rx="1.8"/><path d="M2.5 4.5 9 10l6.5-5.5"/></svg>
        Liên hệ
      </a>

      <div class="sb-account-divider"></div>

      <a href="#" class="sb-account-item logout">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2H3.5A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16H7"/><path d="M12 12.5 16 9l-4-3.5M16 9H6.5"/></svg>
        Đăng xuất
      </a>
    </div>
  </div>
</aside>`;

  document.currentScript.insertAdjacentHTML('beforebegin', SIDEBAR_HTML);
  document.currentScript.remove();

  var file = location.pathname.split('/').pop().replace(/^qranty-/, '').replace(/\.html$/, '');

  var aliasMap = {
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
    'san-pham': 'kho-hang'
  };

  var pageKey = aliasMap.hasOwnProperty(file) ? aliasMap[file] : file;

  var navItem = document.querySelector('.nav-item[data-page="' + pageKey + '"]')
              || document.querySelector('.nav-item[data-page="' + file + '"]');

  if (navItem) {
    navItem.classList.add('active');
  }

  // Sync toggle + dot with localStorage mode
  document.addEventListener('DOMContentLoaded', function() {
    var m = localStorage.getItem('qranty-mode') || 'bh';
    var toggle = document.getElementById('sbModeToggle');
    if (toggle) toggle.checked = (m === 'store');
  });
})();

/* ── Store switcher toggle (global, called from onclick) ──────── */
function toggleStoreMenu() {
  var menu    = document.getElementById('storeMenu');
  var trigger = document.getElementById('storeSwitcher');
  if (!menu || !trigger) return;

  var isOpen = menu.classList.contains('open');
  if (isOpen) {
    menu.classList.remove('open');
    trigger.classList.remove('open');
  } else {
    menu.classList.add('open');
    trigger.classList.add('open');
    // Focus search if present
    var search = menu.querySelector('.qr-store-search');
    if (search) setTimeout(function() { search.focus(); }, 60);
  }
}

/* Close on outside click */
document.addEventListener('click', function(e) {
  var wrap = document.querySelector('.qr-store-wrap');
  if (wrap && !wrap.contains(e.target)) {
    var menu    = document.getElementById('storeMenu');
    var trigger = document.getElementById('storeSwitcher');
    if (menu)    menu.classList.remove('open');
    if (trigger) trigger.classList.remove('open');
  }
});

/* Toggle mode from sidebar toggle switch */
function toggleModeFromSidebar(isStore) {
  var mode = isStore ? 'store' : 'bh';
  localStorage.setItem('qranty-mode', mode);
  document.body.classList.toggle('mode-store', isStore);
  var dot = document.querySelector('.sb-mode-badge-dot');
  if (dot) dot.style.background = isStore ? '#4ADE80' : '#A78BFA';
  var sbLbl = document.getElementById('sbModeLabel');
  if (sbLbl) sbLbl.textContent = isStore ? 'Nhà bán hàng' : 'Bảo hành';
  var sbBadge = document.getElementById('sbModeBadge');
  if (sbBadge) sbBadge.classList.toggle('store', isStore);
  
  if (typeof setAppMode === 'function') {
    setAppMode(mode);
  } else {
    var tbLbl = document.getElementById('modeLabel');
    if (tbLbl) tbLbl.textContent = isStore ? 'Cửa hàng' : 'Trung tâm bảo hành';
    var tbBadge = document.querySelector('.mode-status-badge');
    if (tbBadge) tbBadge.classList.toggle('store', isStore);
  }
}

/* Switch active store */
function switchStore(el) {
  document.querySelectorAll('.qr-store-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  var name = el.querySelector('.qr-store-item-name');
  var nameEl = document.querySelector('.qr-store-name');
  if (name && nameEl) nameEl.textContent = name.textContent;
  var menu = document.getElementById('storeMenu');
  var trigger = document.getElementById('storeSwitcher');
  if (menu)    menu.classList.remove('open');
  if (trigger) trigger.classList.remove('open');
}
