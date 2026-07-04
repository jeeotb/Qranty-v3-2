/* ============================================================
   warranty-store.js — Store quản lý Bảo hành dùng chung
   Dùng bởi: qranty-bao-hanh.html, qranty-thao-tac-nhanh.html
   ============================================================ */
(function () {
  var KEY = 'qranty-warranties';

  function digits(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }
  function today() {
    var d = new Date();
    return [
      String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear()
    ].join('/');
  }

  function parseVNdate(s) {
    if (!s) return null;
    var parts = s.split('/');
    if (parts.length < 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  function getDaysDiff(d1, d2) {
    var t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    var t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    var timeDiff = t2 - t1;
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  function _seed() {
    return [
      {
        serial: 'RHM1K7O7PQNI',
        productSku: 'SKU-IP15-128',
        productName: 'Iphone 15',
        customerName: 'phạm việt hưng',
        customerPhone: '0888444415',
        activatedAt: '26/05/2026',
        expiresAt: '22/11/2026',
        status: 'active',
        recalledReason: '',
        createdAt: '26/05/2026',
        updatedAt: '26/05/2026'
      },
      {
        serial: 'HJBX3XK21QQQ',
        productSku: 'SKU-IP15-128',
        productName: 'Iphone 15',
        customerName: 'phạm việt hưng',
        customerPhone: '0888444415',
        activatedAt: '26/05/2026',
        expiresAt: '22/11/2026',
        status: 'active',
        recalledReason: '',
        createdAt: '26/05/2026',
        updatedAt: '26/05/2026'
      },
      {
        serial: '4PLQZEFC9P6J',
        productSku: 'SKU-IP15-128',
        productName: 'Iphone 15',
        customerName: 'phạm việt hưng',
        customerPhone: '0888444415',
        activatedAt: '26/05/2026',
        expiresAt: '22/11/2026',
        status: 'active',
        recalledReason: '',
        createdAt: '26/05/2026',
        updatedAt: '26/05/2026'
      },
      {
        serial: 'XOF7P4TZM1BU',
        productSku: '',
        productName: 'Bếp Điện',
        customerName: 'phạm việt hưng',
        customerPhone: '0888444415',
        activatedAt: '26/05/2025',
        expiresAt: '26/05/2026',
        status: 'active',
        recalledReason: '',
        createdAt: '26/05/2025',
        updatedAt: '26/05/2025'
      },
      {
        serial: '11113',
        productSku: 'SKU-IP15-128',
        productName: 'iPhone 16',
        customerName: 'Linh',
        customerPhone: '0911312223',
        activatedAt: '14/05/2026',
        expiresAt: '14/05/2027',
        status: 'recalled',
        recalledReason: 'Khách trả hàng',
        createdAt: '14/05/2026',
        updatedAt: '14/05/2026'
      }
    ];
  }

  function _load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function _save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function getAll() {
    var list = _load();
    if (!list) {
      list = _seed();
      _save(list);
    }
    return list;
  }

  /**
   * Tính toán trạng thái thực tế dựa trên ngày hết hạn và status thu hồi.
   * Kết quả trả về:
   * - status: 'dang-bao-hanh' | 'sap-het-han' | 'het-han' | 'thu-hoi'
   * - remainingDaysText: ví dụ: '163 ngày', 'Hết hạn', '—'
   */
  function resolveStatus(w) {
    if (w.status === 'recalled') {
      return {
        status: 'thu-hoi',
        remainingDaysText: '—'
      };
    }
    var now = new Date();
    var expiry = parseVNdate(w.expiresAt);
    if (!expiry) {
      return {
        status: 'dang-bao-hanh',
        remainingDaysText: '—'
      };
    }
    var diff = getDaysDiff(now, expiry);
    if (diff < 0) {
      return {
        status: 'het-han',
        remainingDaysText: 'Hết hạn'
      };
    } else if (diff <= 30) {
      return {
        status: 'sap-het-han',
        remainingDaysText: diff + ' ngày'
      };
    } else {
      return {
        status: 'dang-bao-hanh',
        remainingDaysText: diff + ' ngày'
      };
    }
  }

  function getData() {
    var list = getAll();
    return list.map(function (w) {
      var resolved = resolveStatus(w);
      return Object.assign({}, w, {
        resolvedStatus: resolved.status,
        remainingDaysText: resolved.remainingDaysText
      });
    });
  }

  /**
   * Kiểm tra 1 serial có đang được bảo hành hiệu lực hay không (chưa hết hạn,
   * chưa bị thu hồi). Dùng để chặn kích hoạt trùng — 1 serial vật lý không thể
   * đồng thời gắn cho 2 khách hàng khác nhau.
   */
  function isSerialActive(serial) {
    if (!serial) return false;
    var found = getAll().find(function (x) { return x.serial === serial; });
    if (!found) return false;
    var r = resolveStatus(found);
    return r.status === 'dang-bao-hanh' || r.status === 'sap-het-han';
  }

  /** Lấy bản ghi bảo hành hiện tại (đã resolve status) của 1 serial, hoặc null. */
  function getBySerial(serial) {
    if (!serial) return null;
    var found = getAll().find(function (x) { return x.serial === serial; });
    if (!found) return null;
    var r = resolveStatus(found);
    return Object.assign({}, found, { resolvedStatus: r.status, remainingDaysText: r.remainingDaysText });
  }

  /**
   * Tạo phiếu bảo hành mới cho 1 serial.
   * Chặn trùng: nếu serial này đang có bảo hành hiệu lực (chưa hết hạn / chưa thu hồi)
   * thì KHÔNG tạo bản ghi mới — trả về { error: 'duplicate', existing } để nơi gọi
   * báo cho người dùng, tránh tình trạng 2 khách hàng cùng dùng chung 1 serial.
   */
  function addWarranty(w) {
    var list = getAll();
    var serial = w.serial || ('SN-' + Date.now().toString(36).toUpperCase());
    var dup = list.find(function (x) { return x.serial === serial; });
    if (dup && (resolveStatus(dup).status === 'dang-bao-hanh' || resolveStatus(dup).status === 'sap-het-han')) {
      return { error: 'duplicate', existing: dup };
    }
    var rec = {
      serial: serial,
      productSku: w.productSku || '',
      productName: w.productName || 'Sản phẩm không tên',
      customerName: w.customerName || 'Khách lẻ',
      customerPhone: w.customerPhone || '',
      activatedAt: w.activatedAt || today(),
      expiresAt: w.expiresAt || today(),
      status: w.status || 'active',
      recalledReason: w.recalledReason || '',
      createdAt: today(),
      updatedAt: today()
    };
    list.unshift(rec);
    _save(list);
    return rec;
  }

  function recall(serial, reason) {
    var list = getAll();
    var idx = list.findIndex(function (x) { return x.serial === serial; });
    if (idx >= 0) {
      list[idx].status = 'recalled';
      list[idx].recalledReason = reason || 'Thu hồi bảo hành';
      list[idx].updatedAt = today();
      _save(list);
      return list[idx];
    }
    return null;
  }

  function remove(serial) {
    var list = getAll().filter(function (x) { return x.serial !== serial; });
    _save(list);
  }

  function search(q) {
    var data = getData();
    if (!q) return data;
    var s = q.toLowerCase().trim();
    return data.filter(function (w) {
      return (w.serial || '').toLowerCase().indexOf(s) >= 0
          || (w.productName || '').toLowerCase().indexOf(s) >= 0
          || (w.customerName || '').toLowerCase().indexOf(s) >= 0
          || digits(w.customerPhone).indexOf(digits(q)) >= 0 && digits(q);
    });
  }

  window.QrantyWarranty = {
    getData: getData,
    addWarranty: addWarranty,
    recall: recall,
    remove: remove,
    search: search,
    isSerialActive: isSerialActive,
    getBySerial: getBySerial
  };
})();
