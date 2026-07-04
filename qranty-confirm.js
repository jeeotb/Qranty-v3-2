/* ============================================================
   qranty-confirm.js — Modal xác nhận dùng chung (thay confirm() trình duyệt)
   Dùng bởi: mọi trang có thao tác xóa/hành động cần xác nhận.
   CSS: các class .qcf-* nằm trong shared.css.

   Cách dùng (thay cho `if (confirm(msg)) { ... }`):
     qConfirm(msg, function () { ...làm khi bấm xác nhận... }, {
       title: 'Xóa phiếu sửa chữa',   // mặc định 'Xác nhận'
       okText: 'Xóa',                 // mặc định 'Xác nhận'
       cancelText: 'Hủy',             // mặc định 'Hủy'
       danger: true                   // true → nút OK màu đỏ (mặc định false)
     });
   Lưu ý: bất đồng bộ — code sau qConfirm() chạy ngay, phần cần chờ
   xác nhận phải nằm trong callback.
   ============================================================ */
(function () {
  'use strict';
  var backdrop = null, okCb = null;

  function ensure() {
    if (backdrop) return;
    backdrop = document.createElement('div');
    backdrop.className = 'qcf-backdrop';
    backdrop.innerHTML =
      '<div class="qcf-box" role="dialog" aria-modal="true">' +
        '<div class="qcf-head">' +
          '<span class="qcf-icon">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          '</span>' +
          '<span class="qcf-title">Xác nhận</span>' +
        '</div>' +
        '<div class="qcf-msg"></div>' +
        '<div class="qcf-actions">' +
          '<button type="button" class="btn-secondary qcf-cancel">Hủy</button>' +
          '<button type="button" class="btn-primary qcf-ok">Xác nhận</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(false); });
    document.addEventListener('keydown', function (e) {
      if (!backdrop.classList.contains('open')) return;
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    });
    backdrop.querySelector('.qcf-cancel').addEventListener('click', function () { close(false); });
    backdrop.querySelector('.qcf-ok').addEventListener('click', function () { close(true); });
  }

  function close(ok) {
    backdrop.classList.remove('open');
    var f = okCb; okCb = null;
    if (ok && typeof f === 'function') f();
  }

  function qConfirm(msg, onOk, opts) {
    opts = opts || {};
    ensure();
    backdrop.querySelector('.qcf-title').textContent = opts.title || 'Xác nhận';
    backdrop.querySelector('.qcf-msg').textContent = msg || '';
    backdrop.querySelector('.qcf-cancel').textContent = opts.cancelText || 'Hủy';
    var okBtn = backdrop.querySelector('.qcf-ok');
    okBtn.textContent = opts.okText || 'Xác nhận';
    okBtn.classList.toggle('qcf-danger', !!opts.danger);
    backdrop.querySelector('.qcf-icon').classList.toggle('qcf-danger', !!opts.danger);
    okCb = onOk;
    backdrop.classList.add('open');
    okBtn.focus();
  }

  window.qConfirm = qConfirm;
})();
