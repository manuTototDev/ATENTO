const BASE_URL = 'http://localhost:5000';

/**
 * Fetch autenticado — agrega Authorization: Bearer <token> automáticamente.
 * Si el token de acceso expiró (401), intenta renovarlo con el refresh token (cookie httpOnly)
 * y reintenta la petición una vez. Si falla, redirige al login.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Necesario para enviar la cookie httpOnly del refresh token
  });

  // Si expiró el access token, intentamos renovarlo
  if (response.status === 401 || response.status === 403) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      // Refresh expirado o inválido → logout
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      return null;
    }
  }

  return response;
}

/**
 * Intenta renovar el access token usando el refresh token (httpOnly cookie).
 * Retorna true si tuvo éxito.
 */
async function tryRefreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Cierra sesión: limpia localStorage y borra la cookie de refresh en el servidor.
 */
export async function apiLogout() {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignorar errores de red al hacer logout
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }
}
