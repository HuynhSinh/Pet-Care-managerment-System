USE PetCareX;
GO
-- 1. Trigger cập nhật điểm Loyalty khi tạo hóa đơn
CREATE OR ALTER TRIGGER trg_CapNhatDiemLoyalty
ON HOA_DON
AFTER INSERT
AS
BEGIN
    UPDATE kh
    SET kh.DiemLoyalty = ISNULL(kh.DiemLoyalty, 0) 
        + dbo.fn_TinhDiemLoyaltyTuHoaDon(i.MaHD)
    FROM KHACH_HANG kh
    JOIN inserted i ON kh.MaKH = i.MaKH;
END
GO
-- 2. Trigger tự động cập nhật hạng thành viên của khách hàng
CREATE OR ALTER TRIGGER trg_CapNhatHangThanhVien
ON HOA_DON
AFTER INSERT
AS
BEGIN
    UPDATE kh
    SET MaHang = CASE
        WHEN dbo.fn_TongChiTieuNam(kh.MaKH, YEAR(GETDATE())) >= 8000000 THEN 3
        WHEN dbo.fn_TongChiTieuNam(kh.MaKH, YEAR(GETDATE())) >= 5000000 THEN 2
        ELSE 1
    END
    FROM KHACH_HANG kh
    JOIN inserted i ON kh.MaKH = i.MaKH;
END
GO

-- 3. Trigger kiểm tra tồn kho khi thêm chi tiết hóa đơn sản phẩm
CREATE OR ALTER TRIGGER trg_KiemTraTonKho
ON CT_HOA_DON_SP
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tồn kho
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN SAN_PHAM sp ON i.MaSP = sp.MaSP
        WHERE i.SoLuong > sp.SoLuongTonKho
    )
    BEGIN
        RAISERROR (N'Số lượng sản phẩm trong kho không đủ', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- 2. Insert chi tiết hóa đơn (KHÔNG insert cột IDENTITY)
    INSERT INTO CT_HOA_DON_SP (MaHD, MaSP, SoLuong, DonGia)
    SELECT MaHD, MaSP, SoLuong, DonGia
    FROM inserted;

    -- 3. Trừ tồn kho
    UPDATE sp
    SET sp.SoLuongTonKho = sp.SoLuongTonKho - i.SoLuong
    FROM SAN_PHAM sp
    JOIN inserted i ON sp.MaSP = i.MaSP;
END
GO

-- 4. Trigger kiểm tra gói tiêm còn hiệu lực
CREATE OR ALTER TRIGGER trg_KiemTraGoiTiem
ON TT_TIEM_PHONG
AFTER INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN GOI_TIEM gt ON i.MaGoi = gt.MaGoi
        WHERE DATEADD(MONTH, gt.ThoiGian, i.NgayTiem) < GETDATE()
    )
    BEGIN
        RAISERROR (N'Gói tiêm đã hết hiệu lực', 16, 1);
        ROLLBACK TRANSACTION;
    END
END
GO
