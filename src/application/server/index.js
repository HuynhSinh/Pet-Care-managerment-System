import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import './config/supabase.js'; // Initialize Supabase config

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Improve Vercel compatibility
app.set('trust proxy', 1);

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for now to prevent CORS issues
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('PetCareX API is running...');
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app; // For Vercel
