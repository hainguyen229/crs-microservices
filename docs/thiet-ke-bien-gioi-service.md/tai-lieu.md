# B.1. Thi kế Biên giới Service

## 1. Danh sách Service
| Service                  | Cổng | Database          | Trách nhiệm chính                                        |
|:-------------------------|:-----|:------------------|:---------------------------------------------------------|
| **api-gateway**          | 8080 | *(không có DB)*   | Điểm vào duy nhất, định tuyến, xác thực sơ bộ, CORS      |
| **auth-service**         | 8081 | `auth_db`         | Quản lý User, Student, đăng nhập, sinh/xác thực JWT      |
| **course-service**       | 8082 | `course_db`       | Quản lý Course, tìm kiếm, phân trang, quản lý số chỗ     |
| **registration-service** | 8083 | `registration_db` | Quản lý Registration, gọi sang course-service để đăng ký |

## 2. Nguyên tắc sở hữu dữ liệu (Data Ownership)
- Mỗi service có DATABASE RIÊNG, KHÔNG service nào được truy cập trực tiếp DB của service khác.
- Muốn lấy/thay đổi dữ liệu của service khác -> PHẢI gọi REST API sang service đó.
- registration-service KHÔNG có bảng Course, chỉ lưu courseId (Kieu số, không có khoá ngoại thật).