export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetch público — para endpoints SIN autenticación (login, register).
 * No agrega Authorization, no intenta refresh, no redirige.
 * Un 401 aquí significa "credenciales inválidas", no "sesión expirada".
 */
export async function publicFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Necesario para recibir/enviar la cookie httpOnly del refresh token
  });
}

/**
 * Fetch autenticado — agrega Authorization: Bearer <token> automáticamente.
 * Si el access token expiró (401), intenta renovarlo con el refresh token (cookie httpOnly)
 * y reintenta la petición una vez. Si el refresh falla, redirige al login.
 *
 * IMPORTANTE: un 403 NO dispara refresh ni logout — el backend usa 403 para
 * "no tienes permiso sobre este recurso" (ej. paciente de otro médico).
 * Siempre devuelve un objeto Response (nunca null), para que los callers
 * puedan hacer res.ok / res.json() sin guardias extra.
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
    credentials: 'include',
  });

  // Solo 401 = access token expirado → intentar renovar
  if (response.status === 401) {
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
      // Devolvemos la respuesta original (401) para que el caller no truene con null
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
