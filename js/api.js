function getToken() {
  return localStorage.getItem('cefiret_token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('cefiret_user') || 'null');
  } catch {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem('cefiret_token', token);
  localStorage.setItem('cefiret_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('cefiret_token');
  localStorage.removeItem('cefiret_user');
}

function authHeaders(json = true) {
  const headers = {};

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function buildApiUrl(path) {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}

function getErrorMessage(data, fallback = 'Ocurrió un error.') {
  if (!data) {
    return fallback;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0];

    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length) {
      return data.errors[firstKey][0];
    }
  }

  return fallback;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      ...authHeaders(options.json !== false),
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      success: false,
      message: text || 'Respuesta no válida del servidor'
    };
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const isLoginRequest = cleanPath === '/api/login';

  if (response.status === 401 && !isLoginRequest) {
    clearSession();
    window.location.href = ROUTES?.login || '../auth/login.html';
    return;
  }

  if (!response.ok) {
    throw {
      ...data,
      message: getErrorMessage(data, 'Error en la solicitud.')
    };
  }

  return data;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = ROUTES?.login || '../auth/login.html';
  }
}

function showAlert(id, type, message) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(String(value).slice(0, 10) + 'T00:00:00');

  return isNaN(date) ? value : date.toLocaleDateString('es-MX');
}

function formatTime(value) {
  return value ? String(value).substring(0, 5) : '—';
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}