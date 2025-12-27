
import { db } from '../db/index.js';
import { thuCung, khachHang, ttKhamBenh, ttTiemPhong, nhanVien } from '../db/schema.js';
import { eq, sql, desc, or } from 'drizzle-orm';

// Get Pets List with Owner Info
export const getPets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Build query
        // We need to join with Customer to get Owner Name
        let baseQuery = db.select({
            matc: thuCung.matc,
            tentc: thuCung.tentc,
            loai: thuCung.loai,
            giong: thuCung.giong,
            ngaysinh: thuCung.ngaysinh,
            gioitinh: thuCung.gioitinh,
            tinhtrangsuckhoe: thuCung.tinhtrangsuckhoe,
            makh: thuCung.makh,
            tenkh: khachHang.tenkh
        })
            .from(thuCung)
            .leftJoin(khachHang, eq(thuCung.makh, khachHang.makh));

        if (search) {
            baseQuery = baseQuery.where(sql`LOWER(${thuCung.tentc}) LIKE LOWER(${`%${search}%`})`);
        }

        const data = await baseQuery.limit(limit).offset(offset).orderBy(desc(thuCung.matc));

        // Count for pagination
        const countQuery = await db.select({ count: sql`count(*)` })
            .from(thuCung)
            .where(search ? sql`LOWER(${thuCung.tentc}) LIKE LOWER(${`%${search}%`})` : undefined);

        const total = parseInt(countQuery[0].count);

        res.json({
            success: true,
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Pet
export const createPet = async (req, res) => {
    try {
        const { tentc, loai, giong, ngaysinh, gioitinh, tinhtrangsuckhoe, makh } = req.body;

        if (!tentc || !makh) {
            return res.status(400).json({ success: false, message: 'Pet name and Owner ID are required' });
        }

        // Validate Owner Exists
        const [owner] = await db.select().from(khachHang).where(eq(khachHang.makh, makh));
        if (!owner) {
            return res.status(400).json({ success: false, message: 'Owner not found (Invalid Owner ID)' });
        }

        const [newPet] = await db.insert(thuCung).values({
            tentc, loai, giong, ngaysinh: ngaysinh || null, gioitinh, tinhtrangsuckhoe, makh
        }).returning();

        res.json({ success: true, data: newPet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Pet
export const updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const { tentc, loai, giong, ngaysinh, gioitinh, tinhtrangsuckhoe, makh } = req.body;

        // If owner is being changed, validate it
        if (makh) {
            const [owner] = await db.select().from(khachHang).where(eq(khachHang.makh, makh));
            if (!owner) {
                return res.status(400).json({ success: false, message: 'Owner not found' });
            }
        }

        const updated = await db.update(thuCung)
            .set({ tentc, loai, giong, ngaysinh, gioitinh, tinhtrangsuckhoe, makh })
            .where(eq(thuCung.matc, id))
            .returning();

        if (!updated.length) return res.status(404).json({ success: false, message: 'Pet not found' });

        res.json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Pet
export const deletePet = async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(thuCung).where(eq(thuCung.matc, id));
        res.json({ success: true, message: 'Pet deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Pet Health History
export const getPetHealthHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Medical Exams
        const exams = await db.select({
            date: ttKhamBenh.ngaykham,
            type: sql`'Khám bệnh'`,
            performer: nhanVien.hoten,
            details: sql`CONCAT('Chẩn đoán: ', ${ttKhamBenh.chuandoan}, '. Thuốc: ', ${ttKhamBenh.toathuoc})`
        })
            .from(ttKhamBenh)
            .leftJoin(nhanVien, eq(ttKhamBenh.bsphutrach, nhanVien.manv))
            .where(eq(ttKhamBenh.matc, id));

        // 2. Fetch Vaccinations
        const vaccines = await db.select({
            date: ttTiemPhong.ngaytiem,
            type: sql`'Tiêm phòng'`,
            performer: nhanVien.hoten,
            details: sql`CONCAT('Vắc xin: ', ${ttTiemPhong.loaivacxin})`
        })
            .from(ttTiemPhong)
            .leftJoin(nhanVien, eq(ttTiemPhong.nguoitiem, nhanVien.manv))
            .where(eq(ttTiemPhong.matc, id));

        // 3. Merge and Sort
        const history = [...exams, ...vaccines].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
