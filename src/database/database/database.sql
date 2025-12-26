-- Tạo Database
CREATE DATABASE PetCareX;
GO
USE PetCareX;
GO

-- 1. Bảng Hạng Thành Viên
CREATE TABLE HANG_THANH_VIEN (
    MaHang INT IDENTITY(1,1) PRIMARY KEY,
    TenHang NVARCHAR(50) NOT NULL,
    ChiTieuGiuHang DECIMAL(18,0) DEFAULT 0,
    ChiTieuDatHang DECIMAL(18,0) DEFAULT 0
);

-- 2. Bảng Chi Nhánh
CREATE TABLE CHI_NHANH (
    MaCN INT IDENTITY(1,1) PRIMARY KEY,
    TenCN NVARCHAR(100) NOT NULL,
    DiaChi NVARCHAR(255),
    SDT VARCHAR(15),
    TGMoCua TIME,
    TGDongCua TIME
);

-- 3. Bảng Dịch Vụ (Danh mục loại dịch vụ)
CREATE TABLE DICH_VU (
    MaDV INT IDENTITY(1,1) PRIMARY KEY,
    LoaiDV NVARCHAR(100) NOT NULL -- Ví dụ: Khám bệnh, Tiêm phòng, Spa...
);

-- 4. Bảng Gói Tiêm
CREATE TABLE GOI_TIEM (
    MaGoi INT IDENTITY(1,1) PRIMARY KEY,
    TenGoi NVARCHAR(100) NOT NULL,
    ThoiGian INT, -- Số tháng hiệu lực
    UuDai INT -- Phần trăm ưu đãi (VD: 10 nghĩa là 10%)
);

-- 5. Bảng Sản Phẩm
CREATE TABLE SAN_PHAM (
    MaSP INT IDENTITY(1,1) PRIMARY KEY,
    TenSP NVARCHAR(100) NOT NULL,
    LoaiSP NVARCHAR(50), -- Thức ăn, Phụ kiện, Thuốc...
    GiaBan DECIMAL(18,0) NOT NULL,
    SoLuongTonKho INT DEFAULT 0
);

-- 6. Bảng Nhân Viên
-- (Gộp các vai trò Bác sĩ, Tiếp tân, Quản lý vào đây để tối ưu)
CREATE TABLE NHAN_VIEN (
    MaNV INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    NgayVaoLam DATE DEFAULT GETDATE(),
    LuongCoBan DECIMAL(18,0),
    ChucVu NVARCHAR(50), -- 'BacSi', 'TiepTan', 'BanHang', 'QuanLy'
    MaCN INT,
    FOREIGN KEY (MaCN) REFERENCES CHI_NHANH(MaCN)
);

-- 7. Bảng Lịch Sử Điều Động (Nhân viên chuyển chi nhánh)
CREATE TABLE LICH_SU_DIEU_DONG (
    MaDD INT IDENTITY(1,1) PRIMARY KEY,
    NgayChuyen DATE DEFAULT GETDATE(),
    MaNV INT,
    MaCN_Cu INT, -- Chi nhánh cũ
    MaCN_Moi INT, -- Chi nhánh mới (lấy từ bảng NHAN_VIEN hiện tại hoặc tham chiếu)
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
    FOREIGN KEY (MaCN_Cu) REFERENCES CHI_NHANH(MaCN),
    FOREIGN KEY (MaCN_Moi) REFERENCES CHI_NHANH(MaCN)
);

-- 8. Bảng Khách Hàng
CREATE TABLE KHACH_HANG (
    MaKH INT IDENTITY(1,1) PRIMARY KEY,
    TenKH NVARCHAR(100) NOT NULL,
    SDT VARCHAR(15) UNIQUE,
    Email VARCHAR(100),
    CCCD VARCHAR(20),
    GioiTinh NVARCHAR(10),
    NgaySinh DATE,
    DiemLoyalty INT DEFAULT 0,
    MaHang INT DEFAULT 1, -- Mặc định hạng thấp nhất
    FOREIGN KEY (MaHang) REFERENCES HANG_THANH_VIEN(MaHang)
);

-- 9. Bảng Thú Cưng
CREATE TABLE THU_CUNG (
    MaTC INT IDENTITY(1,1) PRIMARY KEY,
    TenTC NVARCHAR(50),
    Loai NVARCHAR(50), -- Chó, Mèo...
    Giong NVARCHAR(50),
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    TinhTrangSucKhoe NVARCHAR(MAX),
    MaKH INT,
    FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH)
);

-- 10. Bảng Hóa Đơn
CREATE TABLE HOA_DON (
    MaHD INT IDENTITY(1,1) PRIMARY KEY,
    NgayLap DATETIME DEFAULT GETDATE(),
    TongTien DECIMAL(18,0) DEFAULT 0,
    HinhThucThanhToan NVARCHAR(50),
    MaCN INT,
    MaKH INT,
    MaNV INT, -- Nhân viên lập hóa đơn
    FOREIGN KEY (MaCN) REFERENCES CHI_NHANH(MaCN),
    FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH),
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV)
);

-- 11. Bảng Chi Tiết Hóa Đơn - Sản Phẩm (Mua hàng)
CREATE TABLE CT_HOA_DON_SP (
    MaHDSP INT IDENTITY(1,1) PRIMARY KEY,
    MaHD INT,
    MaSP INT,
    SoLuong INT CHECK (SoLuong > 0),
    DonGia DECIMAL(18,0), -- Lưu giá tại thời điểm bán
    FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD),
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP)
);

-- 12. Bảng Chi Tiết Hóa Đơn - Dịch Vụ (Lớp trung gian cho Khám/Tiêm)
-- Bảng này đại diện cho 1 dòng "Dịch vụ" trong hóa đơn
CREATE TABLE CT_HOA_DON_DV (
    MaHDDV INT IDENTITY(1,1) PRIMARY KEY,
    MaHD INT,
    FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD)
);

-- 13. Bảng Thông Tin Khám Bệnh
-- Kế thừa từ CT_HOA_DON_DV, lưu chi tiết chuyên môn
CREATE TABLE TT_KHAM_BENH (
    MaLanKham INT IDENTITY(1,1) PRIMARY KEY,
    MaHDDV INT UNIQUE, -- 1 dòng trong hóa đơn tương ứng 1 lần khám
    NgayKham DATETIME DEFAULT GETDATE(),
    TrieuChung NVARCHAR(MAX),
    ChuanDoan NVARCHAR(MAX),
    ToaThuoc NVARCHAR(MAX),
    NgayHenTaiKham DATE,
    DonGia DECIMAL(18,0),
    MaTC INT,
    BSPhuTrach INT, -- Bác sĩ
    FOREIGN KEY (MaHDDV) REFERENCES CT_HOA_DON_DV(MaHDDV),
    FOREIGN KEY (MaTC) REFERENCES THU_CUNG(MaTC),
    FOREIGN KEY (BSPhuTrach) REFERENCES NHAN_VIEN(MaNV)
);

-- 14. Bảng Thông Tin Tiêm Phòng
-- Kế thừa từ CT_HOA_DON_DV
CREATE TABLE TT_TIEM_PHONG (
    MaLanTiem INT IDENTITY(1,1) PRIMARY KEY,
    MaHDDV INT UNIQUE, -- 1 dòng hóa đơn tương ứng 1 lần tiêm
    NgayTiem DATETIME DEFAULT GETDATE(),
    LoaiVacXin NVARCHAR(100),
    LieuLuong NVARCHAR(50),
    DonGia DECIMAL(18,0),
    MaGoi INT NULL, -- Nếu dùng gói
    MaTC INT,
    NguoiTiem INT, -- Bác sĩ/Y tá
    FOREIGN KEY (MaHDDV) REFERENCES CT_HOA_DON_DV(MaHDDV),
    FOREIGN KEY (MaGoi) REFERENCES GOI_TIEM(MaGoi),
    FOREIGN KEY (MaTC) REFERENCES THU_CUNG(MaTC),
    FOREIGN KEY (NguoiTiem) REFERENCES NHAN_VIEN(MaNV)
);

-- 15. Bảng Đánh Giá
CREATE TABLE DANH_GIA (
    MaDG INT IDENTITY(1,1) PRIMARY KEY,
    MaKH INT, -- Khách hàng thực hiện đánh giá
    MaCN INT, -- Chi nhánh được đánh giá
    NgayDanhGia DATETIME DEFAULT GETDATE(), -- Nên có thêm ngày để thống kê chất lượng theo thời gian
    DiemChatLuongDV INT CHECK (DiemChatLuongDV BETWEEN 1 AND 5),
    DiemThaiDoNV INT CHECK (DiemThaiDoNV BETWEEN 1 AND 5),
    MDHaiLongTT INT CHECK (MDHaiLongTT BETWEEN 1 AND 5), -- Mức độ hài lòng tổng thể
    BinhLuan NVARCHAR(MAX),
    
    -- Tạo khóa ngoại liên kết đến Khách Hàng và Chi Nhánh
    FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH),
    FOREIGN KEY (MaCN) REFERENCES CHI_NHANH(MaCN)
);
GO
