
import { db } from '../db/index.js';
import { khachHang, thuCung, hoaDon, hangThanhVien } from '../db/schema.js';
import { eq, sql, desc, or } from 'drizzle-orm';

// Helper to calculate total spent
const getTotalSpent = async (makh) => {
    const result = await db.select({ total: sql`sum(${hoaDon.tongtien})` })
        .from(hoaDon)
        .where(eq(hoaDon.makh, makh));
    return parseFloat(result[0]?.total || 0);
};

export const getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Helper subquery for total spend could be complex in Drizzle without aggregation views, 
        // so for 'list' view we might fetch it simply or skip it for performance if high volume.
        // For this demo, let's fetch basic info.

        let query = db.select({
            makh: khachHang.makh,
            tenkh: khachHang.tenkh,
            sdt: khachHang.sdt,
            cccd: khachHang.cccd,
            gioitinh: khachHang.gioitinh,
            diemloyalty: khachHang.diemloyalty,
            mahang: khachHang.mahang,
            // Subquery for Total Spent (scalar) - careful with casting
            tongchitieu: sql`(SELECT COALESCE(SUM(tongtien), 0) FROM hoa_don WHERE hoa_don.makh = khach_hang.makh)::text` // Return as text to avoid truncation/precision issues then parseFloat
        })
            .from(khachHang);

        if (search) {
            query = query.where(or(
                sql`LOWER(${khachHang.tenkh}) LIKE LOWER(${`%${search}%`})`,
                sql`${khachHang.sdt} LIKE ${`%${search}%`}`
            ));
        }

        const data = await query.limit(limit).offset(offset).orderBy(desc(khachHang.makh));

        const countQuery = await db.select({ count: sql`count(*)` }).from(khachHang)
            .where(search ? or(
                sql`LOWER(${khachHang.tenkh}) LIKE LOWER(${`%${search}%`})`,
                sql`${khachHang.sdt} LIKE ${`%${search}%`}`
            ) : undefined);
        const total = parseInt(countQuery[0].count);

        // Map inferred rank
        const enrichedData = data.map(c => {
            const spent = parseFloat(c.tongchitieu || '0');
            let hang = 'Thành viên';
            // Logic: Check data reference first, or fallback to spent
            if (c.mahang === 1) hang = 'Thành viên'; // Assuming 1 is default
            if (spent > 5000000) hang = 'VIP';
            else if (spent > 1000000) hang = 'Thân thiết';

            return {
                ...c,
                mahang: hang,
                tongchitieu: spent
            };
        });

        res.json({
            success: true,
            data: enrichedData,
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

export const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [customer] = await db.select().from(khachHang).where(eq(khachHang.makh, id));
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const pets = await db.select().from(thuCung).where(eq(thuCung.makh, id));
        const totalSpent = await getTotalSpent(id);

        res.json({
            success: true,
            data: {
                ...customer,
                pets,
                tongchitieu: totalSpent
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Safe stats calculation based on spending
export const getCustomerStats = async (req, res) => {
    try {
        const [totalRes] = await db.select({ count: sql`count(*)` }).from(khachHang);
        const total = parseInt(totalRes.count || 0);

        // Aggregate stats by bucket
        // We can do this via pure SQL for performance on large datasets
        // Note: Drizzle raw SQL is best here for the case logic
        const query = sql`
            WITH Spending AS (
                SELECT 
                    kh.makh,
                    COALESCE(SUM(hd.tongtien), 0) as total_spent
                FROM khach_hang kh
                LEFT JOIN hoa_don hd ON kh.makh = hd.makh
                GROUP BY kh.makh
            ),
            Ranks AS (
                SELECT 
                    CASE 
                        WHEN total_spent > 5000000 THEN 'VIP'
                        WHEN total_spent > 1000000 THEN 'Thân thiết'
                        ELSE 'Thành viên'
                    END as rank_name
                FROM Spending
            )
            SELECT rank_name, COUNT(*) as count 
            FROM Ranks 
            GROUP BY rank_name
        `;

        const rankStatsRes = await db.execute(query);
        const rankStats = rankStatsRes.rows ? rankStatsRes.rows : rankStatsRes; // Handle potential different driver response structure

        const order = ['VIP', 'Thân thiết', 'Thành viên'];

        // Format for frontend
        const distribution = order.map(label => {
            const found = Array.isArray(rankStats) ? rankStats.find(r => r.rank_name === label) : null;
            const count = found ? parseInt(found.count) : 0;
            return {
                label,
                count,
                percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
            };
        });

        res.json({
            success: true,
            total,
            distribution
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const { tenkh, sdt, gioitinh, email, cccd, ngaysinh } = req.body;
        if (!tenkh || !sdt) {
            return res.status(400).json({ success: false, message: 'Name and Phone are required' });
        }

        // Check duplicate phone
        const existing = await db.select().from(khachHang).where(eq(khachHang.sdt, sdt));
        if (existing.length > 0) return res.status(400).json({ success: false, message: 'Phone number already exists' });

        const [newCustomer] = await db.insert(khachHang).values({
            tenkh, sdt, gioitinh, email, cccd: cccd || '', ngaysinh: ngaysinh || null
        }).returning();

        res.json({ success: true, data: newCustomer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenkh, sdt, gioitinh, email, cccd, ngaysinh } = req.body;

        const updated = await db.update(khachHang)
            .set({ tenkh, sdt, gioitinh, email, cccd, ngaysinh })
            .where(eq(khachHang.makh, id))
            .returning();

        if (!updated.length) return res.status(404).json({ success: false, message: "Customer not found" });

        res.json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        // Check for invoices constraint
        const invoices = await db.select().from(hoaDon).where(eq(hoaDon.makh, id));
        if (invoices.length > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete customer with existing invoices.' });
        }
        // Delete pets first if cascade not set
        await db.delete(thuCung).where(eq(thuCung.makh, id));
        await db.delete(khachHang).where(eq(khachHang.makh, id));

        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
