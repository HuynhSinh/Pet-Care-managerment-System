# Hướng dẫn Deploy lên Render (Web Service)

Để deploy ứng dụng PetCareX (Fullstack) lên Render dưới dạng một **Service duy nhất** (tiết kiệm chi phí và đơn giản), làm theo các bước sau:

## 1. Chuẩn bị
Code của bạn đã được cấu hình để:
- **Build**: Vite sẽ build code React ra thư mục `dist` tại gốc ứng dụng.
- **Run**: Node.js server sẽ phục vụ cả API (`/api/...`) và file tĩnh (React App) trên cùng một port.
- **Start**: Lệnh `npm start` sẽ chạy file `server/index.js`.

## 2. Các bước trên Render Dashboard

1.  Truy cập [Render Dashboard](https://dashboard.render.com/).
2.  Nhấn **New +** -> chọn **Web Service**.
3.  Kết nối với Git Repository của bạn.
4.  Điền các thông tin cấu hình sau:

    | Mục | Giá trị |
    | :--- | :--- |
    | **Name** | `petcarex-app` (hoặc tên tùy ý) |
    | **Root Directory** | `src/application` |
    | **Environment** | `Node` |
    | **Build Command** | `npm run build` |
    | **Start Command** | `npm start` |

    *Giải thích*:
    *   *Root Directory*: Render sẽ đi vào thư mục này trước khi chạy lệnh.
    *   *Build Command*: Render sẽ chạy `npm install` (tự động) rồi chạy `npm run build` (để build React ra thư mục dist).
    *   *Start Command*: Render sẽ chạy `node server/index.js`, server này sẽ host cả API và Frontend.

5.  **Environment Variables (Biến môi trường)**
    Thêm các biến sau vào mục "Environment Variables":
    *   `NODE_VERSION`: `20` (hoặc phiên bản phù hợp)
    *   `SUPABASE_URL`: (URL Supabase của bạn)
    *   `SUPABASE_ANON_KEY`: (Key Supabase của bạn)

6.  Nhấn **Create Web Service**.

## 3. Hoàn tất
Render sẽ bắt đầu build và deploy. Quá trình này mất khoảng 2-3 phút.
Sau khi xong, bạn truy cập URL mà Render cung cấp.
- Trang chủ sẽ tải React App.
- API sẽ chạy tại `/api/...`.
- F5 lại trang (Reload) vẫn sẽ hoạt động nhờ cấu hình "Catch-all route" trong server.
