USE PetCareX;
GO
SET NOCOUNT ON;

PRINT '=== BAT DAU KHOI TAO DU LIEU NEN TANG (NEW SCHEMA) ===';

-- =================================================================
-- 1. DỌN DẸP DỮ LIỆU CŨ (THEO THỨ TỰ CON TRƯỚC - CHA SAU)
-- =================================================================
PRINT '1. Don dep du lieu cu...';

-- Cấp 1: Các bảng chi tiết thấp nhất
DELETE FROM TT_KHAM_BENH;
DELETE FROM TT_TIEM_PHONG;
DELETE FROM CT_HOA_DON_SP;
DELETE FROM CT_HOA_DON_DV; -- Bảng này giờ chứa MaDV
DELETE FROM DANH_GIA;
DELETE FROM LICH_SU_DIEU_DONG;
DELETE FROM DICH_VU_CUNG_CAP;

-- Cấp 2: Các bảng trung gian
DELETE FROM HOA_DON;
DBCC CHECKIDENT ('HOA_DON', RESEED, 0);

DELETE FROM THU_CUNG;
DBCC CHECKIDENT ('THU_CUNG', RESEED, 0);

DELETE FROM NHAN_VIEN;
DBCC CHECKIDENT ('NHAN_VIEN', RESEED, 0);

-- Cấp 3: Các bảng danh mục (Master Data)
DELETE FROM KHACH_HANG;
DBCC CHECKIDENT ('KHACH_HANG', RESEED, 0);

DELETE FROM HANG_THANH_VIEN;
DBCC CHECKIDENT ('HANG_THANH_VIEN', RESEED, 0);

DELETE FROM GOI_TIEM;
DBCC CHECKIDENT ('GOI_TIEM', RESEED, 0);

DELETE FROM SAN_PHAM;
DBCC CHECKIDENT ('SAN_PHAM', RESEED, 0);

DELETE FROM DICH_VU; -- Dịch vụ phải xóa sau Dịch vụ cung cấp
DBCC CHECKIDENT ('DICH_VU', RESEED, 0);

DELETE FROM CHI_NHANH;
DBCC CHECKIDENT ('CHI_NHANH', RESEED, 0);

PRINT '-> DA XOA SACH SE DU LIEU VA RESET ID!';

PRINT '=== BAT DAU NAP DU LIEU NEN TANG ===';

-- 1. TẠO HẠNG THÀNH VIÊN
PRINT '1. Tao HANG_THANH_VIEN...';
INSERT INTO HANG_THANH_VIEN (TenHang, ChiTieuGiuHang, ChiTieuDatHang) VALUES 
(N'Cơ bản', 0, 0),
(N'Thân thiết', 3000000, 5000000),
(N'VIP', 8000000, 12000000);

-- 2. TẠO 10 CHI NHÁNH
PRINT '2. Tao 10 CHI_NHANH...';
INSERT INTO CHI_NHANH (TenCN, DiaChi, SDT, TGMoCua, TGDongCua) VALUES 
(N'PetCareX Quận 1', N'123 Nguyễn Huệ, Q.1, TP.HCM', '0281000001', '08:00', '21:00'),
(N'PetCareX Quận 3', N'45 Võ Văn Tần, Q.3, TP.HCM', '0281000002', '08:00', '21:00'),
(N'PetCareX Quận 7', N'101 Nguyễn Văn Linh, Q.7, TP.HCM', '0281000003', '08:00', '21:00'),
(N'PetCareX Thủ Đức', N'20 Võ Văn Ngân, TP.Thủ Đức', '0281000004', '07:30', '20:30'),
(N'PetCareX Gò Vấp', N'300 Phan Văn Trị, Q.Gò Vấp, TP.HCM', '0281000005', '08:00', '21:00'),
(N'PetCareX Bình Thạnh', N'15 Lê Quang Định, Q.Bình Thạnh', '0281000006', '08:00', '21:00'),
(N'PetCareX Hà Nội - Cầu Giấy', N'10 Xuân Thủy, Cầu Giấy, Hà Nội', '0241000001', '08:00', '21:00'),
(N'PetCareX Hà Nội - Hoàn Kiếm', N'50 Tràng Tiền, Hoàn Kiếm, Hà Nội', '0241000002', '08:00', '21:00'),
(N'PetCareX Đà Nẵng - Hải Châu', N'200 Nguyễn Văn Linh, Đà Nẵng', '0236000001', '08:00', '20:30'),
(N'PetCareX Cần Thơ - Ninh Kiều', N'30/4 Ninh Kiều, Cần Thơ', '0292000001', '08:00', '20:30');

-- 3. TẠO LOẠI DỊCH VỤ
PRINT '3. Tao DICH_VU...';
INSERT INTO DICH_VU (LoaiDV, MoTa) VALUES 
(N'Khám bệnh', N'Khám lâm sàng, chẩn đoán và điều trị bệnh cho thú cưng'),
(N'Tiêm phòng', N'Tiêm vắc-xin phòng bệnh định kỳ (Dại, Care, Parvo...)'),
(N'Mua hàng', N'Mua sắm thức ăn, phụ kiện, thuốc men tại quầy');

-- 4. TẠO DỊCH VỤ CUNG CẤP (Dùng biến để lấy ID, cực kỳ an toàn)
PRINT '4. Tao DICH_VU_CUNG_CAP...';

DECLARE @IdKham INT = (SELECT MaDV FROM DICH_VU WHERE LoaiDV = N'Khám bệnh');
DECLARE @IdTiem INT = (SELECT MaDV FROM DICH_VU WHERE LoaiDV = N'Tiêm phòng');
DECLARE @IdMua INT = (SELECT MaDV FROM DICH_VU WHERE LoaiDV = N'Mua hàng');

DECLARE @k INT = 1;
WHILE @k <= 10
BEGIN
    INSERT INTO DICH_VU_CUNG_CAP (MaCN, MaDV, TrangThai) VALUES (@k, @IdKham, 1);
    INSERT INTO DICH_VU_CUNG_CAP (MaCN, MaDV, TrangThai) VALUES (@k, @IdTiem, 1);
    
    -- Random 70% chi nhánh có thêm "Mua hàng"
    IF (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 10) < 7 
        INSERT INTO DICH_VU_CUNG_CAP (MaCN, MaDV, TrangThai) VALUES (@k, @IdMua, 1);
    
    SET @k = @k + 1;
END
GO


------------------------------------------------------------------------------------------------------------------------------

PRINT '=== BAT DAU SINH 200.000 SAN PHAM  ===';
GO
-- =================================================================
-- 1. DỌN DẸP DỮ LIỆU CŨ
-- =================================================================
-- Xóa bảng con trước
IF OBJECT_ID('dbo.CT_HOA_DON_SP', 'U') IS NOT NULL 
    DELETE FROM CT_HOA_DON_SP;

-- Xóa bảng Sản phẩm
DELETE FROM SAN_PHAM;
DBCC CHECKIDENT ('SAN_PHAM', RESEED, 0);

PRINT '1. Da don dep du lieu cu.';

-- =================================================================
-- 2. TẠO TỪ ĐIỂN TỪ KHÓA (GIỮ NGUYÊN)
-- =================================================================
DECLARE @Loai TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50), Nhom NVARCHAR(50));
INSERT INTO @Loai VALUES 
(N'Thức ăn hạt', N'Thức ăn'), (N'Pate', N'Thức ăn'), (N'Bánh thưởng', N'Thức ăn'), 
(N'Sữa bột', N'Thức ăn'), (N'Xúc xích', N'Thức ăn'), (N'Sữa tắm', N'Phụ kiện'), 
(N'Dầu xả', N'Phụ kiện'), (N'Nước hoa', N'Phụ kiện'), (N'Vòng cổ', N'Phụ kiện'), 
(N'Dây dắt', N'Phụ kiện'), (N'Bát ăn', N'Phụ kiện'), (N'Chuồng', N'Phụ kiện'), 
(N'Đệm ngủ', N'Phụ kiện'), (N'Cát vệ sinh', N'Phụ kiện'), (N'Thuốc trị ve', N'Thuốc'), 
(N'Thuốc tẩy giun', N'Thuốc'), (N'Vitamin', N'Thuốc'), (N'Canxi', N'Thuốc'), 
(N'Men tiêu hóa', N'Thuốc'), (N'Balo vận chuyển', N'Phụ kiện'), (N'Đồ chơi', N'Phụ kiện');

DECLARE @Brand TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Brand VALUES 
(N'Royal Canin'), (N'Whiskas'), (N'Pedigree'), (N'Me-O'), (N'Zenith'), 
(N'Ganador'), (N'SmartHeart'), (N'Taste of the Wild'), (N'Nutrience'), 
(N'Tropiclean'), (N'Fay'), (N'Bio-Pharm'), (N'PetSoft'), (N'Mỹ'), (N'Nhật Bản'),
(N'Hàn Quốc'), (N'Bayer'), (N'Virbac'), (N'Frontline'), (N'NexGard');

DECLARE @Feature TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Feature VALUES 
(N'cho chó con'), (N'cho mèo con'), (N'cho chó lớn'), (N'cho mèo già'),
(N'giúp mượt lông'), (N'hỗ trợ tiêu hóa'), (N'vị cá ngừ'), (N'vị bò'), 
(N'vị gà'), (N'khử mùi hôi'), (N'siêu thấm hút'), (N'chống rỉ sét'), 
(N'siêu mềm mịn'), (N'hương dâu'), (N'hương phấn baby'), (N'trị viêm da'),
(N'cao cấp'), (N'dinh dưỡng cao'), (N'không gây kích ứng');

DECLARE @QuyCach TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(20));
INSERT INTO @QuyCach VALUES 
(N'500g'), (N'1kg'), (N'2kg'), (N'5kg'), (N'10kg'), 
(N'Size S'), (N'Size M'), (N'Size L'), (N'Size XL'), 
(N'Chai 100ml'), (N'Chai 500ml'), (N'Hộp 10 viên'), (N'Gói nhỏ'),
(N'Combo 2'), (N'Thùng 12 gói');

-- Lấy tổng số lượng để Random
DECLARE @MaxLoai INT = (SELECT COUNT(*) FROM @Loai);
DECLARE @MaxBrand INT = (SELECT COUNT(*) FROM @Brand);
DECLARE @MaxFeature INT = (SELECT COUNT(*) FROM @Feature);
DECLARE @MaxQuyCach INT = (SELECT COUNT(*) FROM @QuyCach);

-- =================================================================
-- 3. VÒNG LẶP SINH 200.000 SẢN PHẨM
-- =================================================================
PRINT '2. Bat dau chay vong lap (Loop)...';
DECLARE @i INT = 1;
DECLARE @Target INT = 200000; -- Mục tiêu 200k dòng

-- Biến tạm để lưu giá trị random
DECLARE @R_Loai INT, @R_Brand INT, @R_Feature INT, @R_QuyCach INT;
DECLARE @StrLoai NVARCHAR(50), @StrNhom NVARCHAR(50), @StrBrand NVARCHAR(50), @StrFeature NVARCHAR(50), @StrQuyCach NVARCHAR(20);
DECLARE @FinalName NVARCHAR(200);

WHILE @i <= @Target
BEGIN
    -- Bước 1: Random ID trước (Dùng BIGINT để tránh lỗi tràn số)
    SET @R_Loai = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxLoai) + 1;
    SET @R_Brand = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxBrand) + 1;
    SET @R_Feature = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxFeature) + 1;
    SET @R_QuyCach = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxQuyCach) + 1;

    -- Bước 2: Lấy chuỗi từ bảng từ điển dựa trên ID
    SELECT @StrLoai = Ten, @StrNhom = Nhom FROM @Loai WHERE ID = @R_Loai;
    SELECT @StrBrand = Ten FROM @Brand WHERE ID = @R_Brand;
    SELECT @StrFeature = Ten FROM @Feature WHERE ID = @R_Feature;
    SELECT @StrQuyCach = Ten FROM @QuyCach WHERE ID = @R_QuyCach;

    -- Bước 3: Ghép tên
    SET @FinalName = @StrLoai + ' ' + @StrBrand + ' ' + @StrFeature + ' (' + @StrQuyCach + ')';

    -- Bước 4: Insert
    INSERT INTO SAN_PHAM (TenSP, LoaiSP, GiaBan, SoLuongTonKho)
    VALUES (
        @FinalName,
        @StrNhom,
        (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 400 + 4) * 5000, -- Giá 20k - 2tr
        ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 1001 -- Tồn kho
    );

    SET @i = @i + 1;

    -- In tiến độ mỗi 5000 dòng để biết máy không bị đơ
    IF @i % 5000 = 0 
        PRINT '   -> Da sinh xong ' + CAST(@i AS VARCHAR) + ' san pham...';
END

PRINT '=== HOAN TAT 200.000 SAN PHAM! ===';
GO

-- ======================================================================================
-- PHẦN 7: SINH 70.000 Gói tiêm
-- ======================================================================================
PRINT '=== SINH LAI 70.000 GOI_TIEM  ===';

-- 1. Xóa dữ liệu cũ để làm lại cho sạch
DELETE FROM TT_TIEM_PHONG; -- Xóa bảng con nếu có
DELETE FROM GOI_TIEM;
DBCC CHECKIDENT ('GOI_TIEM', RESEED, 0);

-- 2. Tạo lại các bảng từ điển (giữ nguyên)
DECLARE @Target TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Target VALUES (N'Chó con'), (N'Mèo con'), (N'Chó trưởng thành'), (N'Mèo trưởng thành'), (N'Thú cưng già'), (N'Chó Poodle'), (N'Mèo Anh');

DECLARE @Type TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Type VALUES (N'5 bệnh'), (N'7 bệnh'), (N'Dại'), (N'Viêm gan'), (N'Care'), (N'Parvo'), (N'Lepto'), (N'Ký sinh trùng'), (N'Ve rận');

DECLARE @Duration TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Duration VALUES (N'6 Tháng'), (N'12 Tháng'), (N'24 Tháng'), (N'Trọn đời');

DECLARE @Level TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(50));
INSERT INTO @Level VALUES (N'Cơ bản'), (N'Nâng cao'), (N'Toàn diện'), (N'VIP'), (N'Siêu tiết kiệm'), (N'Premium');

-- 3. Khai báo biến
DECLARE @j INT = 1;
DECLARE @MaxTarget INT = (SELECT COUNT(*) FROM @Target);
DECLARE @MaxType INT = (SELECT COUNT(*) FROM @Type);
DECLARE @MaxDuration INT = (SELECT COUNT(*) FROM @Duration);
DECLARE @MaxLevel INT = (SELECT COUNT(*) FROM @Level);

DECLARE @StrTarget NVARCHAR(50), @StrType NVARCHAR(50), @StrDuration NVARCHAR(50), @StrLevel NVARCHAR(50);
DECLARE @FinalName NVARCHAR(200);
DECLARE @RandTime INT, @RandUuDai INT;

-- [FIX] Khai báo thêm biến lưu ID Random để tính toán trước
DECLARE @R_Target INT, @R_Type INT, @R_Duration INT, @R_Level INT;

PRINT 'Dang sinh du lieu...';

WHILE @j <= 70000
BEGIN
    -- [FIX] Bước 1: Tính toán ID Random ra biến trước (Ổn định giá trị)
    SET @R_Target   = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxTarget) + 1;
    SET @R_Type     = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxType) + 1;
    SET @R_Duration = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxDuration) + 1;
    SET @R_Level    = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxLevel) + 1;

    -- [FIX] Bước 2: Select dựa trên biến ID đã tính (Chắc chắn tìm thấy 1 dòng)
    SELECT @StrTarget = Ten FROM @Target WHERE ID = @R_Target;
    SELECT @StrType = Ten FROM @Type WHERE ID = @R_Type;
    SELECT @StrDuration = Ten FROM @Duration WHERE ID = @R_Duration;
    SELECT @StrLevel = Ten FROM @Level WHERE ID = @R_Level;

    -- Ghép tên
    SET @FinalName = N'Gói ' + @StrTarget + ' ' + @StrType + ' (' + @StrDuration + ') - ' + @StrLevel;

    -- Logic Thời gian
    IF @StrDuration LIKE N'%6 Tháng%' SET @RandTime = 6;
    ELSE IF @StrDuration LIKE N'%12 Tháng%' SET @RandTime = 12;
    ELSE IF @StrDuration LIKE N'%24 Tháng%' SET @RandTime = 24;
    ELSE SET @RandTime = 36;

    -- Ưu đãi
    SET @RandUuDai = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 3 + 1) * 5;

    -- Insert
    INSERT INTO GOI_TIEM (TenGoi, ThoiGian, UuDai)
    VALUES (@FinalName, @RandTime, @RandUuDai);

    SET @j = @j + 1;
    
    IF @j % 10000 = 0 PRINT '   -> Da sinh ' + CAST(@j AS VARCHAR) + ' goi tiem...';
END

PRINT '-> OK: 70.000 GOI TIEM (KHONG LOI NULL)!';
GO




PRINT '=== BAT DAU SINH DU LIEU NHAN SU VA KHACH HANG ===';

-- =================================================================
-- PHẦN 1: DỌN DẸP DỮ LIỆU CŨ (Để tránh lỗi trùng lặp SĐT/Khóa ngoại)
-- =================================================================
PRINT '1. Don dep du lieu cu...';

-- Xóa bảng con trước
DELETE FROM LICH_SU_DIEU_DONG;
DELETE FROM TT_KHAM_BENH;
DELETE FROM TT_TIEM_PHONG;
DELETE FROM CT_HOA_DON_SP;
DELETE FROM CT_HOA_DON_DV;
DELETE FROM DANH_GIA;
DELETE FROM HOA_DON;
DELETE FROM THU_CUNG;

-- Xóa bảng nhân viên & khách hàng
DELETE FROM NHAN_VIEN;
DBCC CHECKIDENT ('NHAN_VIEN', RESEED, 0);

DELETE FROM KHACH_HANG;
DBCC CHECKIDENT ('KHACH_HANG', RESEED, 0);

PRINT '-> DA XOA SACH SE!';

-- =================================================================
-- CHUẨN BỊ: TẠO KHO TÊN TIẾNG VIỆT (Dùng chung cho cả NV và KH)
-- =================================================================
DECLARE @Ho TABLE (ID INT IDENTITY(1,1), Ho NVARCHAR(20));
INSERT INTO @Ho VALUES (N'Nguyễn'), (N'Trần'), (N'Lê'), (N'Phạm'), (N'Hoàng'), (N'Huỳnh'), (N'Phan'), (N'Vũ'), (N'Võ'), (N'Đặng'), (N'Bùi'), (N'Đỗ'), (N'Hồ'), (N'Ngô'), (N'Dương'), (N'Lý');

DECLARE @Dem TABLE (ID INT IDENTITY(1,1), Dem NVARCHAR(20));
INSERT INTO @Dem VALUES (N'Văn'), (N'Thị'), (N'Minh'), (N'Ngọc'), (N'Xuân'), (N'Thanh'), (N'Đức'), (N'Hữu'), (N'Hoàng'), (N'Mỹ'), (N'Kim'), (N'Gia'), (N'Quốc'), (N'Tuệ'), (N'Hồng'), (N'Quang'), (N'Thái');

DECLARE @Ten TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(20));
INSERT INTO @Ten VALUES (N'Anh'), (N'Bảo'), (N'Bình'), (N'Cường'), (N'Dương'), (N'Đạt'), (N'Dũng'), (N'Giang'), (N'Hà'), (N'Hải'), (N'Hiếu'), (N'Hòa'), (N'Hùng'), (N'Huy'), (N'Khánh'), (N'Lan'), (N'Linh'), (N'Long'), (N'Minh'), (N'Nam'), (N'Nga'), (N'Ngọc'), (N'Nhi'), (N'Nhung'), (N'Oanh'), (N'Phúc'), (N'Quân'), (N'Quang'), (N'Quỳnh'), (N'Sang'), (N'Sơn'), (N'Tâm'), (N'Thảo'), (N'Thịnh'), (N'Thu'), (N'Thủy'), (N'Toàn'), (N'Trâm'), (N'Trang'), (N'Trí'), (N'Tú'), (N'Tuấn'), (N'Tùng'), (N'Uyên'), (N'Vân'), (N'Việt'), (N'Vinh'), (N'Vy'), (N'Yến');

DECLARE @MaxHo INT = (SELECT COUNT(*) FROM @Ho);
DECLARE @MaxDem INT = (SELECT COUNT(*) FROM @Dem);
DECLARE @MaxTen INT = (SELECT COUNT(*) FROM @Ten);

-- Biến dùng chung
DECLARE @HoTen NVARCHAR(60), @RandHo NVARCHAR(20), @RandDem NVARCHAR(20), @RandTen NVARCHAR(20);
DECLARE @GioiTinh NVARCHAR(10);
DECLARE @RandVal BIGINT; -- Dùng BIGINT để tránh tràn số

-- =================================================================
-- PHẦN 2: SINH 500 NHÂN VIÊN
-- =================================================================
PRINT '2. Dang sinh 500 NHAN VIEN...';

DECLARE @i INT = 1;
DECLARE @ChucVu NVARCHAR(50);
DECLARE @Luong DECIMAL(18,0);
DECLARE @MaxCN INT = (SELECT COUNT(*) FROM CHI_NHANH);

WHILE @i <= 500
BEGIN
    -- 2.1 Sinh Tên
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandHo = Ho FROM @Ho WHERE ID = (@RandVal % @MaxHo) + 1;
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandDem = Dem FROM @Dem WHERE ID = (@RandVal % @MaxDem) + 1;
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandTen = Ten FROM @Ten WHERE ID = (@RandVal % @MaxTen) + 1;
    SET @HoTen = @RandHo + ' ' + @RandDem + ' ' + @RandTen;

    -- 2.2 Sinh Giới tính
    IF @RandDem = N'Thị' SET @GioiTinh = N'Nữ';
    ELSE IF @RandDem = N'Văn' SET @GioiTinh = N'Nam';
    ELSE SET @GioiTinh = CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2) = 0 THEN N'Nam' ELSE N'Nữ' END;

    -- 2.3 Phân bổ Chức vụ & Lương
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 100; -- Random 0-99
    
    IF @RandVal < 5 -- 5% Quản lý
    BEGIN
        SET @ChucVu = N'Quản lý';
        SET @Luong = 25000000 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 15) * 1000000;
    END
    ELSE IF @RandVal < 35 -- 30% Bác sĩ
    BEGIN
        SET @ChucVu = N'Bác sĩ';
        SET @Luong = 15000000 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 15) * 1000000;
    END
    ELSE IF @RandVal < 60 -- 25% Tiếp tân
    BEGIN
        SET @ChucVu = N'Tiếp tân';
        SET @Luong = 8000000 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 5) * 1000000;
    END
    ELSE -- 40% Bán hàng
    BEGIN
        SET @ChucVu = N'Bán hàng';
        SET @Luong = 7000000 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 4) * 1000000;
    END

    -- 2.4 Insert
    INSERT INTO NHAN_VIEN (HoTen, NgaySinh, GioiTinh, SDT, NgayVaoLam, LuongCoBan, ChucVu, MaCN)
    VALUES (
        @HoTen,
        DATEADD(YEAR, - (22 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 30)), GETDATE()), -- Tuổi 22-52
        @GioiTinh,
        '09' + RIGHT('88888888' + CAST(@i AS VARCHAR(10)), 8), -- SĐT giả định (khác dải số KH)
        DATEADD(DAY, - (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 1800), GETDATE()), -- Vào làm < 5 năm
        @Luong,
        @ChucVu,
        (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxCN) + 1 -- Random Chi nhánh 1-10
    );

    SET @i = @i + 1;
END

PRINT '-> OK: 500 Nhan vien.';

-- =================================================================
-- PHẦN 3: SINH 20.000 KHÁCH HÀNG
-- =================================================================
PRINT '3. Dang sinh 20.000 KHACH HANG...';

DECLARE @j INT = 1;
DECLARE @MaHang INT;
DECLARE @CCCD VARCHAR(20);

WHILE @j <= 20000
BEGIN
    -- 3.1 Sinh Tên
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandHo = Ho FROM @Ho WHERE ID = (@RandVal % @MaxHo) + 1;
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandDem = Dem FROM @Dem WHERE ID = (@RandVal % @MaxDem) + 1;
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandTen = Ten FROM @Ten WHERE ID = (@RandVal % @MaxTen) + 1;
    SET @HoTen = @RandHo + ' ' + @RandDem + ' ' + @RandTen;

    -- 3.2 Sinh Giới tính
    IF @RandDem = N'Thị' SET @GioiTinh = N'Nữ';
    ELSE IF @RandDem = N'Văn' SET @GioiTinh = N'Nam';
    ELSE SET @GioiTinh = CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2) = 0 THEN N'Nam' ELSE N'Nữ' END;

    -- 3.3 Phân hạng thành viên (80% Cơ bản, 15% Thân thiết, 5% VIP)
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 100;
    IF @RandVal < 80 SET @MaHang = 1;      -- Cơ bản
    ELSE IF @RandVal < 95 SET @MaHang = 2; -- Thân thiết
    ELSE SET @MaHang = 3;                  -- VIP

    -- 3.4 Tạo CCCD giả lập (12 số)
    SET @CCCD = '0' + CAST(ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 9 AS VARCHAR) + 
                RIGHT('0000000000' + CAST(ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) AS VARCHAR(10)), 10);

    -- 3.5 Insert
    INSERT INTO KHACH_HANG (TenKH, SDT, Email, CCCD, GioiTinh, NgaySinh, DiemLoyalty, MaHang)
    VALUES (
        @HoTen,
        -- SĐT Unique: 09 + số thứ tự j được pad 0 (Ví dụ: 0900000001 -> 0900020000)
        '09' + RIGHT('00000000' + CAST(@j AS VARCHAR(10)), 8),
        'kh' + CAST(@j AS VARCHAR) + '@petcarex.com',
        @CCCD,
        @GioiTinh,
        DATEADD(DAY, - (6570 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 15000)), GETDATE()), -- 18-60 tuổi
        0, -- Điểm ban đầu
        @MaHang
    );

    SET @j = @j + 1;
    IF @j % 5000 = 0 PRINT '   -> Da sinh ' + CAST(@j AS VARCHAR) + ' khach hang...';
END
GO

PRINT '=== BAT DAU SINH 2000 THU CUNG ===';

-- =================================================================
-- 1. DỌN DẸP DỮ LIỆU CŨ (Tránh lỗi khóa ngoại)
-- =================================================================
-- Xóa các bảng con sử dụng Thú cưng trước
DELETE FROM TT_KHAM_BENH;
DELETE FROM TT_TIEM_PHONG;
DELETE FROM CT_HOA_DON_SP; -- Nếu có logic liên quan
-- Xóa bảng Thú cưng
DELETE FROM THU_CUNG;
DBCC CHECKIDENT ('THU_CUNG', RESEED, 0);

-- =================================================================
-- 2. CHUẨN BỊ DỮ LIỆU TỪ ĐIỂN
-- =================================================================
-- Kho tên thú cưng phổ biến
DECLARE @TenPet TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(30));
INSERT INTO @TenPet VALUES 
(N'Milu'), (N'Misa'), (N'Lu'), (N'Kiki'), (N'Lucky'), (N'Bông'), (N'Mực'), (N'Vàng'), 
(N'Đốm'), (N'Rex'), (N'Coco'), (N'Lola'), (N'Charlie'), (N'Simba'), (N'Bella'), 
(N'Max'), (N'Lucy'), (N'Daisy'), (N'Rocky'), (N'Bear'), (N'Duke'), (N'Cooper'),
(N'Zoe'), (N'Bently'), (N'Stella'), (N'Tôm'), (N'Tép'), (N'Bánh Bao'), (N'Khoai'),
(N'Đậu'), (N'Lạc'), (N'Kem'), (N'Sữa'), (N'Bơ'), (N'Mập'), (N'Ú'), (N'Xoài'),
(N'Mận'), (N'Bưởi'), (N'Na'), (N'Mít'), (N'Socola'), (N'Cà Phê'), (N'Pepsi'),
(N'Coca'), (N'Tiger'), (N'Lion'), (N'Gấu'), (N'Chồn'), (N'Cáo'), (N'Sói');

-- Kho giống Chó
DECLARE @GiongCho TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(30));
INSERT INTO @GiongCho VALUES (N'Poodle'), (N'Husky'), (N'Corgi'), (N'Pug'), (N'Golden Retriever'), (N'Alaska'), (N'Chihuahua'), (N'Becgie'), (N'Phú Quốc'), (N'Shiba Inu');

-- Kho giống Mèo
DECLARE @GiongMeo TABLE (ID INT IDENTITY(1,1), Ten NVARCHAR(30));
INSERT INTO @GiongMeo VALUES (N'Anh lông ngắn'), (N'Anh lông dài'), (N'Ba Tư'), (N'Mướp'), (N'Xiêm'), (N'Munchkin'), (N'Sphynx'), (N'Tai cụp (Scottish)'), (N'Ragdoll');

-- =================================================================
-- 3. VÒNG LẶP SINH 700 THÚ CƯNG
-- =================================================================
DECLARE @i INT = 1;
DECLARE @Target INT = 2000;

-- Lấy số lượng tối đa để random
DECLARE @MaxTen INT = (SELECT COUNT(*) FROM @TenPet);
DECLARE @MaxCho INT = (SELECT COUNT(*) FROM @GiongCho);
DECLARE @MaxMeo INT = (SELECT COUNT(*) FROM @GiongMeo);
-- Lấy Max ID Khách hàng hiện có (Giả sử ID liên tục vì mới reset)
DECLARE @MaxKH INT = (SELECT MAX(MaKH) FROM KHACH_HANG);

IF @MaxKH IS NULL
BEGIN
    PRINT 'LOI: Chua co du lieu KHACH_HANG. Vui long tao Khach hang truoc!';
    RETURN;
END

-- Biến lưu giá trị tạm
DECLARE @RandTen NVARCHAR(30);
DECLARE @Loai NVARCHAR(20);
DECLARE @Giong NVARCHAR(30);
DECLARE @RandKH INT;
DECLARE @GioiTinh NVARCHAR(10);
DECLARE @SucKhoe NVARCHAR(50);
DECLARE @RandVal BIGINT;

PRINT 'Dang sinh du lieu...';

WHILE @i <= @Target
BEGIN
    -- 3.1 Random Tên
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    SELECT @RandTen = Ten FROM @TenPet WHERE ID = (@RandVal % @MaxTen) + 1;

    -- 3.2 Random Loài & Giống (60% Chó, 40% Mèo)
    SET @RandVal = ABS(CAST(CHECKSUM(NEWID()) AS BIGINT));
    
    IF (@RandVal % 10) < 6 
    BEGIN
        SET @Loai = N'Chó';
        -- Random giống chó
        SELECT @Giong = Ten FROM @GiongCho WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxCho) + 1;
    END
    ELSE
    BEGIN
        SET @Loai = N'Mèo';
        -- Random giống mèo
        SELECT @Giong = Ten FROM @GiongMeo WHERE ID = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxMeo) + 1;
    END

    -- 3.3 Random Chủ sở hữu (Lấy ngẫu nhiên 1 khách hàng trong 20k khách)
    -- Sử dụng phép MOD để lấy ID trong khoảng 1 -> MaxKH
    SET @RandKH = (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @MaxKH) + 1;

    -- 3.4 Random Giới tính
    SET @GioiTinh = CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2) = 0 THEN N'Đực' ELSE N'Cái' END;
    
    -- 3.5 Random Sức khỏe (90% Bình thường)
    IF (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 10) = 0 
        SET @SucKhoe = N'Đang điều trị'; 
    ELSE 
        SET @SucKhoe = N'Bình thường';

    -- 3.6 Insert
    INSERT INTO THU_CUNG (TenTC, Loai, Giong, NgaySinh, GioiTinh, TinhTrangSucKhoe, MaKH)
    VALUES (
        @RandTen,
        @Loai,
        @Giong,
        DATEADD(DAY, - (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 3000), GETDATE()), -- Tuổi từ 0-8 năm
        @GioiTinh,
        @SucKhoe,
        @RandKH
    );

    SET @i = @i + 1;
END
PRINT '-> OK: DA SINH XONG 2000 THU CUNG!';
GO


PRINT '=== BAT DAU SINH DU LIEU GIAO DICH  ===';

-- =================================================================
-- 1. DỌN DẸP DỮ LIỆU CŨ
-- =================================================================
PRINT '1. Don dep du lieu cu...';
DELETE FROM TT_KHAM_BENH;
DELETE FROM CT_HOA_DON_DV;
DELETE FROM CT_HOA_DON_SP;
DELETE FROM HOA_DON;
DBCC CHECKIDENT ('HOA_DON', RESEED, 0);

-- =================================================================
-- 2. TẠO BẢNG ÁNH XẠ (MAPPING)
-- =================================================================
PRINT '2. Tao bang anh xa ID...';

IF OBJECT_ID('tempdb..#MapKH') IS NOT NULL DROP TABLE #MapKH;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaKH INTO #MapKH FROM KHACH_HANG;
DECLARE @CntKH INT = (SELECT COUNT(*) FROM #MapKH);

IF OBJECT_ID('tempdb..#MapNV') IS NOT NULL DROP TABLE #MapNV;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaNV INTO #MapNV FROM NHAN_VIEN;
DECLARE @CntNV INT = (SELECT COUNT(*) FROM #MapNV);

IF OBJECT_ID('tempdb..#MapCN') IS NOT NULL DROP TABLE #MapCN;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaCN INTO #MapCN FROM CHI_NHANH;
DECLARE @CntCN INT = (SELECT COUNT(*) FROM #MapCN);

IF OBJECT_ID('tempdb..#MapSP') IS NOT NULL DROP TABLE #MapSP;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaSP, GiaBan INTO #MapSP FROM SAN_PHAM;
DECLARE @CntSP INT = (SELECT COUNT(*) FROM #MapSP);

IF OBJECT_ID('tempdb..#MapTC') IS NOT NULL DROP TABLE #MapTC;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaTC INTO #MapTC FROM THU_CUNG;
DECLARE @CntTC INT = (SELECT COUNT(*) FROM #MapTC);

-- Lấy ID dịch vụ Khám bệnh
DECLARE @MaDV_KhamBenh INT = (SELECT TOP 1 MaDV FROM DICH_VU WHERE LoaiDV LIKE N'%Khám%');
IF @MaDV_KhamBenh IS NULL SET @MaDV_KhamBenh = 1;

-- Kiểm tra dữ liệu nguồn
IF @CntKH = 0 OR @CntNV = 0 OR @CntSP = 0 OR @CntTC = 0
BEGIN
    PRINT 'LOI: Thieu du lieu nen tang (KH, NV, SP, TC). Vui long chay cac script tao du lieu truoc!';
    RETURN;
END

-- =================================================================
-- 3. SINH 100.000 HÓA ĐƠN
-- =================================================================
PRINT '3. Dang sinh 100.000 HOA_DON...';

IF OBJECT_ID('tempdb..#StagingHD') IS NOT NULL DROP TABLE #StagingHD;

-- Tạo bảng tạm chứa các ID Random đã tính toán sẵn
;WITH E1(N) AS (SELECT 1 FROM (VALUES (1),(1),(1),(1),(1),(1),(1),(1),(1),(1)) t(N)), 
      E2(N) AS (SELECT 1 FROM E1 a CROSS JOIN E1 b), 
      E4(N) AS (SELECT 1 FROM E2 a CROSS JOIN E2 b), 
      E5(N) AS (SELECT 1 FROM E4 a CROSS JOIN E1 b)
SELECT 
    DATEADD(MINUTE, - (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 525600), GETDATE()) AS NgayLap,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CntCN) + 1 AS RandCN,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CntKH) + 1 AS RandKH,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CntNV) + 1 AS RandNV,
    CASE WHEN (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2) = 0 THEN N'Tiền mặt' ELSE N'Chuyển khoản' END AS HinhThuc
INTO #StagingHD
FROM E5;

-- Insert vào bảng chính bằng cách JOIN (An toàn tuyệt đối)
INSERT INTO HOA_DON (NgayLap, TongTien, HinhThucThanhToan, MaCN, MaKH, MaNV)
SELECT S.NgayLap, 0, S.HinhThuc, CN.MaCN, KH.MaKH, NV.MaNV
FROM #StagingHD S
JOIN #MapCN CN ON S.RandCN = CN.RowID
JOIN #MapKH KH ON S.RandKH = KH.RowID
JOIN #MapNV NV ON S.RandNV = NV.RowID;

-- Tạo ánh xạ cho Hóa đơn vừa tạo
IF OBJECT_ID('tempdb..#MapHD') IS NOT NULL DROP TABLE #MapHD;
SELECT ROW_NUMBER() OVER(ORDER BY NEWID()) AS RowID, MaHD INTO #MapHD FROM HOA_DON;
DECLARE @CntHD INT = (SELECT COUNT(*) FROM #MapHD);

PRINT '   -> Xong HOA_DON.';

-- =================================================================
-- 4. SINH 100.000 CT_HOA_DON_SP (Fixed Logic)
-- =================================================================
PRINT '4. Dang sinh 100.000 CT_HOA_DON_SP...';

IF OBJECT_ID('tempdb..#StagingSP') IS NOT NULL DROP TABLE #StagingSP;

-- Tính trước ID Sản phẩm cần lấy cho mỗi hóa đơn
SELECT 
    MaHD,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CntSP) + 1 AS RandSP_ID,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 5) + 1 AS RandSL
INTO #StagingSP
FROM #MapHD;

-- Insert bằng cách JOIN (Thay vì CROSS APPLY lỗi)
INSERT INTO CT_HOA_DON_SP (MaHD, MaSP, SoLuong, DonGia)
SELECT 
    S.MaHD,
    P.MaSP,
    S.RandSL,
    P.GiaBan
FROM #StagingSP S
JOIN #MapSP P ON S.RandSP_ID = P.RowID;

PRINT '   -> Xong CT_HOA_DON_SP.';

-- =================================================================
-- 5. SINH 100.000 CT_HOA_DON_DV
-- =================================================================
PRINT '5. Dang sinh 100.000 CT_HOA_DON_DV...';

INSERT INTO CT_HOA_DON_DV (MaHD, MaDV, DonGia)
SELECT MaHD, @MaDV_KhamBenh, 150000 
FROM #MapHD;

PRINT '   -> Xong CT_HOA_DON_DV.';

-- =================================================================
-- 6. SINH 100.000 TT_KHAM_BENH (Fixed Logic)
-- =================================================================
PRINT '6. Dang sinh 100.000 TT_KHAM_BENH...';

-- Lấy danh sách MaHDDV
IF OBJECT_ID('tempdb..#MapHDDV') IS NOT NULL DROP TABLE #MapHDDV;
SELECT MaHDDV INTO #MapHDDV FROM CT_HOA_DON_DV WHERE MaDV = @MaDV_KhamBenh;

-- Tính trước ID Thú cưng và Bác sĩ Random
IF OBJECT_ID('tempdb..#StagingKB') IS NOT NULL DROP TABLE #StagingKB;
SELECT 
    MaHDDV,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CntTC) + 1 AS RandTC_ID,
    (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % @CntNV) + 1 AS RandNV_ID
INTO #StagingKB
FROM #MapHDDV;

-- Insert bằng cách JOIN
INSERT INTO TT_KHAM_BENH (MaHDDV, TrieuChung, ChuanDoan, ToaThuoc, NgayHenTaiKham, MaTC, BSPhuTrach)
SELECT 
    S.MaHDDV,
    N'Sốt, bỏ ăn', -- Có thể random thêm nếu cần
    N'Rối loạn tiêu hóa',
    N'Men tiêu hóa (2 gói)',
    DATEADD(DAY, 5, GETDATE()),
    TC.MaTC,
    NV.MaNV
FROM #StagingKB S
JOIN #MapTC TC ON S.RandTC_ID = TC.RowID
JOIN #MapNV NV ON S.RandNV_ID = NV.RowID;

PRINT '   -> Xong TT_KHAM_BENH.';

-- =================================================================
-- 7. CẬP NHẬT TỔNG TIỀN
-- =================================================================
PRINT '7. Cap nhat Tong Tien...';
;WITH TotalSP AS (
    SELECT MaHD, SUM(SoLuong * DonGia) AS TienSP FROM CT_HOA_DON_SP GROUP BY MaHD
),
TotalDV AS (
    SELECT MaHD, SUM(DonGia) AS TienDV FROM CT_HOA_DON_DV GROUP BY MaHD
)
UPDATE HD
SET TongTien = ISNULL(T1.TienSP, 0) + ISNULL(T2.TienDV, 0)
FROM HOA_DON HD
LEFT JOIN TotalSP T1 ON HD.MaHD = T1.MaHD
LEFT JOIN TotalDV T2 ON HD.MaHD = T2.MaHD;

-- Dọn dẹp
DROP TABLE #MapKH; DROP TABLE #MapNV; DROP TABLE #MapCN; DROP TABLE #MapSP; DROP TABLE #MapTC;
DROP TABLE #StagingHD; DROP TABLE #MapHD; DROP TABLE #StagingSP; DROP TABLE #MapHDDV; DROP TABLE #StagingKB;

PRINT '=== HOAN TAT! ===';

GO



SET NOCOUNT ON; -- Tắt thông báo "1 row affected" để chạy nhanh hơn
---------------------------------------------------------------------------
-- BƯỚC 1: CHUẨN BỊ DỮ LIỆU CỐ ĐỊNH (Lấy ID có sẵn để random)
---------------------------------------------------------------------------
DECLARE @MaCN INT = (SELECT TOP 1 MaCN FROM CHI_NHANH);
DECLARE @MaKH INT = (SELECT TOP 1 MaKH FROM KHACH_HANG);
DECLARE @MaNV INT = (SELECT TOP 1 MaNV FROM NHAN_VIEN);
DECLARE @MaBS INT = (SELECT TOP 1 MaNV FROM NHAN_VIEN WHERE ChucVu = N'Bác sĩ');
DECLARE @MaTC INT = (SELECT TOP 1 MaTC FROM THU_CUNG);
DECLARE @MaDV_Tiem INT = (SELECT TOP 1 MaDV FROM DICH_VU WHERE LoaiDV LIKE N'%Tiêm%');

-- Kiểm tra nếu thiếu dữ liệu thì báo lỗi
IF @MaCN IS NULL OR @MaKH IS NULL OR @MaTC IS NULL OR @MaDV_Tiem IS NULL
BEGIN
    PRINT N'Lỗi: Database thiếu dữ liệu nền (Chi nhánh, Khách, Thú cưng...). Vui lòng chạy script insert mẫu trước.';
    RETURN;
END

PRINT N'Bắt đầu quá trình sinh 100.000 dữ liệu tiêm phòng...';
DECLARE @StartTime DATETIME = GETDATE();

---------------------------------------------------------------------------
-- BƯỚC 2: CHẠY VÒNG LẶP INSERT THEO LÔ (BATCH)
---------------------------------------------------------------------------
DECLARE @BatchSize INT = 1000; -- Số lượng dòng mỗi lần insert
DECLARE @TotalRows INT = 100000; -- Tổng số dòng muốn tạo
DECLARE @i INT = 0;
DECLARE @CurrentCount INT = 0; -- Biến dùng để in tiến độ
DECLARE @Msg NVARCHAR(100);    -- Biến lưu thông báo

-- Tạo bảng tạm để lưu ID trung gian
CREATE TABLE #TempHD (NewMaHD INT, RandomDate DATETIME);
CREATE TABLE #TempHDDV (NewMaHDDV INT, NewMaHD INT);

WHILE @i < (@TotalRows / @BatchSize)
BEGIN
    BEGIN TRANSACTION; 

    -- 2.1. Tạo 1000 Hóa đơn mới 
    INSERT INTO HOA_DON (NgayLap, TongTien, HinhThucThanhToan, MaCN, MaKH, MaNV)
    OUTPUT inserted.MaHD, inserted.NgayLap INTO #TempHD(NewMaHD, RandomDate)
    SELECT 
        DATEADD(DAY, -ABS(CHECKSUM(NEWID()) % 730), GETDATE()), 
        0, 
        N'Tiền mặt', @MaCN, @MaKH, @MaNV
    FROM 
        (SELECT TOP (@BatchSize) 1 AS X FROM sys.all_objects AS o1 CROSS JOIN sys.all_objects AS o2) AS T;

    -- 2.2. Tạo 1000 dòng CT_HOA_DON_DV tương ứng
    INSERT INTO CT_HOA_DON_DV (MaHD, MaDV, DonGia)
    OUTPUT inserted.MaHDDV, inserted.MaHD INTO #TempHDDV(NewMaHDDV, NewMaHD)
    SELECT 
        NewMaHD, 
        @MaDV_Tiem, 
        150000 
    FROM #TempHD;

    -- 2.3. Tạo 1000 dòng TT_TIEM_PHONG tương ứng
    INSERT INTO TT_TIEM_PHONG (MaHDDV, LoaiVacXin, LieuLuong, MaTC, NguoiTiem, NgayTiem)
    SELECT 
        T2.NewMaHDDV, 
        N'Vacxin 7 bệnh (Auto)', 
        N'1 Liều', 
        @MaTC, 
        @MaBS,
        T1.RandomDate
    FROM #TempHD T1
    JOIN #TempHDDV T2 ON T1.NewMaHD = T2.NewMaHD;

    -- 2.4. Cập nhật Tổng tiền 
    UPDATE HD
    SET TongTien = 150000
    FROM HOA_DON HD
    JOIN #TempHD T ON HD.MaHD = T.NewMaHD;

    -- Dọn dẹp bảng tạm 
    TRUNCATE TABLE #TempHD;
    TRUNCATE TABLE #TempHDDV;

    COMMIT TRANSACTION;
    
    -- Tăng biến đếm 
    SET @i = @i + 1;
    
    -- In tiến độ (Đã sửa lỗi cú pháp)
    IF @i % 10 = 0 
    BEGIN
        SET @CurrentCount = @i * @BatchSize;
        SET @Msg = N'Đã xử lý: ' + CAST(@CurrentCount AS NVARCHAR(20)) + N' / 100.000 dòng...';
        RAISERROR (@Msg, 0, 1) WITH NOWAIT;
    END
END

-- Xóa bảng tạm
DROP TABLE #TempHD;
DROP TABLE #TempHDDV;

---------------------------------------------------------------------------
-- KẾT QUẢ
---------------------------------------------------------------------------
DECLARE @EndTime DATETIME = GETDATE();
DECLARE @Duration INT = DATEDIFF(SECOND, @StartTime, @EndTime);


DECLARE @CountHD INT;
DECLARE @CountDV INT;
DECLARE @CountTP INT;

-- Lấy số lượng vào biến trước
SELECT @CountHD = COUNT(*) FROM HOA_DON;
SELECT @CountDV = COUNT(*) FROM CT_HOA_DON_DV;
SELECT @CountTP = COUNT(*) FROM TT_TIEM_PHONG;

-- Sau đó mới in biến ra
PRINT N'==================================================';
PRINT N'=== HOÀN TẤT! ===';
GO

DECLARE @KH1 INT = (SELECT TOP 1 MaKH FROM KHACH_HANG ORDER BY MaKH ASC); -- Khách đầu tiên
DECLARE @KH2 INT = (SELECT TOP 1 MaKH FROM KHACH_HANG ORDER BY MaKH DESC); -- Khách cuối cùng
DECLARE @CN1 INT = (SELECT TOP 1 MaCN FROM CHI_NHANH ORDER BY MaCN ASC);
DECLARE @CN2 INT = (SELECT TOP 1 MaCN FROM CHI_NHANH ORDER BY MaCN DESC);

INSERT INTO DANH_GIA (MaKH, MaCN, NgayDanhGia, DiemChatLuongDV, DiemThaiDoNV, MDHaiLongTT, BinhLuan) VALUES
-- Đánh giá 1: Khen ngợi hết lời
(@KH1, @CN1, DATEADD(DAY, -10, GETDATE()), 5, 5, 5, N'Bác sĩ rất mát tay, bé mèo nhà mình tiêm xong vẫn vui vẻ, không bị sốt. Tuyệt vời!'),

-- Đánh giá 2: Hài lòng nhưng góp ý nhỏ
(@KH2, @CN1, DATEADD(DAY, -5, GETDATE()), 4, 5, 4, N'Nhân viên nhiệt tình, tư vấn kỹ. Tuy nhiên chỗ để xe hơi chật vào giờ cao điểm.'),

-- Đánh giá 3: Phàn nàn nhẹ (để test dữ liệu xấu)
(@KH1, @CN2, DATEADD(DAY, -3, GETDATE()), 3, 2, 3, N'Dịch vụ ổn nhưng nhân viên tiếp tân làm thủ tục hơi lâu, mình phải chờ 30 phút.'),

-- Đánh giá 4: Rất hài lòng về spa
(@KH2, @CN2, DATEADD(DAY, -1, GETDATE()), 5, 5, 5, N'Dịch vụ Spa cắt tỉa lông rất đẹp, bé cún nhà mình thơm phức. Sẽ quay lại.'),

-- Đánh giá 5: Trung bình
(@KH1, @CN1, GETDATE(), 3, 3, 3, N'Mọi thứ ở mức chấp nhận được, giá hơi cao so với mặt bằng chung.');
GO

-----------------------------------------------------------
-- 2. THÊM 5 LỊCH SỬ ĐIỀU ĐỘNG (LICH_SU_DIEU_DONG)
-----------------------------------------------------------
-- Lấy ID Nhân viên và Chi nhánh
DECLARE @NV1 INT = (SELECT TOP 1 MaNV FROM NHAN_VIEN ORDER BY MaNV ASC);
DECLARE @NV2 INT = (SELECT TOP 1 MaNV FROM NHAN_VIEN ORDER BY MaNV DESC);
DECLARE @CN_Goc INT = (SELECT TOP 1 MaCN FROM CHI_NHANH ORDER BY MaCN ASC); -- Chi nhánh A
DECLARE @CN_Dich INT = (SELECT TOP 1 MaCN FROM CHI_NHANH ORDER BY MaCN DESC); -- Chi nhánh B

-- Giả sử DB bạn có ít nhất 2 chi nhánh, nếu chỉ có 1 thì CN_Goc và CN_Dich sẽ giống nhau (vẫn insert được nhưng logic hơi lạ chút)

INSERT INTO LICH_SU_DIEU_DONG (NgayChuyen, MaNV, MaCN_Cu, MaCN_Moi, LyDo) VALUES
-- Lần 1: Hỗ trợ khai trương
(DATEADD(MONTH, -6, GETDATE()), @NV1, @CN_Goc, @CN_Dich, N'Điều động hỗ trợ kỹ thuật cho chi nhánh mới khai trương.'),

-- Lần 2: Luân chuyển định kỳ
(DATEADD(MONTH, -4, GETDATE()), @NV2, @CN_Dich, @CN_Goc, N'Luân chuyển nhân sự định kỳ theo quy định công ty.'),

-- Lần 3: Thăng chức
(DATEADD(MONTH, -3, GETDATE()), @NV1, @CN_Dich, @CN_Goc, N'Bổ nhiệm làm Quản lý chi nhánh chính sau thời gian công tác tốt.'),

-- Lần 4: Nhu cầu cá nhân
(DATEADD(MONTH, -1, GETDATE()), @NV2, @CN_Goc, @CN_Dich, N'Nhân viên xin chuyển công tác về gần nhà.'),

-- Lần 5: Tăng cường nhân sự mùa cao điểm
(GETDATE(), @NV1, @CN_Goc, @CN_Dich, N'Tăng cường bác sĩ thú y cho mùa tiêm phòng cao điểm.');
GO

-----------------------------------------------------------
-- KIỂM TRA KẾT QUẢ
-----------------------------------------------------------
PRINT N'=== ĐÁNH GIÁ MỚI ===';
SELECT MaDG, MaKH, DiemChatLuongDV, MDHaiLongTT, LEFT(BinhLuan, 50) + '...' AS TrichDan FROM DANH_GIA;

PRINT N'=== LỊCH SỬ ĐIỀU ĐỘNG MỚI ===';
SELECT MaDD, NgayChuyen, MaNV, MaCN_Cu, MaCN_Moi, LyDo FROM LICH_SU_DIEU_DONG;
GO

PRINT N'=== HOÀN TẤT TOÀN BỘ DỮ LIỆU! ===';

SELECT N'1. HANG_THANH_VIEN' AS TenBang, COUNT(*) AS SoLuong FROM HANG_THANH_VIEN
UNION ALL
SELECT N'2. CHI_NHANH', COUNT(*) FROM CHI_NHANH
UNION ALL
SELECT N'3. DICH_VU', COUNT(*) FROM DICH_VU
UNION ALL
SELECT N'4. DICH_VU_CUNG_CAP', COUNT(*) FROM DICH_VU_CUNG_CAP
UNION ALL
SELECT N'5. GOI_TIEM', COUNT(*) FROM GOI_TIEM
UNION ALL
SELECT N'6. SAN_PHAM', COUNT(*) FROM SAN_PHAM
UNION ALL
SELECT N'7. NHAN_VIEN', COUNT(*) FROM NHAN_VIEN
UNION ALL
SELECT N'8. LICH_SU_DIEU_DONG', COUNT(*) FROM LICH_SU_DIEU_DONG
UNION ALL
SELECT N'9. KHACH_HANG', COUNT(*) FROM KHACH_HANG
UNION ALL
SELECT N'10. THU_CUNG', COUNT(*) FROM THU_CUNG
UNION ALL
SELECT N'11. HOA_DON', COUNT(*) FROM HOA_DON
UNION ALL
SELECT N'12. CT_HOA_DON_SP', COUNT(*) FROM CT_HOA_DON_SP
UNION ALL
SELECT N'13. CT_HOA_DON_DV', COUNT(*) FROM CT_HOA_DON_DV
UNION ALL
SELECT N'14. TT_KHAM_BENH', COUNT(*) FROM TT_KHAM_BENH
UNION ALL
SELECT N'15. TT_TIEM_PHONG', COUNT(*) FROM TT_TIEM_PHONG
UNION ALL
SELECT N'16. DANH_GIA', COUNT(*) FROM DANH_GIA
ORDER BY SoLuong DESC; -- Sắp xếp để thấy bảng nào nhiều dữ liệu nhất lên đầu
GO