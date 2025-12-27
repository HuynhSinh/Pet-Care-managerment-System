USE PetCareX;
GO

-- 1. Báo cáo doanh thu theo ngày/tháng/quý/năm của một chi nhánh
CREATE OR ALTER PROCEDURE usp_BaoCaoDoanhThuChiNhNhanh
    @MaCN INT = NULL,
    @TuNgay DATE,
    @DenNgay DATE,
    @NhomTheo NVARCHAR(20) = 'ngay' -- 'ngay', 'thang', 'quy', 'nam'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Ky,
        ChiNhanh,
        SUM(DoanhThu) AS DoanhThu
    FROM (
        SELECT
            CASE @NhomTheo
                WHEN 'ngay'   THEN CONVERT(VARCHAR(10), hd.NgayLap, 103)
                WHEN 'thang'  THEN FORMAT(hd.NgayLap, 'MM/yyyy')
                WHEN 'quy'    THEN 'Quý ' + CAST(DATEPART(QUARTER, hd.NgayLap) AS VARCHAR) + '/' + CAST(YEAR(hd.NgayLap) AS VARCHAR)
                WHEN 'nam'    THEN CAST(YEAR(hd.NgayLap) AS VARCHAR)
            END AS Ky,
            ISNULL(cn.TenCN, N'Toàn hệ thống') AS ChiNhanh,
            dbo.fn_TinhTongTienHoaDon(hd.MaHD) AS DoanhThu,
            hd.NgayLap
        FROM HOA_DON hd
        LEFT JOIN CHI_NHANH cn ON hd.MaCN = cn.MaCN
        WHERE CAST(hd.NgayLap AS DATE) BETWEEN @TuNgay AND @DenNgay
          AND (@MaCN IS NULL OR hd.MaCN = @MaCN)
    ) AS Sub
    GROUP BY Ky, ChiNhanh
    ORDER BY MIN(NgayLap);
END
GO

-- 2. Thống kê các loại vắc-xin được tiêm nhiều nhất trong khoảng thời gian
CREATE OR ALTER PROCEDURE usp_TopVacXin
    @Top INT = 10,
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SELECT TOP (@Top)
        tp.LoaiVacXin,
        COUNT(*) AS SoLanTiem,
        COUNT(DISTINCT tp.MaTC) AS SoThuCung
    FROM TT_TIEM_PHONG tp
    JOIN CT_HOA_DON_DV dv ON tp.MaHDDV = dv.MaHDDV
    JOIN HOA_DON hd ON dv.MaHD = hd.MaHD
    WHERE (@TuNgay IS NULL OR CAST(hd.NgayLap AS DATE) >= @TuNgay)
      AND (@DenNgay IS NULL OR CAST(hd.NgayLap AS DATE) <= @DenNgay)
    GROUP BY tp.LoaiVacXin
    ORDER BY SoLanTiem DESC;
END
GO

-- 3. Báo cáo tồn kho sản phẩm bán lẻ (cảnh báo sắp hết hàng)
-- Sửa lại usp_TonKhoSanPham (chỉ hiển thị sản phẩm sắp hết hoặc dưới ngưỡng)
CREATE OR ALTER PROCEDURE usp_TonKhoSanPham
    @NguongCanhBao INT = 10  -- Tồn kho <= ngưỡng này sẽ được liệt kê
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MaSP,
        TenSP,
        LoaiSP,
        SoLuongTonKho,
        CASE 
            WHEN SoLuongTonKho <= @NguongCanhBao THEN N'Sắp hết hàng'
            ELSE N'Bình thường'
        END AS TrangThai
    FROM SAN_PHAM
    WHERE SoLuongTonKho <= @NguongCanhBao  -- CHỈ LẤY NHỮNG SẢN PHẨM DƯỚI HOẶC BẰNG NGƯỠNG
    ORDER BY SoLuongTonKho ASC;
END
GO

-- 4. Thống kê số lượng khách hàng theo hạng thành viên (cấp công ty)
CREATE OR ALTER PROCEDURE usp_ThongKeHoiVien
AS
BEGIN
    SELECT 
        htv.TenHang,
        COUNT(kh.MaKH) AS SoLuongKhachHang,
        CAST(100.0 * COUNT(kh.MaKH) / SUM(COUNT(kh.MaKH)) OVER() AS DECIMAL(5,2)) AS TyLePhanTram
    FROM HANG_THANH_VIEN htv
    LEFT JOIN KHACH_HANG kh ON htv.MaHang = kh.MaHang
    GROUP BY htv.MaHang, htv.TenHang
    ORDER BY htv.MaHang;
END
GO

-- 5. Dịch vụ mang lại doanh thu cao nhất trong khoảng thời gian
CREATE OR ALTER PROCEDURE usp_TopDichVuDoanhThu
    @SoTop INT = 5,
    @ThangGanNhat INT = 6
AS
BEGIN
    DECLARE @TuNgay DATE = DATEADD(MONTH, -@ThangGanNhat, CAST(GETDATE() AS DATE));

    SELECT TOP (@SoTop)
        d.LoaiDV,
        COUNT(*) AS SoLanThucHien,
        SUM(ctdv.DonGia) AS DoanhThu
    FROM CT_HOA_DON_DV ctdv
    JOIN HOA_DON hd ON ctdv.MaHD = hd.MaHD
    JOIN DICH_VU d ON ctdv.MaDV = d.MaDV
    WHERE hd.NgayLap >= @TuNgay
    GROUP BY d.MaDV, d.LoaiDV
    ORDER BY DoanhThu DESC;
END
GO
-- 6. Khách hàng lâu chưa quay lại (cấp chi nhánh)
CREATE OR ALTER PROCEDURE usp_KhachHangLauChuaQuayLai
    @MaCN INT = NULL,
    @SoThang INT = 6
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayCat DATE = DATEADD(MONTH, -@SoThang, CAST(GETDATE() AS DATE));

    WITH LanCuoi AS (
        SELECT
            kh.MaKH,
            kh.TenKH,
            kh.SDT,
            cn.MaCN,
            cn.TenCN,
            hd.NgayLap,
            ROW_NUMBER() OVER (
                PARTITION BY kh.MaKH
                ORDER BY hd.NgayLap DESC
            ) AS rn
        FROM KHACH_HANG kh
        JOIN HOA_DON hd ON kh.MaKH = hd.MaKH
        JOIN CHI_NHANH cn ON hd.MaCN = cn.MaCN
    )
    SELECT
        MaKH,
        TenKH,
        SDT,
        TenCN AS ChiNhanhCuoi,
        NgayLap AS LanCuoiDen
    FROM LanCuoi
    WHERE rn = 1
      AND NgayLap < @NgayCat
      AND (@MaCN IS NULL OR MaCN = @MaCN)
    ORDER BY NgayLap DESC;
END
GO

-- 7. Hiệu suất nhân viên (số hóa đơn + điểm đánh giá trung bình)
CREATE OR ALTER PROCEDURE usp_HieuSuatNhanVien
    @MaCN INT = NULL,
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        nv.MaNV,
        nv.HoTen,
        nv.ChucVu,
        cn.TenCN,
        COUNT(DISTINCT hd.MaHD) AS SoHoaDonLap,
        dgcn.DiemDanhGiaTrungBinh -- điểm của chi nhánh
    FROM NHAN_VIEN nv
    LEFT JOIN HOA_DON hd
        ON nv.MaNV = hd.MaNV
        AND (@TuNgay IS NULL OR hd.NgayLap >= @TuNgay)
        AND (
            @DenNgay IS NULL 
            OR hd.NgayLap < DATEADD(DAY, 1, @DenNgay)
        )
    LEFT JOIN CHI_NHANH cn ON nv.MaCN = cn.MaCN

    -- SUBQUERY TÍNH ĐIỂM ĐÁNH GIÁ CHI NHÁNH
    LEFT JOIN (
        SELECT 
            MaCN,
            AVG(CAST(DiemThaiDoNV AS FLOAT)) AS DiemDanhGiaTrungBinh
        FROM DANH_GIA
        GROUP BY MaCN
    ) dgcn ON dgcn.MaCN = nv.MaCN

    WHERE (@MaCN IS NULL OR nv.MaCN = @MaCN)
    GROUP BY 
        nv.MaNV,
        nv.HoTen,
        nv.ChucVu,
        cn.TenCN,
        dgcn.DiemDanhGiaTrungBinh
    ORDER BY SoHoaDonLap DESC;
END
GO


-- 8. Thống kê thú cưng theo loài và giống (cấp công ty)
CREATE OR ALTER PROCEDURE usp_ThongKeThuCungTheoLoaiGiong
AS
BEGIN
    SELECT 
        tc.Loai,
        tc.Giong,
        COUNT(*) AS SoLuong,
        COUNT(DISTINCT tc.MaKH) AS SoChuNhan
    FROM THU_CUNG tc
    GROUP BY tc.Loai, tc.Giong
    ORDER BY SoLuong DESC;
END
GO

-- 9. Thống kê thú cưng theo hạng thành viên của chủ (Cơ bản/Thân thiết/VIP)
CREATE OR ALTER PROCEDURE usp_ThongKeThuCungTheoHangChu
AS
BEGIN
    SELECT 
        htv.TenHang,
        COUNT(tc.MaTC) AS SoLuongThuCung,
        COUNT(DISTINCT tc.MaKH) AS SoKhachHang
    FROM THU_CUNG tc
    JOIN KHACH_HANG kh ON tc.MaKH = kh.MaKH
    JOIN HANG_THANH_VIEN htv ON kh.MaHang = htv.MaHang
    GROUP BY htv.MaHang, htv.TenHang
    ORDER BY SoLuongThuCung DESC;
END
GO

-- 10. Tra cứu lịch sử khám + tiêm chủng đầy đủ của một thú cưng
CREATE OR ALTER PROCEDURE usp_LichSuChamSocThuCung
    @MaTC INT
AS
BEGIN
    SELECT *
    FROM (
        -- Lịch sử khám bệnh
        SELECT 
            N'Khám bệnh' AS Loai,
            kb.NgayKham AS Ngay,
            nv.HoTen AS NguoiThucHien,
            kb.TrieuChung AS MoTa1,
            kb.ChuanDoan AS MoTa2
        FROM TT_KHAM_BENH kb
        JOIN NHAN_VIEN nv ON kb.BSPhuTrach = nv.MaNV
        WHERE kb.MaTC = @MaTC

        UNION ALL

        -- Lịch sử tiêm phòng
        SELECT 
            N'Tiêm phòng' AS Loai,
            tp.NgayTiem AS Ngay,
            nv.HoTen AS NguoiThucHien,
            tp.LoaiVacXin AS MoTa1,
            gt.TenGoi AS MoTa2
        FROM TT_TIEM_PHONG tp
        LEFT JOIN GOI_TIEM gt ON tp.MaGoi = gt.MaGoi
        JOIN NHAN_VIEN nv ON tp.NguoiTiem = nv.MaNV
        WHERE tp.MaTC = @MaTC
    ) AS LichSu
    ORDER BY Ngay DESC;
END
GO
-- 11. Báo cáo danh sách thú cưng đã tiêm phòng trong khoảng thời gian (cấp chi nhánh hoặc toàn hệ thống)
CREATE OR ALTER PROCEDURE usp_DanhSachThuCungTiemPhong
    @MaCN INT = NULL,
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SELECT 
        tc.MaTC,
        tc.TenTC,
        tc.Loai,
        tc.Giong,
        kh.TenKH,
        kh.SDT,
        tp.LoaiVacXin,
        tp.NgayTiem,
        nv.HoTen AS NguoiTiem,
        cn.TenCN
    FROM TT_TIEM_PHONG tp
    JOIN THU_CUNG tc ON tp.MaTC = tc.MaTC
    JOIN KHACH_HANG kh ON tc.MaKH = kh.MaKH
    JOIN NHAN_VIEN nv ON tp.NguoiTiem = nv.MaNV
    JOIN CT_HOA_DON_DV dv ON tp.MaHDDV = dv.MaHDDV
    JOIN HOA_DON hd ON dv.MaHD = hd.MaHD
    JOIN CHI_NHANH cn ON hd.MaCN = cn.MaCN
    WHERE (@TuNgay IS NULL OR tp.NgayTiem >= @TuNgay)
      AND (@DenNgay IS NULL OR tp.NgayTiem < DATEADD(DAY, 1, @DenNgay))
      AND (@MaCN IS NULL OR hd.MaCN = @MaCN)
    ORDER BY tp.NgayTiem DESC;
END
GO
-- 12. Quản lý nhân viên chi nhánh: Danh sách nhân viên hiện tại theo chi nhánh
CREATE OR ALTER PROCEDURE usp_DanhSachNhanVienChiNhanh
    @MaCN INT = NULL  -- NULL = tất cả chi nhánh
AS
BEGIN
    SELECT 
        nv.MaNV,
        nv.HoTen,
        nv.ChucVu,
        nv.SDT,
        nv.NgayVaoLam,
        nv.LuongCoBan,
        cn.TenCN,
        cn.DiaChi
    FROM NHAN_VIEN nv
    JOIN CHI_NHANH cn ON nv.MaCN = cn.MaCN
    WHERE @MaCN IS NULL OR nv.MaCN = @MaCN
    ORDER BY cn.TenCN, nv.ChucVu, nv.HoTen;
END
GO

-- 13. Tra cứu dịch vụ đang cung cấp tại chi nhánh
CREATE OR ALTER PROCEDURE usp_DichVuTaiChiNhanh
    @MaCN INT
AS
BEGIN
    SELECT 
        cn.TenCN,
        dv.LoaiDV,
        dv.MoTa,
        CASE WHEN dvc.TrangThai = 1 THEN N'Đang cung cấp' ELSE N'Ngưng' END AS TrangThai
    FROM DICH_VU_CUNG_CAP dvc
    JOIN CHI_NHANH cn ON dvc.MaCN = cn.MaCN
    JOIN DICH_VU dv ON dvc.MaDV = dv.MaDV
    WHERE dvc.MaCN = @MaCN
    ORDER BY dv.LoaiDV;
END
GO

-- 14. Báo cáo điểm đánh giá trung bình của từng chi nhánh
CREATE OR ALTER PROCEDURE usp_DanhGiaChiNhanh
    @MaCN INT = NULL
AS
BEGIN
    SELECT
        cn.MaCN,
        cn.TenCN,
        COUNT(dg.MaDG) AS SoLuotDanhGia,
        CASE 
            WHEN COUNT(dg.DiemThaiDoNV) = 0 THEN 0
            ELSE AVG(CAST(dg.DiemThaiDoNV AS FLOAT))
        END AS DiemDanhGiaTrungBinh
    FROM CHI_NHANH cn
    LEFT JOIN DANH_GIA dg 
        ON cn.MaCN = dg.MaCN
    WHERE (@MaCN IS NULL OR cn.MaCN = @MaCN)
    GROUP BY cn.MaCN, cn.TenCN
    ORDER BY DiemDanhGiaTrungBinh DESC;
END
GO

-- 15. Top khách hàng chi tiêu nhiều nhất (cấp chi nhánh hoặc toàn hệ thống)
CREATE OR ALTER PROCEDURE usp_TopKhachHangChiTieu
    @MaCN INT = NULL,
    @Nam INT = NULL,
    @Top INT = 10
AS
BEGIN
    SELECT TOP (@Top)
        kh.MaKH,
        kh.TenKH,
        kh.SDT,
        CASE 
            WHEN @MaCN IS NULL THEN N'Toàn hệ thống'
            ELSE cn.TenCN
        END AS PhamViThongKe,
        SUM(dbo.fn_TinhTongTienHoaDon(hd.MaHD)) AS TongChiTieu
    FROM KHACH_HANG kh
    JOIN HOA_DON hd ON kh.MaKH = hd.MaKH
    JOIN CHI_NHANH cn ON hd.MaCN = cn.MaCN
    WHERE (@MaCN IS NULL OR hd.MaCN = @MaCN)
      AND (@Nam IS NULL OR YEAR(hd.NgayLap) = @Nam)
    GROUP BY kh.MaKH, kh.TenKH, kh.SDT,
             CASE 
                 WHEN @MaCN IS NULL THEN N'Toàn hệ thống'
                 ELSE cn.TenCN
             END
    ORDER BY TongChiTieu DESC;
END
GO

-- 16. Tra cứu vắc-xin theo tên, loại (LoaiVacXin), có thể thêm điều kiện ngày tiêm
CREATE OR ALTER PROCEDURE usp_TraCuuVacXin
    @TenVacXin NVARCHAR(100) = NULL,   -- tìm gần đúng
    @LoaiVacXin NVARCHAR(100) = NULL,  -- phân loại chính xác
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SELECT 
        tp.LoaiVacXin,
        tp.LieuLuong,
        tp.NgayTiem,
        tc.TenTC,
        tc.Loai AS LoaiThuCung,
        kh.TenKH,
        kh.SDT,
        cn.TenCN
    FROM TT_TIEM_PHONG tp
    JOIN THU_CUNG tc ON tp.MaTC = tc.MaTC
    JOIN KHACH_HANG kh ON tc.MaKH = kh.MaKH
    JOIN CT_HOA_DON_DV dv ON tp.MaHDDV = dv.MaHDDV
    JOIN HOA_DON hd ON dv.MaHD = hd.MaHD
    JOIN CHI_NHANH cn ON hd.MaCN = cn.MaCN
    WHERE (@TenVacXin IS NULL OR tp.LoaiVacXin LIKE N'%' + @TenVacXin + N'%')
      AND (@LoaiVacXin IS NULL OR tp.LoaiVacXin = @LoaiVacXin)
      AND (@TuNgay IS NULL OR tp.NgayTiem >= @TuNgay)
      AND (@DenNgay IS NULL OR tp.NgayTiem < DATEADD(DAY, 1, @DenNgay))
    ORDER BY tp.NgayTiem DESC;
END
GO


-- 17. Thống kê số lượng khách hàng theo chi nhánh (hoạt động + lâu chưa quay lại)
CREATE OR ALTER PROCEDURE usp_ThongKeKhachHangChiNhanh
    @MaCN INT = NULL,
    @SoThangLau INT = 6
AS
BEGIN
    DECLARE @NgayCat DATE = DATEADD(MONTH, -@SoThangLau, CAST(GETDATE() AS DATE));

    ;WITH LanCuoiKhachHang AS (
        SELECT 
            kh.MaKH,
            MAX(CASE 
                    WHEN @MaCN IS NULL OR hd.MaCN = @MaCN 
                    THEN hd.NgayLap 
                END) AS LanCuoiDen
        FROM KHACH_HANG kh
        LEFT JOIN HOA_DON hd ON kh.MaKH = hd.MaKH
        GROUP BY kh.MaKH
    )
    SELECT
        CASE 
            WHEN @MaCN IS NULL THEN N'Toàn hệ thống'
            ELSE cn.TenCN
        END AS ChiNhanh,
        COUNT(*) AS TongKhachHang,
        COUNT(CASE WHEN LanCuoiDen >= @NgayCat THEN 1 END) AS KhachHangHoatDong,
        COUNT(CASE WHEN LanCuoiDen < @NgayCat OR LanCuoiDen IS NULL THEN 1 END) AS KhachHangLauChuaQuayLai
    FROM LanCuoiKhachHang lckh
    LEFT JOIN CHI_NHANH cn ON cn.MaCN = @MaCN
    GROUP BY 
        CASE 
            WHEN @MaCN IS NULL THEN N'Toàn hệ thống'
            ELSE cn.TenCN
        END;
END
GO

