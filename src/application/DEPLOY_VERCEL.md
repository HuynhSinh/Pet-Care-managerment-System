# Hướng Dẫn Deploy Lên Vercel (Kết nối GitHub)

Dự án này được cấu hình **Monorepo** (gồm cả Client và Server) và sử dụng file `vercel.json` để tự động điều khiển việc build và deploy. Cách đơn giản nhất để deploy là kết nối với GitHub.

## Bước 1: Đẩy mã nguồn lên GitHub
1.  Tạo một repository mới trên GitHub (ví dụ: `petcarex`).
2.  Mở terminal tại thư mục gốc của dự án và chạy các lệnh sau:
    ```bash
    git init
    git add .
    git commit -m "First commit"
    git branch -M main
    git remote add origin https://github.com/<username>/petcarex.git
    git push -u origin main
    ```

## Bước 2: Tạo dự án trên Vercel
1.  Truy cập [https://vercel.com](https://vercel.com) và đăng nhập.
2.  Tại trang Dashboard, bấm nút **"Add New..."** -> chọn **"Project"**.
3.  Ở phần **Import Git Repository**, bạn sẽ thấy repo `petcarex` vừa tạo. Bấm nút **Import**.

## Bước 3: Cấu hình Project (Quan Trọng)
Tại màn hình **Configure Project**, hãy làm theo đúng các thiết lập sau:

1.  **Project Name**: Đặt tên tùy thích (vd: `petcarex-system`).
2.  **Framework Preset**: Chọn **Other** (Rất quan trọng! Để Vercel sử dụng cấu hình trong `vercel.json`).
3.  **Root Directory**: Để mặc định là `./` (Không thay đổi).
4.  **Build and Output Settings**: 
    *   **Không cần chỉnh sửa gì cả**. File `vercel.json` của chúng ta đã định nghĩa sẵn việc build Client và Server.
    *   *Lưu ý*: Nếu Vercel tự động điền các lệnh build, hãy xóa chúng đi hoặc đảm bảo "Override" được tắt. Chúng ta muốn Vercel dùng `builds` trong `vercel.json`.
5.  **Environment Variables** (Tùy chọn):
    *   Nếu bạn dùng Supabase thật, hãy mở rộng phần này và thêm:
        *   `SUPABASE_URL`: (URL Supabase của bạn)
        *   `SUPABASE_KEY`: (Key anon/public của bạn)
    *   Nếu chưa có, cứ để trống (Hệ thống sẽ chạy chế độ Mock Data).

## Bước 4: Triển khai
1.  Bấm nút **Deploy**.
2.  Chờ khoảng 1-2 phút để Vercel tải dependencies và build.
3.  Khi hoàn tất, màn hình sẽ hiện chúc mừng. Bấm vào ảnh thumbnail để truy cập trang web.

---

## Kiến trúc Deploy (Dành cho Developer)
File `vercel.json` đóng vai trò nhạc trưởng:
*   **Builds**:
    *   `client/package.json`: Sử dụng `@vercel/static-build` để build React Vite ra thư mục `dist`.
    *   `server/index.js`: Sử dụng `@vercel/node` để biến Express server thành một Serverless Function.
*   **Routes**:
    *   `/api/*`: Mọi request bắt đầu bằng `/api/` sẽ được chuyển hướng vào Serverless Function.
    *   `/*`: Các request còn lại (VD: `/`, `/hr`, `/login`) sẽ trả về file `client/index.html` để React Router xử lý (SPA routing).

## Khắc phục sự cố thường gặp
*   **Lỗi 404 khi F5 trang con**: Đã được xử lý bởi `rewrites` trong `vercel.json` (trỏ tất cả về index.html).
*   **Lỗi API trả về 500**: Vào tab **Logs** trên Vercel Dashboard, chọn filter là Function (server/index.js) để xem lỗi chi tiết của Backend.
