# Tài Liệu Cấu Trúc Dự Án & Cơ Chế Hoạt Động (Project Architecture)

Tài liệu này mô tả chi tiết cách tổ chức thư mục, kiến trúc của Server và Client, cũng như luồng dữ liệu và cách thức tương tác giữa chúng trong dự án `petcarex-management`.

## 1. Cấu Trúc Thư Mục (Directory Structure)

Dự án được tổ chức theo mô hình **Monorepo** (đơn giản), tách biệt rõ ràng giữa Frontend (Client) và Backend (Server) nhưng nằm chung trong một kho chứa.

```
src/application/
├── client/                 # Mã nguồn Frontend (React + Vite)
│   ├── dist/               # Thư mục chứa code sau khi build (Production)
│   ├── src/                # Source code chính (Components, Features, Services)
│   │   └── services/       # Chứa logic gọi API (api.js)
│   ├── vite.config.ts      # Cấu hình Vite (Proxy, Plugins)
│   └── package.json        # Dependencies của Client
├── server/                 # Mã nguồn Backend (Node.js + Express)
│   ├── config/             # Cấu hình (Database, Env)
│   ├── controllers/        # Logic xử lý điều khiển
│   ├── routes/             # Định nghĩa các API endpoint
│   ├── index.js            # Entry point của Server
│   └── package.json        # Dependencies của Server
└── DEPLOY_RENDER.md        # Hướng dẫn deploy
```

## 2. Server Architecture (Backend)

Server được xây dựng bằng **Node.js** với **Express Framework**.

*   **Entry Point (`server/index.js`)**:
    *   Khởi tạo Express app.
    *   Cấu hình Middleware: `cors` (cho phép requests từ nguồn khác), `express.json` (parse body JSON), và custom logger.
    *   **API Routes**: Các routes được định nghĩa dưới prefix `/api` (ví dụ: `/api/auth`, `/api/dashboard`).
    *   **Static File Serving**: Server được cấu hình để phục vụ static files từ thư mục `client/dist` (dòng 34-35). Điều này cho phép server trả về giao diện Frontend khi chạy ở môi trường Production.
    *   **Catch-All Route**: Mọi request không khớp với API routes sẽ trả về `index.html` của client (dòng 54-56) để hỗ trợ Client-Side Routing của React.

## 3. Client Architecture (Frontend)

Client được xây dựng bằng **React** và sử dụng **Vite** làm build tool.

*   **Vite Configuration (`client/vite.config.ts`)**:
    *   Sử dụng `@vitejs/plugin-react` và `@tailwindcss/vite`.
    *   **Proxy Setup**: Cấu hình proxy để chuyển tiếp các request bắt đầu bằng `/api` sang server backend (`http://localhost:5000`) khi chạy ở chế độ Development (dòng 12-18).
*   **API Service (`client/src/services/api.js`)**:
    *   Sử dụng thư viện **Axios** để gọi HTTP requests.
    *   **Base URL**: Được cấu hình lấy từ biếm môi trường `VITE_API_URL` hoặc mặc định là `/api`.
    *   **Interceptors**: Tự động đính kèm `Authorization: Bearer <token>` vào header của mỗi request nếu token tồn tại trong localStorage.

## 4. Cơ Chế Hoạt Động & Tương Tác (Interaction Flow)

Cách Client và Server tương tác thay đổi tùy theo môi trường (Development vs Production).

### A. Môi Trường Development (Local)

Ở chế độ này, chúng ta chạy 2 quy trình song song:
1.  **Server**: Chạy trên cổng **5000** (`npm start` trong thư mục server).
2.  **Client (Vite Dev Server)**: Chạy trên cổng mặc định (thường là **5173**) (`npm run dev` trong thư mục client).

**Luồng request:**
1.  Trình duyệt truy cập `http://localhost:5173`.
2.  Khi người dùng thực hiện thao tác (ví dụ: Đăng nhập), Client gọi API tới `/api/auth/login`.
3.  **Vite Proxy** nhận thấy request bắt đầu bằng `/api`, nó sẽ âm thầm chuyển tiếp request này tới `http://localhost:5000/api/auth/login`.
4.  Server xử lý và trả về phản hồi cho Vite, Vite trả lại cho trình duyệt.
5.  *Cơ chế này giúp tránh lỗi CORS khi phát triển.*

### B. Môi Trường Production (Deployment)

Ở chế độ này, Client được "build" thành các file tĩnh (HTML, CSS, JS) và được phục vụ bởi chính Server Backend.

**Quy trình:**
1.  Chạy lệnh build tại client: Code React được biên dịch và lưu vào thư mục `client/dist`.
2.  Server Backend (`server/index.js`) trỏ tới thư mục `../dist` này nhờ dòng lệnh `app.use(express.static(distPath))`.

**Luồng request:**
1.  Người dùng truy cập vào URL của Server (ví dụ: `https://my-app.onrender.com`).
2.  Server trả về file `index.html` từ thư mục `dist`.
3.  Khi Client gọi API (ví dụ `/api/auth/profile`), request được gửi trực tiếp tới Server (cùng domain nên không cần Proxy).
4.  Server nhận request tại endpoint `/api/...` và xử lý trực tiếp.
5.  Nếu người dùng truy cập một đường dẫn lạ (ví dụ `/dashboard`), Server không tìm thấy file file tĩnh hay API route nào khớp, nó sẽ rơi vào **Catch-All Handler** và trả về lại `index.html`. React Router sau đó sẽ xử lý việc hiển thị trang Dashboard phía client.

## 5. Tóm Tắt Kết Nối

| Thành phần | Development | Production |
| :--- | :--- | :--- |
| **Server Port** | 5000 | 5000 (hoặc biến môi trường PORT) |
| **Client Port** | 5173 (Vite) | N/A (Chạy trên cùng port Server) |
| **API Call** | Client -> Proxy (Vite) -> Server | Client -> Server (Trực tiếp) |
| **Static Files** | Vite phục vụ | Express phục vụ |

---
*Tài liệu này được tạo tự động dựa trên phân tích mã nguồn hiện tại.*
