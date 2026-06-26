# Nội dung cần thêm vào skill "qranty-design-guideline"

Copy phần dưới vào skill qua Settings > Capabilities (hoặc dùng skill-creator để chỉnh sửa skill này).

---

## "Công nợ" đã được build thành "Thu chi" — cập nhật sidebar-topbar-integration.md

`sidebar-topbar-integration.md` hiện còn ghi: *"Một nav item placeholder href="#" (ví dụ 'Công nợ' tại thời điểm viết) nghĩa là module chưa được build."* Câu này **đã lỗi thời** — nav item đó giờ là **"Thu chi"**, trỏ vào `qranty-tai-chinh.html` (data-page="tai-chinh"), không còn là link chết. Xoá ví dụ "Công nợ" khỏi câu đó hoặc thay bằng ví dụ placeholder khác nếu có.

Lý do đổi tên từ "Công nợ" sang "Thu chi": project owner cho rằng "công nợ" không đúng bản chất — đây là dòng tiền vào/ra (cash in/cash out) gắn với khách hàng & nhà cung cấp, không phải số liệu kế toán nợ đầy đủ. Tabs bên trong vẫn giữ khái niệm "Cần thu (khách hàng)" / "Cần chi (nhà cung cấp)" vì đó là phân loại hợp lý, chỉ đổi tên module bao ngoài.

## File mới: `thuchi-store.js` — kho dữ liệu Thu chi dùng chung

Một shared script mới, cùng nhóm với `sidebar.js`/`topbar.js`/`col-filter.js`, include bằng `<script src="./thuchi-store.js"></script>` (đặt ngay sau `sidebar.js`). Lưu dữ liệu vào `localStorage` key `qranty-thuchi-data`, API:

```js
QrantyThuChi.getData()              // { thu: [...], chi: [...] } — tự seed nếu chưa có
QrantyThuChi.addEntry(type, entry)  // type: 'thu' | 'chi'; entry: { name, code, amount, paid, remain, ref, source, date? }
QrantyThuChi.fmtVND(n)              // "5.500.000 đ"
QrantyThuChi.sourceLabel(source)    // 'banhang' | 'nhaphang' | 'manual' → nhãn tiếng Việt
```

**Nguyên tắc quan trọng nhất của module này:** Thu chi (`qranty-tai-chinh.html`) không phải nơi *tạo* khoản thu/chi chính — nó là nơi *xem/tổng hợp* những gì các phiếu giao dịch thật đã tự sinh ra. Nút "+ Thêm khoản" thủ công trên trang Thu chi vẫn còn, nhưng chỉ dành cho trường hợp ngoài luồng phiếu (khách ứng trước, mượn tiền...) — không phải lối đi chính.

Hiện có 2 điểm tự động sinh dữ liệu vào đây:

1. **Thao tác nhanh (`qranty-thao-tac-nhanh.html`) → "cần thu".** Khi chế độ Cửa hàng (`mode-store`) đang bật, form kích hoạt bảo hành có thêm khối `fin-only` "Thanh toán bán hàng" (Giá bán + Khách đã trả, field id `qaPrice`/`qaPaid`). Lúc xác nhận kích hoạt, nếu có nhập Giá bán, gọi `QrantyThuChi.addEntry('thu', {..., source: 'banhang'})` — kích hoạt bảo hành và tạo phiếu bán hàng/phiếu thu là **một hành động**, không phải 2 bước tách rời.

2. **Kho hàng (`qranty-kho-hang-v2.html`) → "cần chi".** Modal "Tiếp nhận hàng hóa" (`#addProductModal`) đã có sẵn khung "Thanh toán nhập hàng" (Giá nhập/Số tiền phải trả/Số tiền thực trả, `_apmCalcDebt()`) nhưng trước đây chỉ hiển thị tại chỗ rồi mất khi đóng modal — không lưu lại đâu cả. Đã nối thêm:
   - Nhập đơn lẻ (không phải lô): sync ngay trong `saveSingleProduct()` khi `!_apm.active`, dùng đúng số `apmCostPrice`/`apmStock`/`apmTotalDue`/`apmAmountPaid`/`apmSupplier` đã có.
   - Nhập theo lô: `_apm` có thêm field `totalPaid` (cộng dồn `apmAmountPaid` mỗi item, song song với `totalQty`/`totalValue` đã có sẵn). Sync 1 lần gộp cho cả lô tại `endBatch()`, trước khi reset `_apm`.
   - Cả 2 đều gọi `QrantyThuChi.addEntry('chi', {..., source: 'nhaphang'})`, chỉ khi `mode-store` đang bật.

Nếu mở rộng thêm 1 nguồn sinh thu/chi nữa (ví dụ luồng Sửa chữa tính phí khách), theo đúng pattern này: gọi `QrantyThuChi.addEntry()` ngay tại điểm phiếu được "chốt" (không phải tại điểm nhập liệu), gate bằng `mode-store`, gắn `source` riêng và thêm nhãn vào `sourceLabel()` trong `thuchi-store.js`.

## `qranty-tai-chinh.html` render hoàn toàn từ store, không hardcode

Cả 2 bảng (Cần thu/Cần chi), 3 stat card, đếm tab, và pagination info đều được tính lại từ `QrantyThuChi.getData()` qua hàm `tcRenderAll()` (chạy lúc `DOMContentLoaded` và sau mỗi lần thêm khoản). Nếu sửa trang này, đừng quay lại hardcode `<tr>` trong HTML — mọi dòng đi qua `tcRow()`.
