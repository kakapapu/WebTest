-- DATABASE DEMO CHO DỰ ÁN CHUYỂN ĐỔI HẠ TẦNG LÊN CLOUD
-- Doanh nghiệp kinh doanh thiết bị điện tử (150 nhân viên)

CREATE DATABASE IF NOT EXISTS `ql_thietbidientu`;
USE `ql_thietbidientu`;

-- Bảng lưu danh mục sản phẩm
CREATE TABLE IF NOT EXISTS `san_pham` (
  `ma_sp` VARCHAR(10) PRIMARY KEY,
  `ten_sp` VARCHAR(100) NOT NULL,
  `gia_ban` DECIMAL(12,2) NOT NULL,
  `so_luong_ton` INT DEFAULT 0
);

-- Chèn dữ liệu đầy đủ 8 sản phẩm
INSERT INTO `san_pham` (`ma_sp`, `ten_sp`, `gia_ban`, `so_luong_ton`) VALUES
('SP01', 'Laptop Dell XPS 13', 28500000.00, 45),
('SP02', 'Bàn phím cơ không dây', 1200000.00, 120),
('SP03', 'Chuột Logitech MX', 850000.00, 85),
('SP04', 'Màn hình LG UltraWide', 6500000.00, 30),
('SP05', 'Tai nghe Sony Chống Ồn', 4200000.00, 50),
('SP06', 'Ổ cứng SSD Samsung 1TB', 2300000.00, 100),
('SP07', 'Sạc dự phòng Anker 20k', 950000.00, 150),
('SP08', 'Webcam Logitech 4K Pro', 3100000.00, 40);