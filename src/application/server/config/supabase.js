import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabase = null;

try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase initialized successfully');
    } else {
        console.warn('⚠️ Supabase credentials missing. Running in offline/mock mode.');
    }
} catch (error) {
    console.warn('⚠️ Failed to initialize Supabase:', error.message);
}

// Mock fallback if supabase is null
const safeSupabase = supabase || {
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    }
};

export default safeSupabase;
