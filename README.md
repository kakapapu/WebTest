# Hệ thống chia sẻ tài liệu nội bộ - Node.js + TypeScript

## Mục tiêu
Website đơn giản để nhân viên trong công ty tra cứu, upload và chia sẻ tài liệu nội bộ theo bộ phận, danh mục và từ khóa.

## Cấu trúc project
- `index.html`: giao diện người dùng
- `styles.css`: giao diện và bố cục
- `script.js`: logic gọi API và hiển thị dữ liệu
- `src/server.ts`: backend Express + TypeScript
- `database_noibo.sql`: schema và dữ liệu mẫu PostgreSQL
- `uploads/`: thư mục lưu tệp tài liệu được upload
- `.env.example`: biến môi trường mẫu

## Cài đặt và khởi chạy
1. Cài Node.js 18+.
2. Cài đặt dependency:
   ```bash
   npm install
   ```
3. Sao chép `.env.example` thành `.env` và chỉnh thông tin database nếu cần.
4. Tạo database PostgreSQL `ql_tainguyen_noibo` và import file `database_noibo.sql`.
5. Chạy ở chế độ dev:
   ```bash
   npm run dev
   ```
6. Mở trình duyệt tại:
   ```text
   http://localhost:3000/
   ```

## Demo truy vấn
- Tìm theo từ khóa: `báo giá`, `quy chế`, `hướng dẫn`
- Lọc theo bộ phận: `Kinh doanh`, `Kỹ thuật`, `Nhân sự`
- Lọc theo danh mục: `Báo giá`, `Quy trình`, `Quy định`

## Ghi chú
Đây là phiên bản đơn giản, phù hợp cho nội bộ công ty và có thể mở rộng thêm đăng nhập, phân quyền, quản lý phiên bản và dashboard admin.
