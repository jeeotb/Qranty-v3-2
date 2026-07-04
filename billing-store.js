/* ============================================================
   billing-store.js — Quản lý thanh toán & hóa đơn (localStorage)
   Dùng bởi: qranty-cai-dat.html, sidebar.js, qranty-hoa-don-invoice.html
   ============================================================ */
(function () {
  var PLAN_KEY = 'qranty-billing-plan';
  var EXPIRY_KEY = 'qranty-billing-expiry';
  var INVOICE_KEY = 'qranty-billing-invoice-info';
  var TXS_KEY = 'qranty-billing-transactions';
  var USAGE_KEY = 'qranty-billing-usage';

  // Giới hạn sử dụng theo gói (null = không giới hạn)
  var PLAN_LIMITS = {
    Free:       { products: 50,   orders: 30 },
    Standard:   { products: 500,  orders: null },
    Pro:        { products: null, orders: null },
    Enterprise: { products: null, orders: null }
  };

  function today() { return new Date().toLocaleDateString('vi-VN'); }

  // Default values
  var DEFAULT_PLAN = 'Pro';
  var DEFAULT_EXPIRY = '2027-06-20T08:30:00.000Z'; // 12-month expiry for default seed

  function _seedTxs() {
    return [
      {
        id: 'BIL-20260520-089',
        package: 'Standard',
        period: '1 tháng',
        amount: 290000,
        status: 'Cancelled',
        method: 'payOS',
        createdAt: '2026-05-20T10:15:30.000Z',
        expiry: '2026-06-20T10:15:30.000Z',
        hasInvoice: false,
        invoiceId: '',
        receiptId: 'REC-20260520-089'
      },
      {
        id: 'BIL-20260620-142',
        package: 'Pro',
        period: '12 tháng',
        amount: 5880000,
        status: 'Active',
        method: 'Admin',
        createdAt: '2026-06-20T08:30:00.000Z',
        expiry: '2027-06-20T08:30:00.000Z',
        hasInvoice: true,
        invoiceId: 'INV-20260620-0012',
        receiptId: 'REC-20260620-142'
      }
    ];
  }

  function _seedInvoice() {
    return {
      companyName: 'Công ty TNHH Qranty Việt Nam',
      taxId: '0109123456',
      address: 'Số 10, Đường 3/2, Phường 12, Quận 10, TP. Hồ Chí Minh',
      email: 'haunq1997@gmail.com'
    };
  }

  function getPlan() {
    var name = localStorage.getItem(PLAN_KEY);
    var expiry = localStorage.getItem(EXPIRY_KEY);
    if (!name) {
      name = DEFAULT_PLAN;
      expiry = DEFAULT_EXPIRY;
      localStorage.setItem(PLAN_KEY, name);
      localStorage.setItem(EXPIRY_KEY, expiry);
    }
    // Gói Free không có ngày hết hạn → expiry rỗng
    return { name: name, expiry: expiry || '' };
  }

  /* Mức sử dụng hiện tại (demo seed — thực tế lấy từ backend) */
  function getUsage() {
    try {
      var raw = localStorage.getItem(USAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var def = { products: 42, orders: 23 };
    localStorage.setItem(USAGE_KEY, JSON.stringify(def));
    return def;
  }

  function getLimits(planName) {
    return PLAN_LIMITS[planName] || null;
  }

  function setPlan(name, expiryDateStr) {
    localStorage.setItem(PLAN_KEY, name);
    localStorage.setItem(EXPIRY_KEY, expiryDateStr);
    
    // Also update any sidebar layout that might be listening or needs updates
    var planEl = document.querySelector('.sba-info-val--plan');
    if (planEl) planEl.textContent = name;
    var planBadge = document.querySelector('.sba-plan-badge');
    if (planBadge) {
      planBadge.innerHTML = '<svg width="9" height="9" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L15.5 4.5V10C15.5 13.3 12.6 16 9 16.5C5.4 16 2.5 13.3 2.5 10V4.5Z"/><path d="M6.5 9.5L8.2 11.3L11.5 7.3"/></svg> ' + name;
    }
  }

  function getInvoiceConfig() {
    try {
      var raw = localStorage.getItem(INVOICE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var def = _seedInvoice();
    localStorage.setItem(INVOICE_KEY, JSON.stringify(def));
    return def;
  }

  function saveInvoiceConfig(config) {
    try {
      localStorage.setItem(INVOICE_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getTransactions() {
    try {
      var raw = localStorage.getItem(TXS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var seed = _seedTxs();
    localStorage.setItem(TXS_KEY, JSON.stringify(seed));
    return seed;
  }

  function saveTransactions(list) {
    try {
      localStorage.setItem(TXS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function addTransaction(tx) {
    var list = getTransactions();
    list.unshift(tx);
    saveTransactions(list);
  }

  function updateTransaction(id, updates) {
    var list = getTransactions();
    var idx = list.findIndex(function (t) { return t.id === id; });
    if (idx >= 0) {
      for (var k in updates) {
        if (updates.hasOwnProperty(k)) {
          list[idx][k] = updates[k];
        }
      }
      saveTransactions(list);
      return list[idx];
    }
    return null;
  }

  function issueInvoice(id, buyerInfo) {
    var randomNum = Math.floor(1000 + Math.random() * 9000);
    var datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    var invId = 'INV-' + datePrefix + '-' + randomNum;
    
    // Save invoice specific details under this invoice ID in storage for printing
    var invoiceDetails = {
      invoiceId: invId,
      issueDate: today(),
      buyer: buyerInfo,
      txId: id
    };
    localStorage.setItem('invoice-detail-' + invId, JSON.stringify(invoiceDetails));
    
    updateTransaction(id, {
      hasInvoice: true,
      invoiceId: invId
    });
    
    return invId;
  }

  window.QrantyBilling = {
    getPlan: getPlan,
    setPlan: setPlan,
    getUsage: getUsage,
    getLimits: getLimits,
    getInvoiceConfig: getInvoiceConfig,
    saveInvoiceConfig: saveInvoiceConfig,
    getTransactions: getTransactions,
    addTransaction: addTransaction,
    updateTransaction: updateTransaction,
    issueInvoice: issueInvoice
  };
})();
