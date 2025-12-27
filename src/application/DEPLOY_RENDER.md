# Hướng Dẫn Deploy Lên Render (Cập Nhật Sửa Lỗi)

Tài liệu này đã được cập nhật để khắc phục lỗi "Permission denied" khi build.

## 1. Cấu Trúc Deploy

*   **Service**: Single Web Service.
*   **Source**: Git Repository.
*   **Build Command**: Tự động cài đặt và build cả Client lẫn Server.

## 2. Các Bước Thực Hiện

### Bước 0: Clear Cache (Quan Trọng)
Vì lần build trước bị lỗi, file rác có thể còn tồn tại.
1.  Vào Dashboard của Service trên Render.
2.  Nhấn nút **Manual Deploy** -> Chọn **Clear build cache & deploy**.
    *   *Điều này cực kỳ quan trọng để đảm bảo Render tải lại các quyền (permissions) chính xác.*

### Bước 1: Cấu hình Web Service
Nếu đã tạo Service rồi, hãy vào tab **Settings** và kiểm tra lại:

*   **Build Command**: `npm run build`
    *   *Lưu ý*: Lệnh này gọi script trong `package.json` gốc, nó sẽ tự động chạy:
        1.  `npm install` (root)
        2.  `npm install --prefix client` (client dependencies)
        3.  `npm run build --prefix client` (client build - sử dụng `npx vite build` để tránh lỗi quyền)
        4.  `npm install --prefix server` (server dependencies)
*   **Start Command**: `npm start`
*   **Root Directory**: `src/application`

### Bước 2: Environment Variables
Đảm bảo bạn vẫn giữ các biến môi trường:
*   `DATABASE_URL`: (Kết nối Supabase)
*   `NODE_ENV`: `production`

## 3. Giải Thích Lỗi Trước Đó

Lỗi `sh: 1: vite: Permission denied` hoặc `code 127` xảy ra do Render không tìm thấy file thực thi `vite` trong đường dẫn mặc định hoặc bị lỗi quyền truy cập file binary.
Tôi đã sửa bằng cách:
1.  Thay đổi lệnh build của Client thành `npx vite build`. `npx` sẽ tự động tìm và chạy file thực thi một cách an toàn hơn.
2.  Cập nhật script build ở Root để dùng `--prefix` thay vì `cd`, giúp quá trình chạy ổn định hơn trên môi trường Linux của Render.

Chúc bạn deploy thành công! Nếu vẫn lỗi, hãy copy toàn bộ log và gửi lại cho tôi.
