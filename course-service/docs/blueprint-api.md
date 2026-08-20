# BLUEPRINT API – CRS MICROSERVICES

> Blueprint tổng hợp sau khi đối chiếu nội dung Buổi 1–5.

## 1. Quy ước chung

Tất cả Frontend/client thông thường gọi qua:

```text
http://localhost:8080
```

JWT:

```http
Authorization: Bearer <token>
```

Đối tác:

```http
X-API-KEY: <api-key>
```

Format lỗi thống nhất:

```json
{"message":"..."}
```

hoặc validation:

```json
{"tenField":"noi dung loi"}
```

---

## 2. auth-service

- Cổng: `8081`
- Database: `auth_db`
- Prefix nội bộ: `/auth`
- Prefix qua Gateway: `/api/auth`

| Method | Endpoint nội bộ | Endpoint qua Gateway | Mô tả | Yêu cầu | Trạng thái sau 5 buổi |
|---|---|---|---|---|---|
| POST | `/auth/login` | `/api/auth/login` | Xác thực username/password, trả JWT + username + role | Public | **Đã triển khai** |
| POST | `/auth/register` | `/api/auth/register` | Đăng ký tài khoản | Public | **Tùy chọn / chưa triển khai trong code 5 buổi** |

Response login:

```json
{
  "token": "<jwt>",
  "username": "student1",
  "role": "STUDENT"
}
```

Role: `ADMIN`, `STUDENT`.

---

## 3. course-service

- Cổng: `8082`
- Database: `course_db`
- Prefix nội bộ: `/courses`
- Prefix qua Gateway: `/api/courses`

### 3.1. API dành cho Frontend/Admin

| Method | Endpoint nội bộ | Endpoint qua Gateway | Mô tả | Yêu cầu | Trạng thái |
|---|---|---|---|---|---|
| GET | `/courses` | `/api/courses` | Danh sách môn học; search + pagination + sort | Public | **Đã triển khai** |
| GET | `/courses/{id}` | `/api/courses/{id}` | Chi tiết môn học | Public | **Đã triển khai** |
| POST | `/courses` | `/api/courses` | Thêm môn học | JWT + `ADMIN` | **Đã triển khai** |
| PUT | `/courses/{id}` | `/api/courses/{id}` | Sửa môn học | JWT + `ADMIN` | **Đã triển khai** |
| DELETE | `/courses/{id}` | `/api/courses/{id}` | Xóa môn học | JWT + `ADMIN` | **Đã triển khai** |

Query parameter GET `/courses`: `keyword`, `page`, `size`, `sort`.

Ví dụ:

```http
GET /api/courses?keyword=java&page=0&size=10&sort=tenMonHoc,asc
```

### 3.2. API nội bộ – KHÔNG lộ ra Gateway

| Method | Endpoint | Mô tả | Caller | Trạng thái |
|---|---|---|---|---|
| PATCH | `/internal/courses/{id}/reserve-seat` | Kiểm tra còn chỗ, giảm `soChoConLai` đi 1; transactional | `registration-service` | **Đã triển khai** |
| PATCH | `/internal/courses/{id}/release-seat` | Hoàn lại 1 chỗ, không vượt `soChoToiDa` | `registration-service` | **Đã triển khai** |

Hết chỗ → HTTP 409.

---

## 4. registration-service

- Cổng: `8083`
- Database: `registration_db`
- Prefix nội bộ: `/registrations`
- Prefix qua Gateway: `/api/registrations`

| Method | Endpoint nội bộ | Endpoint qua Gateway | Mô tả | Yêu cầu | Trạng thái sau 5 buổi |
|---|---|---|---|---|---|
| POST | `/registrations` | `/api/registrations` | Đăng ký học phần; kiểm tra trùng; gọi `reserve-seat`; chỉ lưu DB khi reserve thành công | JWT; Blueprint ban đầu: `STUDENT` | **Đã triển khai** |
| GET | `/registrations/my` | `/api/registrations/my` | Danh sách đăng ký của sinh viên hiện tại | JWT + `STUDENT` | **Blueprint dự kiến, chưa có trong controller Buổi 3** |
| DELETE | `/registrations/{id}` | `/api/registrations/{id}` | Huỷ đăng ký; gọi `release-seat`, sau đó đổi trạng thái `DA_HUY` | JWT; Blueprint ban đầu: `STUDENT/ADMIN` | **Đã triển khai** |

Body đăng ký:

```json
{
  "studentId": 1,
  "courseId": 1
}
```

Dữ liệu Registration:

```json
{
  "id": 1,
  "studentId": 1,
  "courseId": 1,
  "trangThai": "DA_DANG_KY",
  "ngayDangKy": "2026-08-20T10:00:00"
}
```

Trạng thái: `DA_DANG_KY`, `DA_HUY`.

### Quyền thực tế ở Buổi 4

SecurityConfig của registration-service áp dụng authenticated chung cho toàn bộ `/registrations/**`, tức ADMIN hoặc STUDENT có token hợp lệ đều đi qua tầng SecurityConfig. Blueprint ban đầu mô tả role chi tiết hơn; muốn đúng tuyệt đối Blueprint cần bổ sung rule role-specific sau này.

---

## 5. api-gateway

- Cổng: `8080`
- Không có database.

| Route | Forward tới | Rewrite | Bảo mật |
|---|---|---|---|
| `/api/auth/**` | `auth-service:8081` | `/auth/**` | `/api/auth/login` Public |
| `/api/courses` | `course-service:8082` | `/courses` | GET Public; POST cần Authorization |
| `/api/courses/**` | `course-service:8082` | `/courses/**` | GET Public; PUT/DELETE cần Authorization |
| `/api/registrations` | `registration-service:8083` | `/registrations` | Cần Authorization |
| `/api/registrations/**` | `registration-service:8083` | `/registrations/**` | Cần Authorization |
| `/api/public/courses` | `course-service:8082` | `/courses` | Bắt buộc `X-API-KEY` |

### AuthHeaderFilter

Public:

```text
/api/auth/login
/api/public/courses
GET /api/courses/**
```

Request khác thiếu `Authorization` → HTTP 401.

### ApiKeyFilter

`GET /api/public/courses` bắt buộc `X-API-KEY`; sai/thiếu → HTTP 403.

### Internal API không định tuyến

Gateway không có route `/internal/courses/**`, do đó Frontend không gọi được reserve/release qua cổng 8080.

---

## 6. crs-frontend

`crs-frontend` không phải REST service, nhưng là client chính sau Buổi 5.

- Vite + React + TypeScript
- Cổng dev mặc định: `5173`
- Base URL duy nhất:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Axios chỉ gọi đường dẫn tương đối như `/api/courses`; Frontend không chứa địa chỉ trực tiếp `8081`, `8082`, `8083`.

---

## 7. Ma trận quyền tổng hợp

| Chức năng | Public | STUDENT | ADMIN | API Key |
|---|:---:|:---:|:---:|:---:|
| Login | ✓ | ✓ | ✓ | - |
| Xem danh sách/chi tiết môn học | ✓ | ✓ | ✓ | - |
| Thêm môn học | - | - | ✓ | - |
| Sửa môn học | - | - | ✓ | - |
| Xóa môn học | - | - | ✓ | - |
| Đăng ký học phần | - | ✓* | ✓* | - |
| Hủy đăng ký | - | ✓* | ✓* | - |
| Xem `/registrations/my` | - | ✓ | - | - |
| Đối tác xem môn học | - | - | - | ✓ |

`*` Theo SecurityConfig Buổi 4, registration-service hiện yêu cầu authenticated chung cho ADMIN/STUDENT; Blueprint Buổi 1 mô tả role chi tiết hơn.

---

## 8. Luồng API quan trọng

### Đăng ký môn học

```text
POST /api/registrations
        │
        ▼
API Gateway
        │
        ▼
registration-service
        │
        ├─ kiểm tra đăng ký trùng
        ├─ PATCH /internal/courses/{id}/reserve-seat
        └─ lưu Registration nếu reserve thành công
```

### Hủy đăng ký

```text
DELETE /api/registrations/{id}
        │
        ▼
registration-service
        │
        ├─ PATCH /internal/courses/{courseId}/release-seat
        └─ cập nhật trangThai = DA_HUY
```

---
