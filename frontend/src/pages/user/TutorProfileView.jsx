import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const TutorProfileView = () => {
    const navigate = useNavigate();

    // Dummy tutor data
    const tutorData = {
        fullName: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@university.edu',
        qualification: 'Ph.D. in Computer Science',
        expertSubjects: [
            'Data Structures', 'Algorithms', 'Database Systems',
            'Operating Systems', 'Computer Networks', 'Software Engineering'
        ],
        yearsExperience: '8 years',
        bio: 'Experienced computer science educator with a passion for helping students understand complex concepts. I believe in making learning interactive and enjoyable. My teaching approach focuses on practical examples and real-world applications.',
        availabilitySlots: [
            'Monday 2:00 PM', 'Monday 4:00 PM', 'Tuesday 10:00 AM',
            'Wednesday 3:00 PM', 'Thursday 1:00 PM', 'Friday 11:00 AM',
            'Saturday 10:00 AM', 'Saturday 2:00 PM'
        ],
        maxConcurrentStudents: '5',
        tutorId: 'TCH2023001',
        joinDate: 'January 2023',
        totalStudents: 48,
        totalSessions: 124,
        averageRating: 4.9,
        verificationStatus: 'Verified',
        department: 'Computer Science Department'
    };

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
                        {tutorData.fullName.charAt(0)}
                    </div>
                    <div className="profile-summary-info">
                        <h2>{tutorData.fullName}</h2>
                        <p className="tutor-title">{tutorData.qualification}</p>
                        <p className="tutor-department">{tutorData.department}</p>
                        <div className="verification-badge">
                            ✓ {tutorData.verificationStatus}
                        </div>
                    </div>
                    <div className="tutor-stats-mini-card">
                        <div className="stat">
                            <div className="stat-value">{tutorData.totalStudents}</div>
                            <div className="stat-label">Students</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">{tutorData.totalSessions}</div>
                            <div className="stat-label">Sessions</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">{tutorData.averageRating}</div>
                            <div className="stat-label">Rating</div>
                        </div>
                    </div>
                </div>

                {/* About & Bio */}
                <div className="profile-info-card">
                    <h3>📝 About Me</h3>
                    <p className="bio-text">{tutorData.bio}</p>
                    <div className="info-item">
                        <label>Years of Experience</label>
                        <p>{tutorData.yearsExperience}</p>
                    </div>
                </div>

                {/* Expert Subjects */}
                <div className="profile-info-card">
                    <h3>🎓 Expert Subjects</h3>
                    <div className="subjects-tags">
                        {tutorData.expertSubjects.map((subject, index) => (
                            <span key={index} className="expert-subject-tag">
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Availability Slots */}
                <div className="profile-info-card">
                    <h3>⏰ Availability Schedule</h3>
                    <div className="availability-slots-grid">
                        {tutorData.availabilitySlots.map((slot, index) => (
                            <div key={index} className="availability-slot">
                                {slot}
                            </div>
                        ))}
                    </div>
                    <div className="info-item">
                        <label>Max Concurrent Students</label>
                        <p>{tutorData.maxConcurrentStudents} students at a time</p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="profile-info-card">
                    <h3>ℹ️ Additional Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Tutor ID</label>
                            <p>{tutorData.tutorId}</p>
                        </div>
                        <div className="info-item">
                            <label>Email</label>
                            <p>{tutorData.email}</p>
                        </div>
                        <div className="info-item">
                            <label>Joined</label>
                            <p>{tutorData.joinDate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorProfileView;