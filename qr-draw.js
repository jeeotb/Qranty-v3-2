/* ============================================================
   qr-draw.js — vẽ QR giả lập (visual only, không phải QR thật
   có thể quét) lên <canvas>, dùng chung cho mọi trang cần hiển
   thị mã QR mà không cần 1 thư viện QR ngoài.

   Trước đây hàm này được viết riêng trong qranty-qr-code.html;
   giờ Thao tác nhanh cũng cần nên gộp về đây — tránh lặp lại
   lần 2 (đúng pattern đã làm với col-filter.js).

   Dùng: QrantyQR.draw(canvasEl, seedNumber, sizePx)
         QrantyQR.hash(text) -> seedNumber ổn định theo text
   ============================================================ */
(function () {
  function LCG(seed) {
    var s = seed * 1664525 + 1013904223;
    this.next = function () { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  }

  function draw(canvas, seed, size) {
    size = size || 130;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    var m = 21; // QR modules
    var cell = size / m;
    var r = new LCG(seed);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    function fill(x, y, c) {
      ctx.fillStyle = c || '#0f172a';
      ctx.fillRect(Math.round(x * cell), Math.round(y * cell), Math.ceil(cell), Math.ceil(cell));
    }

    var modules = [];
    for (var row = 0; row < m; row++) {
      modules[row] = [];
      for (var col = 0; col < m; col++) {
        var inFinder = (row < 8 && col < 8) || (row < 8 && col >= m - 8) || (row >= m - 8 && col < 8);
        if (inFinder) { modules[row][col] = 2; }
        else { modules[row][col] = r.next() > 0.45 ? 1 : 0; }
      }
    }
    for (var row2 = 0; row2 < m; row2++) {
      for (var col2 = 0; col2 < m; col2++) {
        if (modules[row2][col2] === 1) fill(col2, row2);
      }
    }

    function drawFinder(cx, cy) {
      for (var i = 0; i < 7; i++) { fill(cx + i, cy); fill(cx + i, cy + 6); fill(cx, cy + i); fill(cx + 6, cy + i); }
      ctx.fillStyle = '#fff';
      for (var fy = cy + 1; fy <= cy + 5; fy++) for (var fx = cx + 1; fx <= cx + 5; fx++) fill(fx, fy, '#fff');
      for (var fy2 = cy + 2; fy2 <= cy + 4; fy2++) for (var fx2 = cx + 2; fx2 <= cx + 4; fx2++) fill(fx2, fy2, '#0f172a');
      ctx.fillStyle = '#fff';
      for (var i2 = -1; i2 <= 7; i2++) {
        if (cy + i2 >= 0 && cy + i2 < m) fill(cx - 1, cy + i2, '#fff');
        if (cy + i2 >= 0 && cy + i2 < m) fill(cx + 7, cy + i2, '#fff');
        if (cx + i2 >= 0 && cx + i2 < m) fill(cx + i2, cy - 1, '#fff');
        if (cx + i2 >= 0 && cx + i2 < m) fill(cx + i2, cy + 7, '#fff');
      }
      for (var i3 = 0; i3 < 7; i3++) { fill(cx + i3, cy); fill(cx + i3, cy + 6); fill(cx, cy + i3); fill(cx + 6, cy + i3); }
      ctx.fillStyle = '#fff';
      for (var fy3 = cy + 1; fy3 <= cy + 5; fy3++) for (var fx3 = cx + 1; fx3 <= cx + 5; fx3++) fill(fx3, fy3, '#fff');
      for (var fy4 = cy + 2; fy4 <= cy + 4; fy4++) for (var fx4 = cx + 2; fx4 <= cx + 4; fx4++) fill(fx4, fy4, '#0f172a');
    }

    drawFinder(0, 0);
    drawFinder(m - 7, 0);
    drawFinder(0, m - 7);

    for (var i = 8; i < m - 8; i++) {
      if (i % 2 === 0) { fill(i, 6, '#0f172a'); fill(6, i, '#0f172a'); }
      else { fill(i, 6, '#fff'); fill(6, i, '#fff'); }
    }
    var ap = m - 7;
    function fillAlignPat(cx, cy) {
      for (var i = -2; i <= 2; i++) { fill(cx + i, cy - 2, '#0f172a'); fill(cx + i, cy + 2, '#0f172a'); }
      for (var i2 = -2; i2 <= 2; i2++) { fill(cx - 2, cy + i2, '#0f172a'); fill(cx + 2, cy + i2, '#0f172a'); }
      fill(cx - 1, cy - 1, '#fff'); fill(cx, cy - 1, '#fff'); fill(cx + 1, cy - 1, '#fff');
      fill(cx - 1, cy, '#fff'); fill(cx + 1, cy, '#fff');
      fill(cx - 1, cy + 1, '#fff'); fill(cx, cy + 1, '#fff'); fill(cx + 1, cy + 1, '#fff');
      fill(cx, cy, '#0f172a');
    }
    fillAlignPat(ap - 2, ap - 2);
  }

  /* Hash 1 chuỗi text thành số nguyên ổn định để làm seed —
     dùng khi chưa có item.id dạng số (vd: gõ tay tên SP/serial). */
  function hash(text) {
    text = String(text || 'qranty');
    var h = 0;
    for (var i = 0; i < text.length; i++) {
      h = (h << 5) - h + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) || 1;
  }

  window.QrantyQR = { draw: draw, hash: hash };
})();
