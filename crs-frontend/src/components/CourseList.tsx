import type { Course } from '../types/course';
import type { LoadState } from '../api/useCourses';

interface CourseListProps {
  courses: Course[];
  state: LoadState;
  errorMessage: string;
  onRetry: () => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onRegister?: (course: Course) => void;
  registeringId?: number | null;
  registeredCourseIds?: number[];
}

export default function CourseList({
  courses,
  state,
  errorMessage,
  onRetry,
  onEdit,
  onDelete,
  onRegister,
  registeringId,
  registeredCourseIds = [],
}: CourseListProps) {
  if (state === 'loading') {
    return <p>Dang tai danh sach mon hoc...</p>;
  }

  if (state === 'error') {
    return (
      <div style={{ color: '#b91c1c' }}>
        <p>{errorMessage}</p>
        <button onClick={onRetry}>Thu lai</button>
      </div>
    );
  }

  if (state === 'empty') {
    return <p>Khong tim thay mon hoc nao phu hop.</p>;
  }

  const showActions =
    !!onEdit || !!onDelete || !!onRegister;

  return (
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
            borderBottom: '2px solid #333',
          }}
        >
          <th>Ten mon hoc</th>
          <th>So tin chi</th>
          <th>So cho con lai</th>

          {showActions && <th>Thao tac</th>}
        </tr>
      </thead>

      <tbody>
        {courses.map((course) => {
          const isRegistered =
            registeredCourseIds.includes(course.id);

          return (
            <tr
              key={course.id}
              style={{
                borderBottom: '1px solid #eee',
              }}
            >
              <td>{course.tenMonHoc}</td>

              <td>{course.soTinChi}</td>

              <td
                style={{
                  color:
                    course.soChoConLai === 0
                      ? '#b91c1c'
                      : 'inherit',
                }}
              >
                {course.soChoConLai} / {course.soChoToiDa}
              </td>

              {showActions && (
                <td>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(course)}
                    >
                      Sua
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(course)}
                      style={{
                        marginLeft: 8,
                        color: '#b91c1c',
                      }}
                    >
                      Xoa
                    </button>
                  )}

                  {onRegister && (
                    <button
                      onClick={() => onRegister(course)}
                      disabled={
                        course.soChoConLai === 0 ||
                        registeringId === course.id ||
                        isRegistered
                      }
                      style={{
                        marginLeft: 8,
                      }}
                    >
                      {isRegistered
                        ? 'Da dang ky'
                        : registeringId === course.id
                          ? 'Dang dang ky...'
                          : course.soChoConLai === 0
                            ? 'Het cho'
                            : 'Dang ky'}
                    </button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}