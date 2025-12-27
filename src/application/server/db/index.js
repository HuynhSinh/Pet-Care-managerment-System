import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

console.log('Initializing database connection...');
// Mask the password for logging
const maskedString = connectionString.replace(/:([^@]+)@/, ':****@');
console.log(`DATABASE_URL: ${maskedString}`);

const client = postgres(connectionString, {
    prepare: false,
    ssl: 'require' // Required for Supabase in production
});

export const db = drizzle(client);
