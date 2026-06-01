# 🏥 MedCare — Hệ thống đặt lịch khám phòng khám tư

Frontend cho hệ thống quản lý và đặt lịch khám bệnh trực tuyến.  
Xây dựng bằng **React 19 + Vite 8 + Tailwind CSS 3**.

---

## 📋 Máy cần cài gì trước khi clone?

Đây là danh sách **bắt buộc phải có** trên máy trước khi chạy project:

### 1. Node.js
- **Phiên bản tối thiểu:** 18.x  
- **Phiên bản khuyến nghị:** 20 LTS hoặc 22 LTS  
- **Phiên bản đang dùng khi dev:** 24.15.0  
- **Tải tại:** https://nodejs.org/en/download  
- Sau khi cài Node.js, `npm` sẽ được cài kèm tự động.

> Kiểm tra đã cài chưa:
> ```bash
> node --version   # phải ra v18.x trở lên
> npm --version    # phải ra 9.x trở lên
> ```

### 2. Git
- **Phiên bản:** bất kỳ (2.x trở lên)
- **Tải tại:** https://git-scm.com/downloads
- Cần để clone repository về máy.

> Kiểm tra đã cài chưa:
> ```bash
> git --version
> ```

### 3. Trình duyệt
- Chrome, Edge, Firefox phiên bản mới nhất — để xem kết quả.

### 4. Editor (không bắt buộc nhưng khuyến nghị)
- **VS Code:** https://code.visualstudio.com  
- Extension gợi ý: `ES7+ React Snippets`, `Tailwind CSS IntelliSense`, `Prettier`

---

## 🚀 Các bước chạy sau khi clone

Sau khi đã cài đủ Node.js và Git ở trên, làm theo thứ tự:

### Bước 1 — Clone repository về máy
```bash
git clone https://github.com/your-username/booking-care.git
cd booking-care
```

### Bước 2 — Cài các thư viện (chỉ cần làm 1 lần)
```bash
npm install
```
> Lệnh này đọc `package.json` và tự tải toàn bộ thư viện vào thư mục `node_modules/`.  
> Mất khoảng 30–60 giây tùy tốc độ mạng.

### Bước 3 — Tạo file cấu hình môi trường
```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Sau đó mở file `.env` và điền URL backend:
```env
VITE_API_URL=http://localhost:8080/api
```
> Nếu **chưa có backend**, giữ nguyên dòng trên — frontend sẽ tự dùng dữ liệu mẫu (mock data), không bị lỗi.

### Bước 4 — Chạy ứng dụng
```bash
npm run dev
```
Mở trình duyệt tại: **http://localhost:5173**

---

## 🔐 Tài khoản mẫu để đăng nhập thử

| Role | Email | Mật khẩu |
|---|---|---|
| 👤 Người dùng | user@medcare.vn | user123 |
| 👨‍⚕️ Bác sĩ | doctor@medcare.vn | doctor123 |
| 🛡️ Admin | admin@medcare.vn | admin123 |
| 🏥 Lễ tân | staff@medcare.vn | staff123 |

---

## 📦 Phiên bản thư viện chính

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| React | 19.2.6 | UI framework |
| React DOM | 19.2.6 | Render vào DOM |
| React Router DOM | 7.15.1 | Điều hướng trang |
| Axios | 1.16.1 | Gọi API backend |
| Vite | 8.0.12 | Build tool / Dev server |
| Tailwind CSS | 3.4.19 | CSS utility framework |
| PostCSS | 8.5.15 | Xử lý CSS |
| Autoprefixer | 10.5.0 | Tự thêm vendor prefix CSS |

---

## 📋 Các lệnh thường dùng

```bash
npm run dev       # Chạy dev server tại localhost:5173 (có hot reload)
npm run build     # Build production → xuất ra thư mục dist/
npm run preview   # Xem trước bản build production tại localhost:4173
npm run lint      # Kiểm tra lỗi code theo ESLint
```

---

## 🗂 Cấu trúc thư mục

```
booking-care/
├── public/               # File tĩnh (favicon, icons)
├── src/
│   ├── api/              # Gọi API backend (ánh xạ với DTO)
│   │   ├── config.js     # Axios instance + JWT interceptor
│   │   ├── auth.js       # Đăng nhập, đăng ký
│   │   ├── users.js      # Quản lý user, profile
│   │   ├── appointments.js # Lịch hẹn, lịch làm việc
│   │   ├── medical.js    # Hồ sơ bệnh án, đơn thuốc
│   │   ├── catalog.js    # Chuyên khoa, thuốc, bệnh lý
│   │   ├── payments.js   # Thanh toán
│   │   └── index.js      # Export tất cả
│   │
│   ├── components/       # Component dùng chung
│   ├── context/          # AuthContext (quản lý đăng nhập)
│   ├── data/             # mockData.js (dữ liệu mẫu fallback)
│   ├── hooks/            # Custom hooks (useApi, useDoctors...)
│   ├── pages/            # Các trang của ứng dụng
│   │   └── dashboard/    # Dashboard theo từng role
│   ├── App.jsx           # Router chính
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind directives
│
├── .env                  # ⚠️ KHÔNG commit — chứa URL backend
├── .env.example          # ✅ Commit — template cho người clone
├── .gitignore
├── package.json          # Danh sách thư viện và scripts
├── vite.config.js        # Cấu hình Vite
├── tailwind.config.js    # Cấu hình Tailwind
└── README.md
```

---

## ⚠️ Lưu ý quan trọng

| Vấn đề | Giải thích |
|---|---|
| Không thấy `node_modules/` | Bình thường — chạy `npm install` để tạo |
| Không thấy `dist/` | Bình thường — chạy `npm run build` để tạo |
| Không có file `.env` | Tạo bằng lệnh `copy .env.example .env` |
| Lỗi "port 5173 in use" | Đổi port: `npm run dev -- --port 3000` |
| Backend chưa chạy | Không sao — FE tự dùng mock data |

---

## 🌐 Deploy lên hosting

```bash
npm run build
# Thư mục dist/ chứa toàn bộ file tĩnh → upload lên Vercel / Netlify / Nginx
```

**Vercel / Netlify:** Thêm biến môi trường `VITE_API_URL` trong phần Settings → Environment Variables của project.

---

## 🔗 Liên kết

- Backend repository: *(điền link repo BE vào đây)*
- API Documentation: *(điền link Swagger/Postman vào đây)*
