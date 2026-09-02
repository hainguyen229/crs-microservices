import { useState, useCallback } from 'react';
import axios from 'axios';

import { useCourses } from '../api/useCourses';
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from '../api/courseApi';

import SearchBox from '../components/SearchBox';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';
import CourseForm from '../components/CourseForm';

import type { Course, CourseFormValues } from '../types/course';
import type { ApiErrorResponse } from '../types/apiError';

export default function AdminCoursesPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const [editingCourse, setEditingCourse] =
    useState<Course | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

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

  const extractErrorMessage = (
    err: unknown
  ): string => {
    if (axios.isAxiosError<ApiErrorResponse>(err)) {
      const data = err.response?.data;

      if (data?.message) {
        return data.message;
      }

      if (data) {
        const firstFieldError =
          Object.values(data).find(
            (value) => typeof value === 'string'
          );

        if (firstFieldError) {
          return firstFieldError;
        }
      }

      if (!err.response) {
        return 'Không kết nối được tới hệ thống.';
      }

      if (err.response.status === 401) {
        return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
      }

      if (err.response.status === 403) {
        return 'Bạn không có quyền thực hiện thao tác này.';
      }
    }

    return 'Đã xảy ra lỗi, vui lòng thử lại.';
  };

  const handleFormSubmit = async (
    values: CourseFormValues
  ) => {
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingCourse) {
        await updateCourse(
          editingCourse.id,
          values
        );
      } else {
        await createCourse(values);
      }

      setEditingCourse(null);

      await refetch();
    } catch (err) {
      setFormError(
        extractErrorMessage(err)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormError(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (
    course: Course
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa môn học "${course.tenMonHoc}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCourse(course.id);

      if (editingCourse?.id === course.id) {
        setEditingCourse(null);
      }

      await refetch();
    } catch (err) {
      window.alert(
        extractErrorMessage(err)
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setFormError(null);
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <h1>Quản lý môn học (Admin)</h1>

      <CourseForm
        editingCourse={editingCourse}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelEdit}
        submitting={submitting}
        serverError={formError}
      />

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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}