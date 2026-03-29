import api from './api';

const authService = {
    // Existing login method (preserved exactly)
    async login(email, password, role) {
        try {
            console.log('Sending login request to backend...');
            const response = await api.post('/auth/login', {
                email: email.trim(),
                password: password,
                role: role
            });
            
            console.log('Raw response:', response);
            
            if (response.data && response.data.success) {
                // Store basic info in localStorage - using fullName to match existing
                localStorage.setItem('user', JSON.stringify({
                    name: response.data.fullName,  // Keep as fullName for compatibility
                    email: response.data.email,
                    role: response.data.role,
                    redirectUrl: response.data.redirectUrl,
                    userId: response.data.userId
                }));
                console.log('User stored in localStorage');
            }
            
            return response.data;
        } catch (error) {
            console.error('Login service error:', error);
            
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please check if backend is running on http://localhost:8080');
            }
            
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                return error.response.data;
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('No response from server. Please check if backend is running.');
            } else {
                console.error('Error setting up request:', error.message);
                throw error;
            }
        }
    },
    
    // New registration methods
    async registerStudent(formData) {
        try {
            const response = await api.post('/auth/register/student', formData);
            return response.data;
        } catch (error) {
            console.error('Student registration error:', error);
            throw error;
        }
    },
    
    async registerTutor(formData) {
        try {
            const response = await api.post('/auth/register/tutor', formData);
            return response.data;
        } catch (error) {
            console.error('Tutor registration error:', error);
            throw error;
        }
    },
    
    async completeStudentProfile(formData) {
        try {
            const response = await api.post('/auth/complete-profile/student', formData);
            return response.data;
        } catch (error) {
            console.error('Profile completion error:', error);
            throw error;
        }
    },
    
    async getAllSubjects() {
        try {
            const response = await api.get('/auth/subjects');
            return response.data;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },
    
    // Existing logout method
    async logout() {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('user');
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('user');
        }
    },
    
    // Existing checkAuth method
    async checkAuth() {
        try {
            const response = await api.get('/auth/check');
            if (response.data && response.data.success) {
                localStorage.setItem('user', JSON.stringify({
                    name: response.data.fullName,  // Keep as fullName for consistency
                    email: response.data.email,
                    role: response.data.role,
                    userId: response.data.userId
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Check auth error:', error);
            return { success: false };
        }
    },
    
    // Existing getCurrentUser method
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    // Existing isAuthenticated method
    isAuthenticated() {
        return localStorage.getItem('user') !== null;
    }
};

export default authService;