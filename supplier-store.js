/* ============================================================
   supplier-store.js — kho Nhà cung cấp dùng chung (localStorage)
   Dùng bởi: qranty-nha-cung-cap.html, qranty-nhap-hang.html

   ĐỐI XỨNG với customer-store.js: khách hàng = tiền vào (thu),
   nhà cung cấp = tiền ra (chi). Hồ sơ NCC chỉ lưu THÔNG TIN (ai
   là NCC, liên hệ, loại). Mọi con số tiền — đã nhập / công nợ phải
   trả — KHÔNG lưu ở đây mà tính trực tiếp từ QrantyThuChi.chi
   (khớp theo TÊN nhà cung cấp, vì phiếu nhập ghi chi.name = nguồn
   nhập). Một nguồn sự thật duy nhất, không lệch với phiếu thật.

   type: 'ncc' (nhà cung cấp) | 'npp' (nhà phân phối) | 'khac'
   ============================================================ */
(function () {
  var KEY = 'qranty-suppliers';

  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
  function digits(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }
  function today() { return new Date().toLocaleDateString('vi-VN'); }
  function uid() { return 'ncc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function _seed() {
    return [
      { id: 'ncc-seed-1', name: 'Phong Vũ', phone: '0902111222', email: '', contact: 'Anh Minh', type: 'npp', address: 'Q.1, TP.HCM', note: 'Nhà phân phối chính', createdAt: '20/06/2026', updatedAt: '20/06/2026' },
      { id: 'ncc-seed-2', name: 'Nhà cung cấp ABC', phone: '0903444555', email: '', contact: '', type: 'ncc', address: '', note: '', createdAt: '22/06/2026', updatedAt: '22/06/2026' }
    ];
  }

  function _load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return null;
  }
  function _save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }

  function getAll() {
    var list = _load();
    if (!list) { list = _seed(); _save(list); }
    return list;
  }

  function getByName(name) {
    var n = norm(name); if (!n) return null;
    return getAll().filter(function (s) { return norm(s.name) === n; })[0] || null;
  }

  /**
   * Tạo mới hoặc gắn vào NCC đã có (dedupe theo TÊN).
   * - Tên đã tồn tại → merge các trường mới có giá trị (không ghi đè bằng rỗng).
   * - Chưa có → tạo hồ sơ mới (mặc định type 'ncc').
   * Trả về { record, isNew }.
   */
  function upsert(input) {
    input = input || {};
    if (!norm(input.name)) return { record: null, isNew: false };
    var list = getAll();
    var n = norm(input.name);
    var idx = list.findIndex(function (s) { return norm(s.name) === n; });

    if (idx >= 0) {
      var cur = list[idx];
      ['name', 'phone', 'email', 'contact', 'type', 'address', 'note'].forEach(function (k) {
        if (input[k] != null && input[k] !== '') cur[k] = input[k];
      });
      cur.updatedAt = today();
      _save(list);
      return { record: cur, isNew: false };
    }

    var rec = {
      id: uid(),
      name: input.name,
      phone: input.phone || '', email: input.email || '', contact: input.contact || '',
      type: input.type || 'ncc', address: input.address || '', note: input.note || '',
      createdAt: today(), updatedAt: today()
    };
    list.unshift(rec);
    _save(list);
    return { record: rec, isNew: true };
  }

  function remove(id) {
    var list = getAll().filter(function (s) { return s.id !== id; });
    _save(list);
  }

  function search(q) {
    if (!q) return getAll();
    var s = norm(q);
    return getAll().filter(function (c) {
      return norm(c.name).indexOf(s) >= 0
          || (digits(q) && digits(c.phone).indexOf(digits(q)) >= 0)
          || norm(c.contact).indexOf(s) >= 0
          || (c.email || '').toLowerCase().indexOf(s) >= 0;
    });
  }

  /** Số liệu nhập hàng của 1 NCC — tính từ Thu chi (cột chi, khớp theo tên). */
  function stats(name) {
    var out = { lots: 0, totalPurchased: 0, debt: 0, lastDate: '' };
    if (typeof QrantyThuChi === 'undefined') return out;
    var n = norm(name); if (!n) return out;
    var chi = (QrantyThuChi.getData().chi) || [];
    chi.forEach(function (e) {
      if (e.source !== 'nhaphang') return;
      if (norm(e.name) !== n) return;
      out.lots++;
      out.totalPurchased += Number(e.amount) || 0;
      out.debt += Number(e.remain) || 0;
      if (!out.lastDate) out.lastDate = e.date || '';
    });
    return out;
  }

  /** Tổng công nợ phải trả toàn bộ NCC (mình nợ NCC) — dùng cho stat card. */
  function totalPayable() {
    if (typeof QrantyThuChi === 'undefined') return 0;
    var chi = (QrantyThuChi.getData().chi) || [];
    return chi.reduce(function (sum, e) {
      return sum + (e.source === 'nhaphang' ? (Number(e.remain) || 0) : 0);
    }, 0);
  }

  function typeLabel(t) {
    if (t === 'npp') return 'Nhà phân phối';
    if (t === 'khac') return 'Khác';
    return 'Nhà cung cấp';
  }

  window.QrantySupplier = {
    getAll: getAll, getByName: getByName, upsert: upsert,
    remove: remove, search: search, stats: stats,
    totalPayable: totalPayable, typeLabel: typeLabel, norm: norm, digits: digits
  };
})();
