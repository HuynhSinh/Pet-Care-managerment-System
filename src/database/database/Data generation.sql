USE PetCareX;
GO
SET NOCOUNT ON;

-- ======================================================================================
-- PHẦN 0: DỌN DẸP DỮ LIỆU CŨ (RESET SẠCH SẼ)
-- ======================================================================================
PRINT '=== BAT DAU QUY TRINH SINH DU LIEU LON (BIG DATA GENERATION) ===';
PRINT '1. Dang xoa du lieu cu va reset ID...';

-- Xóa theo thứ tự: Con trước -> Cha sau
DELETE FROM CT_HOA_DON_SP;
DELETE FROM TT_KHAM_BENH;
DELETE FROM TT_TIEM_PHONG;
DELETE FROM CT_HOA_DON_DV;
DELETE FROM DANH_GIA;
DELETE FROM HOA_DON;
DBCC CHECKIDENT ('HOA_DON', RESEED, 0);

DELETE FROM THU_CUNG;
DBCC CHECKIDENT ('THU_CUNG', RESEED, 0);

DELETE FROM KHACH_HANG;
DBCC CHECKIDENT ('KHACH_HANG', RESEED, 0);

DELETE FROM SAN_PHAM;
DBCC CHECKIDENT ('SAN_PHAM', RESEED, 0);
GO

-- ======================================================================================
-- PHẦN 1: SINH 10.000 KHÁCH HÀNG (TÊN TIẾNG VIỆT THẬT + CCCD CHUẨN)
-- ======================================================================================
PRINT '2. Dang sinh 10.000 KHACH_HANG...';

-- Bảng tạm chứa từ điển tên
DECLARE @Ho TABLE (ID INT IDENTITY(1,1), Ho NVARCHAR(20));
INSERT INTO @Ho VALUES (N'Nguyễn'), (N'Trần'), (N'Lê'), (N'Phạm'), (N'Hoàng'), (N'Huỳnh'), (N'Phan'), (N'Vũ'), (N'Võ'), (N'Đặng'), (N'Bùi'), (N'Đỗ'), (N'Hồ'), (N'Ngô'), (N'Dương'), (N'Lý');

DECLARE @Dem TABLE (ID INT IDENTITY(1,1), Dem NVARCHAR(20));
INSERT INTO @Dem VALUES (N'Văn'), (N'Thị'), (N'Minh'), (N'Ngọc'), (N'Xuân'), (N'Thanh'), (N'Đức'), (N'Hữu'), (N'Hoàng'), (N'Mỹ'), (N'Kim'), (N'Gia'), (N'Quốc'), (N'Tuệ'), (N'Hồng');

DECLARE @Ten TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(20));
INSERT INTO @Ten VALUES (N'Anh'), (N'Bảo'), (N'Bình'), (N'Cường'), (N'Dương'), (N'Đạt'), (N'Dũng'), (N'Giang'), (N'Hà'), (N'Hải'), (N'Hiếu'), (N'Hòa'), (N'Hùng'), (N'Huy'), (N'Khánh'), (N'Lan'), (N'Linh'), (N'Long'), (N'Minh'), (N'Nam'), (N'Nga'), (N'Ngọc'), (N'Nhi'), (N'Nhung'), (N'Oanh'), (N'Phúc'), (N'Quân'), (N'Quang'), (N'Quỳnh'), (N'Sang'), (N'Sơn'), (N'Tâm'), (N'Thảo'), (N'Thịnh'), (N'Thu'), (N'Thủy'), (N'Toàn'), (N'Trâm'), (N'Trang'), (N'Trí'), (N'Tú'), (N'Tuấn'), (N'Tùng'), (N'Uyên'), (N'Vân'), (N'Việt'), (N'Vinh'), (N'Vy'), (N'Yến');

DECLARE @i INT = 1;
DECLARE @MaxHo INT = (SELECT COUNT(*) FROM @Ho);
DECLARE @MaxDem INT = (SELECT COUNT(*) FROM @Dem);
DECLARE @MaxTen INT = (SELECT COUNT(*) FROM @Ten);

-- Biến hỗ trợ
DECLARE @RandHo NVARCHAR(20), @RandDem NVARCHAR(20), @RandTen NVARCHAR(20), @HoTen NVARCHAR(60);
DECLARE @GioiTinh NVARCHAR(10), @RandID INT;

WHILE @i <= 10000
BEGIN
    -- Lấy tên ngẫu nhiên
    SELECT @RandHo = Ho FROM @Ho WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxHo) + 1;
    SELECT @RandDem = Dem FROM @Dem WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxDem) + 1;
    SELECT @RandTen = Ten FROM @Ten WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxTen) + 1;
    SET @HoTen = @RandHo + ' ' + @RandDem + ' ' + @RandTen;

    -- Xử lý Giới tính
    IF @RandDem = N'Thị' SET @GioiTinh = N'Nữ';
    ELSE IF @RandDem = N'Văn' SET @GioiTinh = N'Nam';
    ELSE SET @GioiTinh = CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2) = 0 THEN N'Nam' ELSE N'Nữ' END;

    INSERT INTO KHACH_HANG (TenKH, SDT, Email, CCCD, GioiTinh, NgaySinh, DiemLoyalty, MaHang)
    VALUES (
        @HoTen,
        '09' + RIGHT('00000000' + CAST(@i AS VARCHAR(10)), 8),
        'kh' + CAST(@i AS VARCHAR) + '@petcarex.com',
        '0' + CAST(ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 9 AS VARCHAR) + RIGHT('0000000000' + CAST(ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) AS VARCHAR(10)), 10),
        @GioiTinh,
        DATEADD(DAY, - (6570 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 15000)), GETDATE()),
        0, 1
    );

    SET @i = @i + 1;
    IF @i % 2000 = 0 PRINT '   -> Da xong ' + CAST(@i AS VARCHAR) + ' khach hang...';
END
PRINT '-> OK: 10.000 KHACH HANG.';
GO

-- ======================================================================================
-- PHẦN 2: SINH 10.000 THÚ CƯNG (LOGIC LOÀI/GIỐNG CHUẨN)
-- ======================================================================================
PRINT '3. Dang sinh 10.000 THU_CUNG...';

-- Tạo kho tên & giống
DECLARE @TenPet TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(30));
INSERT INTO @TenPet VALUES (N'Milu'), (N'Misa'), (N'Lu'), (N'Kiki'), (N'Lucky'), (N'Bông'), (N'Mực'), (N'Vàng'), (N'Đốm'), (N'Rex'), (N'Coco'), (N'Lola'), (N'Charlie'), (N'Simba'), (N'Bella'), (N'Max'), (N'Lucy'), (N'Daisy'), (N'Rocky'), (N'Bear'), (N'Duke'), (N'Cooper'), (N'Zoe'), (N'Bently'), (N'Stella'), (N'Tôm'), (N'Tép'), (N'Bánh Bao'), (N'Khoai'), (N'Đậu'), (N'Lạc'), (N'Kem'), (N'Sữa'), (N'Bơ'), (N'Mập'), (N'Ú'), (N'Xoài'), (N'Mận'), (N'Bưởi'), (N'Na'), (N'Mít'), (N'Socola'), (N'Cà Phê'), (N'Pepsi'), (N'Coca'), (N'Tiger'), (N'Lion'), (N'Gấu'), (N'Chồn'), (N'Cáo'), (N'Sói');

DECLARE @GiongCho TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(30));
INSERT INTO @GiongCho VALUES (N'Poodle'), (N'Husky'), (N'Corgi'), (N'Pug'), (N'Golden'), (N'Alaska'), (N'Chihuahua'), (N'Becgie'), (N'Phú Quốc');

DECLARE @GiongMeo TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(30));
INSERT INTO @GiongMeo VALUES (N'Anh lông ngắn'), (N'Anh lông dài'), (N'Ba Tư'), (N'Mướp'), (N'Xiêm'), (N'Munchkin'), (N'Sphynx'), (N'Tai cụp');

-- TẠO BẢNG ÁNH XẠ KHÁCH HÀNG (QUAN TRỌNG ĐỂ LẤY ID NHANH)
IF OBJECT_ID('tempdb..#MapKH_Pet') IS NOT NULL DROP TABLE #MapKH_Pet;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaKH INTO #MapKH_Pet FROM KHACH_HANG;
DECLARE @CountKH_Map INT = (SELECT COUNT(*) FROM #MapKH_Pet);

DECLARE @i INT = 1, @MaxPet INT = 10000;
DECLARE @MaxTen INT = (SELECT COUNT(*) FROM @TenPet);
DECLARE @MaxCho INT = (SELECT COUNT(*) FROM @GiongCho);
DECLARE @MaxMeo INT = (SELECT COUNT(*) FROM @GiongMeo);
DECLARE @RandTen NVARCHAR(30), @Loai NVARCHAR(20), @Giong NVARCHAR(30), @RandKH INT, @GioiTinh NVARCHAR(10);

WHILE @i <= @MaxPet
BEGIN
    SELECT @RandTen = Ten FROM @TenPet WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxTen) + 1;

    -- Random Loài & Giống
    IF (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 10) < 6 
    BEGIN
        SET @Loai = N'Chó';
        SELECT @Giong = Ten FROM @GiongCho WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxCho) + 1;
    END
    ELSE
    BEGIN
        SET @Loai = N'Mèo';
        SELECT @Giong = Ten FROM @GiongMeo WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxMeo) + 1;
    END

    -- Lấy Mã KH từ bảng ánh xạ (Nhanh hơn SELECT TOP 1 ORDER BY NEWID)
    SELECT @RandKH = MaKH FROM #MapKH_Pet WHERE RowID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountKH_Map) + 1;

    INSERT INTO THU_CUNG (TenTC, Loai, Giong, NgaySinh, GioiTinh, TinhTrangSucKhoe, MaKH)
    VALUES (@RandTen, @Loai, @Giong, DATEADD(DAY, - (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 3000), GETDATE()), CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2) = 0 THEN N'Đực' ELSE N'Cái' END, N'Bình thường', @RandKH);

    SET @i = @i + 1;
    IF @i % 2000 = 0 PRINT '   -> Da xong ' + CAST(@i AS VARCHAR) + ' thu cung...';
END
DROP TABLE #MapKH_Pet;
PRINT '-> OK: 10.000 THU CUNG.';
GO

-- ======================================================================================
-- PHẦN 3: SINH 100.000 SẢN PHẨM (SỬ DỤNG CTE - SIÊU TỐC)
-- ======================================================================================
PRINT '=== BAT DAU SINH 70.000 SAN PHAM ===';

-- 1. Xóa dữ liệu cũ
-- Nếu có ràng buộc khóa ngoại, xóa bảng con trước
DELETE FROM CT_HOA_DON_SP; 
DELETE FROM SAN_PHAM;
DBCC CHECKIDENT ('SAN_PHAM', RESEED, 0);

-- 2. Tạo các từ điển từ khóa (Giữ nguyên để tên đẹp)
DECLARE @Loai TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50), Nhom NVARCHAR(50));
INSERT INTO @Loai VALUES 
(N'Thức ăn hạt', N'Thức ăn'), (N'Pate', N'Thức ăn'), (N'Bánh thưởng', N'Thức ăn'), 
(N'Sữa bột', N'Thức ăn'), (N'Xúc xích', N'Thức ăn'), (N'Sữa tắm', N'Phụ kiện'), 
(N'Dầu xả', N'Phụ kiện'), (N'Nước hoa', N'Phụ kiện'), (N'Vòng cổ', N'Phụ kiện'), 
(N'Dây dắt', N'Phụ kiện'), (N'Bát ăn', N'Phụ kiện'), (N'Chuồng', N'Phụ kiện'), 
(N'Đệm ngủ', N'Phụ kiện'), (N'Cát vệ sinh', N'Phụ kiện'), (N'Thuốc trị ve', N'Thuốc'), 
(N'Thuốc tẩy giun', N'Thuốc'), (N'Vitamin', N'Thuốc'), (N'Canxi', N'Thuốc'), (N'Men tiêu hóa', N'Thuốc');

DECLARE @Brand TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Brand VALUES 
(N'Royal Canin'), (N'Whiskas'), (N'Pedigree'), (N'Me-O'), (N'Zenith'), 
(N'Ganador'), (N'SmartHeart'), (N'Taste of the Wild'), (N'Nutrience'), 
(N'Tropiclean'), (N'Fay'), (N'Bio-Pharm'), (N'PetSoft'), (N'Mỹ'), (N'Nhật Bản');

DECLARE @Feature TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Feature VALUES 
(N'cho chó con'), (N'cho mèo con'), (N'cho chó lớn'), (N'cho mèo già'),
(N'giúp mượt lông'), (N'hỗ trợ tiêu hóa'), (N'vị cá ngừ'), (N'vị bò'), 
(N'vị gà'), (N'khử mùi hôi'), (N'siêu thấm hút'), (N'chống rỉ sét'), 
(N'siêu mềm mịn'), (N'hương dâu'), (N'hương phấn baby'), (N'trị viêm da');

DECLARE @QuyCach TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(20));
INSERT INTO @QuyCach VALUES 
(N'500g'), (N'1kg'), (N'2kg'), (N'5kg'), (N'10kg'), 
(N'Size S'), (N'Size M'), (N'Size L'), (N'Size XL'), 
(N'Chai 100ml'), (N'Chai 500ml'), (N'Hộp 10 viên'), (N'Gói nhỏ');

-- 3. Khai báo biến
DECLARE @i INT = 1;
DECLARE @TargetRows INT = 70000; -- Mục tiêu 70k dòng

DECLARE @CountLoai INT = (SELECT COUNT(*) FROM @Loai);
DECLARE @CountBrand INT = (SELECT COUNT(*) FROM @Brand);
DECLARE @CountFeature INT = (SELECT COUNT(*) FROM @Feature);
DECLARE @CountSize INT = (SELECT COUNT(*) FROM @QuyCach);

-- Biến lưu giá trị tạm
DECLARE @StrLoai NVARCHAR(50), @StrNhom NVARCHAR(50);
DECLARE @StrBrand NVARCHAR(50);
DECLARE @StrFeature NVARCHAR(50);
DECLARE @StrSize NVARCHAR(20);
DECLARE @FinalName NVARCHAR(200);

PRINT '2. Dang chay vong lap insert (co the mat 1-2 phut)...';

-- 4. Vòng lặp WHILE (Chậm nhưng chắc, không treo máy)
WHILE @i <= @TargetRows
BEGIN
    -- Lấy ngẫu nhiên từng thành phần (Dùng BIGINT để tránh tràn số)
    SELECT @StrLoai = Ten, @StrNhom = Nhom FROM @Loai WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountLoai) + 1;
    SELECT @StrBrand = Ten FROM @Brand WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountBrand) + 1;
    SELECT @StrFeature = Ten FROM @Feature WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountFeature) + 1;
    SELECT @StrSize = Ten FROM @QuyCach WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountSize) + 1;

    -- Ghép tên
    SET @FinalName = @StrLoai + ' ' + @StrBrand + ' ' + @StrFeature + ' (' + @StrSize + ')';

    -- Insert
    INSERT INTO SAN_PHAM (TenSP, LoaiSP, GiaBan, SoLuongTonKho)
    VALUES (
        @FinalName,
        @StrNhom,
        (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 400 + 4) * 5000, -- Giá từ 20k - 2tr
        ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 1001 -- Tồn kho
    );

    -- In tiến độ mỗi 2000 dòng để bạn yên tâm là nó đang chạy
    IF @i % 2000 = 0 
        PRINT '   -> Da sinh xong ' + CAST(@i AS VARCHAR) + ' san pham...';

    SET @i = @i + 1;
END

PRINT '-> DA SINH XONG 70.000 SAN PHAM AN TOAN!';
GO

-- ======================================================================================
-- PHẦN 4: SINH 300.000 HÓA ĐƠN (PHƯƠNG PHÁP STAGING & MAPPING)
-- ======================================================================================
PRINT '5. Dang sinh 300.000 HOA_DON (An toan tuyet doi)...';

-- Tạo bảng ánh xạ ID
IF OBJECT_ID('tempdb..#ValidKH') IS NOT NULL DROP TABLE #ValidKH;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaKH INTO #ValidKH FROM KHACH_HANG;
DECLARE @CountKH INT = (SELECT COUNT(*) FROM #ValidKH);

IF OBJECT_ID('tempdb..#ValidNV') IS NOT NULL DROP TABLE #ValidNV;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaNV INTO #ValidNV FROM NHAN_VIEN;
DECLARE @CountNV INT = (SELECT COUNT(*) FROM #ValidNV);

IF OBJECT_ID('tempdb..#ValidCN') IS NOT NULL DROP TABLE #ValidCN;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaCN INTO #ValidCN FROM CHI_NHANH;
DECLARE @CountCN INT = (SELECT COUNT(*) FROM #ValidCN);

-- Tạo bảng Staging chứa dữ liệu ngẫu nhiên (Dùng CTE cho nhanh)
IF OBJECT_ID('tempdb..#Staging') IS NOT NULL DROP TABLE #Staging;
;WITH 
  E1(N) AS (SELECT 1 FROM (VALUES (1),(1),(1),(1),(1),(1),(1),(1),(1),(1)) t(N)), 
  E2(N) AS (SELECT 1 FROM E1 a CROSS JOIN E1 b), 
  E4(N) AS (SELECT 1 FROM E2 a CROSS JOIN E2 b), 
  E6(N) AS (SELECT 1 FROM E4 a CROSS JOIN E4 b) -- 100 trieu
SELECT TOP 300000
    DATEADD(HOUR, - (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 17000), GETDATE()) AS NgayLap,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountKH) + 1 AS RandKH_ID,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountNV) + 1 AS RandNV_ID,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountCN) + 1 AS RandCN_ID,
    CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 10) < 4 THEN N'Chuyển khoản' ELSE N'Tiền mặt' END AS HinhThuc
INTO #Staging
FROM E6;

-- INSERT vào Hóa Đơn bằng cách JOIN
INSERT INTO HOA_DON (NgayLap, TongTien, HinhThucThanhToan, MaCN, MaKH, MaNV)
SELECT 
    S.NgayLap, 0, S.HinhThuc,
    C.MaCN, K.MaKH, V.MaNV
FROM #Staging S
JOIN #ValidCN C ON S.RandCN_ID = C.RowID
JOIN #ValidKH K ON S.RandKH_ID = K.RowID
JOIN #ValidNV V ON S.RandNV_ID = V.RowID;

PRINT '-> OK: 300.000 HOA_DON.';

-- ======================================================================================
-- PHẦN 5: SINH CHI TIẾT MUA HÀNG (QUAN TRỌNG)
-- ======================================================================================
PRINT '6. Dang sinh chi tiet CT_HOA_DON_SP...';

IF OBJECT_ID('tempdb..#ValidSP') IS NOT NULL DROP TABLE #ValidSP;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaSP, GiaBan INTO #ValidSP FROM SAN_PHAM;
DECLARE @CountSP INT = (SELECT COUNT(*) FROM #ValidSP);

-- Insert chi tiết (Random sản phẩm cho mỗi hóa đơn)
INSERT INTO CT_HOA_DON_SP (MaHD, MaSP, SoLuong, DonGia)
SELECT 
    HD.MaHD,
    SP_Rand.MaSP,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 3) + 1,
    SP_Rand.GiaBan
FROM HOA_DON HD
CROSS APPLY (
    SELECT TOP 1 MaSP, GiaBan 
    FROM #ValidSP 
    WHERE RowID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CountSP) + 1
) SP_Rand;

PRINT '   -> Dang cap nhat Tong Tien (viec nay mat 1-2 phut)...';
UPDATE HD
SET TongTien = ISNULL((
    SELECT SUM(SoLuong * DonGia) FROM CT_HOA_DON_SP WHERE MaHD = HD.MaHD
), 0)
FROM HOA_DON HD;

-- Dọn dẹp bảng tạm
DROP TABLE #ValidKH; DROP TABLE #ValidNV; DROP TABLE #ValidCN; DROP TABLE #ValidSP; DROP TABLE #Staging;

PRINT '=== HOAN TAT TOAN BO QUY TRINH! ===';
PRINT 'Kiem tra du lieu:';
SELECT 'KHACH_HANG', COUNT(*) FROM KHACH_HANG
UNION ALL SELECT 'THU_CUNG', COUNT(*) FROM THU_CUNG
UNION ALL SELECT 'SAN_PHAM', COUNT(*) FROM SAN_PHAM
UNION ALL SELECT 'HOA_DON', COUNT(*) FROM HOA_DON
UNION ALL SELECT 'CT_HOA_DON_SP', COUNT(*) FROM CT_HOA_DON_SP;
GO