# Debug Lỗi Kết Nối Database & Supabase (Cấp cứu)

## 1. Lỗi "CONNECT_TIMEOUT" (Đã tự động sửa)
Lỗi `write CONNECT_TIMEOUT ...:6543` xuất hiện vì kết nối qua cổng Pooler (6543) của Supabase bị chặn hoặc quá tải khi gọi từ Render.
**Giải pháp tôi đã áp dụng**: 
Tôi đã sửa code trong `server/db/index.js` để tự động chuyển sang cổng **5432** (Direct Connection) nếu phát hiện bạn đang dùng 6543. Bạn **không cần** sửa lại biến môi trường `DATABASE_URL` trên Render.

## 2. Lỗi "Supabase credentials missing" (Cần bạn sửa)
Trong log có dòng: `⚠️ Supabase credentials missing. Running in offline/mock mode.`
Điều này có nghĩa là các tính năng như Upload ảnh, Login (nếu dùng Supabase Auth) sẽ không hoạt động.

**Hãy thêm các biến sau vào Environment Variables trên Render**:
1.  Vào Dashboard -> Service `petcarex-app` -> **Environment**.
2.  Thêm mới (Add Environment Variable):
    *   Key: `SUPABASE_URL`
    *   Value: `https://hweubkwwpiflkddztqqg.supabase.co` (Ví dụ - hãy lấy từ Dashboard Supabase của bạn)
    *   Key: `SUPABASE_ANON_KEY`
    *   Value: `[Key dài bắt đầu bằng eyJ...]`

*Lưu ý*: Nếu bạn không dùng tính năng upload ảnh hay Auth của Supabase mà chỉ dùng Database, bạn có thể bỏ qua bước 2.

## 3. Bước Tiếp Theo
1.  **Git Commit & Push** code mới.
2.  **Deploy lại** (Manual Deploy -> Clear cache).
3.  Kiểm tra log xem còn lỗi timeout không. Nó sẽ hiện dòng: `✅ DATABASE CONNECTION SUCCESSFUL`.
