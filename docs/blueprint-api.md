# Blueprint API - Hệ thống Quản lý Đăng ký Học phần (CRS Microservices)

Tài liệu này mô tả danh sách các API Endpoint cho 3 service chính trong hệ thống, bao gồm cả các API nội bộ phục vụ giao tiếp giữa các microservices.

---

## 1. Course Service (Cổng mặc định: 8082)
Quản lý thông tin môn học, học phần và số lượng chỗ trống.

### 1.1. Public APIs (Dành cho Client / qua API Gateway)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/courses` | Lấy danh sách toàn bộ học phần |
| **GET** | `/courses/{id}` | Lấy thông tin chi tiết của một học phần |
| **POST** | `/courses` | Thêm học phần mới (Admin) |

### 1.2. Internal APIs (Giao tiếp nội bộ giữa các Service)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **POST** | `/internal/courses/{id}/reserve-seat` | Giữ chỗ (giảm số slot trống khi sinh viên đăng ký) |
| **POST** | `/internal/courses/{id}/release-seat` | Hoàn chỗ (tăng số slot trống khi hủy đăng ký / lỗi transaction) |

---

## 2. Auth Service
Quản lý xác thực, phân quyền và cấp Token cho người dùng.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **POST** | `/auth/login` | Đăng nhập hệ thống, trả về JWT Token |
| **POST** | `/auth/register` | Đăng ký tài khoản mới (Sinh viên / Giảng viên) |
| **POST** | `/auth/validate` | Kiểm tra tính hợp lệ của Token (Gateway gọi) |

---

## 3. Registration Service
Quản lý nghiệp vụ đăng ký học phần của sinh viên.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **POST** | `/registrations` | Gửi yêu cầu đăng ký học phần (gọi sang `course-service` để reserve-seat) |
| **GET** | `/registrations/student/{studentId}` | Xem danh sách học phần sinh viên đã đăng ký thành công |
| **DELETE** | `/registrations/{id}` | Hủy đăng ký học phần (gọi sang `course-service` để release-seat) |