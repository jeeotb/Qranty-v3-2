/**
 * qranty-notify.js — lớp thông báo dữ liệu mới dùng chung cho toàn app Qranty.
 *
 * Mục tiêu: khi một luồng tạo data (bán hàng, nhập kho, thêm khách, bảo hành,
 * sửa chữa…) sinh ra bản ghi mới, hệ thống tự:
 *   1. Hiện badge đỏ (số) cạnh tên module trong sidebar.
 *   2. Cộng số trên chuông thông báo + thêm dòng vào panel chuông.
 *   3. Chèn dòng data đó vào bảng của trang đích, TÔ ĐỎ "chờ bổ sung" cho tới khi
 *      người dùng mở ra và bấm "Đã kiểm tra" (đánh dấu đã xem TỪNG DÒNG).
 *
 * Không có backend — toàn bộ feed lưu trong localStorage key 'qranty-feed' và
 * đồng bộ giữa các tab qua sự kiện 'storage'.
 *
 * Cách dùng từ một trang tạo data:
 *   Qranty.push({
 *     source: 'Đơn hàng #DH-2451',
 *     targets: [
 *       { page:'kho-hang',   kind:'product',  data:{ name:'iPhone 15', imei:'', sku:'', price:'' } },
 *       { page:'khach-hang', kind:'customer', data:{ name:'Khách lẻ', phone:'0900...', email:'' } }
 *     ]
 *   });
 *
 * API: Qranty.push(opts) · Qranty.markSeen(id) · Qranty.markAllSeen() · Qranty.clear()
 */
(function () {
  'use strict';

  var KEY = 'qranty-feed';
  var ALIAS = {
    'kho-hang-v2': 'kho-hang', 'san-pham': 'kho-hang',
    'sua-chua': 'repair-kanban', 'thuc-hien-nhanh': 'thao-tac-nhanh'
  };

  /* ── helpers ─────────────────────────────────────────────── */
  function currentPage() {
    var f = location.pathname.split('/').pop().replace(/^qranty-/, '').replace(/\.html$/, '');
    return ALIAS[f] || f;
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  function uid() { return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // ô có dữ liệu -> hiện giá trị; thiếu -> badge "Chờ bổ sung" tô đỏ
  function f(v, missing) {
    return (v == null || v === '') ? '<span class="qr-missing">' + esc(missing || 'Chờ bổ sung') + '</span>' : esc(v);
  }
  function has(v) { return !(v == null || v === ''); }

  /* ── RENDERERS theo từng trang đích ──────────────────────────
     mount  : selector tbody của bảng
     icon/color : cho icon trên panel chuông
     summary(d) : phụ đề ngắn cho dòng chuông
     cells(d)   : mảng [html, className] cho từng <td> (KHÔNG gồm ô thao tác cuối)
  ─────────────────────────────────────────────────────────────── */
  // Lưu ý: 'khach-hang' KHÔNG còn ở đây — Khách hàng đã có store thật
  // (customer-store.js) tự render bảng, nên notify không chèn dòng vào đó nữa.
  var RENDERERS = {
    'kho-hang': {
      mount: '#goodsTable tbody', icon: 'box', color: 'amber',
      selfRendered: true, // Kho hàng tự render dòng (QrantyKho normalized:false) — engine chỉ lo badge/chuông, KHÔNG chèn dòng
      summary: function (d) { return d.name ? 'SP: ' + d.name : 'Hàng hóa mới'; },
      cells: function (d) {
        var grp = d.group === 'part' ? '<span class="goods-group-badge part">Linh kiện</span>'
                                     : '<span class="goods-group-badge product">Sản phẩm</span>';
        return [
          ['<div class="kh-product"><div class="kh-product-ico"><svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="1.5" width="8" height="15" rx="1.8"/><line x1="7" y1="13.5" x2="11" y2="13.5"/></svg></div><div>'
            + '<div class="kh-product-name">' + f(d.name, 'Chưa đặt tên') + '</div>'
            + '<div class="kh-product-sub">Vừa nhập · chờ bổ sung</div></div></div>', ''],
          [f(d.sku, 'Thiếu SKU'), 'kh-mono'],
          [grp, ''],
          [f(d.type, '—'), ''],
          [f(d.price, 'Thiếu giá bán'), 'fin-only'],
          [f(d.cost, 'Thiếu giá nhập'), 'fin-only'],
          ['<span class="td-dash">-</span>', ''],
          ['<div class="kh-qty"><span class="kh-qty-num">' + esc(d.qty || 0) + '</span></div>', ''],
          [f(d.lot, '—'), ''],
          ['<span class="qr-status">Chờ bổ sung</span>', '']
        ];
      }
    },
    'bao-hanh': {
      mount: '#warrantyTable tbody', icon: 'shield', color: 'green',
      selfRendered: true, // Bảo hành tự render từ QrantyWarranty — engine chỉ lo badge/chuông
      summary: function (d) { return d.product ? 'Bảo hành: ' + d.product : 'Kích hoạt bảo hành'; },
      cells: function (d) {
        return [
          [f(d.sku, 'Thiếu mã SP'), 'kh-mono'],
          [f(d.product, 'Thiếu tên SP'), ''],
          [f(d.customer, 'Thiếu khách'), ''],
          [f(d.phone, 'Thiếu SĐT'), 'kh-mono'],
          [f(d.start, '—'), ''],
          [f(d.end, 'Chờ bổ sung'), ''],
          ['<span class="qr-status">Chờ kích hoạt</span>', ''],
          ['—', '']
        ];
      }
    },
    'repair-kanban': {
      mount: '#listTableBody', icon: 'wrench', color: 'purple',
      selfRendered: true, // Sửa chữa tự render kanban/list — engine chỉ lo badge/chuông
      summary: function (d) { return d.device ? 'Sửa: ' + d.device : 'Phiếu sửa chữa mới'; },
      cells: function (d) {
        return [
          [f(d.code, 'Chờ cấp mã'), 'kh-mono'],
          [f(d.customer, 'Thiếu khách'), ''],
          [f(d.phone, 'Thiếu SĐT'), 'kh-mono'],
          [f(d.date, '—'), ''],
          [f(d.device, 'Thiếu thiết bị'), ''],
          [f(d.fee, 'Chưa có phí'), 'right'],
          ['<span class="qr-status">Chờ xử lý</span>', ''],
          ['', 'right']
        ];
      }
    }
  };

  /* ── render: badge sidebar theo module ───────────────────── */
  function renderSidebarBadges(list) {
    var counts = {};
    list.forEach(function (it) { if (!it.seen && RENDERERS[it.page]) counts[it.page] = (counts[it.page] || 0) + 1; });
    document.querySelectorAll('.nav-item[data-page]').forEach(function (nav) {
      var page = nav.getAttribute('data-page');
      var n = counts[page] || 0;
      var badge = nav.querySelector('.ni-badge[data-qr="1"]');
      if (n > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'ni-badge alert';
          badge.setAttribute('data-qr', '1');
          nav.appendChild(badge);
        }
        badge.classList.add('alert');
        badge.textContent = n > 99 ? '99+' : n;
      } else if (badge) {
        badge.remove();
      }
    });
  }

  /* ── render: badge + panel chuông ────────────────────────── */
  function bellIcon(name) {
    var ICONS = {
      bell: '<path d="M9 1.5C6 1.5 4.5 3.5 4.5 6.5V9.5L2.5 12.5H15.5L13.5 9.5V6.5C13.5 3.5 12 1.5 9 1.5Z"/><path d="M7 14.5C7 15.6 7.9 16.5 9 16.5C10.1 16.5 11 15.6 11 14.5"/>',
      box: '<path d="M2 5.5l7-3.5 7 3.5v7l-7 3.5-7-3.5z"/><path d="M9 2v13M2 5.5l7 3.5 7-3.5"/>',
      shield: '<path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/>',
      wrench: '<path d="M14.5 3.5L12 6 10 4l2.5-2.5A4 4 0 0 0 5 7.5L2 10.5l3 3 3-3A4 4 0 0 0 14.5 3.5z"/>'
    };
    return '<svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.bell) + '</svg>';
  }
  function pageHref(page) {
    var map = { 'kho-hang': 'qranty-kho-hang-v2.html', 'khach-hang': 'qranty-khach-hang.html',
      'bao-hanh': 'qranty-bao-hanh.html', 'repair-kanban': 'qranty-repair-kanban.html',
      'dashboard': 'qranty-dashboard.html', 'tai-chinh': 'qranty-tai-chinh.html' };
    return './' + (map[page] || 'qranty-' + page + '.html');
  }
  function timeAgo(ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'vừa xong';
    if (s < 3600) return Math.floor(s / 60) + ' phút';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ';
    return Math.floor(s / 86400) + ' ngày';
  }
  function renderBell(fullList) {
    var list = fullList.filter(function (it) { return RENDERERS[it.page]; });
    var unseen = list.filter(function (it) { return !it.seen; });
    var badge = document.getElementById('notifBadge');
    if (badge) {
      if (unseen.length > 0) { badge.style.display = ''; badge.textContent = unseen.length > 99 ? '99+' : unseen.length; }
      else { badge.style.display = 'none'; }
    }
    var listEl = document.getElementById('topbarNotifList');
    if (!listEl) return;
    // gỡ các dòng động cũ do engine chèn
    listEl.querySelectorAll('.notif-item[data-qr="1"]').forEach(function (el) { el.remove(); });
    // chèn mới nhất lên đầu
    list.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 12).forEach(function (it) {
      var r = RENDERERS[it.page] || {};
      var item = document.createElement('div');
      item.className = 'notif-item' + (it.seen ? '' : ' unread');
      item.setAttribute('data-qr', '1');
      item.style.cursor = 'pointer';
      item.onclick = function () { location.href = pageHref(it.page); };
      item.innerHTML =
        '<span class="notif-dot' + (it.seen ? ' hidden' : '') + '"></span>'
        + '<span class="notif-ico ' + (r.color || 'blue') + '">' + bellIcon(r.icon) + '</span>'
        + '<div class="notif-body"><div class="notif-body-title">' + esc(it.source || 'Dữ liệu mới')
        + '</div><div class="notif-body-sub">' + esc(it.summary || '') + '</div></div>'
        + '<span class="notif-time">' + timeAgo(it.ts) + '</span>';
      listEl.insertBefore(item, listEl.firstChild);
    });
    // bỏ dòng "không có thông báo" mặc định nếu đã có item
    var empty = listEl.querySelector('div[style*="text-align:center"]');
    if (empty && list.length) empty.style.display = 'none';
  }

  /* ── render: dòng pending tô đỏ trên bảng trang hiện tại ──── */
  function renderRows(list) {
    var page = currentPage();
    var r = RENDERERS[page];
    if (!r || r.selfRendered) return; // trang tự render bảng (vd Kho hàng) → engine không chèn dòng
    var tbody = document.querySelector(r.mount);
    if (!tbody) return;
    // gỡ dòng cũ do engine chèn rồi chèn lại theo trạng thái mới nhất
    tbody.querySelectorAll('tr[data-fid]').forEach(function (el) { el.remove(); });
    list.filter(function (it) { return it.page === page && !it.notifyOnly; })
        .sort(function (a, b) { return b.ts - a.ts; })
        .forEach(function (it) {
      var cells = r.cells(it.data || {});
      var tr = document.createElement('tr');
      tr.setAttribute('data-fid', it.id);
      if (!it.seen) tr.className = 'qr-pending';
      cells.forEach(function (c) {
        var td = document.createElement('td');
        if (c[1]) td.className = c[1];
        td.innerHTML = c[0];
        tr.appendChild(td);
      });
      var act = document.createElement('td');
      if (!it.seen) {
        act.innerHTML = '<button class="qr-check-btn" onclick="Qranty.markSeen(\'' + it.id + '\')" title="Đánh dấu đã kiểm tra">'
          + '<svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 7 13 14.5 4.5"/></svg>Đã kiểm tra</button>';
      } else {
        act.innerHTML = '<span class="qr-checked" title="Đã kiểm tra"><svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 7 13 14.5 4.5"/></svg></span>';
      }
      tr.appendChild(act);
      tbody.insertBefore(tr, tbody.firstChild);
    });
  }

  /* ── toast nhỏ khi có data mới (chỉ tab đang thao tác) ────── */
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'qr-toast';
    t.innerHTML = '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7.5"/><path d="M9 8.5v4M9 5.6v.01"/></svg><span>' + esc(msg) + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 3400);
  }

  /* ── render tổng ──────────────────────────────────────────── */
  function renderAll() {
    var list = load();
    renderSidebarBadges(list);
    renderBell(list);
    renderRows(list);
  }

  /* ── public API ──────────────────────────────────────────── */
  var Qranty = window.Qranty || {};

  Qranty.push = function (opts) {
    if (!opts || !opts.targets) return;
    var list = load();
    var ts = Date.now();
    var added = 0;
    opts.targets.forEach(function (t) {
      if (!RENDERERS[t.page]) return;
      var r = RENDERERS[t.page];
      list.push({
        id: uid(), page: t.page, kind: t.kind || '', data: t.data || {},
        source: opts.source || 'Dữ liệu mới',
        summary: (opts.summary || r.summary(t.data || {})),
        notifyOnly: !!t.notifyOnly,  // true = chỉ badge/chuông/Thông báo, KHÔNG chèn dòng vào bảng
        refCode: t.refCode || '',    // mã phiếu để deep-link (?focus=) + dedup
        ts: ts, seen: false
      });
      added++;
    });
    if (!added) return;
    save(list);
    renderAll();
    toast((opts.source || 'Dữ liệu mới') + ' — đã gửi cho ' + added + ' module để kiểm tra');
  };

  Qranty.markSeen = function (id) {
    var list = load();
    var hit = false;
    list.forEach(function (it) { if (it.id === id && !it.seen) { it.seen = true; hit = true; } });
    if (hit) { save(list); renderAll(); }
  };

  Qranty.markAllSeen = function () {
    var list = load();
    list.forEach(function (it) { it.seen = true; });
    save(list); renderAll();
  };

  Qranty.clear = function () { localStorage.removeItem(KEY); renderAll(); };
  Qranty.renderRows = function() { renderRows(load()); };
  Qranty.renderAll = renderAll;

  window.Qranty = Qranty;

  /* nối "Đánh dấu đã đọc" trên chuông -> đánh dấu cả feed */
  var origMarkAll = window.__tbMarkAllRead;
  window.__tbMarkAllRead = function () { Qranty.markAllSeen(); if (typeof origMarkAll === 'function') origMarkAll(); };
  window.markAllRead = window.__tbMarkAllRead;

  /* đồng bộ giữa các tab */
  window.addEventListener('storage', function (e) { if (e.key === KEY) renderAll(); });

  /* render khi DOM sẵn sàng (sidebar/topbar đã được inject) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();
