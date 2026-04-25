import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from './StudentSidebar';
import './ProfileGuard.css';

/**
 * ProfileGuard
 * Wraps any student page that requires a 100% complete profile.
 * If the student's profile completion is less than 100%, the page content
 * is replaced with a friendly prompt to complete their profile first.
 *
 * Usage:
 *   <ProfileGuard>
 *     <MyActualPageContent />
 *   </ProfileGuard>
 */
const ProfileGuard = ({ children }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading' | 'incomplete' | 'complete'
    const [completion, setCompletion] = useState(0);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        api.get('/dashboard/student/info')
            .then(res => {
                const pct = res.data?.profileCompletion ?? 0;
                setCompletion(pct);
                setStatus(pct < 100 ? 'incomplete' : 'complete');
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    // On error, default to blocking access for safety
                    setStatus('incomplete');
                }
            });
    }, [navigate]);

    if (status === 'loading') {
        return (
            <div className="dashboard">
                <StudentSidebar />
                <div className="pg-loading">
                    <div className="pg-spinner" />
                </div>
            </div>
        );
    }

    if (status === 'incomplete') {
        return (
            <div className="dashboard">
                <StudentSidebar />
                <div className="pg-wall">
                    <div className="pg-wall-card">
                        <div className="pg-wall-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                <path d="M15 5.5a3 3 0 0 1 0 5" strokeOpacity="0.4" />
                                <circle cx="18" cy="16" r="4" fill="var(--pg-accent)" stroke="none" />
                                <path d="M16.5 16h3M18 14.5v3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        <h2 className="pg-wall-title">Complete Your Profile First</h2>

                        <p className="pg-wall-body">
                            You need a <strong>100% complete profile</strong> to access this page.
                            Finishing your profile helps us connect you with the right tutors,
                            resources, and study groups.
                        </p>

                        <div className="pg-progress-wrap">
                            <div className="pg-progress-labels">
                                <span>Profile completion</span>
                                <span className="pg-progress-pct">{completion}%</span>
                            </div>
                            <div className="pg-progress-track">
                                <div
                                    className="pg-progress-fill"
                                    style={{ width: `${completion}%` }}
                                />
                            </div>
                        </div>

                        <div className="pg-wall-actions">
                            <button
                                className="pg-btn-primary"
                                onClick={() => navigate('/profile/edit')}
                            >
                                Complete My Profile
                            </button>
                            <button
                                className="pg-btn-secondary"
                                onClick={() => navigate('/dashboard/student')}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Profile is 100% — render the real page
    return children;
};

export default ProfileGuard;
