/* ============================================================
   order-store.js — Lịch sử bán hàng (localStorage)
   Dùng bởi: qranty-thao-tac-nhanh.html (ghi), qranty-tai-chinh.html (đọc)

   Mỗi phiếu bán = 1 order, GIỮ NGUYÊN danh sách sản phẩm (line items)
   để có thể "bung chi tiết" và "in lại bill" đúng từng dòng — khác với
   Thu chi chỉ lưu tổng tiền + tên SP gộp trong `ref`.

   Liên kết: order.thuChiId === id của khoản Thu (source 'banhang') tương
   ứng, để trang Tài chính tra ngược từ dòng Thu ra chi tiết phiếu.
   ============================================================ */
(function () {
  var KEY = 'qranty-orders';

  function today() { return new Date().toLocaleDateString('vi-VN'); }
  function uid() { return 'od-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function _load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return null;
  }
  function _save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }

  function getAll() { return _load() || []; }

  /**
   * Thêm 1 phiếu bán. input:
   *   { code, customerName, customerPhone, date, items:[{name,sku,qty,price,serial,warranty,hasWarranty}],
   *     total, paid, remain, thuChiId }
   * Trả về record đã có id.
   */
  function addOrder(input) {
    input = input || {};
    var list = getAll();
    var rec = {
      id: uid(),
      code: input.code || '',
      customerName: input.customerName || 'Khách lẻ',
      customerPhone: input.customerPhone || '',
      date: input.date || today(),
      items: Array.isArray(input.items) ? input.items : [],
      total: Number(input.total) || 0,
      paid: Number(input.paid) || 0,
      remain: Number(input.remain) || 0,
      thuChiId: input.thuChiId || '',
      createdAt: today()
    };
    list.unshift(rec);
    _save(list);
    return rec;
  }

  function getByThuChiId(id) {
    if (!id) return null;
    return getAll().filter(function (o) { return o.thuChiId === id; })[0] || null;
  }
  function getById(id) {
    return getAll().filter(function (o) { return o.id === id; })[0] || null;
  }

  window.QrantyOrders = {
    getAll: getAll, addOrder: addOrder,
    getByThuChiId: getByThuChiId, getById: getById
  };
})();
