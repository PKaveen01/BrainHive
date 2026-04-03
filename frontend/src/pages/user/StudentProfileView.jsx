import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_BASE = 'http://localhost:8080/api';

const StudentProfileView = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentProfile();
    }, []);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE}/dashboard/student/info`, {
                credentials: 'include',
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }
            if (!response.ok) throw new Error('Failed to load profile');

            const data = await response.json();

            const subjects = data.focusAreas ? data.focusAreas.map(s => s.name) : [];
            const weakSubjects = data.weakSubjects || [];
            const strengthAreas = subjects.filter(s => !weakSubjects.includes(s));

            setStudentData({
                fullName: data.fullName || '',
                email: data.email || '',
                degree: data.program || '',
                year: data.year || '',
                semester: data.semester || '',
                subjectsFollowing: subjects,
                strengthAreas,
                weakAreas: weakSubjects,
                studyStyle: data.studyStyle || '',
                availabilityHours: data.availabilityHours ? `${data.availabilityHours} hours` : '',
                preferredTime: data.preferredTime || '',
                profileCompletion: data.profileCompletion || 0,
            });
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-error">
                    <p>⚠️ {error}</p>
                    <button onClick={fetchStudentProfile} className="btn-save">Retry</button>
                </div>
            </div>
        );
    }

    if (!studentData) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/dashboard/student')}>
                    ← Back to Dashboard
                </button>
                <h1>Student Profile</h1>
                <button className="edit-profile-button" onClick={() => navigate('/profile/edit')}>
                    Edit Profile
                </button>
            </div>

            <div className="profile-view-content">
                {/* Profile Summary Card */}
                <div className="profile-summary-card">
                    <div className="profile-avatar-large">
                        {studentData.fullName ? studentData.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="profile-summary-info">
                        <h2>{studentData.fullName || 'No name set'}</h2>
                        <p className="student-email">{studentData.email}</p>
                        <div className="profile-completion-badge">
                            <div className="completion-bar-small">
                                <div
                                    className="completion-fill-small"
                                    style={{ width: `${studentData.profileCompletion}%` }}
                                ></div>
                            </div>
                            <span>{studentData.profileCompletion}% Complete</span>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="profile-info-card">
                    <h3>📚 Academic Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Degree Program</label>
                            <p>{studentData.degree || <span className="not-set">Not set</span>}</p>
                        </div>
                        <div className="info-item">
                            <label>Current Year</label>
                            <p>{studentData.year || <span className="not-set">Not set</span>}</p>
                        </div>
                        <div className="info-item">
                            <label>Current Semester</label>
                            <p>{studentData.semester || <span className="not-set">Not set</span>}</p>
                        </div>
                        <div className="info-item">
                            <label>Study Style</label>
                            <p>{studentData.studyStyle || <span className="not-set">Not set</span>}</p>
                        </div>
                    </div>
                </div>

                {/* Subjects Following */}
                {studentData.subjectsFollowing.length > 0 && (
                    <div className="profile-info-card">
                        <h3>📖 Subjects Currently Following</h3>
                        <div className="subjects-tags">
                            {studentData.subjectsFollowing.map((subject, index) => (
                                <span key={index} className="subject-tag">{subject}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Strength & Weak Areas */}
                {(studentData.strengthAreas.length > 0 || studentData.weakAreas.length > 0) && (
                    <div className="profile-info-row">
                        {studentData.strengthAreas.length > 0 && (
                            <div className="profile-info-card half-width">
                                <h3>💪 Strength Areas</h3>
                                <div className="strength-tags">
                                    {studentData.strengthAreas.map((area, index) => (
                                        <span key={index} className="strength-tag">✓ {area}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {studentData.weakAreas.length > 0 && (
                            <div className="profile-info-card half-width">
                                <h3>⚠️ Weak Areas (Need Help)</h3>
                                <div className="weak-tags">
                                    {studentData.weakAreas.map((area, index) => (
                                        <span key={index} className="weak-tag">! {area}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Study Preferences */}
                <div className="profile-info-card">
                    <h3>🎯 Study Preferences</h3>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <span className="preference-icon">👥</span>
                            <div>
                                <label>Study Style</label>
                                <p>{studentData.studyStyle || <span className="not-set">Not set</span>}</p>
                            </div>
                        </div>
                        <div className="preference-item">
                            <span className="preference-icon">🌅</span>
                            <div>
                                <label>Preferred Study Time</label>
                                <p>{studentData.preferredTime || <span className="not-set">Not set</span>}</p>
                            </div>
                        </div>
                        <div className="preference-item">
                            <span className="preference-icon">⏰</span>
                            <div>
                                <label>Daily Study Time</label>
                                <p>{studentData.availabilityHours || <span className="not-set">Not set</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {studentData.profileCompletion < 100 && (
                    <div className="profile-info-card profile-incomplete-notice">
                        <p>
                            Your profile is <strong>{studentData.profileCompletion}%</strong> complete.{' '}
                            <button className="link-button" onClick={() => navigate('/profile/edit')}>
                                Complete your profile
                            </button>{' '}
                            to get better matches.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfileView;
