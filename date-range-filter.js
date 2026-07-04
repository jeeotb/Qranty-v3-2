/* ============================================================
   date-range-filter.js — Bộ lọc thời gian dùng chung (compact)
   Dùng bởi: qranty-tai-chinh, qranty-bao-hanh, qranty-repair-kanban,
             qranty-qr-code, qranty-kho-hang-v2, qranty-khach-hang

   UI: 1 <select> gọn (Tất cả / Hôm nay / 7 / 30 / 90 ngày / Tùy chỉnh).
       Chọn "Tùy chỉnh" → hiện 1 box khoảng ngày; bấm vào mở 1 calendar
       popover, chọn ngày bắt đầu rồi ngày kết thúc ngay trên cùng 1 lịch
       (không chiếm chỗ toolbar bằng 2 ô input rời).
   CSS: các class .qdr-* nằm trong shared.css.

   Cách dùng:
     var dr = QrantyDateRange.mount({ el: '#myDateFilter', onChange: renderFn });
     if (!dr.inRange(item.date)) return false;  // 'dd/mm/yyyy', 'yyyy-mm-dd' hoặc Date
     var r = dr.getRange();                     // { from: Date|null, to: Date|null }
   ============================================================ */
(function () {
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtVN(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function daysAgo(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n); return d; }
  function sameDay(a, b) { return a && b && a.getTime() === b.getTime(); }

  /* Nhận 'dd/mm/yyyy', 'yyyy-mm-dd' hoặc Date → Date 00:00 hoặc null */
  function parseAny(v) {
    if (!v) return null;
    if (v instanceof Date) { var c = new Date(v); c.setHours(0, 0, 0, 0); return isNaN(c.getTime()) ? null : c; }
    var s = String(v).trim(), d = null, p;
    if (s.indexOf('/') > -1) {            // dd/mm/yyyy
      p = s.split('/');
      if (p.length === 3) d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
    } else if (s.indexOf('-') > -1) {     // yyyy-mm-dd (có thể kèm T...)
      p = s.slice(0, 10).split('-');
      if (p.length === 3) d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }
    return (d && !isNaN(d.getTime())) ? d : null;
  }

  function mount(opts) {
    opts = opts || {};
    var host = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el;
    if (!host) return null;
    var onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};

    host.classList.add('qdr-wrap');
    host.innerHTML =
      '<select class="qdr-select" title="Lọc theo thời gian">' +
        '<option value="all">Tất cả thời gian</option>' +
        '<option value="today">Hôm nay</option>' +
        '<option value="7">7 ngày qua</option>' +
        '<option value="30">30 ngày qua</option>' +
        '<option value="90">90 ngày qua</option>' +
        '<option value="custom">Tùy chỉnh…</option>' +
      '</select>' +
      '<span class="qdr-custom" style="display:none">' +
        '<button type="button" class="qdr-trigger">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
          '<span class="qdr-trigger-txt">Chọn khoảng ngày</span>' +
        '</button>' +
        '<div class="qdr-pop"></div>' +
      '</span>';

    var sel = host.querySelector('.qdr-select');
    var customBox = host.querySelector('.qdr-custom');
    var trigger = host.querySelector('.qdr-trigger');
    var triggerTxt = host.querySelector('.qdr-trigger-txt');
    var pop = host.querySelector('.qdr-pop');

    /* ── State của calendar ── */
    var now = new Date();
    var viewY = now.getFullYear(), viewM = now.getMonth();
    var selStart = null, selEnd = null;

    function updateTriggerTxt() {
      if (selStart && selEnd) triggerTxt.textContent = fmtVN(selStart) + ' → ' + fmtVN(selEnd);
      else if (selStart) triggerTxt.textContent = fmtVN(selStart) + ' → …';
      else triggerTxt.textContent = 'Chọn khoảng ngày';
    }

    function renderCal() {
      var wd = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      var html = '<div class="qdr-cal-head">' +
        '<button type="button" class="qdr-nav" data-nav="-1">‹</button>' +
        '<span class="qdr-cal-title">Tháng ' + (viewM + 1) + ', ' + viewY + '</span>' +
        '<button type="button" class="qdr-nav" data-nav="1">›</button>' +
      '</div><div class="qdr-grid">';
      wd.forEach(function (w) { html += '<span class="qdr-wd">' + w + '</span>'; });

      var offset = (new Date(viewY, viewM, 1).getDay() + 6) % 7; // Thứ 2 đứng đầu
      var total = new Date(viewY, viewM + 1, 0).getDate();
      var today = new Date(); today.setHours(0, 0, 0, 0);

      for (var i = 0; i < offset; i++) html += '<span class="qdr-day is-blank"></span>';
      for (var day = 1; day <= total; day++) {
        var d = new Date(viewY, viewM, day);
        var cls = 'qdr-day';
        if (sameDay(d, today)) cls += ' is-today';
        if (selStart && sameDay(d, selStart)) cls += ' is-start';
        if (selEnd && sameDay(d, selEnd)) cls += ' is-end';
        if (selStart && selEnd && d > selStart && d < selEnd) cls += ' in-range';
        html += '<button type="button" class="' + cls + '" data-day="' + day + '">' + day + '</button>';
      }
      html += '</div><div class="qdr-foot">' +
        '<span class="qdr-hint">' + (!selStart || selEnd ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc') + '</span>' +
        '<button type="button" class="qdr-clear">Xóa</button>' +
      '</div>';
      pop.innerHTML = html;
    }

    function openPop() { renderCal(); pop.classList.add('open'); }
    function closePop() { pop.classList.remove('open'); }

    function pickDay(day) {
      var d = new Date(viewY, viewM, day);
      if (!selStart || (selStart && selEnd)) {          // bắt đầu lượt chọn mới
        selStart = d; selEnd = null;
        renderCal(); updateTriggerTxt();
      } else {                                          // chọn ngày kết thúc
        if (d < selStart) { selEnd = selStart; selStart = d; }
        else selEnd = d;
        updateTriggerTxt();
        closePop();
        onChange();
      }
    }

    /* ── Events ── */
    sel.addEventListener('change', function () {
      var custom = sel.value === 'custom';
      customBox.style.display = custom ? 'inline-flex' : 'none';
      if (custom) {
        if (!selStart) { selStart = daysAgo(6); selEnd = daysAgo(0); } // gợi ý sẵn 7 ngày gần nhất
        updateTriggerTxt();
        openPop();
      } else {
        closePop();
      }
      onChange();
    });

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      pop.classList.contains('open') ? closePop() : openPop();
    });

    pop.addEventListener('click', function (e) {
      e.stopPropagation();
      var nav = e.target.closest('.qdr-nav');
      if (nav) {
        viewM += Number(nav.dataset.nav);
        if (viewM < 0) { viewM = 11; viewY--; }
        if (viewM > 11) { viewM = 0; viewY++; }
        renderCal();
        return;
      }
      if (e.target.closest('.qdr-clear')) {
        selStart = null; selEnd = null;
        renderCal(); updateTriggerTxt();
        onChange();
        return;
      }
      var dayBtn = e.target.closest('.qdr-day:not(.is-blank)');
      if (dayBtn) pickDay(Number(dayBtn.dataset.day));
    });

    document.addEventListener('click', function (e) {
      if (!host.contains(e.target)) closePop();
    });

    /* ── API (giữ nguyên cho các trang đang dùng) ── */
    var api = {
      getRange: function () {
        var m = sel.value;
        if (m === 'all') return { from: null, to: null };
        var to = new Date(); to.setHours(0, 0, 0, 0);
        if (m === 'today') return { from: to, to: to };
        if (m === '7' || m === '30' || m === '90') return { from: daysAgo(Number(m) - 1), to: to };
        return { from: selStart, to: selEnd || selStart };
      },
      inRange: function (v) {
        var r = api.getRange();
        if (!r.from && !r.to) return true;
        var d = parseAny(v);
        if (!d) return false;
        if (r.from && d < r.from) return false;
        if (r.to && d > r.to) return false;
        return true;
      },
      getMode: function () { return sel.value; }
    };
    return api;
  }

  window.QrantyDateRange = { mount: mount, parse: parseAny };
})();
