import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // Add timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
    console.log('Starting Request:', request.method, request.url);
    return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.data);
        return response;
    },
    error => {
        console.error('API Error:', error.message);
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - Make sure backend is running on port 8080');
        }
        return Promise.reject(error);
    }
);

export default api;