# 🥋 WINGCHUN BÌNH TÂN — HỆ THỐNG QUẢN LÝ HỌC PHÍ VÕ QUÁN

> **Đường link chạy ứng dụng trực tiếp trên GitHub Pages:**  
> 👉 [**https://thuyetkrb.github.io/vxq_bt/**](https://thuyetkrb.github.io/vxq_bt/) *(Nhấn vào đây để chạy trang web trực tiếp)*

---

## 📌 GIỚI THIỆU
Đây là phần mềm quản lý học phí và sỹ số học viên chuyên nghiệp dành riêng cho **Lớp Vịnh Xuân Bình Tân — Võ Quán Nam Anh Quang**. Ứng dụng giúp huấn luyện viên và ban quản lý dễ dàng theo dõi tình trạng đóng học phí, miễn giảm đặc biệt, lưu trữ lịch sử biên lai, quản lý danh sách học viên, và xuất báo cáo hàng tháng trực quan.

---

## 🛠️ HƯỚNG DẪN KÍCH HOẠT CHẠY WEB TRÊN GITHUB PAGES

Ứng dụng đã được tích hợp sẵn hệ thống **Tự Động Biên Dịch và Đăng Tải (GitHub Actions CI/CD)**. Khi bạn đưa mã nguồn này lên kho lưu trữ `https://github.com/thuyetkrb/vxq_bt`, trang web sẽ tự động chạy theo hướng dẫn sau:

### Bước 1: Kích hoạt tính năng GitHub Actions trên kho lưu trữ của bạn
1. Truy cập vào repo của bạn tại: https://github.com/thuyetkrb/vxq_bt
2. Nhấn vào mục **Settings** (Cài đặt) ở thanh công cụ phía trên.
3. Nhìn sang menu bên trái, tìm và nhấn vào **Pages** (thuộc mục *Code and automation*).
4. Ở phần **Build and deployment**:
   - Tại mục **Source**, nhấn chọn menu thả xuống (mặc định là *Deploy from a branch*).
   - Chọn **GitHub Actions** làm nguồn triển khai.

### Bước 2: Đẩy mã nguồn lên GitHub (Push code)
Sau khi bạn commit và push toàn bộ code mới này lên branch `main` hoặc `master`, luồng công việc tự động sẽ được kích hoạt:
1. GitHub sẽ tự chạy quy trình cài đặt, biên dịch mã nguồn React/Vite (với đường dẫn chính xác `/vxq_bt/`).
2. Sau khoảng 1-2 phút, trạng thái Deploy sẽ chuyển thành màu xanh.
3. Truy cập đường link: [https://thuyetkrb.github.io/vxq_bt/](https://thuyetkrb.github.io/vxq_bt/) để xem trang web hoạt động hoàn hảo!

---

## 🚀 CÁC TÍNH NĂNG CHÍNH CỦA HỆ THỐNG
1. **Tổng Quan Báo Cáo Hoạt Động**: Các chỉ số trực quan về sỹ số, số lượng võ sinh đã đóng tiền, chưa nộp hoặc được miễn giảm học phí trong tháng hiện tại.
2. **Bảng Theo Dõi Học Phí Chi Tiết**: Giao diện ma trận học phí trực quan đa tháng, hỗ trợ lọc thông tin theo từng lớp võ vô cùng thuận tiện.
3. **Cơ Chế Miễn Giảm Học Phí (Mới)**: Hỗ trợ hạch toán ghi nhận các trường hợp miễn học phí đặc biệt kèm lý do cụ thể, tự động cập nhật về 0đ.
4. **Hệ Thống Xuất Biên Lai Chuyên Nghiệp**: Hỗ trợ in trực tiếp từ máy in hoặc xuất/tải xuống file văn bản biên lai/phiếu miễn phí nhanh chóng.
5. **Bộ Sưu Tập Tiện Ích**: Có tích hợp đồng hồ cơ khí Vịnh Xuân, bảng dán tin tức thông báo của võ quán, cấu hình hệ thống, và nhật ký kiểm toán (Audit Logs) bảo mật.

---

## 💻 TRẢI NGHIỆM CHẠY TRÊN MÁY LOCAL (MÁY CÁ NHÂN)
Nếu bạn muốn chạy thử mã nguồn này trên máy tính cá nhân của mình, hãy làm theo các bước:

1. **Cài đặt các gói thư viện phụ trợ:**
   ```bash
   npm install
   ```

2. **Khởi chạy máy chủ phát triển cục bộ (Development server):**
   ```bash
   npm run dev
   ```
   *Sau đó mở trình duyệt truy cập đường dẫn: `http://localhost:3000`*

3. **Tạo bản biên dịch tĩnh phục vụ trực tiếp:**
   ```bash
   npm run build
   ```

---

*Chúc võ quán Vịnh Xuân Bình Tân ngày càng phát triển và thăng tiến trên con đường võ học!*
🥋 **Võ Quán Nam Anh Quang** • *Học thuật tinh nhuệ - Đạo đức vẹn toàn.*
