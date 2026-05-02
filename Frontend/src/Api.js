import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Attach JWT from localStorage on every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        { refreshToken }
                    );
                    localStorage.setItem("accessToken", data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return API(originalRequest);
                } catch {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default API;