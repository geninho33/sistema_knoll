const API_BASE = '/api';

const INACTIVE_MSG = 'Acesso negado. Seu usuário encontra-se inativo no sistema.';

function getToken() {
  return localStorage.getItem('token');
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function notifySessionEnded(message) {
  window.dispatchEvent(
    new CustomEvent('knoll:session-ended', {
      detail: { reason: 'USER_INACTIVE', message: message || INACTIVE_MSG },
    })
  );
}

function handleInactiveResponse(data, status) {
  if (data?.code === 'USER_INACTIVE' || (status === 403 && String(data?.error || '').includes('inativo'))) {
    clearSession();
    notifySessionEnded(data?.error || INACTIVE_MSG);
    return true;
  }
  return false;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  // Não forçar JSON quando FormData (upload)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const normalized = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${normalized}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (handleInactiveResponse(data, res.status)) {
      const err = new Error(data.error || INACTIVE_MSG);
      err.status = res.status;
      err.code = 'USER_INACTIVE';
      err.data = data;
      throw err;
    }
    const err = new Error(data.error || data.detalhe || 'Erro na requisição');
    err.status = res.status;
    err.data = data;
    err.code = data.code;
    throw err;
  }
  return data;
}

/** Upload multipart (ex.: logo) */
export async function apiUpload(path, formData, method = 'POST') {
  return apiFetch(path, { method, body: formData });
}

export function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export { INACTIVE_MSG, clearSession };
