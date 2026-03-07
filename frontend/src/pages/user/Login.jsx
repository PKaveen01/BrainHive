import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('STUDENT');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    // Check if it's admin login
    const checkAdminLogin = (email, password) => {
        // Admin credentials
        const adminEmail = 'admin@brainhive.com';
        const adminPassword = 'Admin123';
        
        return email === adminEmail && password === adminPassword;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Attempting login with:', { email: formData.email, role });

        // Check for admin login first
        if (checkAdminLogin(formData.email, formData.password)) {
            console.log('Admin login detected, redirecting to admin dashboard');
            // Store admin info in localStorage
            const adminData = {
                name: 'Admin User',
                email: formData.email,
                role: 'ADMIN',
                isAdmin: true
            };
            localStorage.setItem('user', JSON.stringify(adminData));
            localStorage.setItem('adminAuthenticated', 'true');
            
            setLoading(false);
            navigate('/dashboard/admin');
            return;
        }

        // If not admin, proceed with normal login
        try {
            const response = await authService.login(
                formData.email,
                formData.password,
                role
            );

            console.log('Login response:', response);

            if (response && response.success) {
                console.log('Login successful, redirecting to:', response.redirectUrl);
                if (role === 'STUDENT') {
                    navigate('/dashboard/student');
                } else {
                    navigate('/dashboard/tutor');
                }
            } else {
                setError(response?.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error details:', err);
            if (err.message === 'Network Error') {
                setError('Cannot connect to server. Make sure the backend is running on port 8080.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network error - Please check if backend server is running.');
            } else {
                setError(err.response?.data?.message || 'An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🧠 BrainHive</div>
                    <h2>Welcome back</h2>
                    <p className="auth-subtitle">Sign in to your academic workspace</p>
                </div>

                {/* Role Selector with Styled Toggle */}
                <div className="role-selector-container">
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('STUDENT')}
                            disabled={loading}
                        >
                            <span className="role-icon">🎓</span>
                            Student
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'TUTOR' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('TUTOR')}
                            disabled={loading}
                        >
                            <span className="role-icon">👨‍🏫</span>
                            Tutor
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>University Email</label>
                        <div className="input-icon">
                            <span className="icon">📧</span>
                            <input
                                type="email"
                                name="email"
                                placeholder={role === 'STUDENT' ? 'student@university.edu' : 'tutor@university.edu'}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon">
                            <span className="icon">🔒</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" disabled={loading} />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <a href="/forgot-password" className="forgot-password-link">
                            Forgot password?
                        </a>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="alert-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in →'}
                    </button>
                </form>

                <div className="register-section">
                    <p>Don't have an account?</p>
                    <div className="register-buttons">
                        <button 
                            type="button"
                            className="register-btn student-btn"
                            onClick={() => navigate('/register/student')}
                            disabled={loading}
                        >
                            Register as Student
                        </button>
                        <button 
                            type="button"
                            className="register-btn tutor-btn"
                            onClick={() => navigate('/register/tutor')}
                            disabled={loading}
                        >
                            Register as Tutor
                        </button>
                    </div>
                </div>

                <div className="help-section">
                    <p>Need help?</p>
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={() => window.location.href = 'mailto:support@brainhive.com'}
                    >
                        Contact Support
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="auth-decoration">
                <div className="decoration-circle"></div>
                <div className="decoration-circle-2"></div>
            </div>
        </div>
    );
};

export default Login;