# Deploy to Render

This guide outlines how to submit this **Monorepo** project to Render.com using a standard Web Service approach.

## 1. Project Structure
This is a monorepo with `client` and `server` directories.
- `client`: Vite/React Frontend.
- `server`: Express/Node Backend.

We will deploy them as **two separate services** on Render but they can live in the same Git repository.

## 2. Server Deployment (Web Service)
1.  **Dashboard**: Go to Render Dashboard -> New -> Web Service.
2.  **Repository**: Connect your git repository.
3.  **Root Directory**: Set this to `src/application/server`.
4.  **Name**: e.g., `petcarex-server`.
5.  **Environment**: Node.js.
6.  **Build Command**: `npm install`.
    *   *Note*: Since root is `src/application/server`, `npm install` runs in that folder.
7.  **Start Command**: `npm start` (or `node index.js`).
8.  **Environment Variables**:
    *   `DATABASE_URL`: Connection string to your PostgreSQL URL (Use Supabase connection string).
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_KEY`: Your Supabase Anon Key.
    *   `PORT`: `5000` (or leave default, Render usually sets this automatically to 10000, but make sure your `index.js` respects `process.env.PORT`).

## 3. Client Deployment (Static Site)
1.  **Dashboard**: Go to Render Dashboard -> New -> Static Site.
2.  **Repository**: Connect the same repository.
3.  **Root Directory**: Set this to `src/application/client`.
4.  **Name**: e.g., `petcarex-client`.
5.  **Build Command**: `npm install && npm run build`.
    *   This will run `vite build` and output to `dist`.
6.  **Publish Directory**: `dist`.
7.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed server (e.g., `https://petcarex-server.onrender.com/api`).
    *   *Important*: Render Environment Variables for Static Sites are utilized at **Build Time**. Ensure this variable is set before you trigger the build.

## 4. Database Setup (Supabase)
Ensure your Supabase database has the tables created. You can run the queries found in `src/application/scripts.sql` in the Supabase SQL Editor.

## 5. Troubleshooting
*   **CORS**: Update `server/index.js` to allow the new client domain if you have strict CORS settings.
    *   Currently, `cors()` is used which usually allows all. For production, you might want to restrict it to your client URL.
*   **Port**: Your server listens on `process.env.PORT || 5000`. Render provides a `PORT` env var. This setup is compatible.
