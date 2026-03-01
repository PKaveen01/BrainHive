import api from './api';

class AuthService {
    async login(email, password, role) {
        try {
            console.log('Sending login request to backend...'); // Debug log
            const response = await api.post('/auth/login', {
                email: email.trim(),
                password: password,
                role: role
            });
            
            console.log('Raw response:', response); // Debug log
            
            if (response.data && response.data.success) {
                // Store basic info in localStorage
                localStorage.setItem('user', JSON.stringify({
                    name: response.data.fullName,
                    email: response.data.email,
                    role: response.data.role
                }));
                console.log('User stored in localStorage'); // Debug log
            }
            
            return response.data;
        } catch (error) {
            console.error('Login service error:', error);
            
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please check if backend is running on http://localhost:8080');
            }
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                return error.response.data;
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                throw new Error('No response from server. Please check if backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', error.message);
                throw error;
            }
        }
    }
    
    async logout() {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('user');
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('user'); // Still remove local storage
        }
    }
    
    async checkAuth() {
        try {
            const response = await api.get('/auth/check');
            if (response.data && response.data.success) {
                localStorage.setItem('user', JSON.stringify({
                    name: response.data.fullName,
                    email: response.data.email,
                    role: response.data.role
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Check auth error:', error);
            return { success: false };
        }
    }
    
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export default new AuthService();