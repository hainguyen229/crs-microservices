import { useEffect, useState } from 'react';
import axios from 'axios';

import CourseList from '../components/CourseList';
import SearchBox from '../components/SearchBox';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';

import { useCourses } from '../api/useCourses';
import {
  registerCourse,
  cancelRegistration,
  getMyRegistrations,
} from '../api/registrationApi';

import { getCourseById } from '../api/courseApi';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

import type { Course } from '../types/course';
import type { Registration } from '../types/registration';

interface RegisteredCourseInfo {
  registration: Registration;
  courseName: string;
}

export default function RegisterCoursePage() {
  const { user } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [registeredCourseInfos, setRegisteredCourseInfos] = useState<
    RegisteredCourseInfo[]
  >([]);

  const [registeringId, setRegisteringId] = useState<number | null>(null);

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const {
    courses,
    totalPages,
    state,
    errorMessage,
    refetch,
  } = useCourses(keyword, page, 10);

  const {
    toast,
    showToast,
    clearToast,
  } = useToast();

  const loadMyRegistrations = async () => {
    try {
      const response = await getMyRegistrations();

      setRegistrations(response.data);

      const active = response.data.filter(
        (registration) =>
          registration.trangThai === 'DA_DANG_KY'
      );

      const courseInfos = await Promise.all(
        active.map(async (registration) => {
          try {
            const courseResponse = await getCourseById(
              registration.courseId
            );

            return {
              registration,
              courseName: courseResponse.data.tenMonHoc,
            };
          } catch (error) {
            console.error(
              `Khong the tai mon hoc id = ${registration.courseId}`,
              error
            );

            return {
              registration,
              courseName: `Môn học #${registration.courseId}`,
            };
          }
        })
      );

      setRegisteredCourseInfos(courseInfos);
    } catch (error) {
      console.error(
        'Khong the tai danh sach dang ky:',
        error
      );
    }
  };

  useEffect(() => {
    loadMyRegistrations();
  }, []);

  const activeRegistrations = registrations.filter(
    (registration) =>
      registration.trangThai === 'DA_DANG_KY'
  );

  const registeredCourseIds = activeRegistrations.map(
    (registration) => registration.courseId
  );

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
    setPage(0);
  };

  const getErrorMessage = (
    error: unknown,
    defaultMessage: string
  ) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      if (
        typeof data === 'string' &&
        data.trim()
      ) {
        return data;
      }

      if (
        data &&
        typeof data === 'object' &&
        'message' in data
      ) {
        return String(data.message);
      }
    }

    return defaultMessage;
  };

  const handleRegister = async (
    course: Course
  ) => {
    if (!user) {
      showToast(
        'Bạn cần đăng nhập để đăng ký học phần.',
        'error'
      );
      return;
    }

    if (
      registeredCourseIds.includes(course.id)
    ) {
      showToast(
        'Bạn đã đăng ký môn học này.',
        'error'
      );
      return;
    }

    if (course.soChoConLai <= 0) {
      showToast(
        'Môn học này đã hết chỗ.',
        'error'
      );
      return;
    }

    try {
      setRegisteringId(course.id);

      await registerCourse({
        studentId: user.id,
        courseId: course.id,
      });

      showToast(
        `Đăng ký môn "${course.tenMonHoc}" thành công.`,
        'success'
      );

      await Promise.all([
        refetch(),
        loadMyRegistrations(),
      ]);
    } catch (error) {
      showToast(
        getErrorMessage(
          error,
          'Đăng ký học phần thất bại.'
        ),
        'error'
      );
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancel = async (
    registration: Registration
  ) => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn hủy đăng ký học phần này?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(registration.id);

      await cancelRegistration(
        registration.id
      );

      showToast(
        'Hủy đăng ký học phần thành công.',
        'success'
      );

      await Promise.all([
        refetch(),
        loadMyRegistrations(),
      ]);
    } catch (error) {
      showToast(
        getErrorMessage(
          error,
          'Hủy đăng ký học phần thất bại.'
        ),
        'error'
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <h1>Đăng ký học phần</h1>

      <p>
        Sinh viên:{' '}
        <strong>{user?.username}</strong>
      </p>

      <SearchBox
        onSearch={handleSearch}
      />

      <CourseList
        courses={courses}
        state={state}
        errorMessage={errorMessage}
        onRetry={refetch}
        onRegister={handleRegister}
        registeringId={registeringId}
        registeredCourseIds={
          registeredCourseIds
        }
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <hr
        style={{
          margin: '32px 0',
        }}
      />

      <h2>Học phần đã đăng ký</h2>

      {registeredCourseInfos.length === 0 ? (
        <p>Bạn chưa đăng ký học phần nào.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: 'left',
                borderBottom:
                  '2px solid #333',
              }}
            >
              <th>Mã đăng ký</th>
              <th>Tên môn học</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {registeredCourseInfos.map(
              ({
                registration,
                courseName,
              }) => (
                <tr
                  key={registration.id}
                  style={{
                    borderBottom:
                      '1px solid #eee',
                  }}
                >
                  <td>
                    {registration.id}
                  </td>

                  <td>
                    {courseName}
                  </td>

                  <td>
                    {registration.ngayDangKy
                      ? new Date(
                          registration.ngayDangKy
                        ).toLocaleString(
                          'vi-VN'
                        )
                      : ''}
                  </td>

                  <td>Đã đăng ký</td>

                  <td>
                    <button
                      onClick={() =>
                        handleCancel(
                          registration
                        )
                      }
                      disabled={
                        cancellingId ===
                        registration.id
                      }
                      style={{
                        color: '#b91c1c',
                      }}
                    >
                      {cancellingId ===
                      registration.id
                        ? 'Đang hủy...'
                        : 'Hủy đăng ký'}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={clearToast}
        />
      )}
    </div>
  );
}
