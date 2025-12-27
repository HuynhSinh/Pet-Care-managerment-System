
import { db } from '../db/index.js';
import { sanPham } from '../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';

export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = db.select().from(sanPham);

        if (search) {
            query = query.where(sql`LOWER(${sanPham.tensp}) LIKE LOWER(${`%${search}%`})`);
        }

        const data = await query.limit(limit).offset(offset).orderBy(desc(sanPham.masp));

        // Get total count for pagination
        // Note: For simplicity in this demo environment, we might do a separate count query or fetch all for filtering.
        // Efficient way:
        const countQuery = await db.select({ count: sql`count(*)` }).from(sanPham)
            .where(search ? sql`LOWER(${sanPham.tensp}) LIKE LOWER(${`%${search}%`})` : undefined);
        const total = parseInt(countQuery[0].count);

        res.json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProductStats = async (req, res) => {
    try {
        const [totalProducts] = await db.select({ count: sql`count(*)` }).from(sanPham);
        const [totalInventory] = await db.select({ sum: sql`sum(${sanPham.soluongtonkho})` }).from(sanPham);
        const [lowStock] = await db.select({ count: sql`count(*)` }).from(sanPham).where(sql`${sanPham.soluongtonkho} < 10`);

        res.json({
            success: true,
            data: {
                totalProducts: parseInt(totalProducts.count) || 0,
                totalInventory: parseInt(totalInventory.sum) || 0,
                lowStock: parseInt(lowStock.count) || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { tensp, loaisp, giaban, soluongtonkho } = req.body;
        if (!tensp || !giaban) {
            return res.status(400).json({ success: false, message: 'Name and Price are required' });
        }

        const newProduct = await db.insert(sanPham).values({
            tensp,
            loaisp,
            giaban,
            soluongtonkho: soluongtonkho || 0
        }).returning();

        res.json({ success: true, data: newProduct[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { tensp, loaisp, giaban, soluongtonkho } = req.body;

        const updated = await db.update(sanPham)
            .set({ tensp, loaisp, giaban, soluongtonkho })
            .where(eq(sanPham.masp, id))
            .returning();

        if (!updated.length) return res.status(404).json({ success: false, message: 'Product not found' });

        res.json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(sanPham).where(eq(sanPham.masp, id));
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
