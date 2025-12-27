USE PetCareX;
GO

PRINT '=== BUOC 1: XOA CAC DOI TUONG PHU THUOC (FK, INDEX, PK) ===';

-- 1. Xóa các Khóa ngoại (Foreign Keys)
DECLARE @sql_fk NVARCHAR(MAX) = '';
SELECT @sql_fk += 'ALTER TABLE ' + QUOTENAME(OBJECT_NAME(parent_object_id)) + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys WHERE referenced_object_id = OBJECT_ID('HOA_DON');
EXEC sp_executesql @sql_fk;

-- 2. Xóa các Chỉ mục (Non-Clustered Indexes) đang chặn việc sửa cột
DECLARE @sql_idx NVARCHAR(MAX) = '';
SELECT @sql_idx += 'DROP INDEX ' + QUOTENAME(name) + ' ON ' + QUOTENAME(OBJECT_NAME(object_id)) + ';'
FROM sys.indexes 
WHERE object_id = OBJECT_ID('HOA_DON') AND type > 0 AND is_primary_key = 0;
EXEC sp_executesql @sql_idx;

-- 3. Xóa Khóa chính cũ (Primary Key)
DECLARE @sql_pk NVARCHAR(MAX) = '';
SELECT @sql_pk += 'ALTER TABLE HOA_DON DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.key_constraints WHERE type = 'PK' AND parent_object_id = OBJECT_ID('HOA_DON');
EXEC sp_executesql @sql_pk;

PRINT '-> Da don dep sach se cac doi tuong phu thuoc!';
GO

-- =========================================================
PRINT '=== BUOC 2: CAU HINH PARTITION ===';

-- Xóa Scheme và Function cũ nếu đã có
IF EXISTS (SELECT * FROM sys.partition_schemes WHERE name = 'ps_NgayLap') DROP PARTITION SCHEME ps_NgayLap;
IF EXISTS (SELECT * FROM sys.partition_functions WHERE name = 'pf_NgayLap') DROP PARTITION FUNCTION pf_NgayLap;
GO

-- Tạo lại hàm và scheme phân vùng
CREATE PARTITION FUNCTION pf_NgayLap (DATETIME) AS RANGE RIGHT FOR VALUES ('2025-01-01', '2026-01-01');
GO
CREATE PARTITION SCHEME ps_NgayLap AS PARTITION pf_NgayLap ALL TO ([PRIMARY]);
GO

-- =========================================================
PRINT '=== BUOC 3: SUA COT VA AP DUNG PARTITION ===';

-- Bây giờ có thể sửa cột thành NOT NULL vì không còn Index nào chặn nữa
ALTER TABLE HOA_DON ALTER COLUMN NgayLap DATETIME NOT NULL;
GO

-- Tạo lại Khóa chính kết hợp trên Partition Scheme
ALTER TABLE HOA_DON
ADD CONSTRAINT PK_HOA_DON_Partitioned 
PRIMARY KEY CLUSTERED (MaHD, NgayLap)
ON ps_NgayLap(NgayLap);
GO

-- =========================================================
PRINT '=== BUOC 4: KIEM TRA PHAN MANH DU LIEU ===';

SELECT 
    p.partition_number AS [Phân vùng số],
    p.rows AS [Số dòng trong ngăn],
    rv.value AS [Mốc thời gian bắt đầu ngăn]
FROM sys.partitions p
JOIN sys.indexes i ON p.object_id = i.object_id AND p.index_id = i.index_id
LEFT JOIN sys.partition_range_values rv ON rv.function_id = (SELECT function_id FROM sys.partition_functions WHERE name = 'pf_NgayLap') 
    AND p.partition_number = rv.boundary_id + 1
WHERE p.object_id = OBJECT_ID('HOA_DON') AND i.type <= 1;
GO