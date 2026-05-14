
//const API_BASE_URL = "http://localhost:5265/api";
const API_BASE_URL = "http://192.168.1.3:5265/api";
//const API_BASE_URL = "https://localhost:7071/api";
//const API_BASE_URL = "http://192.168.1.3:7071/api";

/* ================= STATE ================= */

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/* ================= TOKEN HELPERS ================= */

function getAccessToken(): string | null {
  return localStorage.getItem("token");
}

function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

function setTokens(token: string, refreshToken: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

/* ================= LOGOUT ================= */

function forceLogout() {
  clearTokens();
  window.location.href = "/login";
}

/* ================= REFRESH ================= */

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refreshToken: getRefreshToken()
    })
  })
    .then(async (res) => {
      if (!res.ok) {
        forceLogout();
        throw new Error("Refresh token invalid or expired");
      }

      const data = await res.json();

      // backend трябва да връща:
      // { token: "...", refreshToken: "..." }
      setTokens(data.token, data.refreshToken);

      return data.token;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

/* ================= GET ================= */

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${url}`, {
    headers: {
      ...(getAccessToken() && {
        Authorization: `Bearer ${getAccessToken()}`
      })
    }
  });

  if (response.status !== 401) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  // 🔄 Access token изтекъл → refresh
  const newToken = await refreshAccessToken();

  const retry = await fetch(`${API_BASE_URL}/${url}`, {
    headers: {
      Authorization: `Bearer ${newToken}`
    }
  });

  if (!retry.ok) {
    forceLogout();
    throw new Error(await retry.text());
  }

  return retry.json();
}

/* ================= POST ================= */


export async function apiPost<T>(
  url: string,
  body: unknown
): Promise<T> {
  let token = getAccessToken();

  let response = await fetch(`${API_BASE_URL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    },
    body: JSON.stringify(body)
  });

  // ✅ OK → връщаме директно
  if (response.ok) {
    return response.json();
  }

  // ✅ 401 → опит за refresh
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();

      // retry с нов token
      response = await fetch(`${API_BASE_URL}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return response.json();
      }

    } catch {
      // ✅ refresh fail → logout
      forceLogout();
      throw new Error("Session expired");
    }

    // retry fail → logout
    forceLogout();
    throw new Error(await response.text());
  }

  // ✅ други грешки
  throw new Error(await response.text());
}

/* ================= PUBLIC POST ================= */

export async function apiPublicPost<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* ================= DELETE ================= */

export async function apiDelete(url: string) {
  const token = getAccessToken();
debugger
  const response = await fetch(`${API_BASE_URL}/${url}`, {
    method: "DELETE",
    headers: {
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

/* ================= PUT ================= */

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}/${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

