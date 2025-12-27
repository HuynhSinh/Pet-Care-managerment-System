# Debug Lỗi Kết Nối Database

Nếu bạn gặp lỗi không kết nối được Database trên Render, nguyên nhân thường là:
1.  **Thiếu Environment Variable**: Bạn chưa nhập `DATABASE_URL` trên Render.
2.  **SSL**: Supabase yêu cầu kết nối bảo mật (SSL), nhưng cấu hình mặc định có thể thiếu.

## Tôi đã sửa gì?

1.  **Cập nhật code (`server/db/index.js`)**: Tôi đã thêm `ssl: 'require'` vào cấu hình kết nối. Đây là yêu cầu bắt buộc của Supabase khi chạy trên môi trường Production như Render.
2.  **Thêm Log**: Server sẽ in ra log (đã che mật khẩu) để bạn biết liệu nó có nhận được `DATABASE_URL` hay không.

## Bạn cần làm gì?

1.  **Git Commit & Push** thay đổi mới nhất.
2.  **Kiểm tra Environment Variables trên Render**:
    *   Vào Dashboard -> Chọn Service `petcarex-app` -> **Environment**.
    *   Đảm bảo có biến `DATABASE_URL`.
    *   Giá trị phải là: `postgresql://postgres.[user]:[pass]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres` (Copy từ file `.env` của bạn).
    *   *Lưu ý*: Nếu dùng Port `6543` (Transaction Pooler), code của tôi đã để `prepare: false` là chính xác.
3.  **Deploy lại**.
4.  **Xem Logs**:
    *   Vào tab **Logs** trên Render.
    *   Tìm dòng: `Initializing database connection...`
    *   Nếu thấy `DATABASE_URL is not defined` -> Bạn chưa set biến môi trường.
    *   Nếu thấy lỗi `SSL/TLS`, hãy báo lại tôi.
