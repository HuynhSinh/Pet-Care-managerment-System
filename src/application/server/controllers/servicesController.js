import { db } from "../db/index.js";
import { dichVu, dichVuCungCap, goiTiem, chiNhanh } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

// === Services ===

export const getServices = async (req, res) => {
    try {
        const services = await db.select().from(dichVu).orderBy(desc(dichVu.madv));
        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createService = async (req, res) => {
    try {
        const { loaidv } = req.body;
        if (!loaidv) return res.status(400).json({ success: false, message: 'Service name (loaidv) is required' });

        const newService = await db.insert(dichVu).values({ loaidv }).returning();
        res.json({ success: true, data: newService[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { loaidv } = req.body;

        const updated = await db.update(dichVu)
            .set({ loaidv })
            .where(eq(dichVu.madv, id))
            .returning();

        if (!updated.length) return res.status(404).json({ success: false, message: 'Service not found' });

        res.json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        // Check constraints? typically yes, if used in bills or provided services.
        // Assuming cascade or restriction. If restricted, catch error.

        await db.delete(dichVu).where(eq(dichVu.madv, id));
        res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ success: false, message: 'Cannot delete service as it is being used in records.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getServiceBranches = async (req, res) => {
    try {
        const { id } = req.params;
        // Join dichVuCungCap with chiNhanh
        const branches = await db.select({
            macn: chiNhanh.macn,
            tencn: chiNhanh.tencn,
            diachi: chiNhanh.diachi
        })
            .from(dichVuCungCap)
            .leftJoin(chiNhanh, eq(dichVuCungCap.macn, chiNhanh.macn))
            .where(eq(dichVuCungCap.madv, id));

        res.json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// === Packages (Goi Tiem) ===

export const getPackages = async (req, res) => {
    try {
        const packages = await db.select().from(goiTiem).orderBy(desc(goiTiem.magoi));
        res.json({ success: true, data: packages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPackage = async (req, res) => {
    try {
        const { tengoi, thoigian, uudai } = req.body;
        if (!tengoi) return res.status(400).json({ success: false, message: 'Package name is required' });

        const newPkg = await db.insert(goiTiem).values({ tengoi, thoigian: thoigian || 0, uudai: uudai || 0 }).returning();
        res.json({ success: true, data: newPkg[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { tengoi, thoigian, uudai } = req.body;

        const updated = await db.update(goiTiem)
            .set({ tengoi, thoigian: thoigian || 0, uudai: uudai || 0 })
            .where(eq(goiTiem.magoi, id))
            .returning();

        if (!updated.length) return res.status(404).json({ success: false, message: 'Package not found' });

        res.json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(goiTiem).where(eq(goiTiem.magoi, id));
        res.json({ success: true, message: 'Package deleted' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ success: false, message: 'Cannot delete package as it is being used in records.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
