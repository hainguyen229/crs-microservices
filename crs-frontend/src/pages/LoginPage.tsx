import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { login as loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import type { ApiErrorResponse } from '../types/apiError';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const res = await loginApi({
        username,
        password,
      });

      login(res.data);

      navigate('/courses');
    } catch (err) {
      if (
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.data?.message
      ) {
        setError(err.response.data.message);
      } else {
        setError(
          'Đăng nhập thất bại, vui lòng thử lại.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '60px auto',
        padding: 24,
        border: '1px solid #ddd',
        borderRadius: 12,
      }}
    >
      <h2>Đăng nhập hệ thống CRS</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Tên đăng nhập</label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            style={{
              width: '100%',
              padding: 8,
              marginTop: 4,
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Mật khẩu</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              width: '100%',
              padding: 8,
              marginTop: 4,
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#b91c1c' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Đang xử lý...'
            : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}