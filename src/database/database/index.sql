USE PetCareX;
GO

SET STATISTICS TIME ON; 
SET STATISTICS IO ON;
GO

PRINT '=== DEMO CHẠY CHẬM (ÉP QUÉT TOÀN BẢNG) ===';
GO
-- Xóa cache để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT tc.TenTC, tc.Giong, kb.NgayKham, kb.TrieuChung, kb.ChuanDoan
FROM KHACH_HANG kh WITH (INDEX(0)) -- Ép bảng khách hàng quét toàn bộ
JOIN THU_CUNG tc WITH (INDEX(0)) ON kh.MaKH = tc.MaKH -- Thêm điều kiện ON ở đây
JOIN TT_KHAM_BENH kb WITH (INDEX(0)) ON tc.MaTC = kb.MaTC -- Thêm điều kiện ON ở đây
WHERE kh.SDT = '0900000045'
ORDER BY kb.NgayKham DESC;
GO

PRINT '=== DEMO CHẠY NHANH (DÙNG INDEX TỰ ĐỘNG) ===';
GO
-- Xóa cache để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT tc.TenTC, tc.Giong, kb.NgayKham, kb.TrieuChung, kb.ChuanDoan
FROM KHACH_HANG kh 
JOIN THU_CUNG tc ON kh.MaKH = tc.MaKH
JOIN TT_KHAM_BENH kb ON tc.MaTC = kb.MaTC
WHERE kh.SDT = '0900000045'
ORDER BY kb.NgayKham DESC;
GO


--=============
--KỊCH BẢN 2
--=============
-- 1. ĐẢM BẢO ĐÃ CÓ INDEX TỐI ƯU (Chạy cái này trước)
-- Index này giúp tìm nhanh sản phẩm theo loại và lọc tồn kho thấp
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SAN_PHAM_Inventory_Check')
BEGIN
    CREATE INDEX IX_SAN_PHAM_Inventory_Check 
    ON SAN_PHAM(LoaiSP, SoLuongTonKho) 
    INCLUDE (TenSP, GiaBan);
END
GO

-- THÍ NGHIỆM 2.1: CHẠY CHẬM (ÉP QUÉT TOÀN BẢNG 200.000 DÒNG)
PRINT '=== KỊCH BẢN 2: CHẠY CHẬM (KHÔNG INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT TenSP, LoaiSP, GiaBan, SoLuongTonKho
FROM SAN_PHAM WITH (INDEX(0)) -- Ép quét toàn bảng
WHERE LoaiSP = N'Thuốc' 
  AND SoLuongTonKho < 50
ORDER BY SoLuongTonKho ASC;
GO

-- THÍ NGHIỆM 2.2: CHẠY NHANH (DÙNG INDEX TỐI ƯU

PRINT '=== KỊCH BẢN 2: CHẠY NHANH (CÓ INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT TenSP, LoaiSP, GiaBan, SoLuongTonKho
FROM SAN_PHAM
WHERE LoaiSP = N'Thuốc' 
  AND SoLuongTonKho < 50
ORDER BY SoLuongTonKho ASC;
GO

--============
--KỊCH BẢN 3
--============
-- 1. ĐẢM BẢO ĐÃ CÓ INDEX TỐI ƯU (Chạy cái này trước)
-- Covering Index: Chứa cả ngày lập, mã chi nhánh và tiền để SQL không cần vào bảng chính
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOA_DON_Revenue_Report')
BEGIN
    CREATE INDEX IX_HOA_DON_Revenue_Report 
    ON HOA_DON(NgayLap, MaCN) 
    INCLUDE (TongTien);
END
GO
-- THÍ NGHIỆM 3.1: CHẠY CHẬM (ÉP QUÉT TOÀN BẢNG 100.000 HÓA ĐƠN)
PRINT '=== KỊCH BẢN 3: CHẠY CHẬM (KHÔNG INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT MaCN, SUM(TongTien) as DoanhThu
FROM HOA_DON WITH (INDEX(0)) -- Ép quét toàn bảng
WHERE NgayLap BETWEEN '2025-01-01' AND '2025-06-30'
GROUP BY MaCN;
GO


-- THÍ NGHIỆM 3.2: CHẠY NHANH (DÙNG INDEX TỐI ƯU)
PRINT '=== KỊCH BẢN 3: CHẠY NHANH (CÓ INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT MaCN, SUM(TongTien) as DoanhThu
FROM HOA_DON
WHERE NgayLap BETWEEN '2025-01-01' AND '2025-06-30'
GROUP BY MaCN;
GO

--=======
--KỊCH BẢN 4
--========
-- 1. ĐẢM BẢO ĐÃ CÓ INDEX TỐI ƯU (Chạy cái này trước)
-- Index trên MaNV trong bảng HOA_DON giúp việc gom nhóm (GROUP BY) và JOIN cực nhanh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOA_DON_Staff_Performance')
BEGIN
    CREATE INDEX IX_HOA_DON_Staff_Performance 
    ON HOA_DON(MaNV) 
    INCLUDE (MaHD);
END
GO

-- THÍ NGHIỆM 4.1: CHẠY CHẬM (ÉP QUÉT TOÀN BẢNG)
PRINT '=== KỊCH BẢN 4: CHẠY CHẬM (KHÔNG INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT nv.MaNV, nv.HoTen, nv.ChucVu, COUNT(hd.MaHD) AS SoLuongGiaoDich
FROM NHAN_VIEN nv
LEFT JOIN HOA_DON hd WITH (INDEX(0)) ON nv.MaNV = hd.MaNV -- Ép quét toàn bảng HOA_DON
GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
ORDER BY SoLuongGiaoDich DESC;
GO

-- THÍ NGHIỆM 4.2: CHẠY NHANH (DÙNG INDEX TỐI ƯU)
PRINT '=== KỊCH BẢN 4: CHẠY NHANH (CÓ INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT nv.MaNV, nv.HoTen, nv.ChucVu, COUNT(hd.MaHD) AS SoLuongGiaoDich
FROM NHAN_VIEN nv
LEFT JOIN HOA_DON hd ON nv.MaNV = hd.MaNV
GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
ORDER BY SoLuongGiaoDich DESC;
GO

--=================
--KỊCH BẢN 5
--=================
-- 1. ĐẢM BẢO ĐÃ CÓ INDEX TỐI ƯU (Chạy cái này trước)
-- Index trên NgayLap giúp lọc nhanh 6 tháng gần nhất
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOA_DON_Date_Filter')
BEGIN
    CREATE INDEX IX_HOA_DON_Date_Filter ON HOA_DON(NgayLap) INCLUDE (MaHD);
END

-- Index trên CT_HOA_DON_DV giúp JOIN và tính SUM cực nhanh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CT_DV_Performance')
BEGIN
    CREATE INDEX IX_CT_DV_Performance ON CT_HOA_DON_DV(MaHD, MaDV) INCLUDE (DonGia);
END
GO
-- THÍ NGHIỆM 5.1: CHẠY CHẬM (KHÔNG INDEX)
PRINT '=== KỊCH BẢN 5: CHẠY CHẬM (KHÔNG INDEX) ===';
GO
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT dv.LoaiDV, SUM(ct.DonGia) as DoanhThu
FROM DICH_VU dv
JOIN CT_HOA_DON_DV ct WITH (INDEX(0)) ON dv.MaDV = ct.MaDV
JOIN HOA_DON h WITH (INDEX(0)) ON ct.MaHD = h.MaHD
WHERE h.NgayLap >= DATEADD(MONTH, -6, GETDATE())
GROUP BY dv.LoaiDV;
GO
--THÍ NGHIỆM 5.2: CHẠY NHANH (CÓ INDEX)
PRINT '=== KỊCH BẢN 5: CHẠY NHANH (CÓ INDEX) ===';
GO
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT dv.LoaiDV, SUM(ct.DonGia) as DoanhThu
FROM DICH_VU dv
JOIN CT_HOA_DON_DV ct ON dv.MaDV = ct.MaDV
JOIN HOA_DON h ON ct.MaHD = h.MaHD
WHERE h.NgayLap >= DATEADD(MONTH, -6, GETDATE())
GROUP BY dv.LoaiDV;
GO

--==============
--KỊCH BẢN 6
--==============
-- 1. ĐẢM BẢO ĐÃ CÓ INDEX TỐI ƯU (Chạy cái này trước)
-- Index đa cột giúp SQL tìm ngày gần nhất (MAX) của mỗi khách hàng cực nhanh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOA_DON_Customer_Loyalty')
BEGIN
    CREATE INDEX IX_HOA_DON_Customer_Loyalty 
    ON HOA_DON(MaKH, NgayLap DESC);
END
GO

-- THÍ NGHIỆM 6.1: CHẠY CHẬM (KHÔNG INDEX - QUÉT 100K HÓA ĐƠN)
PRINT '=== KỊCH BẢN 6: CHẠY CHẬM (KHÔNG INDEX) ===';
GO
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT kh.MaKH, kh.TenKH, kh.SDT, MAX(hd.NgayLap) as NgayGiaoDichCuoi
FROM KHACH_HANG kh
LEFT JOIN HOA_DON hd WITH (INDEX(0)) ON kh.MaKH = hd.MaKH
GROUP BY kh.MaKH, kh.TenKH, kh.SDT
HAVING MAX(hd.NgayLap) < DATEADD(MONTH, -6, GETDATE()) 
   OR MAX(hd.NgayLap) IS NULL
ORDER BY NgayGiaoDichCuoi ASC;
GO

-- THÍ NGHIỆM 6.2: CHẠY NHANH (CÓ INDEX TỐI ƯU)
PRINT '=== KỊCH BẢN 6: CHẠY NHANH (CÓ INDEX) ===';
GO
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT kh.MaKH, kh.TenKH, kh.SDT, MAX(hd.NgayLap) as NgayGiaoDichCuoi
FROM KHACH_HANG kh
LEFT JOIN HOA_DON hd ON kh.MaKH = hd.MaKH
GROUP BY kh.MaKH, kh.TenKH, kh.SDT
HAVING MAX(hd.NgayLap) < DATEADD(MONTH, -6, GETDATE()) 
   OR MAX(hd.NgayLap) IS NULL
ORDER BY NgayGiaoDichCuoi ASC;
GO

--===========
--KỊCH BẢN 8
--===========
-- 1. ĐẢM BẢO ĐÃ CÓ INDEX TỐI ƯU (Chạy cái này trước)
-- Covering Index trên bảng Tiêm phòng giúp lọc loại vắc-xin và mã thú cưng cực nhanh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TIEM_PHONG_Stats')
BEGIN
    CREATE INDEX IX_TIEM_PHONG_Stats 
    ON TT_TIEM_PHONG(LoaiVacXin, MaTC);
END

-- Index trên bảng Thú cưng để lấy thông tin Loài nhanh hơn
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_THU_CUNG_Loai')
BEGIN
    CREATE INDEX IX_THU_CUNG_Loai 
    ON THU_CUNG(MaTC) INCLUDE (Loai);
END
GO

-- THÍ NGHIỆM 8.1: CHẠY CHẬM (KHÔNG INDEX)
PRINT '=== KỊCH BẢN 8: CHẠY CHẬM (KHÔNG INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT tc.Loai, tp.LoaiVacXin, COUNT(*) as SoLuongMuiTiem
FROM TT_TIEM_PHONG tp WITH (INDEX(0)) -- Ép quét toàn bảng
JOIN THU_CUNG tc WITH (INDEX(0)) ON tp.MaTC = tc.MaTC
GROUP BY tc.Loai, tp.LoaiVacXin
ORDER BY SoLuongMuiTiem DESC;
GO


-- THÍ NGHIỆM 8.2: CHẠY NHANH (CÓ INDEX)
PRINT '=== KỊCH BẢN 8: CHẠY NHANH (CÓ INDEX) ===';
GO
-- Xóa bộ nhớ đệm để công bằng
CHECKPOINT; DBCC DROPCLEANBUFFERS; DBCC FREEPROCCACHE;
GO

SELECT tc.Loai, tp.LoaiVacXin, COUNT(*) as SoLuongMuiTiem
FROM TT_TIEM_PHONG tp
JOIN THU_CUNG tc ON tp.MaTC = tc.MaTC
GROUP BY tc.Loai, tp.LoaiVacXin
ORDER BY SoLuongMuiTiem DESC;
GO