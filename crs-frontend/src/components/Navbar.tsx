import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
        borderBottom: '1px solid #ddd',
        marginBottom: 20,
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <Link to="/courses">
          Danh sách môn học
        </Link>

        {isAuthenticated &&
          user?.role === 'ADMIN' && (
            <>
              <Link to="/admin/courses">
                Quản trị môn học
              </Link>
              <Link to="/admin/api-keys">
                Quản lý API Key
              </Link>
            </>
          )}

        {isAuthenticated &&
          user?.role === 'STUDENT' && (
            <Link to="/register-course">
              Đăng ký học phần
            </Link>
          )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {isAuthenticated ? (
          <>
            <span>
              Xin chào, {user?.username} ({user?.role})
            </span>

            <button onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}