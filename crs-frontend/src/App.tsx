import { useEffect, useState } from 'react';
import { getCourses } from './api/courseApi';
import type { Course } from './types/course';
import './App.css';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((res) => {
        setCourses(res.data.content);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Không kết nối được tới hệ thống.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">COURSE REGISTRATION SYSTEM</p>
          <h1>CRS Dashboard</h1>
          <p className="subtitle">Frontend React đang kết nối qua API Gateway</p>
        </div>

        <div className={`status ${error ? 'status-error' : 'status-success'}`}>
          <span className="status-dot"></span>
          {error ? 'Gateway lỗi' : 'Gateway hoạt động'}
        </div>
      </header>

      <main className="content">
        <section className="summary">
          <div className="summary-card">
            <span>Tổng môn học</span>
            <strong>{courses.length}</strong>
          </div>
          <div className="summary-card">
            <span>API Gateway</span>
            <strong>:8080</strong>
          </div>
          <div className="summary-card">
            <span>Frontend</span>
            <strong>:5173</strong>
          </div>
        </section>

        <section className="course-section">
          <div className="section-header">
            <h2>Danh sách môn học</h2>
            <p>Dữ liệu được lấy qua GET /api/courses</p>
          </div>

          {loading && <div className="message">Đang tải dữ liệu...</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && !error && courses.length === 0 && (
            <div className="message">Chưa có môn học nào.</div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên môn học</th>
                    <th>Số tín chỉ</th>
                    <th>Số chỗ tối đa</th>
                    <th>Số chỗ còn lại</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>#{course.id}</td>
                      <td className="course-name">{course.tenMonHoc}</td>
                      <td>{course.soTinChi}</td>
                      <td>{course.soChoToiDa}</td>
                      <td><span className="available">{course.soChoConLai}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
