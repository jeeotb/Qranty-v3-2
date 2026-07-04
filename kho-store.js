/**
 * kho-store.js — Shared inventory store for Qranty
 * Dùng chung: kho-hang-v2.html, qranty-thao-tac-nhanh.html
 *
 * Schema sản phẩm tối giản (không có RAM/ROM/màu sắc):
 * {
 *   sku        : string   — mã SKU (tự sinh nếu để trống)
 *   name       : string   — tên sản phẩm
 *   category   : string   — danh mục (vd: "Điện thoại thông minh")
 *   brand      : string   — thương hiệu
 *   unit       : string   — đơn vị (Cái, Chiếc, Bộ...)
 *   warrantyDays: number  — thời gian bảo hành (số ngày, 0 = không có)
 *   costPrice  : number   — giá nhập
 *   salePrice  : number   — giá bán
 *   qty        : number   — tồn kho hiện tại
 *   origin     : string   — xuất xứ (vd: "Việt Nam", "Trung Quốc")
 *   normalized : boolean  — đã chuẩn hóa đầy đủ hay chưa
 *   customFields: object  — trường tùy chỉnh từ Cài đặt (Pro)
 *   createdAt  : string   — ngày tạo "dd/mm/yyyy"
 *   updatedAt  : string
 * }
 */

const QrantyKho = (() => {
  const KEY = 'qranty-kho-products';
  const KEY_CF = 'qranty-kho-custom-fields'; // custom field definitions (Pro)

  // ── Helpers ────────────────────────────────────────────────────────────
  function today() {
    const d = new Date();
    return [
      String(d.getDate()).padStart(2,'0'),
      String(d.getMonth()+1).padStart(2,'0'),
      d.getFullYear()
    ].join('/');
  }

  function genSku(name) {
    // Generate a short SKU from name + timestamp tail
    const slug = (name || 'SP')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    const tail = Date.now().toString(36).slice(-4).toUpperCase();
    return slug + '-' + tail;
  }

  function fmtVND(n) {
    if (!n && n !== 0) return '-';
    return n.toLocaleString('vi-VN') + 'đ';
  }

  function warrantyLabel(days) {
    if (!days || days === 0) return 'Không có';
    if (days % 365 === 0) return (days / 365) + ' năm';
    if (days % 30 === 0) return (days / 30) + ' tháng';
    return days + ' ngày';
  }

  // ── Core CRUD ──────────────────────────────────────────────────────────
  function getData() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || _seed();
    } catch(e) {
      return _seed();
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  /** Thêm sản phẩm mới. Trả về product đã thêm (với sku được gán). */
  function addProduct(p) {
    const data = getData();
    const product = {
      sku:          p.sku || genSku(p.name),
      name:         p.name || '',
      category:     p.category || '',
      subCategory:  p.subCategory || '',
      brand:        p.brand || '',
      unit:         p.unit || 'Cái',
      warrantyDays: Number(p.warrantyDays) || 0,
      costPrice:    Number(p.costPrice) || 0,
      salePrice:    Number(p.salePrice) || 0,
      qty:          Number(p.qty) || 0,
      origin:       p.origin || '',
      normalized:   p.normalized !== undefined ? !!p.normalized : false,
      customFields: p.customFields || {},
      createdAt:    today(),
      updatedAt:    today(),
    };
    // Nếu SKU đã tồn tại → cập nhật qty (nhập thêm)
    const idx = data.findIndex(x => x.sku === product.sku);
    if (idx >= 0) {
      data[idx].qty += product.qty;
      data[idx].updatedAt = today();
      save(data);
      return data[idx];
    }
    data.unshift(product);
    save(data);
    return product;
  }

  const LOW_STOCK = 3; // ngưỡng cảnh báo tồn thấp

  /* Sinh thông báo cảnh báo khi tồn vừa rơi xuống ngưỡng thấp (>0).
     Chỉ bắn khi VỪA chạm ngưỡng (oldQty > LOW) để không spam mỗi lần xuất. */
  function _lowStockAlert(prod, oldQty) {
    if (!prod || typeof window === 'undefined' || !window.Qranty) return;
    var q = prod.qty;
    if (q > 0 && q <= LOW_STOCK && (oldQty == null || oldQty > LOW_STOCK)) {
      var loai = prod.category === 'Linh kiện' ? 'linh kiện' : 'sản phẩm';
      window.Qranty.push({
        source: 'Tồn kho ' + loai + ' sắp hết',
        summary: prod.name + ' sắp hết hàng (chỉ còn ' + q + ' ' + (prod.unit || 'cái') + ').',
        targets: [{ page: 'kho-hang', kind: 'warning', notifyOnly: true, data: { sku: prod.sku } }]
      });
    }
  }

  /** Cập nhật toàn bộ thông tin sản phẩm theo SKU. */
  function updateProduct(sku, changes) {
    const data = getData();
    const idx = data.findIndex(x => x.sku === sku);
    if (idx < 0) return null;
    const oldQty = data[idx].qty;
    Object.assign(data[idx], changes, { updatedAt: today() });
    save(data);
    _lowStockAlert(data[idx], oldQty);
    return data[idx];
  }

  /**
   * Điều chỉnh tồn kho.
   * delta > 0: nhập thêm hàng
   * delta < 0: xuất hàng (bán / sửa chữa dùng)
   * Trả về qty mới, hoặc null nếu không tìm thấy SKU.
   */
  function updateStock(sku, delta) {
    const data = getData();
    const idx = data.findIndex(x => x.sku === sku);
    if (idx < 0) return null;
    const oldQty = data[idx].qty || 0;
    data[idx].qty = Math.max(0, oldQty + delta);
    data[idx].updatedAt = today();
    save(data);
    _lowStockAlert(data[idx], oldQty);
    return data[idx].qty;
  }

  /** Tìm kiếm sản phẩm (tên hoặc SKU, không phân biệt hoa thường). */
  function searchProducts(query) {
    if (!query) return getData();
    const q = query.toLowerCase().trim();
    return getData().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }

  /** Lấy 1 sản phẩm theo SKU. */
  function getProduct(sku) {
    return getData().find(x => x.sku === sku) || null;
  }

  /** Xoá sản phẩm theo SKU. */
  function removeProduct(sku) {
    const data = getData().filter(x => x.sku !== sku);
    save(data);
  }

  // ── Custom field definitions (Pro) ────────────────────────────────────
  /** Lấy danh sách custom field definitions. */
  function getCustomFieldDefs() {
    try {
      return JSON.parse(localStorage.getItem(KEY_CF)) || [];
    } catch(e) { return []; }
  }

  /** Thêm custom field definition. type: 'text' | 'number' | 'date' */
  function addCustomFieldDef(def) {
    const defs = getCustomFieldDefs();
    defs.push({ id: 'cf_' + Date.now(), label: def.label, type: def.type || 'text' });
    localStorage.setItem(KEY_CF, JSON.stringify(defs));
  }

  // ── Stats helpers ──────────────────────────────────────────────────────
  function getTotalStockValue() {
    return getData().reduce((sum, p) => sum + (p.qty * p.costPrice), 0);
  }

  function getLowStockProducts(threshold) {
    threshold = threshold || 3;
    return getData().filter(p => p.qty > 0 && p.qty <= threshold);
  }

  function getOutOfStockProducts() {
    return getData().filter(p => p.qty === 0);
  }

  // ── Seed data (demo — chỉ dùng khi localStorage rỗng) ─────────────────
  function _seed() {
    const seed = [
      { sku:'SKU-IP15PM-256', name:'iPhone 15 Pro Max 256GB', category:'Điện thoại thông minh', brand:'Apple',   unit:'Chiếc', warrantyDays:365, costPrice:27000000, salePrice:32990000, qty:15, origin:'Việt Nam',  normalized:true,  customFields:{}, createdAt:'01/04/2026', updatedAt:'01/04/2026' },
      { sku:'SKU-S24U-256',   name:'Samsung Galaxy S24 Ultra 256GB', category:'Điện thoại thông minh', brand:'Samsung', unit:'Chiếc', warrantyDays:365, costPrice:26000000, salePrice:31990000, qty:4,  origin:'Việt Nam',  normalized:true,  customFields:{}, createdAt:'02/04/2026', updatedAt:'02/04/2026' },
      { sku:'SKU-RN13-128',   name:'Xiaomi Redmi Note 13 128GB', category:'Điện thoại thông minh', brand:'Xiaomi',  unit:'Chiếc', warrantyDays:365, costPrice:4200000,  salePrice:5490000,  qty:18, origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'03/04/2026', updatedAt:'03/04/2026' },
      { sku:'SKU-RENO11-256', name:'OPPO Reno11 5G 256GB', category:'Điện thoại thông minh', brand:'OPPO',    unit:'Chiếc', warrantyDays:365, costPrice:7800000,  salePrice:9990000,  qty:9,  origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'05/04/2026', updatedAt:'05/04/2026' },
      { sku:'SKU-V29-256',    name:'Vivo V29 5G 256GB', category:'Điện thoại thông minh', brand:'Vivo',    unit:'Chiếc', warrantyDays:365, costPrice:8200000,  salePrice:10490000, qty:6,  origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'05/04/2026', updatedAt:'05/04/2026' },
      { sku:'SKU-IP15-128',   name:'iPhone 15 128GB', category:'Điện thoại thông minh', brand:'Apple',   unit:'Chiếc', warrantyDays:365, costPrice:17500000, salePrice:22990000, qty:4,  origin:'Việt Nam',  normalized:true,  customFields:{}, createdAt:'06/04/2026', updatedAt:'06/04/2026' },
      { sku:'SKU-IP14P-256',  name:'iPhone 14 Pro 256GB', category:'Điện thoại thông minh', brand:'Apple',   unit:'Chiếc', warrantyDays:180, costPrice:21000000, salePrice:26490000, qty:1,  origin:'Việt Nam',  normalized:true,  customFields:{}, createdAt:'07/04/2026', updatedAt:'07/04/2026' },
      { sku:'SKU-XM14-512',   name:'Xiaomi 14 512GB', category:'Điện thoại thông minh', brand:'Xiaomi',  unit:'Chiếc', warrantyDays:365, costPrice:14500000, salePrice:18990000, qty:2,  origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'08/04/2026', updatedAt:'08/04/2026' },
      { sku:'LK-SCR-IP13',    name:'Màn hình OLED iPhone 13', category:'Linh kiện', brand:'Apple',   unit:'Cái', warrantyDays:90,  costPrice:950000,   salePrice:1250000,  qty:100,origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'01/04/2026', updatedAt:'01/04/2026' },
      { sku:'LK-BAT-S23',     name:'Pin BMS Samsung Galaxy S23', category:'Linh kiện', brand:'Samsung', unit:'Cái', warrantyDays:90,  costPrice:280000,   salePrice:380000,   qty:12, origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'01/04/2026', updatedAt:'01/04/2026' },
      { sku:'LK-CASE-IP15PM', name:'Ốp lưng iPhone 15 Pro Max', category:'Phụ kiện', brand:'',       unit:'Cái', warrantyDays:0,   costPrice:80000,    salePrice:120000,   qty:45, origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'01/04/2026', updatedAt:'01/04/2026' },
      { sku:'LK-GLASS-S23',   name:'Kính cường lực Samsung Galaxy S23', category:'Phụ kiện', brand:'',       unit:'Cái', warrantyDays:0,   costPrice:40000,    salePrice:60000,    qty:150,origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'02/04/2026', updatedAt:'02/04/2026' },
      { sku:'LK-CHG-20W',     name:'Củ sạc nhanh 20W Type-C', category:'Phụ kiện', brand:'',       unit:'Cái', warrantyDays:180, costPrice:100000,   salePrice:150000,   qty:80, origin:'Trung Quốc', normalized:true,  customFields:{}, createdAt:'02/04/2026', updatedAt:'02/04/2026' },
      { sku:'SKU-ZF5-256',    name:'Samsung Galaxy Z Flip5 256GB', category:'Điện thoại thông minh', brand:'Samsung', unit:'Chiếc', warrantyDays:365, costPrice:18000000, salePrice:22990000, qty:2,  origin:'Việt Nam',  normalized:true,  customFields:{}, createdAt:'09/04/2026', updatedAt:'09/04/2026' },
      { sku:'SKU-A55-128',    name:'Samsung Galaxy A55 5G 128GB', category:'Điện thoại thông minh', brand:'Samsung', unit:'Chiếc', warrantyDays:365, costPrice:8500000,  salePrice:10990000, qty:0,  origin:'Việt Nam',  normalized:true,  customFields:{}, createdAt:'10/04/2026', updatedAt:'10/04/2026' },
    ];
    save(seed);
    return seed;
  }

  // ── Phiếu Nhập Kho (PNK) history ─────────────────────────────────────
  const KEY_PNK = 'qranty-pnk-history';

  function _randSerial() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var s = '';
    for (var i = 0; i < 11; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function _genSeedSerials(count, presetCodes, activeCount) {
    var arr = [];
    for (var i = 0; i < count; i++) {
      var code = (presetCodes && presetCodes[i]) || _randSerial();
      var isActive = i < activeCount;
      arr.push({
        code: code,
        status: isActive ? 'active' : 'pending',
        customerPhone: isActive ? '09' + Math.floor(10000000 + Math.random() * 89999999) : null
      });
    }
    return arr;
  }

  /** Nhóm hàng tạo tay (lưu riêng) — để nhóm chưa có sản phẩm vẫn hiện ở sidebar. */
  function getCategories() {
    var list = null;
    try { var v = JSON.parse(localStorage.getItem('qranty-kho-categories')); if (Array.isArray(v)) list = v; } catch (e) {}
    if (!list) list = ['Điện thoại thông minh', 'Máy tính bảng', 'Laptop', 'Loa', 'Bộ đàm', 'Linh kiện', 'Phụ kiện'];
    // Tự lành dữ liệu: mọi danh mục đang dùng trên sản phẩm phải có trong danh sách quản lý
    // (tránh tình trạng danh mục quản lý lệch với category thật của sản phẩm).
    var changed = false;
    try {
      var used = {};
      getData().forEach(function (p) { var c = (p.category || '').trim(); if (c) used[c] = true; });
      Object.keys(used).forEach(function (c) { if (list.indexOf(c) < 0) { list.push(c); changed = true; } });
    } catch (e) {}
    if (changed || !localStorage.getItem('qranty-kho-categories')) {
      localStorage.setItem('qranty-kho-categories', JSON.stringify(list));
    }
    return list;
  }
  function addCategory(name) {
    name = (name || '').trim();
    if (!name) return getCategories();
    const list = getCategories();
    if (list.indexOf(name) === -1) {
      list.push(name);
      localStorage.setItem('qranty-kho-categories', JSON.stringify(list));
    }
    return list;
  }
  /** Đổi tên danh mục cha: cập nhật danh sách, map con & toàn bộ sản phẩm. */
  function renameCategory(oldName, newName) {
    oldName = (oldName || '').trim(); newName = (newName || '').trim();
    if (!oldName || !newName || oldName === newName) return;
    const list = getCategories(), i = list.indexOf(oldName);
    if (i !== -1) {
      if (list.indexOf(newName) === -1) list[i] = newName; else list.splice(i, 1);
      localStorage.setItem('qranty-kho-categories', JSON.stringify(list));
    }
    const m = _loadSubcat();
    if (m[oldName]) {
      const tgt = m[newName] || [];
      m[oldName].forEach(function (s) { if (tgt.indexOf(s) === -1) tgt.push(s); });
      m[newName] = tgt; delete m[oldName]; _saveSubcat(m);
    }
    const data = getData(); let ch = false;
    data.forEach(function (p) { if ((p.category || '') === oldName) { p.category = newName; ch = true; } });
    if (ch) save(data);
  }
  /** Xoá danh mục cha khỏi danh sách tạo tay (kèm map con). Caller phải tự kiểm tra điều kiện xoá. */
  function removeCategory(name) {
    name = (name || '').trim();
    const list = getCategories().filter(function (c) { return c !== name; });
    localStorage.setItem('qranty-kho-categories', JSON.stringify(list));
    const m = _loadSubcat();
    if (m[name]) { delete m[name]; _saveSubcat(m); }
  }

  /* ── Nhãn core (Thương hiệu / Xuất xứ / Đơn vị / Nguồn khách hàng) ───────
     Danh sách phẳng, quản lý tập trung ở Cài đặt > Quản lý nhãn. "Danh mục"
     KHÔNG nằm ở đây — nó dùng getCategories() để đồng bộ với cây Nhóm hàng. */
  const KEY_LABELS = 'qranty-core-labels';
  function _seedLabels() {
    return {
      brand: ['Vsmart', 'Apple', 'Samsung', 'Xiaomi', 'Hytera', 'Dell', 'Lenovo', 'HP', 'ASUS'],
      origin: ['Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Thái Lan', 'Mỹ', 'Đức', 'Pháp'],
      unit: ['Cái', 'Bộ', 'Chiếc'],
      custSource: ['Walk-in', 'Facebook', 'Zalo', 'Giới thiệu']
    };
  }
  function _loadLabels() {
    var s = _seedLabels();
    try {
      var m = JSON.parse(localStorage.getItem(KEY_LABELS));
      if (m && typeof m === 'object') {
        Object.keys(s).forEach(function (k) { if (!Array.isArray(m[k])) m[k] = s[k]; });
        return m;
      }
    } catch (e) {}
    localStorage.setItem(KEY_LABELS, JSON.stringify(s));
    return s;
  }
  function getLabels(kind) { var m = _loadLabels(); return (m[kind] || []).slice(); }
  function addLabel(kind, name) {
    name = (name || '').trim(); if (!name) return getLabels(kind);
    var m = _loadLabels(); if (!m[kind]) m[kind] = [];
    if (m[kind].indexOf(name) === -1) { m[kind].push(name); localStorage.setItem(KEY_LABELS, JSON.stringify(m)); }
    return m[kind].slice();
  }
  function renameLabel(kind, oldName, newName) {
    oldName = (oldName || '').trim(); newName = (newName || '').trim();
    if (!oldName || !newName || oldName === newName) return getLabels(kind);
    var m = _loadLabels(), a = m[kind];
    if (a) { var i = a.indexOf(oldName); if (i !== -1) { if (a.indexOf(newName) === -1) a[i] = newName; else a.splice(i, 1); localStorage.setItem(KEY_LABELS, JSON.stringify(m)); } }
    // đồng bộ vào sản phẩm cho các nhãn gắn trực tiếp
    var fieldMap = { brand: 'brand', origin: 'origin', unit: 'unit' };
    if (fieldMap[kind]) {
      var f = fieldMap[kind], data = getData(), ch = false;
      data.forEach(function (p) { if ((p[f] || '') === oldName) { p[f] = newName; ch = true; } });
      if (ch) save(data);
    }
    return getLabels(kind);
  }
  function removeLabel(kind, name) {
    name = (name || '').trim();
    var m = _loadLabels();
    if (m[kind]) { m[kind] = m[kind].filter(function (x) { return x !== name; }); localStorage.setItem(KEY_LABELS, JSON.stringify(m)); }
    return getLabels(kind);
  }
  /** Đếm sản phẩm đang gắn 1 nhãn (brand/origin/unit) — để cảnh báo trước khi xoá. */
  function countByLabel(kind, name) {
    var fieldMap = { brand: 'brand', origin: 'origin', unit: 'unit' };
    var f = fieldMap[kind]; if (!f) return 0;
    name = (name || '').trim();
    return getData().filter(function (p) { return (p[f] || '') === name; }).length;
  }

  /* ── Danh mục con (sub-category) — cấp 2 do người dùng tự tạo, lưu riêng
     theo dạng { "<danh mục cha>": ["con A", "con B"] }. Tách hẳn với việc
     tự gom theo Hãng (brand) ở sidebar — hai chiều phân loại khác nhau. */
  const KEY_SUBCAT = 'qranty-kho-subcategories';
  function _loadSubcat() { try { return JSON.parse(localStorage.getItem(KEY_SUBCAT)) || {}; } catch (e) { return {}; } }
  function _saveSubcat(m) { localStorage.setItem(KEY_SUBCAT, JSON.stringify(m)); }
  function getSubcatMap() { return _loadSubcat(); }
  function getSubcategories(parent) {
    parent = (parent || '').trim(); const m = _loadSubcat();
    return (m[parent] || []).slice();
  }
  function addSubcategory(parent, name) {
    parent = (parent || '').trim(); name = (name || '').trim();
    if (!parent || !name) return getSubcategories(parent);
    addCategory(parent); // đảm bảo danh mục cha tồn tại bền vững
    const m = _loadSubcat();
    if (!m[parent]) m[parent] = [];
    if (m[parent].indexOf(name) === -1) { m[parent].push(name); _saveSubcat(m); }
    return m[parent].slice();
  }
  function renameSubcategory(parent, oldName, newName) {
    parent = (parent || '').trim(); oldName = (oldName || '').trim(); newName = (newName || '').trim();
    if (!parent || !oldName || !newName || oldName === newName) return;
    const m = _loadSubcat(), arr = m[parent];
    if (arr) {
      const i = arr.indexOf(oldName);
      if (i !== -1) { if (arr.indexOf(newName) === -1) arr[i] = newName; else arr.splice(i, 1); _saveSubcat(m); }
    }
    const data = getData(); let ch = false;
    data.forEach(function (p) {
      if ((p.category || '') === parent && (p.subCategory || '') === oldName) { p.subCategory = newName; ch = true; }
    });
    if (ch) save(data);
  }
  function removeSubcategory(parent, name) {
    parent = (parent || '').trim(); name = (name || '').trim();
    const m = _loadSubcat();
    if (m[parent]) {
      m[parent] = m[parent].filter(function (s) { return s !== name; });
      if (!m[parent].length) delete m[parent];
      _saveSubcat(m);
    }
  }
  /** Đếm số sản phẩm trong 1 danh mục cha. */
  function countInCategory(cat) {
    cat = (cat || '').trim();
    return getData().filter(function (p) { return (p.category || '') === cat; }).length;
  }
  /** Đếm số sản phẩm trong 1 danh mục con (cha + con). */
  function countInSubcategory(cat, sub) {
    cat = (cat || '').trim(); sub = (sub || '').trim();
    return getData().filter(function (p) { return (p.category || '') === cat && (p.subCategory || '') === sub; }).length;
  }

  /* ── Thẻ mô tả gợi ý, TÁCH RIÊNG theo loại hàng ──────────────────
     { product:[...], part:[...] }. Chỉ là gợi ý cho ô chip ở Kho hàng,
     không đụng tới luồng bán hàng / khách hàng. */
  const KEY_TAGS = 'qranty-kho-desc-tags';
  function _seedTags() {
    return {
      product: ['Màu sắc', 'Dung lượng', 'Tình trạng máy', 'Phụ kiện kèm theo'],
      part:    ['Tương thích với', 'Chất lượng (Zin/OEM)', 'Loại linh kiện']
    };
  }
  function _loadTags() {
    try {
      const t = JSON.parse(localStorage.getItem(KEY_TAGS));
      if (t && Array.isArray(t.product) && Array.isArray(t.part)) return t;
    } catch (e) {}
    const s = _seedTags();
    localStorage.setItem(KEY_TAGS, JSON.stringify(s));
    return s;
  }
  function _tagBucket(t, type) { return type === 'part' ? t.part : t.product; }
  /** Lấy danh sách thẻ gợi ý của 1 loại ('product' | 'part'). */
  function getTagDefs(type) { return _tagBucket(_loadTags(), type).slice(); }
  function addTagDef(type, label) {
    label = (label || '').trim();
    if (!label) return getTagDefs(type);
    const t = _loadTags(), arr = _tagBucket(t, type);
    if (arr.indexOf(label) === -1) { arr.push(label); localStorage.setItem(KEY_TAGS, JSON.stringify(t)); }
    return arr.slice();
  }
  function removeTagDef(type, label) {
    const t = _loadTags(), arr = _tagBucket(t, type), i = arr.indexOf(label);
    if (i !== -1) { arr.splice(i, 1); localStorage.setItem(KEY_TAGS, JSON.stringify(t)); }
    return arr.slice();
  }

  /* Thẻ mô tả gợi ý theo TỪNG DANH MỤC (mỗi danh mục một rổ riêng). */
  const KEY_CTAGS = 'qranty-kho-desc-tags-cat';
  function _loadCatTags() { try { return JSON.parse(localStorage.getItem(KEY_CTAGS)) || {}; } catch (e) { return {}; } }
  function getCatTagDefs(cat) {
    cat = (cat || '').trim(); if (!cat) return [];
    const m = _loadCatTags();
    if (m[cat]) return m[cat].slice();
    // gợi ý mặc định theo loại danh mục phổ biến
    const lc = cat.toLowerCase();
    if (lc.indexOf('điện thoại') >= 0 || lc.indexOf('laptop') >= 0 || lc.indexOf('máy') >= 0)
      return ['Màu sắc', 'Dung lượng', 'Tình trạng máy', 'Phụ kiện kèm theo'];
    if (lc.indexOf('linh kiện') >= 0) return ['Tương thích với', 'Chất lượng (Zin/OEM)', 'Loại linh kiện'];
    if (lc.indexOf('phụ kiện') >= 0) return ['Màu sắc', 'Chất liệu', 'Tương thích với'];
    return [];
  }
  function addCatTagDef(cat, label) {
    cat = (cat || '').trim(); label = (label || '').trim();
    if (!cat || !label) return getCatTagDefs(cat);
    const m = _loadCatTags();
    if (!m[cat]) m[cat] = getCatTagDefs(cat);   // seed từ gợi ý mặc định lần đầu
    if (m[cat].indexOf(label) === -1) { m[cat].push(label); localStorage.setItem(KEY_CTAGS, JSON.stringify(m)); }
    return m[cat].slice();
  }
  function removeCatTagDef(cat, label) {
    cat = (cat || '').trim();
    const m = _loadCatTags();
    if (!m[cat]) m[cat] = getCatTagDefs(cat);
    const i = m[cat].indexOf(label);
    if (i !== -1) { m[cat].splice(i, 1); localStorage.setItem(KEY_CTAGS, JSON.stringify(m)); }
    return m[cat].slice();
  }
  function renameCatTagDef(cat, oldLabel, newLabel) {
    cat = (cat || '').trim(); oldLabel = (oldLabel || '').trim(); newLabel = (newLabel || '').trim();
    if (!cat || !oldLabel || !newLabel || oldLabel === newLabel) return getCatTagDefs(cat);
    const m = _loadCatTags();
    if (!m[cat]) m[cat] = getCatTagDefs(cat);
    const i = m[cat].indexOf(oldLabel);
    if (i !== -1) {
      if (m[cat].indexOf(newLabel) === -1) m[cat][i] = newLabel; else m[cat].splice(i, 1);
      localStorage.setItem(KEY_CTAGS, JSON.stringify(m));
    }
    // đổi tên khoá thuộc tính trong sản phẩm thuộc danh mục này
    const data = getData(); let ch = false;
    data.forEach(function (p) {
      if ((p.category || '') === cat && p.customFields && Array.isArray(p.customFields.attrs)) {
        p.customFields.attrs.forEach(function (a) { if (a && a.name === oldLabel) { a.name = newLabel; ch = true; } });
      }
    });
    if (ch) save(data);
    return m[cat].slice();
  }

  /** Lấy toàn bộ lịch sử PNK (mới nhất trước). */
  function getPNKList() {
    try {
      const list = JSON.parse(localStorage.getItem(KEY_PNK));
      if (list && list.length) return list;
      return _seedPNK();
    } catch(e) { return _seedPNK(); }
  }

  /** Lưu 1 phiếu nhập kho mới. */
  function addPNK(record) {
    const list = getPNKList();
    list.unshift({
      code:     record.code     || ('PNK-' + Date.now()),
      supplier: record.supplier || 'Nguồn nhập',
      date:     record.date     || today(),
      note:     record.note     || '',
      items:    record.items    || [],
      total:    Number(record.total)  || 0,
      paid:     Number(record.paid)   || 0,
      remain:   Number(record.remain) || 0,
    });
    localStorage.setItem(KEY_PNK, JSON.stringify(list));
    return list[0];
  }

  /**
   * Cập nhật trạng thái serials của một phiếu nhập (lô).
   * Chỉ những serial THỰC SỰ đổi trạng thái (status cũ !== status mới) mới được
   * tính là "thay đổi" — nhờ vậy gọi lại hàm này trên 1 serial đã 'active' rồi sẽ
   * không bị tính thêm lần nữa (tránh trừ/cộng tồn kho 2 lần cho cùng 1 serial).
   * Đồng thời đồng bộ luôn tồn kho sản phẩm: kích hoạt (pending → active) = xuất
   * kho 1 đơn vị; thu hồi (active → pending) = nhập lại kho 1 đơn vị — để trạng
   * thái "Còn hàng / Sắp hết / Hết hàng" ở Kho hàng phản ánh đúng số đã kích hoạt.
   * Trả về { pnk, changed, skipped } — changed: serial thực sự đổi trạng thái,
   * skipped: serial đã ở đúng trạng thái đích từ trước (không đổi gì).
   */
  function updatePNKSerials(pnkCode, itemSku, serialCodes, status, customerPhone) {
    var list = getPNKList();
    var pnk = list.find(function (x) { return x.code === pnkCode; });
    if (!pnk) return null;

    var changed = [];
    var skipped = [];

    function applyToItem(item) {
      if (!item.serials) return;
      item.serials.forEach(function (s) {
        if (serialCodes.indexOf(s.code) === -1) return;
        if (s.status === status) {
          skipped.push(s.code);
          return;
        }
        changed.push({ sku: item.sku, code: s.code, from: s.status, to: status });
        s.status = status;
        s.customerPhone = (status === 'active' ? customerPhone : null);
      });
    }

    if (itemSku) {
      var item = pnk.items.find(function (i) { return i.sku === itemSku || (!i.sku && i.name); });
      if (item) applyToItem(item);
    } else {
      pnk.items.forEach(applyToItem);
    }

    localStorage.setItem(KEY_PNK, JSON.stringify(list));

    changed.forEach(function (c) {
      if (!c.sku) return;
      if (c.to === 'active' && c.from !== 'active') updateStock(c.sku, -1);
      else if (c.to === 'pending' && c.from === 'active') updateStock(c.sku, 1);
    });

    return { pnk: pnk, changed: changed, skipped: skipped };
  }

  /**
   * Tổng hợp số serial đã/chưa kích hoạt của 1 SKU, gộp trên TẤT CẢ các lô (PNK)
   * có chứa SKU đó. Dùng để hiện "x/y chưa kích hoạt" ở Kho hàng thay vì chỉ hiện
   * tổng số lượng chung chung.
   */
  function getSerialStatsBySku(sku) {
    var total = 0, active = 0;
    getPNKList().forEach(function (pnk) {
      (pnk.items || []).forEach(function (item) {
        if (item.sku !== sku || !item.serials) return;
        total += item.serials.length;
        active += item.serials.filter(function (s) { return s.status === 'active'; }).length;
      });
    });
    return { total: total, active: active, pending: total - active };
  }

  function _seedPNK() {
    const seed = [
      {
        code: 'PNK-202606-123',
        supplier: 'Phong Vũ',
        date: '12/06/2026',
        note: 'Nhập lô hàng iPhone 15 Pro Max',
        total: 540000000,
        paid: 540000000,
        remain: 0,
        items: [
          {
            name: 'iPhone 15 Pro Max 256GB',
            sku: 'SKU-IP15PM-256',
            qty: 20,
            costPrice: 27000000,
            salePrice: 32990000,
            warrantyDays: 180,
            serials: _genSeedSerials(20, ['II72Q3T390KQ', 'AGZ0K147LLFC', 'U22XM9DH7K1J', '66UHUL2O3PKR'], 0)
          }
        ]
      },
      {
        code: 'PNK-202606-081',
        supplier: 'Di Động Việt',
        date: '08/06/2026',
        note: 'Linh kiện màn hình nhập bổ sung',
        total: 38000000,
        paid: 38000000,
        remain: 0,
        items: [
          {
            name: 'Màn hình OLED iPhone 13',
            sku: 'LK-SCR-IP13',
            qty: 40,
            costPrice: 950000,
            salePrice: 1250000,
            warrantyDays: 365,
            serials: _genSeedSerials(40, [], 5)
          }
        ]
      },
      {
        code: 'PNK-202605-291',
        supplier: 'FPT Shop',
        date: '29/05/2026',
        note: 'Điện thoại iPhone 15 chính hãng',
        total: 175000000,
        paid: 150000000,
        remain: 25000000,
        items: [
          {
            name: 'iPhone 15 128GB',
            sku: 'SKU-IP15-128',
            qty: 10,
            costPrice: 17500000,
            salePrice: 22990000,
            warrantyDays: 365,
            serials: _genSeedSerials(10, [], 10)
          }
        ]
      },
      {
        code: 'PNK-202606-015',
        supplier: 'Samsung Authorized HCM',
        date: '01/06/2026',
        note: 'Galaxy S24 Ultra',
        total: 390000000,
        paid: 390000000,
        remain: 0,
        items: [
          {
            name: 'Samsung Galaxy S24 Ultra 256GB',
            sku: 'SKU-S24U-256',
            qty: 15,
            costPrice: 26000000,
            salePrice: 31990000,
            warrantyDays: 365,
            serials: _genSeedSerials(15, [], 9)
          }
        ]
      }
    ];
    localStorage.setItem(KEY_PNK, JSON.stringify(seed));
    return seed;
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    getData,
    addProduct,
    updateProduct,
    updateStock,
    searchProducts,
    getProduct,
    removeProduct,
    getCustomFieldDefs,
    addCustomFieldDef,
    getTotalStockValue,
    getLowStockProducts,
    getOutOfStockProducts,
    fmtVND,
    warrantyLabel,
    genSku,
    // Nhóm hàng tạo tay
    getCategories,
    addCategory,
    renameCategory,
    removeCategory,
    // Nhãn core (brand/origin/unit/custSource)
    getLabels,
    addLabel,
    renameLabel,
    removeLabel,
    countByLabel,
    // Danh mục con (sub-category)
    getSubcatMap,
    getSubcategories,
    addSubcategory,
    renameSubcategory,
    removeSubcategory,
    countInCategory,
    countInSubcategory,
    // Thẻ mô tả gợi ý theo loại
    getTagDefs,
    addTagDef,
    removeTagDef,
    // Thẻ mô tả gợi ý theo DANH MỤC
    getCatTagDefs,
    addCatTagDef,
    removeCatTagDef,
    renameCatTagDef,
    // PNK history
    getPNKList,
    addPNK,
    updatePNKSerials,
    getSerialStatsBySku,
  };
})();
