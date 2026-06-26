/* ============================================================
   customer-store.js — kho Khách hàng dùng chung (localStorage)
   Dùng bởi: qranty-khach-hang.html, qranty-thao-tac-nhanh.html,
             qranty-repair-kanban.html

   Khách hàng là THỰC THỂ TRUNG TÂM: Đơn hàng / Sửa chữa upsert vào
   đây theo SĐT (khóa định danh) — không tạo khách trùng. Số liệu
   "SP đã mua / Tổng chi tiêu / Công nợ" được tính trực tiếp từ
   QrantyThuChi (khớp theo SĐT) nên luôn khớp với phiếu thật.
   ============================================================ */
(function () {
  var KEY = 'qranty-customers';

  function digits(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }
  function today() { return new Date().toLocaleDateString('vi-VN'); }
  function uid() { return 'kh-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function _seed() {
    return [
      { id: 'kh-seed-1', name: 'Phạm Việt Hưng', phone: '0888444415', email: 'vhfashion18193@gmail.com', dob: '', gender: '', type: 'vip',     address: '', note: '', createdAt: '26/05/2026', updatedAt: '26/05/2026' },
      { id: 'kh-seed-2', name: 'Nguyễn Văn An',  phone: '0901234567', email: '',                          dob: '', gender: '', type: 'vip',     address: '', note: '', createdAt: '22/06/2026', updatedAt: '22/06/2026' },
      { id: 'kh-seed-3', name: 'Trần Quốc Bảo',  phone: '0987654321', email: '',                          dob: '', gender: '', type: 'regular', address: '', note: '', createdAt: '21/06/2026', updatedAt: '21/06/2026' },
      { id: 'kh-seed-4', name: 'Linh',           phone: '0911312223', email: '',                          dob: '', gender: '', type: 'regular', address: '', note: '', createdAt: '14/05/2026', updatedAt: '14/05/2026' }
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

  function getByPhone(phone) {
    var d = digits(phone); if (!d) return null;
    return getAll().filter(function (c) { return digits(c.phone) === d; })[0] || null;
  }

  /**
   * Tạo mới hoặc gắn vào khách đã có (dedupe theo SĐT).
   * - SĐT đã tồn tại → merge các trường mới có giá trị (không ghi đè bằng rỗng).
   * - Chưa có → tạo hồ sơ mới.
   * Trả về { record, isNew }.
   */
  function upsert(input) {
    input = input || {};
    var list = getAll();
    var d = digits(input.phone);
    var idx = d ? list.findIndex(function (c) { return digits(c.phone) === d; }) : -1;

    if (idx >= 0) {
      var cur = list[idx];
      ['name', 'phone', 'email', 'dob', 'gender', 'type', 'address', 'note'].forEach(function (k) {
        if (input[k] != null && input[k] !== '') cur[k] = input[k];
      });
      cur.updatedAt = today();
      _save(list);
      return { record: cur, isNew: false };
    }

    var rec = {
      id: uid(),
      name: input.name || 'Khách lẻ',
      phone: input.phone || '',
      email: input.email || '', dob: input.dob || '', gender: input.gender || '',
      type: input.type || 'regular', address: input.address || '', note: input.note || '',
      createdAt: today(), updatedAt: today()
    };
    list.unshift(rec);
    _save(list);
    return { record: rec, isNew: true };
  }

  function remove(id) {
    var list = getAll().filter(function (c) { return c.id !== id; });
    _save(list);
  }

  function search(q) {
    if (!q) return getAll();
    var s = q.toLowerCase().trim();
    return getAll().filter(function (c) {
      return (c.name || '').toLowerCase().indexOf(s) >= 0
          || digits(c.phone).indexOf(digits(q)) >= 0 && digits(q)
          || (c.email || '').toLowerCase().indexOf(s) >= 0;
    });
  }

  /** Số liệu mua hàng của 1 khách — tính từ Thu chi (khớp SĐT ở cột code). */
  function stats(phone) {
    var out = { orders: 0, totalSpent: 0, debt: 0, lastDate: '' };
    if (typeof QrantyThuChi === 'undefined') return out;
    var d = digits(phone); if (!d) return out;
    var thu = (QrantyThuChi.getData().thu) || [];
    thu.forEach(function (e) {
      if (digits(e.code) !== d) return;
      out.orders++;
      out.totalSpent += Number(e.amount) || 0;
      out.debt += Number(e.remain) || 0;
      if (!out.lastDate) out.lastDate = e.date || '';
    });
    return out;
  }

  window.QrantyKhach = {
    getAll: getAll, getByPhone: getByPhone, upsert: upsert,
    remove: remove, search: search, stats: stats, digits: digits
  };
})();
