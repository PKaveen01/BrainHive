import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Signup.css';
import logoImage from '../../assets/images/logo.png';

const TutorSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        qualification: '',
        yearsOfExperience: '',
        bio: '',
        expertSubjects: [],
        availabilitySlots: [],
        maxConcurrentStudents: 5
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [subjects, setSubjects] = useState([]);
    
    // State for availability slots (simplified for demo)
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

    // Fetch subjects on component mount
    React.useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Dummy subjects for demo
                const dummySubjects = [
                    { id: 1, name: 'Data Structures' },
                    { id: 2, name: 'Algorithms' },
                    { id: 3, name: 'Database Systems' },
                    { id: 4, name: 'Operating Systems' },
                    { id: 5, name: 'Computer Networks' },
                    { id: 6, name: 'Web Development' },
                    { id: 7, name: 'Software Engineering' },
                    { id: 8, name: 'Artificial Intelligence' },
                    { id: 9, name: 'Machine Learning' },
                    { id: 10, name: 'Cybersecurity' },
                ];
                setSubjects(dummySubjects);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };
        fetchSubjects();
    }, []);

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
        
        // Qualification validation
        if (!formData.qualification.trim()) {
            newErrors.qualification = 'Qualification is required';
        }
        
        // Expert Subjects validation
        if (formData.expertSubjects.length === 0) {
            newErrors.expertSubjects = 'Please select at least one subject to teach';
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
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubjectToggle = (subjectId) => {
        setFormData(prev => {
            const currentSubjects = [...prev.expertSubjects];
            const index = currentSubjects.indexOf(subjectId);
            
            if (index === -1) {
                currentSubjects.push(subjectId);
            } else {
                currentSubjects.splice(index, 1);
            }
            
            return {
                ...prev,
                expertSubjects: currentSubjects
            };
        });
        
        if (errors.expertSubjects && formData.expertSubjects.length > 0) {
            setErrors(prev => ({
                ...prev,
                expertSubjects: ''
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
            const response = await authService.registerTutor(formData);
            
            if (response && response.success) {
                // Show in-page success screen — tutor must wait for approval
                setRegistrationSuccess(true);
            } else {
                setServerError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
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

    // Show success screen after registration — tutor must wait for admin approval
    if (registrationSuccess) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                    <h2 style={{ color: '#1f2937', marginBottom: '12px' }}>Registration Successful!</h2>
                    <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                        Your tutor account has been created and is <strong>pending admin approval</strong>.
                        You will be able to log in once an administrator reviews and approves your application.
                    </p>
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
                        <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                            ⏳ <strong>What happens next?</strong><br />
                            An admin will review your qualification and details. Once approved, you will be able to log in with your email and password.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ padding: '12px 32px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card tutor-signup-card">
                <div className="auth-header">
                    <div className="auth-logo"><img src={logoImage} alt="BrainHive" className="auth-logo-img" /><span>BrainHive</span></div>
                    <h2>Register as Tutor</h2>
                    <p className="auth-subtitle">Share your expertise and help students succeed</p>
                    <div className="signup-badge tutor-badge">
                        👨‍🏫 Tutor Registration
                    </div>
                </div>

                {/* Verification Warning Banner */}
                <div className="alert alert-warning">
                    <span className="alert-icon">⚠️</span>
                    <div className="alert-content">
                        <strong>Account Verification Required</strong>
                        <p>Your account will be reviewed by an admin before you can accept tutoring requests. This typically takes 24-48 hours.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Account Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Account Information</h3>
                        
                        <div className="form-group">
                            <label>Full Name *</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="👤 Dr. Sarath Indika"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={errors.fullName ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>
                            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                        </div>

                        <div className="form-group">
                            <label>University Email *</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="📧 sarath.indika@university.edu"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Password *</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="🔒 Create a strong password"
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
                            <label>Confirm Password *</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="✓ Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={errors.confirmPassword ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    {/* Expertise & Verification Section */}
                    <div className="form-section">
                        <h3 className="section-title">Expertise & Verification</h3>

                        <div className="form-group">
                            <label>Highest Qualification *</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="text"
                                    name="qualification"
                                    placeholder="🎓 e.g., M.Sc. in Computer Science, PhD Candidate"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className={errors.qualification ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>
                            {errors.qualification && <span className="error-message">{errors.qualification}</span>}
                        </div>

                        <div className="form-group">
                            <label>Years of Experience (Optional)</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="number"
                                    name="yearsOfExperience"
                                    placeholder="📅 e.g., 5"
                                    value={formData.yearsOfExperience}
                                    onChange={handleChange}
                                    disabled={loading}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Subjects You Can Teach *</label>
                            <div className="subjects-grid">
                                {subjects.map(subject => (
                                    <label key={subject.id} className="subject-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.expertSubjects.includes(subject.id)}
                                            onChange={() => handleSubjectToggle(subject.id)}
                                            disabled={loading}
                                        />
                                        <span>{subject.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.expertSubjects && <span className="error-message">{errors.expertSubjects}</span>}
                        </div>

                        <div className="form-group">
                            <label>Short Bio / Teaching Summary</label>
                            <textarea
                                name="bio"
                                rows="4"
                                placeholder="Describe your teaching experience, approach, and what makes you a great tutor..."
                                value={formData.bio}
                                onChange={handleChange}
                                disabled={loading}
                                maxLength="1000"
                                className="bio-textarea"
                            />
                            <div className="char-counter">
                                {formData.bio.length}/1000 characters
                            </div>
                        </div>
                    </div>

                    {/* Availability & Settings Section */}
                    <div className="form-section">
                        <h3 className="section-title">Availability & Settings</h3>

                        <div className="form-group">
                            <label>Max Concurrent Students</label>
                            <div className="input-icon">
                                <span className="icon"></span>
                                <input
                                    type="number"
                                    name="maxConcurrentStudents"
                                    value={formData.maxConcurrentStudents}
                                    onChange={handleChange}
                                    disabled={loading}
                                    min="1"
                                    max="20"
                                />
                            </div>
                            <small className="form-hint">Maximum number of students you can tutor simultaneously</small>
                        </div>
                    </div>

                    {serverError && (
                        <div className="alert alert-error">
                            <span className="alert-icon">⚠️</span>
                            {serverError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn-primary tutor-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Tutor Account →'}
                    </button>
                </form>

                <div className="register-section">
                    <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
                    <div className="alternative-registration">
                        <p className="alternative-text">Want to register as a student instead?</p>
                        <Link to="/register/student" className="alternative-link student-link">
                            Register as Student →
                        </Link>
                    </div>
                </div>

                <div className="help-section">
                    <p>Need help with registration?</p>
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

export default TutorSignup;