# Qranty UI — Code ver 3

App là tập các trang HTML độc lập, không build step, không framework. Mọi trang
dùng chung 4 file: `shared.css` (design tokens + component), `sidebar.js`,
`topbar.js`, `col-filter.js`, và state chung qua `localStorage`.

## Store dùng chung (localStorage)

| File | Object toàn cục | Vai trò |
|------|-----------------|---------|
| `kho-store.js`        | `QrantyKho`        | Kho hàng thật: sản phẩm (có cờ `normalized`), lô nhập (PNK), tồn kho |
| `thuchi-store.js`     | `QrantyThuChi`     | Thu/chi: lịch sử tự sinh từ phiếu thật, mỗi khoản có `source` |
| `customer-store.js`   | `QrantyKhach`      | Khách hàng (khóa SĐT); số mua/chi/nợ suy từ Thu chi |
| `supplier-store.js`   | `QrantySupplier`   | Nhà cung cấp (khóa tên), loại ncc/npp/khac; công nợ phải trả suy từ Thu chi |
| `order-store.js`      | `QrantyOrders`     | Phiếu bán hàng — giữ line items để bung chi tiết + in lại bill (nối Thu chi qua `thuChiId`) |
| `warranty-store.js`   | `QrantyWarranty`   | Bảo hành theo serial; là nguồn dữ liệu cho module QR |
| `repair-columns-store.js` | `QrantyRepairCols` | Cấu hình cột trạng thái Kanban sửa chữa (quản lý ở Cài đặt) |
| `qranty-notify.js`    | `Qranty`           | Thông báo dữ liệu mới: badge module + chuông + dòng đỏ "chờ bổ sung" |

## Module Thu chi (`qranty-tai-chinh.html`) — chỉ lịch sử, không tạo tay

Chỉ 2 tab **Thu / Chi**, mỗi dòng là một giao dịch tự sinh, có cột **badge nguồn**
(`.tc-badge`) + **dropdown lọc nguồn** (`#tcSourceFilter`) + ô tìm. Không có nút
"Thêm" / modal tạo tay (đã gỡ).

Quy ước `source` (xem `QrantyThuChi.sourceLabel` / `sourcesFor`):

| Loại | source | Nhãn | Sinh từ |
|------|--------|------|---------|
| Thu | `banhang` | Bán hàng | Phiếu bán (Thao tác nhanh) |
| Thu | `suachua` | Sửa chữa | Tạo phiếu sửa có phí (repair-kanban, `handleFormSubmit` create) |
| Chi | `nhaphang` | Nguồn nhập | Nhập lô / batch (kho) |
| Chi | `le` | Nguồn khác | Tạo sản phẩm lẻ (kho `saveSingleProduct`) |

Lưu ý: seed demo mới chỉ áp dụng khi localStorage `qranty-thuchi-data` trống —
xoá key này để xem dữ liệu mẫu mới, hoặc nó sẽ tự đầy lên khi tạo phiếu thật.

## Hệ thống thông báo dữ liệu mới — `qranty-notify.js`

Khi một luồng tạo data chạy, gọi `Qranty.push(...)` để tự cập nhật toàn app:

- **Badge đỏ (số)** cạnh tên module trong sidebar (`.ni-badge.alert`, nhấp nháy),
  đếm số bản ghi mới chưa kiểm tra của module đó.
- **Chuông** góc phải cộng số + thêm dòng vào panel; bấm vào nhảy sang module.
- **Dòng data mới tô đỏ** (`tr.qr-pending`) ngay trong bảng trang đích; ô thiếu/
  chưa chuẩn hóa hiện nhãn đỏ "Chờ bổ sung" (`.qr-missing`). Mỗi dòng có nút
  **"Đã kiểm tra"** — bấm thì dòng hết đỏ và badge giảm 1 (đánh dấu đã xem từng dòng).

Feed lưu ở `localStorage['qranty-feed']`, đồng bộ giữa các tab qua sự kiện `storage`.

### API

```js
Qranty.push({
  source: 'Đơn hàng mới của Nguyễn Văn A',
  targets: [
    { page: 'khach-hang', kind: 'customer', data: { name, phone, email } },
    { page: 'kho-hang',   kind: 'product',  data: { name, sku, type, qty, cost, price, lot } },
    { page: 'bao-hanh',   kind: 'warranty', data: { sku, product, customer, phone, start, end } },
  ]
});
Qranty.markSeen(id);   // đánh dấu 1 dòng đã kiểm tra
Qranty.markAllSeen();  // nối với "Đánh dấu đã đọc" trên chuông
Qranty.clear();        // xoá feed (reset demo)
```

`RENDERERS` trong file định nghĩa bảng đích + cách dựng ô cho từng `page`
(`khach-hang`, `kho-hang`, `bao-hanh`, `repair-kanban`). Trường rỗng → tự hiện
"Chờ bổ sung". Badge module = số item `!seen` của page đó; badge chuông = tổng `!seen`.

### Đã wire các luồng tạo data

- **Bán hàng** (`qranty-thao-tac-nhanh.html`, `qaSubmit`) → Khách hàng + Kho hàng + Bảo hành
- **Thêm khách** (`qranty-khach-hang.html`, `submitAddCustomer`) → Khách hàng
- **Nhập lô** (`qranty-kho-hang-v2.html`, `pnkConfirm`) → Kho hàng + Bảo hành
- **Thêm hàng đơn lẻ** (`qranty-kho-hang-v2.html`, `saveSingleProduct`) → Kho hàng

- **Sửa chữa** (`qranty-repair-kanban.html`, tạo phiếu có phí) → Thu chi (source `suachua`) + Khách hàng

## Serial + QR bảo hành theo từng dòng (Thao tác nhanh)

Mỗi dòng sản phẩm có bảo hành có toggle `.seg` **Tự động / Thủ công** cho serial:

- **Tự động** (mặc định): sinh serial `SN<6 số>-<id>`; ô serial khoá (`readonly`),
  có nút ⟳ tạo lại. Bật khi tick "Áp dụng bảo hành" hoặc bấm Tự động.
- **Thủ công**: mở khoá ô serial cho nhập tay.

Hàm: `qaItemSetSerialMode(id, mode)`, `qaItemGenSerial(id)`. Không có QR thumbnail
cạnh ô serial — mã QR đã hiển thị ở **preview phiếu bên phải** (`qaRenderReceipt`
vẽ từ serial qua `QrantyQR.draw`, qr-draw.js).

## Roadmap & Tiến độ (cập nhật 25/06/2026)

> Trạng thái chi tiết theo từng module nằm ở `references/feature-roadmap.md` trong
> skill **qranty-design-guideline** (✅ chạy thật · 🟡 có nền chưa đủ dùng · ⬜ chưa có).
> Dưới đây là log những gì đã làm xong trong các phiên gần đây.

**Đã xong (mới):**

- **Hệ thống thông báo dữ liệu mới** — engine `qranty-notify.js`: badge đỏ cạnh module +
  chuông + dòng đỏ "Chờ bổ sung", deep-link bấm vào nhảy đúng trang/đúng dòng. Mỗi trang
  tự render bảng (`selfRendered`) nên không còn dòng notify trùng. Có markSeen/markAllSeen,
  trang Thông báo + 8 seed (4 nhóm: Mới tạo / Chưa chuẩn hóa / Cảnh báo / Nhắc nhở).
- **Cảnh báo tồn kho thấp** — `kho-store.js` `_lowStockAlert()` đẩy thông báo (kind warning,
  tag "Kho hàng") khi tồn rớt xuống dưới `LOW_STOCK = 3`, gọi từ updateProduct/updateStock.
- **Module Tài chính** (`qranty-tai-chinh.html`) — 2 tab Tiền vào / Tiền ra, badge nguồn,
  dropdown lọc nguồn, score card thống kê, chỉ-lịch-sử (không tạo tay). Tự sinh từ phiếu thật.
- **Luồng khách hàng xuyên module** — `customer-store.js` (QrantyKhach): upsert dedupe theo
  SĐT, gộp dữ liệu từ Đơn hàng + Sửa chữa + Thu chi; autocomplete khi bán hàng / kích hoạt BH.
- **Sửa chữa → Thu chi** — tạo phiếu sửa có phí tự ghi một khoản Thu (source `suachua`).
  Hoàn thiện đúng pattern "Nhập/xuất tiền theo phiếu" cho cả 3 luồng bán/nhập/sửa.
- **Phiếu sửa chữa demo + statusSince** — 5 phiếu full demo, thẻ "đã [trạng thái] X ngày"
  (ngày tạo phiếu cố định, không đổi); thông báo quá hạn tiếp nhận.
- **Bảo hành** — bỏ score card trùng tổng quan; filter trạng thái chuyển thành score-card
  bấm-để-lọc.
- **Kho hàng** — dòng chưa chuẩn hóa chỉ tô đỏ + nhãn "Chờ bổ sung" bấm mở panel sửa phải
  (bỏ nút "Đã kiểm tra" che icon); chip/tag input cho trường tùy chỉnh (gõ `,` → pill xám).
- **Nhập kho riêng** (`qranty-nhap-hang.html`) — module độc lập bố cục 2 cột (form trái /
  preview + thanh toán phải), theo guideline "Thao tác nhanh".
- **Fix layout dataset Kho hàng** — `.kh-table-wrapper` từ không có CSS → box cố định nền
  trắng, cuộn ngang bên trong (giống bảng Bảo hành/Khách hàng), hết tràn ra ngoài màn hình.
- **Dọn Kho hàng 4 tab → 2 tab** — bỏ tab "Nhập kho" (trùng module) + "Sản phẩm gốc/Danh mục"
  (trùng sidebar Nhóm hàng + cờ chưa-chuẩn-hóa). Còn **Hàng hóa** + **Lô hàng**.
- **Sidebar Nhóm hàng data-driven** — đếm thật theo `category`; bấm nhóm cha bung mục con theo
  hãng (`brand`) + lọc bảng; "+ Thêm nhóm" lưu thật (`qranty-kho-categories`), nhóm rỗng vẫn hiện.
- **Thẻ mô tả tách theo loại** — `qranty-kho-desc-tags` `{product, part}`: sản phẩm và linh kiện
  có rổ thẻ gợi ý riêng, bấm thêm/xóa, không lẫn nhau; không đụng luồng bán hàng.
- **Modal Hàng hóa chỉ còn nhập lẻ** — bỏ toggle "Thêm theo lô (Batch)" (`apmModeField` luôn ẩn);
  tạo theo lô dồn về panel duy nhất.
- **Lô hàng tab = accordion từ PNK** — header trường chi tiết (mã phiếu/NCC/ngày/mặt hàng/tổng/
  thanh toán/trạng thái), bấm bung sản phẩm trong lô (mặc định ẩn); mỗi SP có cột Chuẩn hóa
  (chưa chuẩn → "Chờ bổ sung" mở panel sửa).
- **Panel phải "Tạo lô nhập hàng"** (`#createLotPanel`) — docked sidebar ngay trong Kho hàng,
  KHÔNG nhảy sang module; ghi đồng bộ `addProduct` + `addPNK` + Thu chi `nhaphang` + serial.

**Đang chờ / kế tiếp:**

- **Thanh toán & Hóa đơn điện tử**: Tích hợp luồng thanh toán tự động payOS (quét QR động) và tự động xuất hóa đơn VAT CyberBill (5 bước mua gói, modal 4 bước xuất hóa đơn), quản lý lịch sử thanh toán và thông tin xuất hóa đơn.
- Bước 3: gỡ store `qranty-lots` cũ — Lô hàng giờ đọc thẳng `getPNKList()` nên `qranty-lots` đã thừa.
- Tùy chọn: `supplier-store` đối xứng `customer-store` cho Nhà cung cấp.

## Kho hàng — kiến trúc & quyết định (thay phần skill)

Vì file skill là cache chỉ-đọc, các quyết định thiết kế Kho hàng ghi tại đây để tra cứu.

**2 tab:** **Hàng hóa** (danh sách SP + sidebar Nhóm hàng bên trái) và **Lô hàng** (lịch sử
phiếu nhập = lô). Đã bỏ tab "Nhập kho" và "Sản phẩm gốc/Danh mục" vì trùng chức năng.

**Sidebar Nhóm hàng (`#catFilterList`)** — cây 2 cấp data-driven (`khBuildCatTree`): cấp 1 =
`category`, cấp 2 = `brand`. Vừa lọc bảng vừa quản lý nhóm. Đếm tự cập nhật ở cuối
`renderGoodsTable`. Nhóm tạo tay lưu ở `qranty-kho-categories` (kho-store `getCategories/addCategory`).

**Thẻ mô tả gợi ý** — tách theo loại ở `qranty-kho-desc-tags` `{product, part}` (kho-store
`getTagDefs/addTagDef/removeTagDef`). Modal đổi rổ theo toggle loại hàng (`apmRenderTagSuggest`,
biến `APM_TYPE`). Chỉ là gợi ý cho ô chip; giá trị thật vẫn lưu trong `customFields.specs` của SP.

**"1 phiếu = 1 lô".** Tạo lô có MỘT đường duy nhất: **panel phải `#createLotPanel`** (mở từ nút
"Tạo lô nhập hàng" ở tab Lô hàng + link trong modal thêm SP). Đây là panel docked THỨ HAI trên
trang — dùng lại modifier `.fin-slide-backdrop.apm-docked` + `body.apm-panel-open` (co `.main`
`margin-right:420px`), KHÔNG nới base class `.fin-slide-backdrop`. Khi đóng chỉ gỡ
`apm-panel-open` nếu panel kia (`#addProductModal`) không mở. `clConfirm()` ghi đồng bộ:
`QrantyKho.addProduct` (tồn, `normalized:false`) + `QrantyKho.addPNK` (phiếu=lô, serial tự sinh)
+ `QrantyThuChi.addEntry('chi', source:'nhaphang')` + `Qranty.push`. Module `qranty-nhap-hang.html`
giữ làm dự phòng, không còn link tới.

**Mô hình 2 tầng nhập / chuẩn hóa:**
- *Nhập nhanh* (panel Tạo lô): chỉ data cốt lõi → SP vào kho `normalized:false`.
- *Chuẩn hóa* ở **tab Lô hàng**: render accordion từ `QrantyKho.getPNKList()` (`renderLotAcc`);
  bấm header bung danh sách SP (mặc định ẩn). Cột "Chuẩn hóa": `normalized:false` → nút đỏ
  "Chờ bổ sung" mở `editProduct`; xong badge "Đã chuẩn hóa". Header lô có chip "N chờ bổ sung".

**Đồng bộ Lô hàng:** kích hoạt/thu hồi bảo hành ghi qua `QrantyKho.updatePNKSerials` (vào PNK),
xóa lô gỡ khỏi `qranty-pnk-history` → render lại từ PNK luôn đúng. `lot.id === pnk.code`.

**Modal "Thêm sản phẩm" chỉ nhập lẻ** — `apmSetGoodsType` luôn đặt `apmModeField.style.display
= 'none'` (trước đây vô tình bật toggle Batch cho loại sản phẩm). Nút toolbar gọi
`openAddProductModal(false)`.

**Gotcha test (jsdom):** `QrantyKho` là top-level `const`, KHÔNG lên `window` — test phải đọc
`localStorage` trực tiếp hoặc gọi qua hàm UI (vd `khAddCatKey`, `clConfirm`), không dùng
`w.QrantyKho`. Store Thu chi tự seed khi lần đầu `getData` (đừng đếm chênh lệch tuyệt đối).

## Gotcha đã biết — inline-create khách hàng (Thao tác nhanh)

Ô **SĐT** (`#qaPhone`) và ô **Tên** (`#qaName`) đều có "Tạo khách hàng mới" và đều
ghi vào **cùng biến** `QA_STATE.customer`.

- **Bug hiện tại:** hai handler *ghi đè* object (không merge) → bấm "Tạo mới" ở ô
  thứ hai làm mất trường của ô thứ nhất trong state.
- **Rủi ro khi nối backend:** nếu mỗi lần bấm inline = một INSERT thì sẽ ra **2 hồ
  sơ khách rời** (một chỉ có SĐT, một chỉ có Tên). Tên + SĐT là 2 thuộc tính của
  CÙNG một khách, không phải 2 thực thể.
- **Quy tắc đúng:** (1) gộp state, không ghi đè; (2) khóa định danh = SĐT; (3) chỉ
  upsert MỘT lần lúc "Tạo đơn" — SĐT đã có → gắn vào khách cũ, chưa có → tạo 1
  record với cả tên + SĐT. `Qranty.push` cho khách hàng cũng cần dedupe theo SĐT
  để không báo đỏ nhầm khách đã tồn tại.

## Quy trình nghiệp vụ (cập nhật 26/06/2026)

Toàn app theo một nguyên tắc xương sống: **tách "ai/cái gì" (thực thể) khỏi "tiền"
(Thu chi)**. Các trang thực thể chỉ lưu thông tin; mọi con số tiền — đã mua, đã
nhập, công nợ — đều tính trực tiếp từ `QrantyThuChi`, nên không bao giờ lệch với
phiếu thật. "Tiền đi theo phiếu" có đúng 3 luồng:

1. **Bán hàng** (Thao tác nhanh → `qaSubmit`): tạo phiếu nhiều SP → ghi **Thu**
   (`source: banhang`) + lưu **Phiếu bán** (`QrantyOrders`, giữ line items) +
   kích hoạt **Bảo hành** (`QrantyWarranty`, sinh serial/QR) + upsert **Khách**
   (theo SĐT) + trừ tồn kho. Khách trả thiếu → khoản "còn lại" tự sang Thu chi.
2. **Nhập hàng** (Nhập kho / panel Tạo lô): ghi **Chi** (`source: nhaphang`) +
   thêm SP vào kho (`normalized:false`) + lưu lô (PNK) + **upsert Nhà cung cấp**
   (ô "Nguồn nhập" gợi ý danh bạ NCC). Công nợ phải trả NCC = tổng `chi.remain`.
3. **Sửa chữa** (Repair Kanban → `handleFormSubmit`): phí sửa → ghi **Thu**
   (`source: suachua`) đồng bộ **2 chiều** qua `thuChiId` (sửa phiếu cập nhật
   đúng dòng, xoá phiếu gỡ khoản thu); trạng thái **Trả máy** = đánh dấu đã thu
   đủ. Upsert Khách + trừ kho linh kiện dùng trong ca sửa.

**Tài chính = lăng kính, không phải nơi nhập tay.** `qranty-tai-chinh.html` chỉ
đọc Thu chi: 2 tab Tiền vào/ra, lọc theo nguồn, **lọc theo ngày (sổ quỹ)** hiện
tổng thu/chi/tồn quỹ của ngày được chọn. Dòng Thu của phiếu bán **bung được chi
tiết từng SP** và **in lại bill** đúng từng dòng (lấy từ `QrantyOrders`).

**QR ↔ Bảo hành.** Module QR không còn dữ liệu mock: mỗi mã QR = một phiếu Bảo
hành thật. QR mới (do bán hàng/kích hoạt BH tạo) tự xuất hiện; bấm vào QR mở
modal full thông tin SP/khách/hạn bảo hành.

## Spec sản phẩm — module & trạng thái

| Module | Trang | Trạng thái | Ghi chú |
|---|---|---|---|
| Bán hàng | `qranty-thao-tac-nhanh.html` | ✅ | Nhiều SP/phiếu, serial+QR, đồng bộ Thu/Kho/BH/Khách/Đơn |
| Lịch sử bán hàng | trong `qranty-tai-chinh.html` | ✅ | Bung chi tiết + in lại bill (từ `QrantyOrders`) |
| Kho hàng | `qranty-kho-hang-v2.html` | ✅ | 2 tab Hàng hóa + Lô hàng; nhóm hàng data-driven |
| Nhập hàng | panel Tạo lô + `qranty-nhap-hang.html` | ✅ | Đồng bộ Chi + PNK + NCC + serial |
| Nhà cung cấp | `qranty-nha-cung-cap.html` | ✅ | Danh bạ NCC/NPP, công nợ phải trả từ Thu chi, modal chi tiết |
| Khách hàng | `qranty-khach-hang.html` | ✅ | Danh bạ, modal chi tiết giữa màn hình, số liệu từ Thu chi |
| Bảo hành | `qranty-bao-hanh.html` | 🟡 | Có store thật, còn vài chỗ bảng demo |
| Sửa chữa | `qranty-repair-kanban.html` | ✅ | Kanban cột động (mặc định 4 cột), phí→Thu chi 2 chiều |
| QR Code | `qranty-qr-code.html` | ✅ | Đọc Bảo hành thật, modal chi tiết, đã gỡ mock |
| Tài chính | `qranty-tai-chinh.html` | ✅ | Sổ quỹ + lọc ngày, chỉ-đọc |
| Cài đặt | `qranty-cai-dat.html` | ✅ | + tab "Trạng thái sửa chữa" (thêm/sửa/xoá/đổi màu/đổi thứ tự cột) |
| Thanh toán & Hóa đơn | `qranty-cai-dat.html` (Tab Thanh toán & Hồ sơ) | ⬜ | Đăng ký gói (payOS), xuất hóa đơn (CyberBill), Lịch sử thanh toán & Cài đặt thông tin |
| Dashboard | `qranty-dashboard.html` | 🟡 | Số liệu còn mock, chưa nối Thu chi/Đơn thật |

### Cột trạng thái sửa chữa (mới)
Kanban render **động** từ `QrantyRepairCols` (mặc định 4 cột: Tiếp nhận / Đang sửa
/ Hoàn thành / Trả máy — gọn cho vừa màn hình, ít kéo thả). Quản lý ở **Cài đặt →
Trạng thái sửa chữa**: thêm/đổi tên/đổi màu/đổi thứ tự/xoá cột. Phiếu thuộc cột bị
xoá tự dồn về cột đầu (`migrateOrphanTickets`). Màu chấm cột + select trạng thái
sinh từ CSS động (`buildStatusStyle`) nên cột tự thêm vẫn đúng màu; thống kê 3 thẻ
(Đang xử lý/Hoàn thành/Trả máy) suy theo cấu hình qua `_statKeys` để không vỡ khi
đổi cột.
