import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_BASE = 'http://localhost:8080/api';

const TutorProfileView = () => {
    const navigate = useNavigate();
    const [tutorData, setTutorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTutorProfile();
    }, []);

    const fetchTutorProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/dashboard/tutor/profile`, {
                credentials: 'include',
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }
            if (!response.ok) throw new Error('Failed to load profile');

            const data = await response.json();
            setTutorData(data);
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
                    <button onClick={fetchTutorProfile} className="btn-save">Retry</button>
                </div>
            </div>
        );
    }

    if (!tutorData) return null;

    const isVerified = tutorData.verificationStatus === 'APPROVED';

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/dashboard/tutor')}>
                    ← Back to Dashboard
                </button>
                <h1>Tutor Profile</h1>
                <button
                    className="edit-profile-button"
                    onClick={() => navigate('/tutor/profile/edit')}
                >
                    Edit Profile
                </button>
            </div>

            <div className="profile-view-content">
                {/* Profile Summary Card */}
                <div className="profile-summary-card tutor-summary">
                    <div className="profile-avatar-large tutor-avatar">
                        {tutorData.fullName ? tutorData.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="profile-summary-info">
                        <h2>{tutorData.fullName || 'No name set'}</h2>
                        <p className="tutor-title">{tutorData.qualification || 'Qualification not set'}</p>
                        <p className="student-email">{tutorData.email}</p>
                        <div className={`verification-badge ${isVerified ? 'verified' : 'pending'}`}>
                            {isVerified ? '✓ Verified' : `⏳ ${tutorData.verificationStatus || 'Pending'}`}
                        </div>
                    </div>
                    <div className="tutor-stats-mini-card">
                        <div className="stat">
                            <div className="stat-value">{tutorData.totalSessions ?? 0}</div>
                            <div className="stat-label">Sessions</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">
                                {tutorData.averageRating != null
                                    ? Number(tutorData.averageRating).toFixed(1)
                                    : '—'}
                            </div>
                            <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">
                                {tutorData.credibilityScore != null
                                    ? Number(tutorData.credibilityScore).toFixed(1)
                                    : '—'}
                            </div>
                            <div className="stat-label">Score</div>
                        </div>
                    </div>
                </div>

                {/* About & Bio */}
                <div className="profile-info-card">
                    <h3>📝 About Me</h3>
                    {tutorData.bio ? (
                        <p className="bio-text">{tutorData.bio}</p>
                    ) : (
                        <p className="not-set">No bio added yet. Edit your profile to add one.</p>
                    )}
                    <div className="info-grid" style={{ marginTop: '1rem' }}>
                        <div className="info-item">
                            <label>Years of Experience</label>
                            <p>{tutorData.yearsOfExperience != null ? `${tutorData.yearsOfExperience} years` : <span className="not-set">Not set</span>}</p>
                        </div>
                        <div className="info-item">
                            <label>Max Concurrent Students</label>
                            <p>{tutorData.maxConcurrentStudents != null ? `${tutorData.maxConcurrentStudents} students at a time` : <span className="not-set">Not set</span>}</p>
                        </div>
                        <div className="info-item">
                            <label>Availability</label>
                            <p>
                                <span className={`availability-status ${tutorData.isAvailable ? 'available' : 'unavailable'}`}>
                                    {tutorData.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expert Subjects */}
                {tutorData.expertSubjects && tutorData.expertSubjects.length > 0 && (
                    <div className="profile-info-card">
                        <h3>🎓 Expert Subjects</h3>
                        <div className="subjects-tags">
                            {tutorData.expertSubjects.map((subject, index) => (
                                <span key={index} className="expert-subject-tag">{subject}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Availability Slots */}
                {tutorData.availabilitySlots && tutorData.availabilitySlots.length > 0 && (
                    <div className="profile-info-card">
                        <h3>⏰ Availability Schedule</h3>
                        <div className="availability-slots-grid">
                            {tutorData.availabilitySlots.map((slot, index) => (
                                <div key={index} className="availability-slot">{slot}</div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="profile-info-card">
                    <h3>ℹ️ Account Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Email</label>
                            <p>{tutorData.email}</p>
                        </div>
                        <div className="info-item">
                            <label>Verification Status</label>
                            <p>{tutorData.verificationStatus || 'Pending'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorProfileView;
