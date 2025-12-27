import { pgTable, serial, varchar, time, timestamp, integer, numeric, text, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const chiNhanh = pgTable("chi_nhanh", {
    macn: serial("macn").primaryKey(),
    tencn: varchar("tencn").notNull(),
    diachi: varchar("diachi"),
    sdt: varchar("sdt"),
    tgmocua: time("tgmocua"),
    tgdongcua: time("tgdongcua"),
});

export const hangThanhVien = pgTable("hang_thanh_vien", {
    mahang: serial("mahang").primaryKey(),
    tenhang: varchar("tenhang").notNull(),
    chitieugiuhang: numeric("chitieugiuhang").default(0),
    chitieudathang: numeric("chitieudathang").default(0),
});

export const khachHang = pgTable("khach_hang", {
    makh: serial("makh").primaryKey(),
    tenkh: varchar("tenkh").notNull(),
    sdt: varchar("sdt"),
    email: varchar("email"),
    cccd: varchar("cccd"),
    gioitinh: varchar("gioitinh"),
    ngaysinh: date("ngaysinh"),
    diemloyalty: integer("diemloyalty").default(0),
    mahang: integer("mahang").default(1).references(() => hangThanhVien.mahang),
});

export const hoaDon = pgTable("hoa_don", {
    mahd: serial("mahd").primaryKey(),
    ngaylap: timestamp("ngaylap").defaultNow(),
    tongtien: numeric("tongtien").default("0"),
    macn: integer("macn").references(() => chiNhanh.macn),
    makh: integer("makh").references(() => khachHang.makh),
});

export const ctHoaDonDv = pgTable("ct_hoa_don_dv", {
    mahddv: serial("mahddv").primaryKey(),
    mahd: integer("mahd").references(() => hoaDon.mahd),
    madv: integer("madv"), // Assuming link to dich_vu
    dongia: numeric("dongia").default("0"),
});

export const ctHoaDonSp = pgTable("ct_hoa_don_sp", {
    mahdsp: serial("mahdsp").primaryKey(),
    mahd: integer("mahd").references(() => hoaDon.mahd),
    masp: integer("masp"), // Assuming link to san_pham
    soluong: integer("soluong"),
    dongia: numeric("dongia"),
});

export const ttKhamBenh = pgTable("tt_kham_benh", {
    malankham: serial("malankham").primaryKey(),
    mahddv: integer("mahddv").references(() => ctHoaDonDv.mahddv),
    ngaykham: timestamp("ngaykham").defaultNow(),
    dongia: numeric("dongia"),
    matc: integer("matc").references(() => thuCung.matc),
    bsphutrach: integer("bsphutrach").references(() => nhanVien.manv),
    chuandoan: text("chuandoan"),
    toathuoc: text("toathuoc"),
});

export const ttTiemPhong = pgTable("tt_tiem_phong", {
    malantiem: serial("malantiem").primaryKey(),
    mahddv: integer("mahddv").references(() => ctHoaDonDv.mahddv),
    ngaytiem: timestamp("ngaytiem").defaultNow(),
    dongia: numeric("dongia"),
    matc: integer("matc").references(() => thuCung.matc),
    nguoitiem: integer("nguoitiem").references(() => nhanVien.manv),
    loaivacxin: varchar("loaivacxin"),
});

export const nhanVien = pgTable("nhan_vien", {
    manv: serial("manv").primaryKey(),
    hoten: varchar("hoten").notNull(),
    ngaysinh: date("ngaysinh"),
    gioitinh: varchar("gioitinh"),
    ngayvaolam: date("ngayvaolam").defaultNow(),
    luongcoban: numeric("luongcoban"),
    chucvu: varchar("chucvu"),
    macn: integer("macn").references(() => chiNhanh.macn),
    sdt: varchar("sdt"),
});

export const lichSuDieuDong = pgTable("lich_su_dieu_dong", {
    madd: serial("madd").primaryKey(),
    ngaychuyen: date("ngaychuyen").defaultNow(),
    manv: integer("manv").references(() => nhanVien.manv),
    macn_cu: integer("macn_cu").references(() => chiNhanh.macn),
    macn_moi: integer("macn_moi").references(() => chiNhanh.macn),
    lydo: text("lydo"),
});

export const dichVu = pgTable("dich_vu", {
    madv: serial("madv").primaryKey(),
    loaidv: varchar("loaidv").notNull(),
});

export const dichVuCungCap = pgTable("dich_vu_cung_cap", {
    madvcc: serial("madvcc").primaryKey(),
    macn: integer("macn").references(() => chiNhanh.macn),
    madv: integer("madv").references(() => dichVu.madv),
    trangthai: integer("trangthai").default(1),
});

export const goiTiem = pgTable("goi_tiem", {
    magoi: serial("magoi").primaryKey(),
    tengoi: varchar("tengoi").notNull(),
    thoigian: integer("thoigian"),
    uudai: integer("uudai"),
});
export const sanPham = pgTable("san_pham", {
    masp: serial("masp").primaryKey(),
    tensp: varchar("tensp").notNull(),
    loaisp: varchar("loaisp"),
    giaban: numeric("giaban").notNull(),
    soluongtonkho: integer("soluongtonkho").default(0),
});

export const thuCung = pgTable("thu_cung", {
    matc: serial("matc").primaryKey(),
    tentc: varchar("tentc"),
    loai: varchar("loai"), // Cat, Dog
    giong: varchar("giong"), // Breed
    ngaysinh: date("ngaysinh"),
    gioitinh: varchar("gioitinh"),
    tinhtrangsuckhoe: text("tinhtrangsuckhoe"),
    makh: integer("makh").references(() => khachHang.makh),
});
