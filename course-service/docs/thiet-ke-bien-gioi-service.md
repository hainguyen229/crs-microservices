# THIẾT KẾ BIÊN GIỚI SERVICE – CRS MICROSERVICES

> Tài liệu tổng hợp và tinh chỉnh dựa trên nội dung 5 buổi thực hành của hệ thống CRS Microservices.

## 1. Danh sách Service

| Service | Cổng | Database | Trách nhiệm chính |
|---|---:|---|---|
| `api-gateway` | 8080 | Không có DB | Điểm vào duy nhất từ Frontend/đối tác; định tuyến request; RewritePath; chặn sớm request thiếu Authorization; kiểm tra API Key cho đối tác; cấu hình CORS tập trung. |
| `auth-service` | 8081 | `auth_db` | Quản lý `User`, `Student`; xác thực username/password; mã hóa BCrypt; sinh JWT chứa username và role. |
| `course-service` | 8082 | `course_db` | Quản lý `Course`; CRUD; validation; tìm kiếm, phân trang, sắp xếp; quản lý `soChoConLai`; API nội bộ reserve-seat/release-seat. |
| `registration-service` | 8083 | `registration_db` | Quản lý `Registration`; kiểm tra đăng ký trùng; gọi API nội bộ của course-service để giữ/hoàn chỗ; lưu trạng thái đăng ký; tự xác thực JWT. |

### Thành phần Client

`crs-frontend` không phải backend service và không sở hữu database. Đây là ứng dụng Vite + React + TypeScript chạy mặc định ở cổng 5173. Frontend chỉ biết API Gateway qua:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Mọi lời gọi API từ Frontend phải đi qua Gateway, không gọi trực tiếp `8081`, `8082`, `8083`.

---

## 2. Nguyên tắc sở hữu dữ liệu (Data Ownership)

### 2.1. Mỗi service có database riêng

- `auth-service` chỉ truy cập `auth_db`.
- `course-service` chỉ truy cập `course_db`.
- `registration-service` chỉ truy cập `registration_db`.
- `api-gateway` không có database.
- Không service nào được truy cập trực tiếp database của service khác.

### 2.2. Muốn lấy/thay đổi dữ liệu service khác phải gọi REST API

`registration-service` không được truy vấn bảng `course`. Khi đăng ký, service gọi:

```http
PATCH http://localhost:8082/internal/courses/{id}/reserve-seat
```

Khi huỷ đăng ký, service gọi:

```http
PATCH http://localhost:8082/internal/courses/{id}/release-seat
```

### 2.3. Không tạo khóa ngoại xuyên database

Entity `Registration` chỉ lưu `studentId`, `courseId`, `trangThai`, `ngayDangKy`. `courseId` chỉ là số, không dùng `@ManyToOne` tới `Course` và không có foreign key thật xuyên `registration_db` → `course_db`.

Tính hợp lệ của `courseId` được kiểm tra thông qua REST API của `course-service`.

### 2.4. Auth data và JWT

`auth-service` là nơi phát hành JWT. `course-service` và `registration-service` không truy cập `auth_db`; chúng tự xác thực JWT bằng cùng `jwt.secret`. Gateway chỉ chặn sớm request thiếu header, không thay thế việc service tự verify token.

### 2.5. Giao dịch liên-service

Luồng đăng ký:
1. `registration-service` kiểm tra đăng ký trùng.
2. Gọi `course-service` để reserve seat.
3. Chỉ khi reserve thành công mới lưu `Registration` với `DA_DANG_KY`.

Luồng huỷ:
1. `registration-service` gọi `release-seat`.
2. Cập nhật trạng thái `DA_HUY`.

Đây là giao dịch phân tán đơn giản; phạm vi 5 buổi chưa triển khai Saga/Outbox.

---

## 3. Bảng định tuyến Gateway

| Route bên ngoài | Forward tới | Đường dẫn nội bộ | Bảo mật / Ghi chú |
|---|---|---|---|
| `/api/auth/**` | `http://localhost:8081` | `/auth/**` | `/api/auth/login` Public. |
| `/api/courses` | `http://localhost:8082` | `/courses` | GET Public; POST cần JWT và role ADMIN. |
| `/api/courses/**` | `http://localhost:8082` | `/courses/**` | GET Public; PUT/DELETE cần JWT và role ADMIN. |
| `/api/registrations` | `http://localhost:8083` | `/registrations` | Cần JWT; service tự verify token. |
| `/api/registrations/**` | `http://localhost:8083` | `/registrations/**` | Cần JWT; service tự verify token. |
| `/api/public/courses` | `http://localhost:8082` | `/courses` | Không dùng JWT; bắt buộc header `X-API-KEY`. |

### 3.1. API cố tình KHÔNG công khai qua Gateway

Gateway không khai báo route cho:

```text
/internal/courses/**
```

Chỉ `registration-service` gọi trực tiếp `course-service:8082`.

### 3.2. CORS tập trung tại Gateway

Gateway cho phép Frontend mặc định `http://localhost:5173`. Không cấu hình CORS riêng ở từng service.

---

## 4. Luồng giao tiếp chính

### Xem danh sách môn học

```text
React :5173
   ↓
GET /api/courses
   ↓
API Gateway :8080
   ↓
course-service :8082
   ↓
course_db
```

### Đăng nhập

```text
React/Postman
   ↓
POST /api/auth/login
   ↓
API Gateway :8080
   ↓
auth-service :8081
   ↓
auth_db
   ↓
JWT
```

### Đăng ký học phần

```text
Client
   ↓ JWT
POST /api/registrations
   ↓
API Gateway :8080
   ↓
registration-service :8083
   ↓
PATCH /internal/courses/{id}/reserve-seat
   ↓
course-service :8082
   ↓
course_db
   ↓
registration_db
```

---

## 5. Quy tắc bảo mật

- `GET /api/courses/**`: Public.
- `POST /api/courses`: chỉ `ADMIN`.
- `PUT /api/courses/{id}`: chỉ `ADMIN`.
- `DELETE /api/courses/{id}`: chỉ `ADMIN`.
- `/api/registrations/**`: phải đăng nhập; SecurityConfig Buổi 4 yêu cầu authenticated chung.
- `/api/public/courses`: dùng `X-API-KEY`, không dùng JWT.
- `/internal/**`: không công khai qua Gateway; dành cho gọi nội bộ.
- JWT secret phải giống nhau giữa các service cần verify JWT trong bài học; khi deploy thật cần chuyển secret ra biến môi trường/secret manager.

---
