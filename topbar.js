/**
 * topbar.js — Qranty shared topbar component
 * Usage: đặt window.TOPBAR_CONFIG trước khi include script này
 *
 * window.TOPBAR_CONFIG = {
 *   title:      'Tên module',
 *   breadcrumb: 'Mô tả ngắn',
 *   notifs: [
 *     { color: 'amber|blue|green|red|purple', icon: 'warning|bell|check|info|shield|wrench|box|qr|zns', title: '...', sub: '...', time: '3h', unread: true },
 *   ]
 * };
 */
(function () {
  /* ─── CONFIG ─────────────────────────────────────────────── */
  var cfg     = window.TOPBAR_CONFIG || {};
  var title   = cfg.title      || 'Qranty';
  var crumb   = cfg.breadcrumb || '';
  var notifs  = cfg.notifs     || [];
  var unread  = notifs.filter(function (n) { return n.unread; }).length;

  /* ─── ICON MAP ───────────────────────────────────────────── */
  var ICONS = {
    warning: '<path d="M9 2L16.5 15.5H1.5z"/><path d="M9 8v3M9 13.5v.01"/>',
    bell:    '<path d="M9 1.5C6 1.5 4.5 3.5 4.5 6.5V9.5L2.5 12.5H15.5L13.5 9.5V6.5C13.5 3.5 12 1.5 9 1.5Z"/><path d="M7 14.5C7 15.6 7.9 16.5 9 16.5C10.1 16.5 11 15.6 11 14.5"/>',
    check:   '<circle cx="9" cy="9" r="7"/><path d="M6 9.5l2 2 4-4.5"/>',
    info:    '<circle cx="9" cy="9" r="7.2"/><path d="M9 8.5v4M9 6v.01"/>',
    shield:  '<path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/>',
    wrench:  '<path d="M14.5 3.5L12 6 10 4l2.5-2.5A4 4 0 0 0 5 7.5L2 10.5l3 3 3-3A4 4 0 0 0 14.5 3.5z"/>',
    box:     '<path d="M2 5.5l7-3.5 7 3.5v7l-7 3.5-7-3.5z"/><path d="M9 2v13M2 5.5l7 3.5 7-3.5"/>',
    qr:      '<rect x="2" y="2" width="6" height="6"/><rect x="10" y="2" width="6" height="6"/><rect x="2" y="10" width="6" height="6"/><rect x="10" y="10" width="3" height="3"/><rect x="13" y="13" width="3" height="3"/>',
    zns:     '<rect x="2" y="3" width="14" height="11" rx="1.5"/><path d="M2 4.5 9 9.5l7-5"/>',
    sync:    '<path d="M15 9A6 6 0 0 1 3.3 12.7"/><path d="M3 9A6 6 0 0 1 14.7 5.3"/><polyline points="15,5.3 14.7,5.3 14.7,2"/><polyline points="3,12.7 3.3,12.7 3.3,16"/>',
  };

  function svgIcon(name, size) {
    size = size || 14;
    var d = ICONS[name] || ICONS['bell'];
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  /* ─── NOTIF ITEMS ────────────────────────────────────────── */
  var notifHTML = '';
  notifs.forEach(function (n) {
    var dot   = n.unread ? '<span class="notif-dot"></span>' : '<span class="notif-dot hidden"></span>';
    var ico   = svgIcon(n.icon || 'bell', 14);
    var color = n.color || 'blue';
    notifHTML += [
      '<div class="notif-item' + (n.unread ? ' unread' : '') + '">',
        dot,
        '<span class="notif-ico ' + color + '">' + ico + '</span>',
        '<div class="notif-body">',
          '<div class="notif-body-title">' + n.title + '</div>',
          (n.sub ? '<div class="notif-body-sub">' + n.sub + '</div>' : ''),
        '</div>',
        '<span class="notif-time">' + (n.time || '') + '</span>',
      '</div>',
    ].join('');
  });

  /* ─── TOPBAR HTML ────────────────────────────────────────── */
  var badgeHTML = unread > 0
    ? '<span class="tb-notif-badge" id="notifBadge">' + unread + '</span>'
    : '<span class="tb-notif-badge" id="notifBadge" style="display:none">0</span>';

  var html = [
    '<header class="topbar">',
      '<div class="tb-left">',
        '<span class="tb-title">' + title + '</span>',
        (crumb ? '<div class="tb-sep"></div><span class="tb-breadcrumb">' + crumb + '</span>' : ''),
        '<span class="mode-status-badge" id="modeStatusBadge">',
          '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/><path d="M6.5 9.5L8.2 11.3L11.5 7.3"/></svg>',
          ' <span id="modeLabel">Trung tâm bảo hành</span>',
        '</span>',
      '</div>',
      '<div class="tb-actions">',
        '<div class="tb-sync-wrap">',
          '<button class="tb-btn" title="Đồng bộ dữ liệu" onclick="__tbHandleSync(this)">',
            svgIcon('sync', 16),
          '</button>',
          '<span class="sync-tooltip" id="syncTooltip">Cập nhật lần cuối: --</span>',
        '</div>',
        '<div class="tb-notif-wrap">',
          '<button class="tb-btn" title="Thông báo" onclick="__tbToggleNotif(event)">',
            svgIcon('bell', 16),
            badgeHTML,
          '</button>',
          '<div class="notif-panel" id="notifPanel">',
            '<div class="notif-panel-hdr">',
              '<span class="notif-panel-title">Thông báo</span>',
              '<button class="notif-mark-all" onclick="__tbMarkAllRead()">Đánh dấu đã đọc</button>',
            '</div>',
            '<div class="notif-list" id="topbarNotifList">',
              (notifHTML || '<div style="padding:20px;text-align:center;color:var(--text-4);font-size:13px">Không có thông báo mới</div>'),
            '</div>',
            '<div class="notif-panel-footer"><a href="./qranty-thong-bao.html">Xem tất cả thông báo</a></div>',
          '</div>',
        '</div>',
      '</div>',
    '</header>',
  ].join('');

  /* ─── INJECT ─────────────────────────────────────────────── */
  document.currentScript.insertAdjacentHTML('afterend', html);

  /* ─── MODE BADGE ─────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var mode = localStorage.getItem('qranty-mode') || 'bh';
    var lbl  = document.getElementById('modeLabel');
    if (lbl) lbl.textContent = mode === 'store' ? 'Cửa hàng' : 'Trung tâm bảo hành';
  });

  /* ─── JS FUNCTIONS (global, prefixed to avoid conflicts) ─── */
  window.__tbHandleSync = function (btn) {
    btn.classList.add('syncing');
    setTimeout(function () {
      btn.classList.remove('syncing');
      var now = new Date();
      var d   = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      var t   = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      var tip = document.getElementById('syncTooltip');
      if (tip) {
        tip.textContent = 'Cập nhật lần cuối: ' + d + ' lúc ' + t;
        tip.classList.add('show');
        setTimeout(function () { tip.classList.remove('show'); }, 3000);
      }
    }, 900);
  };

  window.__tbToggleNotif = function (e) {
    if (e) e.stopPropagation();
    var panel = document.getElementById('notifPanel');
    if (panel) panel.classList.toggle('open');
  };

  window.__tbMarkAllRead = function () {
    document.querySelectorAll('#topbarNotifList .notif-item.unread').forEach(function (el) {
      el.classList.remove('unread');
    });
    document.querySelectorAll('#topbarNotifList .notif-dot').forEach(function (el) {
      el.classList.add('hidden');
    });
    var badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
  };

  /* close panel on outside click */
  document.addEventListener('click', function (e) {
    var wrap = document.querySelector('.tb-notif-wrap');
    if (wrap && !wrap.contains(e.target)) {
      var panel = document.getElementById('notifPanel');
      if (panel) panel.classList.remove('open');
    }
  });

  /* backward-compat aliases (old onclick handlers in pages) */
  window.handleSync    = window.__tbHandleSync;
  window.toggleNotif   = window.__tbToggleNotif;
  window.markAllRead   = window.__tbMarkAllRead;

})();
