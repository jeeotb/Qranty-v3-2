# Audit dữ liệu Qranty (Code ver 3)

Rà từ code thật: các store localStorage, mảng dữ liệu trong trang, và luồng ghi/đọc. Phân làm 3 nhóm: **(A) đã liên kết**, **(B) tách rời / chưa thực thể hóa**, **(C) rác / dead code**.

> Cập nhật 26/06/2026: thêm **Nhà cung cấp** (`supplier-store.js`), **Phiếu bán hàng** (`order-store.js`), **Cột trạng thái sửa chữa** (`repair-columns-store.js`); **QR** giờ đọc thẳng từ Bảo hành thật (đã gỡ mảng mock). Luồng "tiền theo phiếu" đủ 3 nhánh và Sửa chữa đã đồng bộ Thu chi 2 chiều (tạo/sửa/xoá + đánh dấu đã thu khi trả máy).

## A. Dữ liệu đã liên kết (có store chung, nhiều luồng ghi vào)

| Thực thể | localStorage key | Trường chính | Ghi từ | Đọc tại |
|---|---|---|---|---|
| **Khách hàng** (`QrantyKhach`) | `qranty-customers` | id, name, **phone (khóa)**, email, dob, gender, type, address, note | Modal thêm khách, Đơn hàng (upsert), Sửa chữa (upsert) | Khách hàng, autocomplete Đơn/Sửa |
| **Nhà cung cấp** (`QrantySupplier`) | `qranty-suppliers` | id, **name (khóa)**, phone, contact, email, type (ncc/npp/khac), address, note | Modal thêm NCC, **Nhập hàng (upsert ô Nguồn nhập)** | Nhà cung cấp; công nợ phải trả suy từ Thu chi (chi, source nhaphang) |
| **Sản phẩm / Kho** (`QrantyKho`) | `qranty-kho-products` | sku, name, category, brand, unit, warrantyDays, costPrice, salePrice, qty, **normalized**, customFields | Đơn hàng, Nhập lô, SP lẻ, trừ kho linh kiện khi sửa | Kho hàng, autocomplete SP, dropdown linh kiện Sửa |
| **Lô nhập (PNK)** | `qranty-pnk-history` | code, supplier, date, items[], total, paid, remain | Nhập lô (Kho), Nhập hàng | Kho hàng → tab Lô hàng |
| **Phiếu bán hàng** (`QrantyOrders`) | `qranty-orders` | id, customerName, customerPhone, date, **items[]** (name,sku,qty,price,serial,warranty), total, paid, remain, **thuChiId** | Bán hàng (Thao tác nhanh, `qaSubmit`) | Tài chính: bung chi tiết dòng Thu + in lại bill đúng từng SP |
| **Thu chi** (`QrantyThuChi`) | `qranty-thuchi-data-v2` | id, name, code (SĐT/NCC), amount, paid, remain, ref, **source**, date | Đơn→thu(banhang), Nhập→chi(nhaphang), SP lẻ→chi(le), **Sửa→thu(suachua) 2 chiều** | Tài chính (sổ quỹ + lọc theo ngày), Khách hàng, Nhà cung cấp |
| **Bảo hành** (`QrantyWarranty`) | `qranty-warranties` | serial, productSku, productName, customerName, customerPhone, activatedAt, expiresAt, status, recalledReason | Bán hàng (kích hoạt BH) | Bảo hành; **QR Code** (mỗi QR = 1 phiếu BH, bấm xem full thông tin) |
| **Cột trạng thái sửa chữa** (`QrantyRepairCols`) | `qranty-repair-columns` | key, label, color | Cài đặt → tab "Trạng thái sửa chữa" | Repair Kanban render cột động (mặc định 4 cột) |
| **Phiếu sửa** | `qranty-tickets-v2` | id, code, customer, phone, date, device, cost, status, partSku, partQty, isStockDeducted, **thuChiId** | Repair Kanban | Repair Kanban |
| **Thông báo** (`Qranty` feed) | `qranty-feed` | id, page, kind, data{}, source, seen | Đơn, Nhập lô, SP lẻ, Sửa quá hạn | Badge sidebar + chuông + dòng đỏ |

**Khóa nối thực thể:** `phone` = khóa khách; `name` = khóa NCC; `sku` nối SP↔Đơn↔linh kiện sửa; `source` phân loại Thu chi; `thuChiId` nối Phiếu bán↔dòng Thu và Phiếu sửa↔dòng Thu; `serial` nối Bảo hành↔QR.

## B. Còn tách rời / chưa thực thể hóa

### Bảo hành — đã có store nhưng seed phần lớn là demo
`qranty-warranties` đã là store thật (Bán hàng ghi vào, QR + trang Bảo hành đọc ra). Còn lại: bảng trang Bảo hành một số chỗ vẫn là số demo; nên rà để mọi card lọc đếm từ store thay vì DOM tĩnh.

### Dashboard — số liệu mock
Card "Doanh thu tháng này" + chart vẫn hardcode, chưa nối `QrantyThuChi` / `QrantyOrders` thật.

## C. Rác dữ liệu / dead code / nợ kỹ thuật

| Mục | Loại | Chi tiết |
|---|---|---|
| `qranty-warranty-data`, `qranty-thuchi-data` (v1) | Dead key | Chỉ còn trong `qranty-workflow-slide.html` (trang minh hoạ luồng, không phải module thật). Store thật là `qranty-warranties` / `qranty-thuchi-data-v2`. |
| `qranty-lots` | Legacy | `qranty-nhap-hang.html` còn ghi/đọc key này, nhưng Lô hàng ở Kho đọc thẳng `qranty-pnk-history`. Module nhập-hang giữ làm dự phòng (không link từ sidebar). |
| `CUSTOMERS_DB` (thao-tac-nhanh) | Gần dead | Chỉ còn là fallback khi `QrantyKhach` chưa nạp; autocomplete đã đọc store thật. |
| `qranty_collapsed_columns` | Nợ kỹ thuật | Tên gạch-dưới lệch chuẩn `qranty-...`. (`qranty-tickets-v2` đã đúng chuẩn.) |
| QR mock cũ (`PRODUCTS/CUSTOMERS/WARRANTY/randSerial…`) | **Đã gỡ** | QR Code nay dựng từ `QrantyWarranty.getData()`; khối mock đã xoá khỏi `qranty-qr-code.html`. |
| Số liệu Dashboard | Mock | Phần lớn hardcode, chưa nối dữ liệu thật. |

## Khuyến nghị ưu tiên còn lại

1. **Dashboard nối dữ liệu thật** — doanh thu/đơn lấy từ `QrantyOrders` + `QrantyThuChi`, bỏ số mock.
2. **Bảo hành render hoàn toàn từ store** — bỏ mọi dòng tĩnh, card lọc đếm từ `QrantyWarranty`.
3. **Dọn nợ tên key** — thống nhất `qranty_collapsed_columns` → `qranty-...`; gỡ `qranty-lots` khi chắc chắn nhập-hang không còn dùng; gỡ tham chiếu key mồ côi trong `qranty-workflow-slide.html`.
