/* ============================================================
   thuchi-store.js — kho dữ liệu Thu chi dùng chung (localStorage)
   Dùng bởi: qranty-tai-chinh.html, qranty-thao-tac-nhanh.html,
             qranty-kho-hang-v2.html.

   Mục đích: khi 1 phiếu thật (bán hàng, nhập hàng...) phát sinh
   tiền cần thu/cần chi, các trang đó gọi addEntry() để ghi nhận
   thẳng vào đây — Thu chi không còn là nơi nhập tay là chính,
   mà là nơi xem/tổng hợp những gì các phiếu đã tự sinh ra.
   ============================================================ */
(function () {
  var KEY = 'qranty-thuchi-data-v2';

  function _seed() {
    return {
      thu: [
        { id: 'seed-thu-1', name: 'Nguyễn Văn An', code: '0901234567',
          amount: 32990000, paid: 32990000, remain: 0,
          ref: 'Phiếu bán hàng — iPhone 15 Pro Max', source: 'banhang', date: '22/06/2026' },
        { id: 'seed-thu-2', name: 'Trần Quốc Bảo', code: '0987654321',
          amount: 2400000, paid: 1000000, remain: 1400000,
          ref: 'Phiếu sửa chữa — SV-202604-00010 · Sửa nguồn iPhone', source: 'suachua', date: '21/06/2026' }
      ],
      chi: [
        { id: 'seed-chi-1', name: 'Nhà cung cấp ABC', code: 'NCC001',
          amount: 5500000, paid: 5500000, remain: 0,
          ref: 'Phiếu nhập hàng — lô LOT-2606', source: 'nhaphang', date: '22/06/2026' },
        { id: 'seed-chi-2', name: 'Khách lai linh kiện', code: '',
          amount: 350000, paid: 350000, remain: 0,
          ref: 'Tạo sản phẩm lẻ — Pin BMS', source: 'le', date: '20/06/2026' }
      ]
    };
  }

  function _load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage không khả dụng hoặc JSON hỏng — dùng seed */ }
    return null;
  }

  function _save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function getData() {
    var data = _load();
    if (!data || !data.thu || !data.chi) {
      data = _seed();
      _save(data);
    }
    return data;
  }

  /**
   * Thêm 1 khoản thu/chi vào kho dữ liệu.
   * type: 'thu' | 'chi'
   * entry: { name, code, amount, paid, remain, ref, source, date }
   *   source ví dụ: 'banhang' | 'nhaphang' | 'manual'
   * Trả về entry đã có id.
   */
  function addEntry(type, entry) {
    var data = getData();
    entry.id = 'tc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    if (!entry.date) {
      entry.date = new Date().toLocaleDateString('vi-VN');
    }
    (type === 'thu' ? data.thu : data.chi).unshift(entry);
    _save(data);
    return entry;
  }

  function fmtVND(n) {
    n = Number(n) || 0;
    return n.toLocaleString('vi-VN') + ' đ';
  }

  function sourceLabel(source) {
    switch (source) {
      case 'banhang': return 'Bán hàng';
      case 'suachua': return 'Sửa chữa';
      case 'nhaphang': return 'Nguồn nhập';
      case 'le': return 'Nguồn khác';
      case 'manual': return 'Nguồn khác';
      default: return 'Khác';
    }
  }

  // Nhóm nguồn theo loại thu/chi — dùng cho dropdown lọc ở trang Thu chi
  function sourcesFor(type) {
    return type === 'thu'
      ? [{ v: 'banhang', l: 'Bán hàng' }, { v: 'suachua', l: 'Sửa chữa' }]
      : [{ v: 'nhaphang', l: 'Nguồn nhập' }, { v: 'le', l: 'Nguồn khác' }];
  }

  window.QrantyThuChi = {
    getData: getData,
    save: _save,
    addEntry: addEntry,
    fmtVND: fmtVND,
    sourceLabel: sourceLabel,
    sourcesFor: sourcesFor
  };
})();
