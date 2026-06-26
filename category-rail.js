/* ============================================================
   category-rail.js — Rail "Bộ lọc Nhóm hàng" DÙNG CHUNG toàn app
   Dùng bởi: qranty-qr-code.html, qranty-bao-hanh.html (và có thể mở rộng)

   Taxonomy danh mục là DUY NHẤT, quản lý ở Kho hàng:
     - Danh mục cha   = QrantyKho.getCategories()        (qranty-kho-categories)
     - Danh mục con   = QrantyKho.getSubcategories(cha)  (qranty-kho-subcategories)
   Mọi module lọc theo đúng cây này (cha → con), không tự bịa danh mục.

   Cách dùng:
     QrantyCatRail.render({
       container: el,                 // phần tử chứa rail
       items: [{category, subCategory}, ...],   // dữ liệu của trang để đếm
       sel: { cat:'', sub:'' },       // lựa chọn hiện tại
       onSelect: function(cat, sub){ ... }      // gọi khi người dùng chọn
     });
   ============================================================ */
(function () {
  var _expanded = {};   // trạng thái mở rộng theo container id

  function kho() { return (typeof QrantyKho !== 'undefined') ? QrantyKho : null; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var UNCAT = 'Chưa phân loại';

  function injectCSS() {
    if (document.getElementById('qcrStyle')) return;
    var css = ''
      + '.qcr-rail{width:230px;flex-shrink:0;background:#fff;border:1px solid var(--n200);border-radius:var(--r);box-shadow:var(--shadow-card);padding:10px;position:sticky;top:16px;max-height:calc(100vh - 90px);overflow-y:auto;}'
      + '.qcr-hdr{font-size:13px;font-weight:800;color:var(--text-1);padding:6px 8px 12px;}'
      + '.qcr-item{display:flex;align-items:center;gap:6px;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:700;color:var(--text-2);}'
      + '.qcr-item:hover{background:var(--n50);}'
      + '.qcr-item.all{background:var(--brand);color:#fff;margin-bottom:4px;}'
      + '.qcr-item.all .qcr-count{background:rgba(255,255,255,.25);color:#fff;}'
      + '.qcr-item.active{background:var(--s50);color:var(--p700);}'
      + '.qcr-item.sub{padding-left:30px;font-weight:600;font-size:12px;}'
      + '.qcr-chev{width:16px;height:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--text-4);transition:transform .15s;}'
      + '.qcr-chev.open{transform:rotate(90deg);}'
      + '.qcr-chev.spacer{visibility:hidden;}'
      + '.qcr-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.qcr-count{font-size:11px;font-weight:800;color:var(--text-4);background:var(--n100);border-radius:10px;padding:1px 8px;flex-shrink:0;}'
      + '.qcr-item.active .qcr-count{background:#fff;color:var(--p600);}'
      + '@media(max-width:980px){.qcr-rail{width:100%;position:static;max-height:none;}}';
    var s = document.createElement('style'); s.id = 'qcrStyle'; s.textContent = css;
    document.head.appendChild(s);
  }

  var CHEV = '<svg class="qcr-chev-svg" width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 4l5 5-5 5"/></svg>';

  function render(opts) {
    injectCSS();
    var c = opts.container; if (!c) return;
    if (!c.id) c.id = 'qcr-' + Math.random().toString(36).slice(2, 7);
    var exp = _expanded[c.id] || (_expanded[c.id] = {});
    var sel = opts.sel || { cat: '', sub: '' };
    var items = opts.items || [];
    var k = kho();

    // Đếm theo cha / con
    function catOf(it) { return (it.category || '').trim() || UNCAT; }
    function subOf(it) { return (it.subCategory || '').trim(); }
    var total = items.length;
    function cntCat(cat) { return items.filter(function (it) { return catOf(it) === cat; }).length; }
    function cntSub(cat, sub) { return items.filter(function (it) { return catOf(it) === cat && subOf(it) === sub; }).length; }

    // Danh sách danh mục cha = danh mục quản lý ở kho (hiện đủ, kể cả 0) + danh mục lạ đang có trong dữ liệu
    var managed = k ? k.getCategories().slice() : [];
    var present = {}; items.forEach(function (it) { present[catOf(it)] = true; });
    var extras = Object.keys(present).filter(function (cat) { return cat !== UNCAT && managed.indexOf(cat) < 0; }).sort(function (a, b) { return a.localeCompare(b, 'vi'); });
    var cats = managed.concat(extras);
    var hasUncat = !!present[UNCAT];

    var html = '<div class="qcr-hdr">Bộ lọc Nhóm hàng</div>';
    html += '<div class="qcr-item all' + (!sel.cat ? '' : '') + '" data-cat="" data-sub=""><span class="qcr-chev spacer"></span><span class="qcr-name">Tất cả</span><span class="qcr-count">' + total + '</span></div>';

    function parentRow(cat) {
      var subsManaged = k ? k.getSubcategories(cat) : [];
      var subsPresent = {};
      items.forEach(function (it) { if (catOf(it) === cat) { var s = subOf(it); if (s) subsPresent[s] = true; } });
      var subs = subsManaged.slice();
      Object.keys(subsPresent).forEach(function (s) { if (subs.indexOf(s) < 0) subs.push(s); });
      var hasSubs = subs.length > 0;
      var isOpen = !!exp[cat];
      var active = sel.cat === cat && !sel.sub;
      var chev = hasSubs ? '<span class="qcr-chev' + (isOpen ? ' open' : '') + '" data-toggle="' + esc(cat) + '">' + CHEV + '</span>' : '<span class="qcr-chev spacer"></span>';
      var out = '<div class="qcr-item' + (active ? ' active' : '') + '" data-cat="' + esc(cat) + '" data-sub="">' + chev + '<span class="qcr-name">' + esc(cat) + '</span><span class="qcr-count">' + cntCat(cat) + '</span></div>';
      if (hasSubs && isOpen) {
        subs.sort(function (a, b) { return a.localeCompare(b, 'vi'); });
        subs.forEach(function (s) {
          var sActive = sel.cat === cat && sel.sub === s;
          out += '<div class="qcr-item sub' + (sActive ? ' active' : '') + '" data-cat="' + esc(cat) + '" data-sub="' + esc(s) + '"><span class="qcr-name">' + esc(s) + '</span><span class="qcr-count">' + cntSub(cat, s) + '</span></div>';
        });
      }
      return out;
    }

    cats.forEach(function (cat) { html += parentRow(cat); });
    if (hasUncat) {
      var uActive = sel.cat === UNCAT && !sel.sub;
      html += '<div class="qcr-item' + (uActive ? ' active' : '') + '" data-cat="' + UNCAT + '" data-sub=""><span class="qcr-chev spacer"></span><span class="qcr-name">' + UNCAT + '</span><span class="qcr-count">' + cntCat(UNCAT) + '</span></div>';
    }
    c.innerHTML = html;

    // Wire click (delegation)
    c.onclick = function (e) {
      var tog = e.target.closest('[data-toggle]');
      if (tog) { var cat = tog.getAttribute('data-toggle'); exp[cat] = !exp[cat]; render(opts); return; }
      var item = e.target.closest('.qcr-item');
      if (!item) return;
      var cat = item.getAttribute('data-cat') || '';
      var sub = item.getAttribute('data-sub') || '';
      // bấm cha có con → tự mở rộng luôn cho dễ nhìn
      if (cat && !sub && k && k.getSubcategories(cat).length) exp[cat] = true;
      if (typeof opts.onSelect === 'function') opts.onSelect(cat, sub);
    };
  }

  window.QrantyCatRail = { render: render };
})();
