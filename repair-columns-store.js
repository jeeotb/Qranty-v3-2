/* ============================================================
   repair-columns-store.js — Cấu hình cột trạng thái sửa chữa
   Dùng bởi: qranty-repair-kanban.html (render cột), qranty-cai-dat.html (quản lý)

   Kanban sửa chữa render ĐỘNG từ danh sách cột này, nên thêm/sửa/xoá cột ở
   Cài đặt sẽ phản ánh ngay sang trang Sửa chữa. Mặc định gọn 4 cột cho vừa
   màn hình (ít kéo thả). Mỗi cột: { key, label, color }.
   ============================================================ */
(function () {
  var KEY = 'qranty-repair-columns';

  var COLORS = {
    blue:   '#2563EB', amber: '#F59E0B', green: '#22C55E', teal: '#14B8A6',
    purple: '#8B5CF6', red:   '#EF4444', sky:   '#0EA5E9', gray: '#64748B'
  };

  function _default() {
    return [
      { key: 'tiep-nhan',  label: 'Tiếp nhận',  color: 'blue'  },
      { key: 'dang-sua',   label: 'Đang sửa',   color: 'amber' },
      { key: 'hoan-thanh', label: 'Hoàn thành', color: 'green' },
      { key: 'tra-may',    label: 'Trả máy',    color: 'teal'  }
    ];
  }

  function slug(s) {
    return String(s || '').toLowerCase().trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('cot-' + Date.now().toString(36));
  }

  function _load() { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }
  function _save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }

  function getAll() {
    var list = _load();
    if (!list || !list.length) { list = _default(); _save(list); }
    return list;
  }

  function add(label, color) {
    var list = getAll();
    var key = slug(label);
    if (list.some(function (c) { return c.key === key; })) key += '-' + Date.now().toString(36).slice(-3);
    var rec = { key: key, label: label || 'Cột mới', color: COLORS[color] ? color : 'gray' };
    list.push(rec);
    _save(list);
    return rec;
  }

  function update(key, patch) {
    var list = getAll();
    var c = list.filter(function (x) { return x.key === key; })[0];
    if (!c) return null;
    if (patch.label != null) c.label = patch.label;
    if (patch.color && COLORS[patch.color]) c.color = patch.color;
    _save(list);
    return c;
  }

  function remove(key) {
    var list = getAll().filter(function (c) { return c.key !== key; });
    if (!list.length) list = _default();   // luôn còn ít nhất 1 cột
    _save(list);
    return list;
  }

  function move(key, dir) {           // dir = -1 (trái) | +1 (phải)
    var list = getAll();
    var i = list.findIndex(function (c) { return c.key === key; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return list;
    var t = list[i]; list[i] = list[j]; list[j] = t;
    _save(list);
    return list;
  }

  function colorHex(color) { return COLORS[color] || COLORS.gray; }

  window.QrantyRepairCols = {
    getAll: getAll, add: add, update: update, remove: remove, move: move,
    colorHex: colorHex, COLORS: COLORS, slug: slug
  };
})();
