USE PetCareX;
GO
CREATE OR ALTER FUNCTION dbo.fn_TinhTongTienHoaDon (@MaHD INT)
RETURNS DECIMAL(18,0)
AS
BEGIN
    DECLARE @TongTien DECIMAL(18,0) = 0;

    SELECT @TongTien = ISNULL(SUM(ctsp.SoLuong * ctsp.DonGia), 0)
    FROM CT_HOA_DON_SP ctsp
    WHERE ctsp.MaHD = @MaHD;

    SELECT @TongTien = @TongTien + ISNULL(SUM(ctdv.DonGia), 0)
    FROM CT_HOA_DON_DV ctdv
    WHERE ctdv.MaHD = @MaHD;

    RETURN @TongTien;
END
GO
-- 1. Tính điểm Loyalty tích lũy từ một hóa đơn (1 điểm = 50.000 VND)
CREATE OR ALTER FUNCTION dbo.fn_TinhDiemLoyaltyTuHoaDon (@MaHD INT)
RETURNS INT
AS
BEGIN
    RETURN FLOOR(dbo.fn_TinhTongTienHoaDon(@MaHD) / 50000);
END
GO
-- 2. Xác định hạng thành viên dự kiến của khách hàng (dựa trên chi tiêu năm hiện tại)
CREATE OR ALTER FUNCTION dbo.fn_TongChiTieuNam (@MaKH INT, @Nam INT)
RETURNS DECIMAL(18,0)
AS
BEGIN
    RETURN (
        SELECT ISNULL(SUM(
            ISNULL(ctsp.TienSP,0) + ISNULL(ctdv.TienDV,0)
        ),0)
        FROM HOA_DON hd
        LEFT JOIN (
            SELECT MaHD, SUM(SoLuong * DonGia) AS TienSP
            FROM CT_HOA_DON_SP
            GROUP BY MaHD
        ) ctsp ON hd.MaHD = ctsp.MaHD
        LEFT JOIN (
            SELECT MaHD, SUM(DonGia) AS TienDV
            FROM CT_HOA_DON_DV
            GROUP BY MaHD
        ) ctdv ON hd.MaHD = ctdv.MaHD
        WHERE hd.MaKH = @MaKH
          AND YEAR(hd.NgayLap) = @Nam
    );
END
GO

-- 3. Kiểm tra thú cưng có đang thuộc gói tiêm nào còn hiệu lực không
CREATE OR ALTER FUNCTION dbo.fn_KiemTraGoiTiemConHieuLuc 
(
    @MaTC INT,
    @NgayKiemTra DATE = NULL
)
RETURNS BIT
AS
BEGIN
    IF @NgayKiemTra IS NULL 
        SET @NgayKiemTra = CAST(GETDATE() AS DATE);

    IF EXISTS (
        SELECT 1
        FROM TT_TIEM_PHONG tp
        JOIN GOI_TIEM gt ON tp.MaGoi = gt.MaGoi
        WHERE tp.MaTC = @MaTC
          AND DATEADD(MONTH, gt.ThoiGian, tp.NgayTiem) >= @NgayKiemTra
    )
        RETURN 1;
    RETURN 0;
END
GO
-- 4. Tính phần trăm ưu đãi từ gói tiêm (nếu có) cho một lần tiêm dịch vụ
CREATE OR ALTER FUNCTION dbo.fn_UuDaiGoiTiem (@MaHDDV INT)
RETURNS INT
AS
BEGIN
    RETURN (
        SELECT ISNULL(gt.UuDai, 0)
        FROM CT_HOA_DON_DV dv
        LEFT JOIN TT_TIEM_PHONG tp ON dv.MaHDDV = tp.MaHDDV
        LEFT JOIN GOI_TIEM gt ON tp.MaGoi = gt.MaGoi
        WHERE dv.MaHDDV = @MaHDDV
    );
END
GO


-- 5. Lấy lịch sử khám bệnh của một thú cưng (Table-valued)
CREATE OR ALTER FUNCTION dbo.fn_LichSuKhamBenh (@MaTC INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        kb.NgayKham,
        kb.TrieuChung,
        kb.ChuanDoan,
        kb.ToaThuoc,
        kb.NgayHenTaiKham,
        nv.HoTen AS BacSi,
        hd.MaHD
    FROM TT_KHAM_BENH kb
    JOIN NHAN_VIEN nv ON kb.BSPhuTrach = nv.MaNV
    JOIN CT_HOA_DON_DV dv ON kb.MaHDDV = dv.MaHDDV
    JOIN HOA_DON hd ON dv.MaHD = hd.MaHD
    WHERE kb.MaTC = @MaTC
);
GO

-- 6. Lấy lịch sử tiêm phòng của một thú cưng (Table-valued)
CREATE OR ALTER FUNCTION dbo.fn_LichSuTiemPhong (@MaTC INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        tp.NgayTiem,
        tp.LoaiVacXin,
        tp.LieuLuong,
        gt.TenGoi,
        nv.HoTen AS NguoiTiem,
        hd.MaHD
    FROM TT_TIEM_PHONG tp
    LEFT JOIN GOI_TIEM gt ON tp.MaGoi = gt.MaGoi
    JOIN NHAN_VIEN nv ON tp.NguoiTiem = nv.MaNV
    JOIN CT_HOA_DON_DV dv ON tp.MaHDDV = dv.MaHDDV
    JOIN HOA_DON hd ON dv.MaHD = hd.MaHD
    WHERE tp.MaTC = @MaTC
);
GO

-- 7. Tính doanh thu của một chi nhánh trong khoảng thời gian
CREATE OR ALTER FUNCTION dbo.fn_DoanhThuChiNhanh 
(
    @MaCN INT,
    @TuNgay DATE,
    @DenNgay DATE
)
RETURNS DECIMAL(18,0)
AS
BEGIN
    RETURN (
        SELECT ISNULL(SUM(dbo.fn_TinhTongTienHoaDon(hd.MaHD)),0)
        FROM HOA_DON hd
        WHERE hd.MaCN = @MaCN
          AND CAST(hd.NgayLap AS DATE) BETWEEN @TuNgay AND @DenNgay
    );
END
GO
-- 8. Thống kê số lượng khách hàng theo từng hạng thành viên (có thể lọc theo năm)
CREATE OR ALTER FUNCTION dbo.fn_SoKhachHangTheoHang (@Nam INT = NULL)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        htv.TenHang,
        COUNT(DISTINCT kh.MaKH) AS SoLuongKhachHang
    FROM HANG_THANH_VIEN htv
    LEFT JOIN KHACH_HANG kh ON htv.MaHang = kh.MaHang
    WHERE @Nam IS NULL
       OR EXISTS (
            SELECT 1
            FROM HOA_DON hd
            WHERE hd.MaKH = kh.MaKH
              AND YEAR(hd.NgayLap) = @Nam
       )
    GROUP BY htv.TenHang
);
GO
