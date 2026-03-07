import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import './CompleteProfile.css'; 

// Import step components - make sure these files exist
import AcademicInfoStep from './ProfileWizard/AcademicInfoStep';
import SubjectsStep from './ProfileWizard/SubjectsStep';
import PreferencesStep from './ProfileWizard/PreferencesStep';
import ReviewStep from './ProfileWizard/ReviewStep';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        degreeProgram: '',
        currentYear: '',
        currentSemester: '',
        subjects: [],
        strongSubjects: [],
        weakSubjects: [],
        studyStyle: '',
        availabilityHours: 4,
        preferredTime: ''
    });
    const [errors, setErrors] = useState({});

    const totalSteps = 4;

    useEffect(() => {
        console.log('CompleteProfile component mounted');
        
        // Check if user is authenticated via localStorage
        const user = authService.getCurrentUser();
        console.log('Current user in CompleteProfile:', user);
        
        if (!user) {
            console.log('No user found, redirecting to login');
            navigate('/login');
            return;
        }
        
        // If user has already completed profile, redirect to dashboard
        if (user.profileCompleted) {
            console.log('Profile already completed, redirecting to dashboard');
            navigate('/dashboard/student');
            return;
        }
        
        console.log('User is authenticated and profile not completed');
        
        // Fetch subjects
        const fetchSubjects = async () => {
            try {
                const data = await authService.getAllSubjects();
                console.log('Fetched subjects:', data);
                setSubjects(data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };
        fetchSubjects();
    }, [navigate]);

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const validateStep = () => {
        const newErrors = {};
        
        if (currentStep === 1) {
            if (!formData.degreeProgram) newErrors.degreeProgram = 'Please select your degree program';
            if (!formData.currentYear) newErrors.currentYear = 'Please select your current year';
            if (!formData.currentSemester) newErrors.currentSemester = 'Please select your semester';
        } else if (currentStep === 2) {
            if (formData.subjects.length === 0) {
                newErrors.subjects = 'Please select at least one subject';
            }
        } else if (currentStep === 3) {
            if (!formData.studyStyle) newErrors.studyStyle = 'Please select your study style';
            if (!formData.availabilityHours) newErrors.availabilityHours = 'Please select your study availability';
            if (!formData.preferredTime) newErrors.preferredTime = 'Please select your preferred study time';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setLoading(true);
        
        try {
            // Create a new object with only the fields needed for profile completion
            // This matches the StudentProfileCompletionRequest DTO
            const profileData = {
                degreeProgram: formData.degreeProgram,
                currentYear: formData.currentYear,
                currentSemester: formData.currentSemester,
                subjects: formData.subjects,
                strongSubjects: formData.strongSubjects,
                weakSubjects: formData.weakSubjects,
                studyStyle: formData.studyStyle,
                availabilityHours: formData.availabilityHours,
                preferredTime: formData.preferredTime
            };
            
            console.log('Submitting profile completion with data:', profileData);
            const response = await authService.completeStudentProfile(profileData);
            console.log('Profile completion response:', response);
            
            if (response && response.success) {
                // Update user data in localStorage
                const user = authService.getCurrentUser();
                if (user) {
                    user.profileCompleted = true;
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('Updated user in localStorage:', user);
                }
                navigate('/dashboard/student');
            } else {
                alert(response.message || 'Failed to complete profile');
            }
        } catch (error) {
            console.error('Profile completion error:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const skipProfile = () => {
        navigate('/dashboard/student');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <AcademicInfoStep
                        data={formData}
                        updateData={updateFormData}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <SubjectsStep
                        data={formData}
                        updateData={updateFormData}
                        subjects={subjects}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <PreferencesStep
                        data={formData}
                        updateData={updateFormData}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <ReviewStep
                        data={formData}
                        subjects={subjects}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="profile-wizard">
            <div className="wizard-container">
                <div className="wizard-header">
                    <h1>Complete Your Profile</h1>
                    <button 
                        type="button" 
                        onClick={skipProfile} 
                        className="skip-btn"
                    >
                        Skip for now
                    </button>
                </div>

                <div className="progress-steps">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Academic Info</div>
                    </div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Subjects</div>
                    </div>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Preferences</div>
                    </div>
                    <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                        <div className="step-number">4</div>
                        <div className="step-label">Review</div>
                    </div>
                </div>

                <div className="wizard-content">
                    {renderStep()}
                </div>

                <div className="wizard-footer">
                    {currentStep > 1 && (
                        <button 
                            type="button"
                            onClick={handleBack} 
                            className="back-btn" 
                            disabled={loading}
                        >
                            ← Back
                        </button>
                    )}
                    
                    {currentStep < totalSteps ? (
                        <button 
                            type="button"
                            onClick={handleNext} 
                            className="next-btn" 
                            disabled={loading}
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button 
                            type="button"
                            onClick={handleSubmit} 
                            className="submit-btn" 
                            disabled={loading}
                        >
                            {loading ? 'Completing...' : 'Complete Profile'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;