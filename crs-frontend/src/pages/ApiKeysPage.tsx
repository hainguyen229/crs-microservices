import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { createApiKey, getApiKeys, revokeApiKey } from '../api/apiKeyApi';
import type { ApiKey } from '../types/apiKey';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState('');
  const [scopes, setScopes] = useState('courses:read');
  const [validDays, setValidDays] = useState('30');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getApiKeys();
      setKeys(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Bạn không có quyền quản lý API Key.');
      } else {
        setError('Không tải được danh sách API Key.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNewKeyValue(null);

    if (!ownerName.trim() || !scopes.trim()) {
      setError('Vui lòng nhập tên đối tác và scope.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createApiKey({
        ownerName: ownerName.trim(),
        scopes: scopes.trim(),
        validDays: validDays.trim() ? Number(validDays) : undefined,
      });

      setNewKeyValue(response.data.keyValue);
      setOwnerName('');
      await loadKeys();
    } catch {
      setError('Cấp API Key thất bại. Vui lòng kiểm tra dữ liệu và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (apiKey: ApiKey) => {
    const confirmed = window.confirm(
      `Thu hồi API Key của "${apiKey.ownerName}"?`
    );

    if (!confirmed) return;

    try {
      await revokeApiKey(apiKey.id);
      await loadKeys();
    } catch {
      window.alert('Thu hồi API Key thất bại.');
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return 'Không giới hạn';
    return new Date(value).toLocaleString('vi-VN');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1>Quản lý API Key (Admin)</h1>

      <form
        onSubmit={handleCreate}
        style={{
          display: 'grid',
          gap: 12,
          padding: 20,
          marginBottom: 24,
          border: '1px solid #ddd',
          borderRadius: 10,
        }}
      >
        <h2 style={{ margin: 0 }}>Cấp API Key mới</h2>

        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Tên đối tác, ví dụ: Đối tác Test"
        />

        <input
          value={scopes}
          onChange={(e) => setScopes(e.target.value)}
          placeholder="courses:read"
        />

        <input
          type="number"
          min="1"
          value={validDays}
          onChange={(e) => setValidDays(e.target.value)}
          placeholder="Số ngày hiệu lực"
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Đang cấp...' : 'Cấp API Key'}
        </button>

        {error && (
          <div style={{ color: '#b91c1c' }}>{error}</div>
        )}
      </form>

      {newKeyValue && (
        <div
          style={{
            padding: 16,
            marginBottom: 24,
            border: '1px solid #16a34a',
            borderRadius: 10,
          }}
        >
          <strong>API Key mới - hãy sao chép ngay:</strong>
          <div style={{ marginTop: 8, wordBreak: 'break-all' }}>
            <code>{newKeyValue}</code>
          </div>
          <small>Khóa này chỉ được hiển thị rõ ngay sau khi tạo trên giao diện.</small>
        </div>
      )}

      <h2>Danh sách API Key</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Đối tác</th>
                <th>Scope</th>
                <th>Trạng thái</th>
                <th>Hết hạn</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={7}>Chưa có API Key.</td>
                </tr>
              ) : (
                keys.map((apiKey) => (
                  <tr key={apiKey.id}>
                    <td>{apiKey.id}</td>
                    <td>{apiKey.ownerName}</td>
                    <td>{apiKey.scopes}</td>
                    <td>{apiKey.status}</td>
                    <td>{formatDate(apiKey.expiresAt)}</td>
                    <td>{formatDate(apiKey.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        disabled={apiKey.status === 'REVOKED'}
                        onClick={() => void handleRevoke(apiKey)}
                      >
                        {apiKey.status === 'REVOKED' ? 'Đã thu hồi' : 'Thu hồi'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
