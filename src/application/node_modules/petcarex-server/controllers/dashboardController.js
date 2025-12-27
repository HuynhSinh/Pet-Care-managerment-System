import { db } from "../db/index.js";
import {
    hoaDon, khachHang, ttKhamBenh, ttTiemPhong, ctHoaDonSp, chiNhanh
} from "../db/schema.js";
import { sql, sum, count, desc, eq, and, gte, lt } from "drizzle-orm";

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // helper to get stats for a table with a date column
        // returning current month sum/count and % change

        // 1. Total Revenue (hoa_don.tongtien)
        const currentRevenue = await db.select({ value: sum(hoaDon.tongtien) })
            .from(hoaDon)
            .where(gte(hoaDon.ngaylap, startOfMonth));

        const lastMonthRevenue = await db.select({ value: sum(hoaDon.tongtien) })
            .from(hoaDon)
            .where(and(gte(hoaDon.ngaylap, startOfLastMonth), lt(hoaDon.ngaylap, startOfMonth)));

        const revNow = Number(currentRevenue[0]?.value || 0);
        const revLast = Number(lastMonthRevenue[0]?.value || 0);
        const revChange = revLast === 0 ? 100 : ((revNow - revLast) / revLast) * 100;

        // 2. Total Invoices (hoa_don count)
        const currentInvoices = await db.select({ value: count(hoaDon.mahd) })
            .from(hoaDon)
            .where(gte(hoaDon.ngaylap, startOfMonth));

        const lastMonthInvoices = await db.select({ value: count(hoaDon.mahd) })
            .from(hoaDon)
            .where(and(gte(hoaDon.ngaylap, startOfLastMonth), lt(hoaDon.ngaylap, startOfMonth)));

        const invNow = Number(currentInvoices[0]?.value || 0);
        const invLast = Number(lastMonthInvoices[0]?.value || 0);
        const invChange = invLast === 0 ? 100 : ((invNow - invLast) / invLast) * 100;

        // 3. Examination Count (tt_kham_benh count)
        const currentExams = await db.select({ value: count(ttKhamBenh.malankham) })
            .from(ttKhamBenh)
            .where(gte(ttKhamBenh.ngaykham, startOfMonth));

        const lastMonthExams = await db.select({ value: count(ttKhamBenh.malankham) })
            .from(ttKhamBenh)
            .where(and(gte(ttKhamBenh.ngaykham, startOfLastMonth), lt(ttKhamBenh.ngaykham, startOfMonth)));

        const examNow = Number(currentExams[0]?.value || 0);
        const examLast = Number(lastMonthExams[0]?.value || 0);
        const examChange = examLast === 0 ? 100 : ((examNow - examLast) / examLast) * 100;

        // 4. Total Customers (Total in DB, change is N/A since no date, or assume flat)
        // User requested comparison, but without create_date, we just return total. 
        // Or we could count unique customers in invoices for "Active Customers"
        const totalCustomers = await db.select({ value: count(khachHang.makh) }).from(khachHang);
        const custCount = Number(totalCustomers[0]?.value || 0);

        res.json({
            success: true,
            data: {
                revenue: { value: revNow, change: revChange.toFixed(1) },
                invoices: { value: invNow, change: invChange.toFixed(1) },
                exams: { value: examNow, change: examChange.toFixed(1) },
                customers: { value: custCount, change: 0 } // No historical data for customers
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRevenueChart = async (req, res) => {
    try {
        const { period } = req.query; // 'month' | 'year'

        let query;

        if (period === 'year') {
            // Group by Year
            query = sql`
                SELECT to_char(ngaylap, 'YYYY') as label, SUM(tongtien) as revenue
                FROM hoa_don
                GROUP BY label
                ORDER BY label ASC
                LIMIT 5
            `;
        } else {
            // Group by Month (default)
            query = sql`
                SELECT to_char(ngaylap, 'YYYY-MM') as label, SUM(tongtien) as revenue
                FROM hoa_don
                GROUP BY label
                ORDER BY label ASC
                LIMIT 12
            `;
        }

        const revenueData = await db.execute(query);

        // Normalize data keys for frontend
        const formattedData = revenueData.map(item => ({
            month: item.label, // keeping key 'month' for frontend compatibility or map to 'label'
            revenue: item.revenue
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error("Error fetching revenue chart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRevenueStructure = async (req, res) => {
    try {
        // 1. Products: from ct_hoa_don_sp (sum dongia * soluong)
        const products = await db.select({
            value: sql`sum(${ctHoaDonSp.dongia} * ${ctHoaDonSp.soluong})`
        }).from(ctHoaDonSp);

        // 2. Exams: from tt_kham_benh (sum dongia)
        const exams = await db.select({
            value: sum(ttKhamBenh.dongia)
        }).from(ttKhamBenh);

        // 3. Vaccines: from tt_tiem_phong (sum dongia)
        const vaccines = await db.select({
            value: sum(ttTiemPhong.dongia)
        }).from(ttTiemPhong);

        res.json({
            success: true,
            data: [
                { name: 'Products', value: Number(products[0]?.value || 0) },
                { name: 'Examinations', value: Number(exams[0]?.value || 0) },
                { name: 'Vaccinations', value: Number(vaccines[0]?.value || 0) }
            ]
        });

    } catch (error) {
        console.error("Error fetching revenue structure:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBranches = async (req, res) => {
    try {
        const branches = await db.select({
            macn: chiNhanh.macn,
            tencn: chiNhanh.tencn,
            diachi: chiNhanh.diachi,
            sdt: chiNhanh.sdt,
            tgmocua: chiNhanh.tgmocua,
            tgdongcua: chiNhanh.tgdongcua,
            revenue: sql`COALESCE(SUM(${hoaDon.tongtien}), 0)`
        })
            .from(chiNhanh)
            .leftJoin(hoaDon, eq(chiNhanh.macn, hoaDon.macn))
            .groupBy(chiNhanh.macn)
            .orderBy(desc(chiNhanh.macn));

        res.json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBranch = async (req, res) => {
    try {
        const { tencn, diachi, sdt, tgmocua, tgdongcua } = req.body;
        if (!tencn) return res.status(400).json({ success: false, message: 'Branch name is required' });

        const newBranch = await db.insert(chiNhanh).values({
            tencn, diachi, sdt, tgmocua, tgdongcua
        }).returning();

        res.json({ success: true, data: newBranch[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { tencn, diachi, sdt, tgmocua, tgdongcua } = req.body;

        if (!tencn) return res.status(400).json({ success: false, message: 'Branch name is required' });

        const updatedBranch = await db.update(chiNhanh)
            .set({ tencn, diachi, sdt, tgmocua, tgdongcua })
            .where(eq(chiNhanh.macn, id))
            .returning();

        if (updatedBranch.length === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.json({ success: true, data: updatedBranch[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBranch = await db.delete(chiNhanh)
            .where(eq(chiNhanh.macn, id))
            .returning();

        if (deletedBranch.length === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.json({ success: true, message: 'Branch deleted successfully', data: deletedBranch[0] });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete this branch because it has related records (invoices, employees, etc.)'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
