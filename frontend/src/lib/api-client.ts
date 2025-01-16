import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Error Types
export interface ApiErrorResponse {
    detail: string;
    code?: string;
    errors?: Record<string, string[]>;
}

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor for logging
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        if (import.meta.env.DEV) {
            console.error('[API Response Error]', {
                status: error.response?.status,
                url: error.config?.url,
                data: error.response?.data,
                error: error.message
            });
        }

        // Transform error for consistent handling
        const apiError = new Error(
            error.response?.data?.detail ||
            error.message ||
            'An unexpected error occurred'
        ) as Error & {
            status?: number;
            code?: string;
            errors?: Record<string, string[]>;
        };

        apiError.status = error.response?.status;
        apiError.code = error.response?.data?.code;
        apiError.errors = error.response?.data?.errors;

        return Promise.reject(apiError);
    }
);

export default apiClient; 