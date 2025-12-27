import { db } from "../db/index.js";
import { nhanVien, chiNhanh, lichSuDieuDong } from "../db/schema.js";
import { eq, desc, ilike, or } from "drizzle-orm";

export const getStaff = async (req, res) => {
    try {
        // Fetch all staff with branch info
        const staff = await db.select({
            manv: nhanVien.manv,
            hoten: nhanVien.hoten,
            ngaysinh: nhanVien.ngaysinh,
            gioitinh: nhanVien.gioitinh,
            ngayvaolam: nhanVien.ngayvaolam,
            luongcoban: nhanVien.luongcoban,
            chucvu: nhanVien.chucvu,
            sdt: nhanVien.sdt,
            macn: nhanVien.macn,
            tencn: chiNhanh.tencn
        })
            .from(nhanVien)
            .leftJoin(chiNhanh, eq(nhanVien.macn, chiNhanh.macn))
            .orderBy(desc(nhanVien.manv)); // Newest first

        res.json({ success: true, data: staff });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createStaff = async (req, res) => {
    try {
        const { hoten, ngaysinh, gioitinh, ngayvaolam, luongcoban, chucvu, macn, sdt } = req.body;

        if (!hoten) {
            return res.status(400).json({ success: false, message: "Full Name is required" });
        }
        if (!macn) {
            return res.status(400).json({ success: false, message: "Branch is required" });
        }

        const newStaff = await db.insert(nhanVien).values({
            hoten,
            ngaysinh: ngaysinh || null,
            gioitinh,
            ngayvaolam: ngayvaolam || new Date(),
            luongcoban: luongcoban || 0,
            chucvu,
            macn,
            sdt
        }).returning();

        res.json({ success: true, data: newStaff[0] });

    } catch (error) {
        console.error("Error creating staff:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStaffHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Use aliases for joining table twice
        // Drizzle ORM self-joins or multi-joins on same table can be complex without aliases, 
        // simplified approach: fetch IDs and names separately or use raw query if complex.
        // For now, let's try a simpler approach if aliases are tricky in Drizzle setup without defining alias objects.
        // Actually, let's just fetch raw for clarity or standard join if it supports aliasing easily.
        // Assuming we just want branch names.

        // Simpler: Just get the IDs and date/reason, frontend can map IDs to names if we send branch list or fetch names.
        // Better: Join.

        // Let's rely on mapping on frontend or basic join. 
        // We will fetch history and manually lookup branch names via separate quick queries or just return IDs for now to ensure stability 
        // and add names if time permits. Wait, we can join `chiNhanh` twice with aliases? 
        // Drizzle `alias` function:

        const history = await db.select()
            .from(lichSuDieuDong)
            .where(eq(lichSuDieuDong.manv, id))
            .orderBy(desc(lichSuDieuDong.ngaychuyen));

        // To make it user friendly, we really should have branch names.
        // Let's do a quick enrichment in JS if joins are verbose.
        const branches = await db.select({ macn: chiNhanh.macn, tencn: chiNhanh.tencn }).from(chiNhanh);
        const branchMap = {};
        branches.forEach(b => branchMap[b.macn] = b.tencn);

        const enrichedHistory = history.map(h => ({
            ...h,
            tencn_cu: branchMap[h.macn_cu] || 'N/A',
            tencn_moi: branchMap[h.macn_moi] || 'N/A',
        }));

        res.json({ success: true, data: enrichedHistory });

    } catch (error) {
        console.error("Error fetching staff history:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { hoten, ngaysinh, gioitinh, ngayvaolam, luongcoban, chucvu, macn, sdt } = req.body;

        // 1. Get current staff to check for branch change
        const currentStaff = await db.select().from(nhanVien).where(eq(nhanVien.manv, id));
        if (currentStaff.length === 0) return res.status(404).json({ success: false, message: "Staff not found" });

        const oldBranch = currentStaff[0].macn;

        // 2. Update staff
        const updatedStaff = await db.update(nhanVien)
            .set({ hoten, ngaysinh, gioitinh, ngayvaolam, luongcoban, chucvu, macn, sdt })
            .where(eq(nhanVien.manv, id))
            .returning();

        // 3. Log history if branch changed
        if (oldBranch && macn && oldBranch != macn) {
            await db.insert(lichSuDieuDong).values({
                manv: id,
                macn_cu: oldBranch,
                macn_moi: macn,
                ngaychuyen: new Date(),
                lydo: `Chuyển công tác từ chi nhánh cũ sang chi nhánh mới` // Generic reason or passed from frontend
            });
        }

        res.json({ success: true, data: updatedStaff[0] });

    } catch (error) {
        console.error("Error updating staff:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        // Check for dependencies (history, etc) - Drizzle/Postgres usually blocks if FK exists.
        // We might want to delete history first or let cascade handle it if configured (schema didn't specify cascade).
        // Let's try delete, if fails, manual delete of history might be needed.

        // Safe delete: Delete history first? Or just try deleting staff.
        // Given constraints in script.sql: 
        // CONSTRAINT fk_dd_nhanvien FOREIGN KEY (manv) REFERENCES public.nhan_vien(manv)
        // It does NOT say ON DELETE CASCADE. So we likely need to clean up history first or error out.
        // Let's clean up history first for this feature to work smoothly.

        await db.delete(lichSuDieuDong).where(eq(lichSuDieuDong.manv, id));

        const result = await db.delete(nhanVien).where(eq(nhanVien.manv, id)).returning();

        if (result.length === 0) return res.status(404).json({ success: false, message: "Staff not found" });

        res.json({ success: true, message: "Staff deleted successfully" });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete this staff because they have related records (invoices, etc.)'
            });
        }
        console.error("Error deleting staff:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
