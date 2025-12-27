-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chi_nhanh (
  macn integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  tencn character varying NOT NULL,
  diachi character varying,
  sdt character varying,
  tgmocua time without time zone,
  tgdongcua time without time zone,
  CONSTRAINT chi_nhanh_pkey PRIMARY KEY (macn)
);
CREATE TABLE public.ct_hoa_don_dv (
  mahddv integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  mahd integer,
  madv integer,
  dongia numeric DEFAULT 0,
  CONSTRAINT ct_hoa_don_dv_pkey PRIMARY KEY (mahddv),
  CONSTRAINT fk_cthddv_hoadon FOREIGN KEY (mahd) REFERENCES public.hoa_don(mahd),
  CONSTRAINT fk_cthddv_dichvu FOREIGN KEY (madv) REFERENCES public.dich_vu(madv)
);
CREATE TABLE public.ct_hoa_don_sp (
  mahdsp integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  mahd integer,
  masp integer,
  soluong integer CHECK (soluong > 0),
  dongia numeric,
  CONSTRAINT ct_hoa_don_sp_pkey PRIMARY KEY (mahdsp),
  CONSTRAINT fk_cthdsp_hoadon FOREIGN KEY (mahd) REFERENCES public.hoa_don(mahd),
  CONSTRAINT fk_cthdsp_sanpham FOREIGN KEY (masp) REFERENCES public.san_pham(masp)
);
CREATE TABLE public.danh_gia (
  madg integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  makh integer,
  macn integer,
  ngaydanhgia timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  diemchatluongdv integer CHECK (diemchatluongdv >= 1 AND diemchatluongdv <= 5),
  diemthaidonv integer CHECK (diemthaidonv >= 1 AND diemthaidonv <= 5),
  mdhailongtt integer CHECK (mdhailongtt >= 1 AND mdhailongtt <= 5),
  binhluan text,
  CONSTRAINT danh_gia_pkey PRIMARY KEY (madg),
  CONSTRAINT fk_dg_khachhang FOREIGN KEY (makh) REFERENCES public.khach_hang(makh),
  CONSTRAINT fk_dg_chinhanh FOREIGN KEY (macn) REFERENCES public.chi_nhanh(macn)
);
CREATE TABLE public.dich_vu (
  madv integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  loaidv character varying NOT NULL,
  CONSTRAINT dich_vu_pkey PRIMARY KEY (madv)
);
CREATE TABLE public.dich_vu_cung_cap (
  madvcc integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  macn integer,
  madv integer,
  trangthai integer DEFAULT 1,
  CONSTRAINT dich_vu_cung_cap_pkey PRIMARY KEY (madvcc),
  CONSTRAINT fk_dvcc_cn FOREIGN KEY (macn) REFERENCES public.chi_nhanh(macn),
  CONSTRAINT fk_dvcc_dv FOREIGN KEY (madv) REFERENCES public.dich_vu(madv)
);
CREATE TABLE public.goi_tiem (
  magoi integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  tengoi character varying NOT NULL,
  thoigian integer,
  uudai integer,
  CONSTRAINT goi_tiem_pkey PRIMARY KEY (magoi)
);
CREATE TABLE public.hang_thanh_vien (
  mahang integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenhang character varying NOT NULL,
  chitieugiuhang numeric DEFAULT 0,
  chitieudathang numeric DEFAULT 0,
  CONSTRAINT hang_thanh_vien_pkey PRIMARY KEY (mahang)
);
CREATE TABLE public.hoa_don (
  mahd integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  ngaylap timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  tongtien numeric DEFAULT 0,
  hinhthucthanhtoan character varying,
  macn integer,
  makh integer,
  manv integer,
  CONSTRAINT hoa_don_pkey PRIMARY KEY (mahd),
  CONSTRAINT fk_hoadon_chinhanh FOREIGN KEY (macn) REFERENCES public.chi_nhanh(macn),
  CONSTRAINT fk_hoadon_khachhang FOREIGN KEY (makh) REFERENCES public.khach_hang(makh),
  CONSTRAINT fk_hoadon_nhanvien FOREIGN KEY (manv) REFERENCES public.nhan_vien(manv)
);
CREATE TABLE public.khach_hang (
  makh integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenkh character varying NOT NULL,
  sdt character varying UNIQUE,
  email character varying,
  cccd character varying,
  gioitinh character varying,
  ngaysinh date,
  diemloyalty integer DEFAULT 0,
  mahang integer DEFAULT 1,
  CONSTRAINT khach_hang_pkey PRIMARY KEY (makh),
  CONSTRAINT fk_khachhang_hang FOREIGN KEY (mahang) REFERENCES public.hang_thanh_vien(mahang)
);
CREATE TABLE public.lich_su_dieu_dong (
  madd integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  ngaychuyen date DEFAULT CURRENT_DATE,
  manv integer,
  macn_cu integer,
  macn_moi integer,
  lydo text,
  CONSTRAINT lich_su_dieu_dong_pkey PRIMARY KEY (madd),
  CONSTRAINT fk_dd_nhanvien FOREIGN KEY (manv) REFERENCES public.nhan_vien(manv),
  CONSTRAINT fk_dd_cn_cu FOREIGN KEY (macn_cu) REFERENCES public.chi_nhanh(macn),
  CONSTRAINT fk_dd_cn_moi FOREIGN KEY (macn_moi) REFERENCES public.chi_nhanh(macn)
);
CREATE TABLE public.nhan_vien (
  manv integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hoten character varying NOT NULL,
  ngaysinh date,
  gioitinh character varying,
  ngayvaolam date DEFAULT CURRENT_DATE,
  luongcoban numeric,
  chucvu character varying,
  macn integer,
  sdt character varying,
  CONSTRAINT nhan_vien_pkey PRIMARY KEY (manv),
  CONSTRAINT fk_nhanvien_chinhanh FOREIGN KEY (macn) REFERENCES public.chi_nhanh(macn)
);
CREATE TABLE public.san_pham (
  masp integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  tensp character varying NOT NULL,
  loaisp character varying,
  giaban numeric NOT NULL,
  soluongtonkho integer DEFAULT 0,
  CONSTRAINT san_pham_pkey PRIMARY KEY (masp)
);
CREATE TABLE public.thu_cung (
  matc integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  tentc character varying,
  loai character varying,
  giong character varying,
  ngaysinh date,
  gioitinh character varying,
  tinhtrangsuckhoe text,
  makh integer,
  CONSTRAINT thu_cung_pkey PRIMARY KEY (matc),
  CONSTRAINT fk_thucung_khachhang FOREIGN KEY (makh) REFERENCES public.khach_hang(makh)
);
CREATE TABLE public.tt_kham_benh (
  malankham integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  mahddv integer UNIQUE,
  ngaykham timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  trieuchung text,
  chuandoan text,
  toathuoc text,
  ngayhentaikham date,
  dongia numeric,
  matc integer,
  bsphutrach integer,
  CONSTRAINT tt_kham_benh_pkey PRIMARY KEY (malankham),
  CONSTRAINT fk_kb_cthddv FOREIGN KEY (mahddv) REFERENCES public.ct_hoa_don_dv(mahddv),
  CONSTRAINT fk_kb_thucung FOREIGN KEY (matc) REFERENCES public.thu_cung(matc),
  CONSTRAINT fk_kb_bacsi FOREIGN KEY (bsphutrach) REFERENCES public.nhan_vien(manv)
);
CREATE TABLE public.tt_tiem_phong (
  malantiem integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  mahddv integer UNIQUE,
  ngaytiem timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  loaivacxin character varying,
  lieuluong character varying,
  dongia numeric,
  magoi integer,
  matc integer,
  nguoitiem integer,
  CONSTRAINT tt_tiem_phong_pkey PRIMARY KEY (malantiem),
  CONSTRAINT fk_tp_cthddv FOREIGN KEY (mahddv) REFERENCES public.ct_hoa_don_dv(mahddv),
  CONSTRAINT fk_tp_goitiem FOREIGN KEY (magoi) REFERENCES public.goi_tiem(magoi),
  CONSTRAINT fk_tp_thucung FOREIGN KEY (matc) REFERENCES public.thu_cung(matc),
  CONSTRAINT fk_tp_nguoitiem FOREIGN KEY (nguoitiem) REFERENCES public.nhan_vien(manv)
);