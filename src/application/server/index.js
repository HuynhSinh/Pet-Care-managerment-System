import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import customersRoutes from './routes/customersRoutes.js';
import petsRoutes from './routes/petsRoutes.js';
import './config/supabase.js'; // Initialize Supabase config
import { db } from './db/index.js';
import { chiNhanh } from './db/schema.js';

dotenv.config();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Serve Static Files (React App)
// Assumes build output is in ../dist (relative to server/index.js)
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Routes
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/pets', petsRoutes);

app.get('/api/test-connection', async (req, res) => {
    try {
        const result = await db.select().from(chiNhanh).limit(7);
        res.json({
            success: true,
            data: result,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// Catch-All Handler for React (Must be after API routes)
// This handles client-side routing by serving index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

import { sql } from 'drizzle-orm';

// Start Server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Auto-check Database Connection
    try {
        // Simple query to verify connection
        await db.execute(sql`SELECT 1`);
        console.log("✅ DATABASE CONNECTION SUCCESSFUL");
    } catch (error) {
        console.error("❌ DATABASE CONNECTION FAILED:", error.message);
    }
});
