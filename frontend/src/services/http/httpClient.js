import axios from 'axios';

let accessToken = null;
let refreshPromise = null;
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const setAccessToken = (token) => { accessToken = token || null; };

export const http = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

http.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => request?.url?.includes(path));
  if (error.response?.status !== 401 || request?._retried || isAuthRequest) return Promise.reject(error);
  request._retried = true;
  try {
    refreshPromise ||= axios.post(baseURL + '/auth/refresh', {}, { withCredentials: true }).finally(() => { refreshPromise = null; });
    const response = await refreshPromise;
    setAccessToken(response.data.data.accessToken);
    request.headers.Authorization = 'Bearer ' + accessToken;
    return http(request);
  } catch (refreshError) {
    setAccessToken(null);
    window.dispatchEvent(new Event('imovies:session-expired'));
    return Promise.reject(refreshError);
  }
});

export const errorMessage = (error) => {
  const apiError = error?.response?.data?.error;
  if (apiError?.details?.length) return apiError.details.map((item) => item.message).join(' ');
  return apiError?.message || error?.message || 'Something went wrong. Please try again.';
};
