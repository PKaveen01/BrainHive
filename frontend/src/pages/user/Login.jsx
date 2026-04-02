import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('STUDENT');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Send role to backend; if DB says ADMIN the backend ignores the role selector
            const response = await authService.login(formData.email.trim(), formData.password, role);

            if (response && response.success) {
                // Persist role returned by server (may differ from selector for admins)
                const storedUser = authService.getCurrentUser();
                if (storedUser) {
                    storedUser.role = response.role;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                }

                const serverRole = response.role;
                if (serverRole === 'ADMIN') {
                    navigate('/dashboard/admin');
                } else if (serverRole === 'STUDENT') {
                    navigate('/dashboard/student');
                } else {
                    navigate('/dashboard/tutor');
                }
            } else {
                setError(response?.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
                setError('Cannot connect to server. Make sure the backend is running on port 8080.');
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

                {/* Role Selector */}
                <div className="role-selector-container">
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('STUDENT')}
                            disabled={loading}
                        >
                            <span className="role-icon">🎓</span> Student
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'TUTOR' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('TUTOR')}
                            disabled={loading}
                        >
                            <span className="role-icon">👨‍🏫</span> Tutor
                        </button>
                    </div>
                    <p className="role-hint">
                        Admin? Use your email &amp; password — the system will recognise your role automatically.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-icon">
                            <span className="icon">📧</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="your@email.com"
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
                        <a href="/forgot-password" className="forgot-password-link">Forgot password?</a>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="alert-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
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

            <div className="auth-decoration">
                <div className="decoration-circle"></div>
                <div className="decoration-circle-2"></div>
            </div>
        </div>
    );
};

export default Login;
