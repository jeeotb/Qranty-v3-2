/**
 * col-filter.js — Qranty shared "Cột hiển thị" component
 *
 * Wires up every `.col-filter-wrap` on the page: open/close the dropdown,
 * and hide/show table columns via checkboxes.
 *
 * Markup expected inside each `.col-filter-wrap`:
 *   <button class="btn-outline">...Cột hiển thị</button>
 *   <div class="col-filter-menu" data-table="yourTableId">
 *     <div class="col-filter-title">Hiển thị cột</div>
 *     <label class="col-filter-item"><input type="checkbox" checked data-col="1"> Tên cột</label>
 *     ...
 *   </div>
 *
 * The page itself only needs to provide the table-specific `#tableId.hide-cN`
 * CSS rules for its columns (column count differs per table, so that part
 * stays page-local) — everything else here is generic.
 */
(function () {
  function wireMenu(wrap) {
    var btn = wrap.querySelector('.btn-outline');
    var menu = wrap.querySelector('.col-filter-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.col-filter-menu').forEach(function (m) {
        if (m !== menu) m.classList.remove('open');
      });
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var table = document.getElementById(menu.dataset.table);
        if (table) table.classList.toggle('hide-c' + cb.dataset.col, !cb.checked);
      });
    });
  }

  document.addEventListener('click', function (e) {
    document.querySelectorAll('.col-filter-wrap').forEach(function (wrap) {
      if (!wrap.contains(e.target)) {
        var m = wrap.querySelector('.col-filter-menu');
        if (m) m.classList.remove('open');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.col-filter-wrap').forEach(wireMenu);
  });
})();
