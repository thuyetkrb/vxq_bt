# 🥋 WINGCHUN BÌNH TÂN — HỆ THỐNG QUẢN LÝ HỌC PHÍ

> **Đường link chạy ứng dụng trực tiếp:**  
> 👉 [**https://thuyetkrb.github.io/vxq_bt/**](https://thuyetkrb.github.io/vxq_bt/)

---

## 📌 GIỚI THIỆU
Ứng dụng quản lý học phí và sỹ số học viên chuyên nghiệp hỗ trợ theo dõi tình trạng đóng học phí, miễn giảm đặc biệt, lưu trữ lịch sử chuyển khoản, in biên lai, và tự động hóa các chỉ số hoạt động.

---

## 🛠️ HƯỚNG DẪN TRIỂN KHAI TRÊN GITHUB PAGES

Ứng dụng tích hợp sẵn luồng tự động hóa bằng GitHub Actions. Khi đẩy mã nguồn lên kho lưu trữ, hệ thống tự biên dịch và triển khai trực tuyến.

### Các bước thực hiện:
1. Truy cập vào kho lưu trữ của bạn trên GitHub.
2. Nhấn vào mục **Settings** -> **Pages**.
3. Tại phần **Build and deployment**, chọn nguồn triển khai là **GitHub Actions**.
4. Thực hiện đẩy mã nguồn lên nhánh chính (`main` hoặc `master`). Quy trình biên dịch sẽ hoàn tất tự động sau 1-2 phút.

---

## 🚀 CÁC TÍNH NĂNG CHÍNH
1. **Báo cáo Hoạt động chung**: Trực quan hóa sỹ số hoạt động, học phí đã đóng, còn thiếu và chuyển khoản trong tháng.
2. **Quản lý Học phí**: Bảng ma trận học phí tự động kéo dài chu kỳ, hạch toán biên lai phí và cập nhật trạng thái miễn giảm.
3. **Danh sách Học viên**: Đăng ký, lọc trạng thái hoạt động/nghỉ học và phân nhóm lớp học trực quan.
4. **Hạch toán Chuyển khoản**: Phân tích chi tiết dòng tiền chuyển khoản ngân hàng theo từng chu kỳ tháng tiện lợi.
5. **Tiện ích Phụ**: Đồng hồ chuyên dụng, nhật ký ghi chú thông báo chung và nhật ký kiểm toán hệ thống.

---

## 💻 CHẠY TRÊN MÁY CÁ NHÂN (LOCAL)

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Khởi chạy Development Server:**
   ```bash
   npm run dev
   ```

3. **Tạo bản build sản phẩm tĩnh:**
   ```bash
   npm run build
   ```
