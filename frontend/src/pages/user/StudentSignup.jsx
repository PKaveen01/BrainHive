import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Signup.css';

const StudentSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        
        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }
        
        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*[0-9])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        }
        
        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setServerError('');
        
        try {
            console.log('Submitting registration with data:', {
                fullName: formData.fullName,
                email: formData.email,
                passwordLength: formData.password.length
            });
            
            const response = await authService.registerStudent(formData);
            
            console.log('Registration response:', response);
            
            if (response && response.success) {
                // Store user data in localStorage after successful registration
                const userData = {
                    name: formData.fullName,
                    email: formData.email,
                    role: 'STUDENT',
                    profileCompleted: response.profileCompleted || false,
                    redirectUrl: response.redirectUrl
                };
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('User stored in localStorage:', userData);
                
                // FIXED: Redirect to the correct route based on profile completion
                if (response.profileCompleted) {
                    navigate('/dashboard/student');
                } else {
                    // Use the correct route path that matches App.js
                    navigate('/complete-profile/student');
                }
            } else {
                console.error('Registration failed:', response);
                setServerError(response?.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error details:', error);
            if (error.response?.data?.message) {
                setServerError(error.response.data.message);
            } else if (error.message === 'Network Error') {
                setServerError('Cannot connect to server. Please check your connection.');
            } else {
                setServerError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Create your account</h1>
                    <p>Join thousands of students on BrainHive</p>
                    <p className="signup-note">
                        Your academic profile will be completed after signup to personalize your experience.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Alex Johnson"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={errors.fullName ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">University Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="student@university.edu"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="**********"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                        <small className="password-hint">
                            Password must be at least 8 characters with 1 uppercase letter and 1 number
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="**********"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    {serverError && (
                        <div className="server-error">
                            <strong>Error:</strong> {serverError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="signup-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account →'}
                    </button>
                </form>

                <div className="signup-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    <p className="register-link">
                        Want to register as a tutor instead? <Link to="/register/tutor">Register as Tutor</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentSignup;