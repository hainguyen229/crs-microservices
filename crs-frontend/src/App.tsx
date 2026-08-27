import { useState } from 'react';
import { useCourses } from './api/useCourses';
import SearchBox from './components/SearchBox';
import CourseList from './components/CourseList';
import Pagination from './components/Pagination';
import './App.css';

function App() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const {
    courses,
    totalPages,
    state,
    errorMessage,
    refetch,
  } = useCourses(keyword, page);

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
    setPage(0);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">COURSE REGISTRATION SYSTEM</p>
          <h1>CRS Dashboard</h1>
          <p className="subtitle">
            Danh sách môn học, tìm kiếm và phân trang qua API Gateway
          </p>
        </div>

        <div
          className={`status ${
            state === 'error' ? 'status-error' : 'status-success'
          }`}
        >
          <span className="status-dot"></span>
          {state === 'error' ? 'Gateway lỗi' : 'Gateway hoạt động'}
        </div>
      </header>

      <main className="content">
        <section className="summary">
          <div className="summary-card">
            <span>Số môn ở trang hiện tại</span>
            <strong>{courses.length}</strong>
          </div>

          <div className="summary-card">
            <span>API Gateway</span>
            <strong>:8080</strong>
          </div>

          <div className="summary-card">
            <span>Trang hiện tại</span>
            <strong>{page + 1}</strong>
          </div>
        </section>

        <section className="course-section">
          <div className="section-header">
            <div>
              <h2>Danh sách môn học</h2>
              <p>Dữ liệu được lấy qua GET /api/courses</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <SearchBox
              onSearch={handleSearch}
              placeholder="Tìm kiếm theo tên môn học..."
            />
          </div>

          <CourseList
            courses={courses}
            state={state}
            errorMessage={errorMessage}
            onRetry={refetch}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      </main>
    </div>
  );
}

export default App;