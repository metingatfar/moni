const resolveBaseUrl = () => {
    // If we are running on localhost, force local API URL to avoid CORS/Fetch errors
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api';
    }
    const envUrl = import.meta.env && import.meta.env.VITE_BACKEND_API_URL;
    const baseUrl = envUrl ? envUrl : "http://localhost:5000/api";
    return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api`;
};
export const API_BASE_URL = resolveBaseUrl();
console.log(`[API CONFIG] Base URL: ${API_BASE_URL}`);
export const getEndpoint = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};
