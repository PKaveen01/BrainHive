import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const StudentProfileView = () => {
    const navigate = useNavigate();

    // Dummy student data
    const studentData = {
        fullName: 'Alex Johnson',
        email: 'alex.johnson@university.edu',
        degree: 'Computer Science',
        year: 'Year 3',
        semester: 'Semester 1',
        subjectsFollowing: [
            'Data Structures', 'Algorithms', 'Database Systems', 
            'Operating Systems', 'Web Development', 'Software Engineering'
        ],
        strengthAreas: ['Data Structures', 'Algorithms', 'Web Development'],
        weakAreas: ['Database Systems', 'Operating Systems'],
        studyStyle: 'Group',
        availabilityHours: '3-4 hours',
        studentId: 'CS2023001',
        enrollmentDate: 'September 2023',
        profileCompletion: 85
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/dashboard/student')}>
                    ← Back to Dashboard
                </button>
                <h1>Student Profile</h1>
                <button 
                    className="edit-profile-button"
                    onClick={() => navigate('/profile/edit')}
                >
                    Edit Profile
                </button>
            </div>

            <div className="profile-view-content">
                {/* Profile Summary Card */}
                <div className="profile-summary-card">
                    <div className="profile-avatar-large">
                        {studentData.fullName.charAt(0)}
                    </div>
                    <div className="profile-summary-info">
                        <h2>{studentData.fullName}</h2>
                        <p className="student-id">ID: {studentData.studentId}</p>
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
                            <p>{studentData.degree}</p>
                        </div>
                        <div className="info-item">
                            <label>Current Year</label>
                            <p>{studentData.year}</p>
                        </div>
                        <div className="info-item">
                            <label>Current Semester</label>
                            <p>{studentData.semester}</p>
                        </div>
                        <div className="info-item">
                            <label>Enrollment Date</label>
                            <p>{studentData.enrollmentDate}</p>
                        </div>
                    </div>
                </div>

                {/* Subjects Following */}
                <div className="profile-info-card">
                    <h3>📖 Subjects Currently Following</h3>
                    <div className="subjects-tags">
                        {studentData.subjectsFollowing.map((subject, index) => (
                            <span key={index} className="subject-tag">
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Strength & Weak Areas */}
                <div className="profile-info-row">
                    <div className="profile-info-card half-width">
                        <h3>💪 Strength Areas</h3>
                        <div className="strength-tags">
                            {studentData.strengthAreas.map((area, index) => (
                                <span key={index} className="strength-tag">
                                    ✓ {area}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="profile-info-card half-width">
                        <h3>⚠️ Weak Areas (Need Help)</h3>
                        <div className="weak-tags">
                            {studentData.weakAreas.map((area, index) => (
                                <span key={index} className="weak-tag">
                                    ! {area}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Study Preferences */}
                <div className="profile-info-card">
                    <h3>🎯 Study Preferences</h3>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <span className="preference-icon">👥</span>
                            <div>
                                <label>Study Style</label>
                                <p>{studentData.studyStyle}</p>
                            </div>
                        </div>
                        <div className="preference-item">
                            <span className="preference-icon">⏰</span>
                            <div>
                                <label>Daily Study Time</label>
                                <p>{studentData.availabilityHours}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileView;