# Hướng dẫn Deploy lên Vercel (Updated)

Dưới đây là các bước chi tiết để deploy dự án lên Vercel mà không gặp lỗi "No Output Directory".

## 1. Cấu trúc sau khi sửa
Chúng ta đã cấu hình lại để dự án hoạt động theo chuẩn monorepo của Vercel:
- **Client**: Build ra thư mục `dist` ngay tại gốc (`src/application/dist`).
- **Server**: Chạy dưới dạng Serverless Function qua thư mục `api`.
- **Cấu hình**: `vercel.json` điều hướng routing.

## 2. Các bước Deploy trên Vercel Dashboard

Vì dự án này có cấu trúc tùy chỉnh, Vercel có thể không tự động nhận diện đúng Output Directory. Bạn cần cài đặt thủ công như sau:

1.  **Truy cập Vercel:** [https://vercel.com/new](https://vercel.com/new)
2.  **Import Project:** Chọn repository chứa code của bạn.
3.  **Configure Project (Quan trọng):**
    *   **Root Directory:** Chọn `src/application` (hoặc nhấn Edit để trỏ vào đó).
    *   **Framework Preset:** Chọn **Vite**.
    *   **Build & Development Settings:**
        *   **Build Command:** *Để mặc định* (Nó sẽ chạy `npm run build` từ `package.json` của chúng ta).
        *   **Output Directory:** ⚠️ **QUAN TRỌNG**: Bạn phải đổi thành `dist` (Mặc định nếu chọn Vite là `dist`, nhưng hãy kiểm tra kỹ). Nếu bạn *không* chọn Preset là Vite, bạn **BẮT BUỘC** phải bật "Override" và nhập `dist`.
        *   **Install Command:** *Để mặc định* (Nó sẽ chạy `npm install` cấu hình sẵn).

4.  **Environment Variables (Biến môi trường):**
    Thêm các biến môi trường cần thiết cho backend (kết nối Supabase, JWT Secret, v.v.):
    *   `SUPABASE_URL`: ...
    *   `SUPABASE_KEY`: ...
    *   `JWT_SECRET`: ...
    *   ... (các biến khác trong `.env` của bạn)

5.  **Nhấn Deploy.**

## 3. Giải thích các sửa đổi kỹ thuật

### Tại sao cần chỉnh sửa `package.json`?
Lệnh build cũ build vào `client/dist`. Chúng ta đã đổi thành:
```json
"build": "npm run build --prefix client -- --outDir ../dist --emptyOutDir"
```
Lệnh này ép Vite build ra thư mục `dist` nằm ngay tại `src/application`, giúp Vercel dễ dàng phục vụ file tĩnh hơn.

### Tại sao lỗi `Missing public directory`?
Nếu không cấu hình **Output Directory** là `dist`, Vercel (khi không nhận diện được framework) sẽ mặc định tìm thư mục tên là `public`. Vì code build ra `dist` nên nó báo lỗi.

### API hoạt động thế nào?
File `api/index.js` đóng vai trò cầu nối. Vercel tự động biến các file trong thư mục `api` thành Serverless Functions. Mọi request gọi vào `/api/...` sẽ được `vercel.json` dẫn vào đây.

---
**Lưu ý:** Nếu sau này bạn cập nhật code, chỉ cần push lên Git, Vercel sẽ tự động build lại theo cấu hình này.
