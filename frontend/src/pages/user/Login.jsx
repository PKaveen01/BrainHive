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
        setError(''); // Clear error when switching roles
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Attempting login with:', { email: formData.email, role }); // Debug log

        try {
            const response = await authService.login(
                formData.email,
                formData.password,
                role
            );

            console.log('Login response:', response); // Debug log

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
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome back</h1>
                    <p>Sign in to your academic workspace</p>
                </div>

                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('STUDENT')}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === 'TUTOR' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('TUTOR')}
                    >
                        Tutor
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>University Email</label>
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

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="**********"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" disabled={loading} /> Remember me
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot your password?
                        </a>
                    </div>

                    {error && (
                        <div className="error-message">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="signin-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in →'}
                    </button>
                </form>

                <div className="register-links">
                    <p>Don't have an account?</p>
                    <div className="register-buttons">
                        <button 
                            onClick={() => navigate('/register/student')}
                            disabled={loading}
                        >
                            Register as Student
                        </button>
                        <button 
                            onClick={() => navigate('/register/tutor')}
                            disabled={loading}
                        >
                            Register as Tutor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;