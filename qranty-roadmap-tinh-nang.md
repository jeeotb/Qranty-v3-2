# Roadmap tính năng — Qranty (phần mềm bán hàng + bảo hành)

Danh sách dưới đây tổng hợp từ cấu trúc thật của `sidebar.js` (các trang đang tồn tại), những gì đã build trong các phiên làm việc gần đây, và những khoảng trống đã phát hiện ra trong quá trình build (đặc biệt là phần Bán hàng/Thu chi). Không phải để build hết một lúc — đánh dấu trạng thái để bạn biết module nào đã chạy, module nào mới có nền, module nào chưa có gì.

Ký hiệu: ✅ Đã có và hoạt động · 🟡 Có nền nhưng chưa đủ dùng thật · ⬜ Chưa có gì

---

## 1. Bán hàng (Sales / Checkout)

- ✅ Tạo phiếu bán hàng nhiều sản phẩm trong 1 lần (Thao tác nhanh), mỗi sản phẩm tự chọn có/không áp dụng bảo hành riêng
- ✅ Tự tính tổng tiền từ danh sách sản phẩm, theo dõi đã thu/còn lại
- ✅ Tự đồng bộ khoản "cần thu" sang Thu chi khi khách trả thiếu — không cần nhập tay lại
- ✅ In phiếu bán hàng kèm mã QR bảo hành (khổ nhiệt 80mm, tự đổi A5 khi nhiều sản phẩm)
- ⬜ **Lịch sử bán hàng** — danh sách tất cả phiếu đã tạo, xem lại theo ngày/khách hàng, bung chi tiết từng sản phẩm trong phiếu (hiện mỗi phiếu chỉ là 1 dòng gộp trong Thu chi, không bung được)
- ⬜ **In lại hoá đơn cũ** — hiện chỉ in được ngay lúc tạo, đóng trang là mất, không có nơi lưu để in lại
- ⬜ Giảm giá / khuyến mãi trên hoá đơn
- ⬜ Phân loại hình thức thanh toán (tiền mặt / chuyển khoản / thẻ) — hiện chỉ có 1 số "đã trả", không phân loại
- ⬜ Trả hàng / hoàn tiền cho hoá đơn đã bán

## 2. Kho hàng & Sản phẩm

- ✅ Hàng hóa (Sản phẩm + Linh kiện gộp 1 bảng), Lô hàng theo serial, Danh mục
- ✅ Theo dõi tồn kho, giá nhập/giá bán theo sản phẩm
- ✅ Kích hoạt/thu hồi bảo hành hàng loạt theo lô
- 🟡 Tồn kho theo giá trị — có field giá trị nhưng chưa có báo cáo tổng hợp theo thời gian
- ⬜ Cảnh báo tồn kho thấp / sắp hết hàng
- ⬜ Kiểm kho định kỳ (đối chiếu tồn thực tế vs hệ thống)
- ⬜ Chuyển kho giữa chi nhánh (nếu vận hành nhiều cửa hàng)

## 3. Nguồn nhập (Import Sources)

- 🟡 Chỉ có ô chọn/nhập nhanh tên nguồn nhập trong modal nhập hàng — chưa có trang quản lý riêng
- ⬜ Trang danh sách nguồn nhập: thông tin liên hệ, lịch sử nhập hàng theo từng nguồn (NCC, Tồn đầu, Khách trả hàng...)
- ⬜ Liên kết tổng nợ theo nguồn nhập (đã có số ở Thu chi) ngược lại vào trang Nguồn nhập

## 4. Khách hàng (CRM)

- ✅ Trang Khách hàng, autocomplete khi bán hàng/kích hoạt bảo hành
- 🟡 Có field phân loại (VIP, tiềm năng...) nhưng chưa thấy lọc/báo cáo theo phân loại
- ⬜ Lịch sử mua hàng theo từng khách — liên kết các phiếu bán hàng về đúng hồ sơ khách hàng đó
- ⬜ Tích điểm / ưu đãi khách hàng thân thiết

## 5. Bảo hành (Warranty)

- ✅ Kích hoạt, tra cứu, thu hồi bảo hành; in phiếu bảo hành kèm QR
- ⬜ Cổng tra cứu công khai cho khách tự gửi yêu cầu bảo hành (mã QR hiện chỉ là mã định danh nội bộ, chưa trỏ link thật)
- ⬜ Hiện lịch sử bảo hành/sửa chữa trước đó ngay khi tra cứu 1 serial

## 6. Sửa chữa (Repair)

- ✅ Kanban trạng thái sửa chữa
- ⬜ Tính phí sửa chữa + tự đồng bộ sang Thu chi (đúng tinh thần "Nhập/xuất tiền theo phiếu" đã đặt ra từ đầu cho cả 3 luồng bán hàng/nhập hàng/sửa chữa — mới làm xong 2/3) — repair-kanban hiện chưa có field tiền
- ⬜ Trừ kho linh kiện dùng trong ca sửa

## 7. Thu chi / Tài chính

- ✅ Theo dõi cần thu/cần chi, tự sinh từ phiếu Bán hàng & Nhập hàng
- ⬜ **Sổ quỹ / nhật ký thu chi hàng ngày** — khác với "cần thu/cần chi" (số còn nợ): đây là dòng tiền THỰC TẾ đã thu/chi mỗi ngày, kể cả phần đã thu đủ
- ⬜ Đối soát cuối ca/cuối ngày (mở ca, đóng ca, kiểm tiền mặt thực tế so với hệ thống)
- ⬜ Xuất báo cáo thu chi theo khoảng ngày

## 8. Báo cáo & Doanh thu

- 🟡 Dashboard có card "Doanh thu tháng này" + chart xu hướng, nhưng đang là **số mock cứng**, chưa nối với dữ liệu phiếu bán hàng thật đang tạo ra
- ⬜ Báo cáo doanh thu theo ngày/tuần/tháng, theo sản phẩm bán chạy, theo nhân viên bán hàng
- ⬜ Báo cáo lợi nhuận (doanh thu trừ giá nhập)

## 9. QR Code

- ✅ Tạo, tra cứu, tìm kiếm mã QR

## 10. Thông báo

- ✅ Trang Thông báo, kênh Zalo OA

## 11. Nhân viên & Phân quyền

- ⬜ Cài đặt mới có 1 dòng mô tả "Quản lý nhân viên — phân quyền theo vai trò", chưa có trang/modal thật — chưa thêm được nhân viên, chưa gán vai trò, chưa giới hạn quyền truy cập module

## 12. Đa chi nhánh

- 🟡 Sidebar đã có UI chuyển đổi cửa hàng (store switcher) nhưng chưa rõ có trang quản lý chi nhánh hay dữ liệu có tách riêng theo chi nhánh

## 13. Hồ sơ cửa hàng & Cài đặt chung

- 🟡 Cài đặt có dòng "Thông tin cửa hàng" nhưng chưa có form nhập thật — phiếu in (hoá đơn/phiếu bảo hành) hiện đang hardcode "Cửa hàng demo · 0900 000 000"
- ✅ Cài đặt hiển thị, serial, nhãn in, chế độ Cửa hàng/Trung tâm bảo hành

## 14. Thanh toán & Hóa đơn điện tử (Billing & E-Invoice)

- ⬜ **Luồng mua gói & thanh toán payOS** — Stepper 5 bước trong Cài đặt (Chọn gói -> Xem lại -> Thanh toán QR động payOS -> Hỗ trợ/Báo sự cố -> Hoàn tất).
- ⬜ **Modal xuất hóa đơn điện tử** — Tự động hiển thị sau khi thanh toán thành công, 4 bước (Xác nhận -> Điền thông tin -> Xem trước hóa đơn -> Kết quả tích hợp CyberBill).
- ⬜ **Lịch sử thanh toán** — Danh sách giao dịch, trạng thái (Active/Pending/Cancelled), in biên lai, xuất hóa đơn VAT.
- ⬜ **Thông tin xuất hóa đơn (Profile)** — Cấu hình thông tin pháp lý của khách hàng trong Cài đặt -> Hồ sơ để tự động pre-fill khi xuất hóa đơn.

---

## Gợi ý thứ tự (không bắt buộc)

Nếu cần một điểm bắt đầu: **Lịch sử bán hàng** và **nối Doanh thu trên Dashboard vào dữ liệu thật** là 2 việc rẻ nhất để làm ngay — vì dữ liệu phiếu bán hàng đã được ghi vào Thu chi từ trước, chỉ cần khai thác lại, không phải xây từ đầu. Sau đó **Hồ sơ cửa hàng** (để phiếu in không còn hardcode) và **Sổ quỹ hàng ngày** là 2 việc nền tảng cho mọi báo cáo tài chính sau này. **Nhân viên & phân quyền** và **Đa chi nhánh** nên để sau cùng vì ảnh hưởng kiến trúc rộng hơn (ai thấy gì, dữ liệu tách theo đâu).

---

*Lưu ý: mình không sửa được trực tiếp skill "qranty-design-guideline" trong phiên làm việc này (skill là cache chỉ-đọc) — bạn cần vào Settings > Capabilities để cập nhật thủ công. File này dùng làm checklist kế hoạch lẫn nội dung gốc để dán dần vào skill mỗi khi build xong một mục.*
