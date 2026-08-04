# Thiết Kế Biên Giới Dịch Vụ (Service Boundaries & Architecture)

Tài liệu mô tả kiến trúc phân rã dịch vụ (Service Decomposition), nguyên tắc quản lý dữ liệu độc lập và bảng định tuyến API Gateway cho hệ thống Quản lý Đăng ký Học phần (CRS Microservices).

---

## 1. Mô tả 4 Thành phần Chính (Service Boundaries)

Hệ thống được chia thành 4 service độc lập theo nguyên tắc hướng nghiệp vụ (Business Capability):

1. **API Gateway (`api-gateway`)**
    * **Vai trò:** Là cổng giao tiếp duy nhất (Single Point of Entry) tiếp nhận mọi request từ Client (Web/Mobile/Postman).
    * **Nhiệm vụ:** Định tuyến request (Routing), kiểm tra xác thực (Authentication check via Auth Service), hạn chế lưu lượng (Rate limiting) và ghi log.

2. **Auth Service (`auth-service`)**
    * **Vai trò:** Quản lý tài khoản, phân quyền và bảo mật.
    * **Nhiệm vụ:** Xử lý đăng ký, đăng nhập, xác thực danh tính người dùng và cấp phát/xác thực JSON Web Token (JWT).
    * **Cơ sở dữ liệu riêng:** `auth_db` (Bảng `users`, `roles`, `permissions`).

3. **Course Service (`course-service`)**
    * **Vai trò:** Quản lý danh mục học phần và quản lý số lượng chỗ trống (slot).
    * **Nhiệm vụ:** Cung cấp thông tin môn học; xử lý các nghiệp vụ nội bộ giữ chỗ (`reserve-seat`) và hoàn trả chỗ (`release-seat`).
    * **Cấu hình:** Chạy độc lập tại cổng **8082**.
    * **Cơ sở dữ liệu riêng:** `course_db` (Bảng `courses`, `course_schedules`).

4. **Registration Service (`registration-service`)**
    * **Vai trò:** Quản lý nghiệp vụ đăng ký học phần của sinh viên.
    * **Nhiệm vụ:** Ghi nhận đăng ký, hủy đăng ký, phối hợp với `course-service` để đảm bảo không bị vượt quá số slot quy định.
    * **Cơ sở dữ liệu riêng:** `registration_db` (Bảng `registrations`, `registration_items`).

---

## 2. Nguyên Tắc Cơ Sở Dữ Liệu Riêng (Database per Service)

* **Độc lập dữ liệu (Shared-nothing):** Mỗi microservice sở hữu một Database MySQL 8 riêng biệt (`auth_db`, `course_db`, `registration_db`).
* **Không truy cập chéo:** Các service **tuyệt đối không** truy cập trực tiếp vào database của service khác.
* **Giao tiếp liên dịch vụ:** Mọi liên kết hoặc tương tác nghiệp vụ cần dữ liệu chéo đều phải thông qua giao thức REST API (hoặc Message Queue).

---

## 3. Bảng Định Tuyến Gateway Dự Kiến (Expected Gateway Routing Table)

API Gateway sẽ định tuyến các request dựa trên tiền tố đường dẫn (Path Prefix):

| Đường dẫn (Path Pattern) | Service Đích (Target Service) | Cổng dự kiến | Yêu cầu xác thực (Auth) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/**` | `auth-service` | `8081` | Không | Đăng nhập, đăng ký tài khoản |
| `/api/courses/**` | `course-service` | `8082` | Có (hoặc Public với GET) | Tra cứu và quản lý học phần |
| `/api/registrations/**` | `registration-service` | `8083` | Có (JWT Token) | Đăng ký và xem kết quả học phần |# Thiết Kế Biên Giới Dịch Vụ (Service Boundaries & Architecture)

Tài liệu mô tả kiến trúc phân rã dịch vụ (Service Decomposition), nguyên tắc quản lý dữ liệu độc lập và bảng định tuyến API Gateway cho hệ thống Quản lý Đăng ký Học phần (CRS Microservices).

---

## 1. Mô tả 4 Thành phần Chính (Service Boundaries)

Hệ thống được chia thành 4 service độc lập theo nguyên tắc hướng nghiệp vụ (Business Capability):

1. **API Gateway (`api-gateway`)**
    * **Vai trò:** Là cổng giao tiếp duy nhất (Single Point of Entry) tiếp nhận mọi request từ Client (Web/Mobile/Postman).
    * **Nhiệm vụ:** Định tuyến request (Routing), kiểm tra xác thực (Authentication check via Auth Service), hạn chế lưu lượng (Rate limiting) và ghi log.

2. **Auth Service (`auth-service`)**
    * **Vai trò:** Quản lý tài khoản, phân quyền và bảo mật.
    * **Nhiệm vụ:** Xử lý đăng ký, đăng nhập, xác thực danh tính người dùng và cấp phát/xác thực JSON Web Token (JWT).
    * **Cơ sở dữ liệu riêng:** `auth_db` (Bảng `users`, `roles`, `permissions`).

3. **Course Service (`course-service`)**
    * **Vai trò:** Quản lý danh mục học phần và quản lý số lượng chỗ trống (slot).
    * **Nhiệm vụ:** Cung cấp thông tin môn học; xử lý các nghiệp vụ nội bộ giữ chỗ (`reserve-seat`) và hoàn trả chỗ (`release-seat`).
    * **Cấu hình:** Chạy độc lập tại cổng **8082**.
    * **Cơ sở dữ liệu riêng:** `course_db` (Bảng `courses`, `course_schedules`).

4. **Registration Service (`registration-service`)**
    * **Vai trò:** Quản lý nghiệp vụ đăng ký học phần của sinh viên.
    * **Nhiệm vụ:** Ghi nhận đăng ký, hủy đăng ký, phối hợp với `course-service` để đảm bảo không bị vượt quá số slot quy định.
    * **Cơ sở dữ liệu riêng:** `registration_db` (Bảng `registrations`, `registration_items`).

---

## 2. Nguyên Tắc Cơ Sở Dữ Liệu Riêng (Database per Service)

* **Độc lập dữ liệu (Shared-nothing):** Mỗi microservice sở hữu một Database MySQL 8 riêng biệt (`auth_db`, `course_db`, `registration_db`).
* **Không truy cập chéo:** Các service **tuyệt đối không** truy cập trực tiếp vào database của service khác.
* **Giao tiếp liên dịch vụ:** Mọi liên kết hoặc tương tác nghiệp vụ cần dữ liệu chéo đều phải thông qua giao thức REST API (hoặc Message Queue).

---

## 3. Bảng Định Tuyến Gateway Dự Kiến (Expected Gateway Routing Table)

API Gateway sẽ định tuyến các request dựa trên tiền tố đường dẫn (Path Prefix):

| Đường dẫn (Path Pattern) | Service Đích (Target Service) | Cổng dự kiến | Yêu cầu xác thực (Auth) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/**` | `auth-service` | `8081` | Không | Đăng nhập, đăng ký tài khoản |
| `/api/courses/**` | `course-service` | `8082` | Có (hoặc Public với GET) | Tra cứu và quản lý học phần |
| `/api/registrations/**` | `registration-service` | `8083` | Có (JWT Token) | Đăng ký và xem kết quả học phần |