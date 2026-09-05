const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function getToken() {
  return localStorage.getItem('nexora_token');
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];
async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => path.startsWith(p));

  if (response.status === 401 && !isAuthEndpoint) {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    localStorage.removeItem('nexora_business_id');
    window.location.href = '/login';
    throw new Error('Sesi berakhir, silakan login kembali.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(', ') : null) ||
      'Terjadi kesalahan pada server.';

    const error = new Error(message);
    error.status = response.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;