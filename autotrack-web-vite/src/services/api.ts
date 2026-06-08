import axios from "axios";

//const API_BASE_URL = "http://localhost:5265/api";
//const API_BASE_URL = "http://192.168.1.3:5265/api";
//const API_BASE_URL = "https://localhost:7071/api"; //Локален SSL (може да има проблеми с сертификата в браузъра)
//const API_BASE_URL = "http://192.168.1.3:7071/api";

const API_BASE_URL = "https://autotrackapi1.onrender.com/api";
//const API_BASE_URL = "https://autotrackapi.onrender.com/api";

//alert(`API BASE URL: ${API_BASE_URL}`);

/* ================= Configuration ================= */

const api = axios.create({
  baseURL: API_BASE_URL, // или твоето API
  withCredentials: true, // ✅ МНОГО ВАЖНО
});

export default api;



/* ================= GET ================= */

export async function apiGet<T>(url: string): Promise<T> {
  const response = await api.get<T>(url);
  return response.data;
}

/* ================= POST ================= */

export async function apiPost<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await api.post<T>(url, body);
  return response.data;
}

/* ================= PUT ================= */

export async function apiPut<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await api.put<T>(url, body);
  return response.data;
}

/* ================= DELETE ================= */

export async function apiDelete(url: string): Promise<void> {
  await api.delete(url);
}

/* ================= AUTO REFRESH (OPTIONAL, BUT PRO LEVEL) ================= */


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("auth/refresh") &&
      !originalRequest.url.includes("auth/login")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("auth/refresh");
        return api(originalRequest);
      } catch {
        return Promise.reject(error); // ✅ FIX
      }
    }

    return Promise.reject(error);
  }
);



