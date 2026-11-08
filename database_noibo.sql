CREATE DATABASE ql_tainguyen_noibo;

CREATE TABLE IF NOT EXISTS bo_phan (
  id SERIAL PRIMARY KEY,
  ten_bo_phan VARCHAR(100) NOT NULL,
  mo_ta TEXT
);

CREATE TABLE IF NOT EXISTS nguoi_dung (
  id SERIAL PRIMARY KEY,
  ho_ten VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  mat_khau VARCHAR(255) NOT NULL,
  bo_phan_id INTEGER,
  vai_tro VARCHAR(20) NOT NULL DEFAULT 'nhan_vien' CHECK (vai_tro IN ('admin', 'nhan_vien', 'quan_ly')),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'hoat_dong' CHECK (trang_thai IN ('hoat_dong', 'tam_ngung')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_nguoi_dung_bo_phan FOREIGN KEY (bo_phan_id) REFERENCES bo_phan (id)
);

CREATE INDEX IF NOT EXISTS idx_nguoi_dung_bo_phan ON nguoi_dung (bo_phan_id);

CREATE TABLE IF NOT EXISTS tai_lieu (
  id SERIAL PRIMARY KEY,
  ma_tai_lieu VARCHAR(30) UNIQUE NOT NULL,
  ten_tai_lieu VARCHAR(200) NOT NULL,
  mo_ta TEXT,
  bo_phan_id INTEGER NOT NULL,
  danh_muc VARCHAR(100) NOT NULL,
  file_url VARCHAR(255) DEFAULT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  created_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_tai_lieu_bo_phan FOREIGN KEY (bo_phan_id) REFERENCES bo_phan (id),
  CONSTRAINT fk_tai_lieu_nguoi_dung FOREIGN KEY (created_by) REFERENCES nguoi_dung (id)
);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_danh_muc_bo_phan ON tai_lieu (danh_muc, bo_phan_id);

CREATE TABLE IF NOT EXISTS phan_quyen (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  bo_phan_id INTEGER NOT NULL,
  quyen VARCHAR(10) NOT NULL CHECK (quyen IN ('xem', 'tai', 'sua', 'xoa')),
  UNIQUE (user_id, bo_phan_id, quyen),
  CONSTRAINT fk_quyen_user FOREIGN KEY (user_id) REFERENCES nguoi_dung (id),
  CONSTRAINT fk_quyen_bo_phan FOREIGN KEY (bo_phan_id) REFERENCES bo_phan (id)
);

CREATE TABLE IF NOT EXISTS luot_truy_cap (
  id SERIAL PRIMARY KEY,
  tai_lieu_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  hanh_dong VARCHAR(20) NOT NULL CHECK (hanh_dong IN ('xem', 'tai', 'tim_kiem')),
  thoi_gian TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_log_tai_lieu FOREIGN KEY (tai_lieu_id) REFERENCES tai_lieu (id),
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES nguoi_dung (id)
);

INSERT INTO bo_phan (ten_bo_phan, mo_ta) VALUES
('Kinh doanh', 'Phòng kinh doanh, chăm sóc khách hàng và hợp đồng'),
('Kỹ thuật', 'Phòng kỹ thuật và triển khai hệ thống'),
('Nhân sự', 'Quản lý nhân sự, quy chế và đào tạo'),
('Tài chính', 'Quản lý kế toán, thuế và thanh toán'),
('Hành chính', 'Văn phòng, công văn và quản lý điều hành'),
('Marketing', 'Quảng bá thương hiệu và nội dung truyền thông');

INSERT INTO nguoi_dung (ho_ten, email, username, mat_khau, bo_phan_id, vai_tro) VALUES
('Nguyễn Thị Lan', 'lan@congty.vn', 'lannt', '123456', 1, 'quan_ly'),
('Trần Văn Hùng', 'hung@congty.vn', 'hungtv', '123456', 2, 'nhan_vien'),
('Phạm Thị Mai', 'mai@congty.vn', 'maipt', '123456', 3, 'quan_ly'),
('Lê Quốc Anh', 'anh@congty.vn', 'anhle', '123456', 4, 'nhan_vien'),
('Hoàng Thị Hòa', 'hoa@congty.vn', 'hoaht', '123456', 5, 'admin');

INSERT INTO tai_lieu (ma_tai_lieu, ten_tai_lieu, mo_ta, bo_phan_id, danh_muc, file_url, version, created_by, updated_at) VALUES
('KD-001', 'Bảng báo giá thiết bị điện tử 2026', 'Danh sách giá bán thiết bị điện tử và phụ kiện cho khách hàng.', 1, 'Báo giá', '/files/bang-bao-gia-2026.pdf', '1.0', 1, NOW()),
('KD-002', 'Quy trình chăm sóc khách hàng', 'Hướng dẫn xử lý khiếu nại, phản hồi và chăm sóc sau bán hàng.', 1, 'Quy trình', '/files/quy-trinh-cham-soc-khach-hang.pdf', '2.0', 1, NOW()),
('KT-001', 'Hướng dẫn triển khai hệ thống mới', 'Tài liệu kỹ thuật triển khai, cấu hình và kiểm thử hệ thống.', 2, 'Hướng dẫn', '/files/huong-dan-trien-khai-he-thong.pdf', '1.5', 2, NOW()),
('KT-002', 'Checklist bảo trì thiết bị văn phòng', 'Danh mục kiểm tra định kỳ thiết bị, máy tính, máy in, router.', 2, 'Checklist', '/files/checklist-bao-tri.pdf', '3.0', 2, NOW()),
('NS-001', 'Quy chế làm việc nội bộ 2026', 'Quy định thời gian làm việc, nghỉ phép, kỷ luật và nội quy.', 3, 'Quy định', '/files/quy-che-lam-viec-2026.pdf', '1.0', 3, NOW()),
('TC-001', 'Hướng dẫn thanh toán và hóa đơn', 'Quy trình xuất hóa đơn, thanh toán và theo dõi công nợ.', 4, 'Tài chính', '/files/huong-dan-thanh-toan-hoa-don.pdf', '2.1', 4, NOW()),
('HC-001', 'Mẫu văn bản hành chính nội bộ', 'Các mẫu đề xuất, công văn, biên bản và biểu mẫu điều hành.', 5, 'Văn bản', '/files/mau-van-ban-hanh-chinh.pdf', '1.2', 5, NOW()),
('MK-001', 'Kế hoạch chiến dịch truyền thông quý 4', 'Lịch triển khai nội dung, kênh quảng cáo và đối tượng mục tiêu.', 6, 'Marketing', '/files/ke-hoach-chien-dich-q4.pdf', '1.0', 1, NOW());

INSERT INTO phan_quyen (user_id, bo_phan_id, quyen) VALUES
(1, 1, 'xem'), (1, 1, 'tai'), (1, 1, 'sua'), (1, 1, 'xoa'),
(2, 2, 'xem'), (2, 2, 'tai'),
(3, 3, 'xem'), (3, 3, 'tai'), (3, 3, 'sua'),
(4, 4, 'xem'), (4, 4, 'tai'),
(5, 5, 'xem'), (5, 5, 'tai'), (5, 5, 'sua'), (5, 5, 'xoa');

INSERT INTO luot_truy_cap (tai_lieu_id, user_id, hanh_dong) VALUES
(1, 1, 'xem'), (2, 2, 'tim_kiem'), (3, 2, 'tai'),
(4, 1, 'xem'), (5, 3, 'xem'), (6, 4, 'tai'),
(7, 5, 'xem'), (8, 1, 'tim_kiem');

SELECT * FROM bo_phan;
SELECT * FROM tai_lieu;
