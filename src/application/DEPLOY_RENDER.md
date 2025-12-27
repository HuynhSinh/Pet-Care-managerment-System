# Hướng dẫn Deploy lên Render (Updated)

Hướng dẫn này áp dụng cho mô hình **Monorepo** nơi Server và Client chạy chung trên một Web Service.

## 1. Kiểm tra cấu trúc dự án
Đảm bảo bạn đã có các file sau (đã được cấu hình tự động):
*   `package.json` (Root): Có script `build` và `start`.
*   `server/index.js`: Có logic phục vụ file tĩnh từ thư mục `dist` và xử lý "catch-all route".
*   `client/vite.config.ts`: Cấu hình build ra thư mục `dist`.

## 2. Deploy lên Render

1.  **Truy cập Render Dashboard:** [https://dashboard.render.com](https://dashboard.render.com)
2.  **Tạo mới:** Chọn **New +** -> **Web Service**.
3.  **Kết nối Git:** Chọn repository của bạn.
4.  **Cấu hình Web Service:**
    Điền chính xác các thông tin sau:

    | Mục | Giá trị | Giải thích |
    | :--- | :--- | :--- |
    | **Name** | `petcarex-app` | Tên app của bạn. |
    | **Root Directory** | `src/application` | Render sẽ chạy lệnh từ thư mục này. |
    | **Environment** | `Node` | Môi trường chạy server. |
    | **Build Command** | `npm run build` | Lệnh này sẽ build React App ra thư mục `dist`. |
    | **Start Command** | `npm start` | Lệnh này start Node server (`server/index.js`). |

5.  **Environment Variables (Biến môi trường):**
    Thêm các biến sau vào mục "Environment Variables" (nếu chưa có):
    *   `NODE_VERSION`: `20`
    *   `SUPABASE_URL`: (Copy từ file .env cũ của bạn)
    *   `SUPABASE_KEY`: (Copy từ file .env cũ của bạn)
    *   ... các key khác nếu có.

6.  **Deploy:** Nhấn **Create Web Service**.

## 3. Cách hoạt động
*   Khi Render chạy `npm run build`: Hệ thống sẽ dùng Vite (trong folder client) để build giao diện ra thư mục `src/application/dist`.
*   Khi Render chạy `npm start`: Hệ thống gọi `node server/index.js`.
*   File `server/index.js` sẽ chạy Express server trên port được cấp (chúng ta dùng `process.env.PORT` nên nó tự khớp).
*   Express server vừa đóng vai trò API Backend, vừa phục vụ file `index.html` và các file CSS/JS tĩnh cho người dùng truy cập.

**Lưu ý:**
*   Nếu gặp lỗi liên quan đến file không tìm thấy, hãy kiểm tra kỹ phần **Root Directory** đã đặt đúng là `src/application` chưa.
*   Lỗi 500 thường do thiếu biến môi trường hoặc lỗi logic code server, hãy vào tab **Logs** trên Render để xem chi tiết.
