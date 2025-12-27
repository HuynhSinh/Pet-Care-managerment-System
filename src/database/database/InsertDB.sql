USE PetCareX;
GO
--1
INSERT INTO HANG_THANH_VIEN (TenHang, ChiTieuGiuHang, ChiTieuDatHang)
VALUES
(N'Bạc', 0, 5000000),
(N'Vàng', 5000000, 15000000),
(N'Kim Cương', 15000000, 999999999);


--2
INSERT INTO CHI_NHANH (TenCN, DiaChi, SDT, TGMoCua, TGDongCua)
VALUES
(N'PetCareX Quận 1', N'123 Lê Lợi, Q1', '0901111111', '08:00', '20:00'),
(N'PetCareX Quận 7', N'456 Nguyễn Văn Linh, Q7', '0902222222', '08:00', '21:00'),
(N'PetCareX Thủ Đức', N'789 Võ Văn Ngân, TP Thủ Đức', '0903333333', '07:30', '19:30');

--3
INSERT INTO DICH_VU (LoaiDV)
VALUES
(N'Khám bệnh'),
(N'Tiêm phòng'),
(N'Spa thú cưng');

--4
INSERT INTO GOI_TIEM (TenGoi, ThoiGian, UuDai)
VALUES
(N'Gói tiêm cơ bản', 6, 5),
(N'Gói tiêm nâng cao', 12, 10);

--5
INSERT INTO SAN_PHAM (TenSP, LoaiSP, GiaBan, SoLuongTonKho)
VALUES
(N'Thức ăn chó Royal Canin', N'Thức ăn', 350000, 100),
(N'Thức ăn mèo Whiskas', N'Thức ăn', 280000, 120),
(N'Sữa tắm thú cưng', N'Phụ kiện', 150000, 80),
(N'Thuốc tẩy giun', N'Thuốc', 90000, 200);

--6
INSERT INTO NHAN_VIEN (HoTen, NgaySinh, GioiTinh, LuongCoBan, ChucVu, MaCN)
VALUES
(N'Nguyễn Văn An', '1985-03-15', N'Nam', 20000000, N'BacSi', 1),
(N'Trần Thị Bình', '1990-07-20', N'Nữ', 12000000, N'TiepTan', 1),
(N'Lê Minh Châu', '1988-11-02', N'Nam', 18000000, N'BacSi', 2),
(N'Phạm Thị Dung', '1995-05-12', N'Nữ', 10000000, N'BanHang', 3),
(N'Võ Quốc Huy', '1982-01-10', N'Nam', 25000000, N'QuanLy', 1);

--7
INSERT INTO KHACH_HANG (TenKH, SDT, Email, GioiTinh, NgaySinh)
VALUES
(N'Nguyễn Thị Lan', '0911111111', 'lan@gmail.com', N'Nữ', '1995-06-01'),
(N'Trần Văn Minh', '0912222222', 'minh@gmail.com', N'Nam', '1990-09-12'),
(N'Lê Hoàng Anh', '0913333333', 'anh@gmail.com', N'Nam', '1988-02-20');

--8
INSERT INTO THU_CUNG (TenTC, Loai, Giong, NgaySinh, GioiTinh, MaKH)
VALUES
(N'Milu', N'Chó', N'Poodle', '2021-05-10', N'Đực', 1),
(N'Luna', N'Mèo', N'Anh lông ngắn', '2022-03-15', N'Cái', 1),
(N'Rocky', N'Chó', N'Husky', '2020-11-20', N'Đực', 2);


--9
INSERT INTO HOA_DON (HinhThucThanhToan, MaCN, MaKH, MaNV)
VALUES
(N'Tiền mặt', 1, 1, 2),
(N'Chuyển khoản', 2, 2, 3);

--10
INSERT INTO CT_HOA_DON_DV (MaHD)
VALUES
(1),
(2);


--11
INSERT INTO TT_KHAM_BENH (MaHDDV, TrieuChung, ChuanDoan, DonGia, MaTC, BSPhuTrach)
VALUES
(1, N'Sốt, bỏ ăn', N'Viêm đường ruột', 300000, 1, 1);

--12

INSERT INTO TT_TIEM_PHONG (MaHDDV, LoaiVacXin, LieuLuong, DonGia, MaGoi, MaTC, NguoiTiem)
VALUES
(2, N'Vacxin 5 trong 1', N'1 mũi', 450000, 1, 3, 3);

--13
INSERT INTO CT_HOA_DON_SP (MaHD, MaSP, SoLuong, DonGia)
VALUES
(1, (SELECT TOP 1 MaSP FROM SAN_PHAM), 2, 350000),
(2, (SELECT TOP 1 MaSP FROM SAN_PHAM ORDER BY MaSP DESC), 1, 90000);


--14
INSERT INTO DANH_GIA (MaKH, MaCN, DiemChatLuongDV, DiemThaiDoNV, MDHaiLongTT, BinhLuan)
VALUES
(1, 1, 5, 5, 5, N'Dịch vụ rất tốt, bác sĩ tận tình'),
(2, 2, 4, 4, 4, N'Hài lòng với chất lượng khám');

--15
INSERT INTO LICH_SU_DIEU_DONG (MaNV, MaCN_Cu, MaCN_Moi, NgayChuyen) VALUES
(1, 2, 1, '2023-01-01');

UPDATE HD
SET TongTien = ISNULL((SELECT SUM(SoLuong * DonGia) FROM CT_HOA_DON_SP WHERE MaHD = HD.MaHD), 0)
             + ISNULL((SELECT SUM(KB.DonGia) FROM TT_KHAM_BENH KB JOIN CT_HOA_DON_DV DV ON KB.MaHDDV = DV.MaHDDV WHERE DV.MaHD = HD.MaHD), 0)
             + ISNULL((SELECT SUM(TP.DonGia) FROM TT_TIEM_PHONG TP JOIN CT_HOA_DON_DV DV ON TP.MaHDDV = DV.MaHDDV WHERE DV.MaHD = HD.MaHD), 0)
FROM HOA_DON HD;
GO

-- Kiểm tra kết quả
SELECT * FROM HOA_DON;