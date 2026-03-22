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
                
                // Redirect to the correct route based on profile completion
                if (response.profileCompleted) {
                    navigate('/dashboard/student');
                } else {
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

    // Password strength indicators
    const passwordStrength = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        number: /[0-9]/.test(formData.password)
    };

    const strengthCount = Object.values(passwordStrength).filter(Boolean).length;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🧠 BrainHive</div>
                    <h2>Create Student Account</h2>
                    <p className="auth-subtitle">Join thousands of students on BrainHive</p>
                    <div className="signup-badge student-badge">
                        🎓 Student Registration
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-icon">
                            <span className="icon">👤</span>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Alex Johnson"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={errors.fullName ? 'error' : ''}
                                disabled={loading}
                            />
                        </div>
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label>University Email</label>
                        <div className="input-icon">
                            <span className="icon">📧</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="student@university.edu"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                disabled={loading}
                            />
                        </div>
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon">
                            <span className="icon">🔒</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                disabled={loading}
                            />
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    <div className={`strength-bar ${strengthCount >= 1 ? 'active' : ''}`}></div>
                                    <div className={`strength-bar ${strengthCount >= 2 ? 'active' : ''}`}></div>
                                    <div className={`strength-bar ${strengthCount >= 3 ? 'active' : ''}`}></div>
                                </div>
                                <div className="strength-text">
                                    {strengthCount === 0 && 'Very Weak'}
                                    {strengthCount === 1 && 'Weak'}
                                    {strengthCount === 2 && 'Medium'}
                                    {strengthCount === 3 && 'Strong'}
                                </div>
                            </div>
                        )}
                        
                        <div className="password-requirements">
                            <p>Password must contain:</p>
                            <ul>
                                <li className={passwordStrength.length ? 'valid' : ''}>
                                    {passwordStrength.length ? '✓' : '○'} At least 8 characters
                                </li>
                                <li className={passwordStrength.uppercase ? 'valid' : ''}>
                                    {passwordStrength.uppercase ? '✓' : '○'} At least one uppercase letter
                                </li>
                                <li className={passwordStrength.number ? 'valid' : ''}>
                                    {passwordStrength.number ? '✓' : '○'} At least one number
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-icon">
                            <span className="icon">✓</span>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                disabled={loading}
                            />
                        </div>
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    {serverError && (
                        <div className="alert alert-error">
                            <span className="alert-icon">⚠️</span>
                            {serverError}
                        </div>
                    )}

                    <div className="signup-note">
                        <span className="note-icon">📝</span>
                        <p>Your academic profile will be completed after signup to personalize your experience.</p>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account →'}
                    </button>
                </form>

                <div className="register-section">
                    <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
                    <div className="alternative-registration">
                        <p className="alternative-text">Want to register as a tutor instead?</p>
                        <Link to="/register/tutor" className="alternative-link">
                            Register as Tutor →
                        </Link>
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

export default StudentSignup;