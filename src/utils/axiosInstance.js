import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import router from "@/router";
import.meta.env.VITE_API_URL
// export const axiosInstance = axios.create({
//     //baseURL: 'http://192.168.18.14:8000',
//     baseURL: 'http://127.0.0.1:8000',
//     timeout: 300000,
// });

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 300000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }

        // Log requests for debugging
        //console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor with Token Refresh
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging
        //console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        const authStore = useAuthStore();
        const originalRequest = error.config;

        // Network Error / Server Down
        if (!error.response) {
            console.error("❌ Network Error / Server Down");
            return Promise.reject({
                message: "Server is not responding. Please check your connection or try again later.",
                isNetworkError: true
            });
        }

        // Log error responses
        console.error(`❌ ${error.response.status} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, error.response.data);

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If there's no refresh token, user is not logged in – don't force redirect
            if (!authStore.refreshToken) {
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the access token
                const newToken = await authStore.refreshAccessToken();

                if (newToken) {
                    // Update the failed request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    console.log('🔄 Token refreshed, retrying request...');

                    // Retry the original request
                    return axiosInstance(originalRequest);
                } else {
                    // Refresh failed, logout user (will also redirect to login)
                    authStore.logout();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);

                // Clear auth and redirect to login via store logout
                authStore.logout();

                return Promise.reject(refreshError);
            }
        }

        // Handle 403 Forbidden
        if (error.response.status === 403) {
            console.error('❌ Forbidden: You do not have permission to access this resource');
        }

        // Handle 404 Not Found
        if (error.response.status === 404) {
            console.error('❌ Not Found: The requested resource does not exist');
        }

        // Handle 500 Internal Server Error
        if (error.response.status === 500) {
            console.error('❌ Server Error: Internal server error occurred');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;