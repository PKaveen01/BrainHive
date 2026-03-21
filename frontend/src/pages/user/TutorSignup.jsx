import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Signup.css';

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
    const [subjects, setSubjects] = useState([]);
    const [availability, setAvailability] = useState({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    });

    // Fetch subjects on component mount
    React.useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const data = await authService.getAllSubjects();
                setSubjects(data);
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
                // Store user data and redirect to login
                alert('Tutor registration successful! Your account will be reviewed by an admin. You can login after approval.');
                navigate('/login');
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

    return (
        <div className="signup-container tutor-signup">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Register as Tutor</h1>
                    <p>Share your expertise and help students succeed</p>
                    <div className="warning-banner">
                        ⚠️ Your account will be reviewed by an admin before you can accept tutoring requests. 
                        This typically takes 24-48 hours.
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <h2>Account Information</h2>
                    
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Dr. Sarah Mitchell"
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
                            placeholder="sarah.m@university.edu"
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

                    <h2>Expertise & Verification</h2>

                    <div className="form-group">
                        <label htmlFor="qualification">Highest Qualification</label>
                        <input
                            type="text"
                            id="qualification"
                            name="qualification"
                            placeholder="e.g., M.Sc. in Mathematics, PhD Candidate"
                            value={formData.qualification}
                            onChange={handleChange}
                            className={errors.qualification ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.qualification && <span className="error-message">{errors.qualification}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="yearsOfExperience">Years of Experience (Optional)</label>
                        <input
                            type="number"
                            id="yearsOfExperience"
                            name="yearsOfExperience"
                            placeholder="e.g., 5"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            disabled={loading}
                            min="0"
                        />
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
                        <label htmlFor="bio">Short Bio / Teaching Summary</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows="4"
                            placeholder="Describe your teaching experience and approach..."
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={loading}
                            maxLength="1000"
                        />
                        <small>{formData.bio.length}/1000 characters</small>
                    </div>

                    <h2>Availability & Settings</h2>

                    <div className="form-group">
                        <label htmlFor="maxConcurrentStudents">Max Concurrent Students</label>
                        <input
                            type="number"
                            id="maxConcurrentStudents"
                            name="maxConcurrentStudents"
                            value={formData.maxConcurrentStudents}
                            onChange={handleChange}
                            disabled={loading}
                            min="1"
                            max="20"
                        />
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
                        {loading ? 'Creating Account...' : 'Create Tutor Account →'}
                    </button>
                </form>

                <div className="signup-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    <p className="register-link">
                        Want to register as a student instead? <Link to="/register/student">Register as Student</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TutorSignup;