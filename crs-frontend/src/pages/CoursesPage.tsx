import { useState, useCallback } from 'react';

import { useCourses } from '../api/useCourses';
import SearchBox from '../components/SearchBox';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';

export default function CoursesPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const {
    courses,
    totalPages,
    state,
    errorMessage,
    refetch,
  } = useCourses(keyword, page, 5);

  const handleSearch = useCallback(
    (newKeyword: string) => {
      if (newKeyword === keyword) {
        return;
      }

      setKeyword(newKeyword);
      setPage(0);
    },
    [keyword]
  );

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      <h1>Danh sách môn học</h1>

      <p>Xem và tìm kiếm các môn học trong hệ thống.</p>

      <div style={{ marginBottom: '20px' }}>
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
    </div>
  );
}