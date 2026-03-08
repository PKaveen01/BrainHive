import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const StudentProfileEdit = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    // Dummy data for edit form
    const [profileData, setProfileData] = useState({
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
    });

    const [availableSubjects] = useState([
        'Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems',
        'Computer Networks', 'Web Development', 'Software Engineering',
        'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
        'Cloud Computing', 'Mobile Development', 'Programming Fundamentals',
        'Object Oriented Programming', 'Discrete Mathematics', 'Calculus'
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubjectToggle = (subject, type) => {
        if (type === 'following') {
            setProfileData(prev => ({
                ...prev,
                subjectsFollowing: prev.subjectsFollowing.includes(subject)
                    ? prev.subjectsFollowing.filter(s => s !== subject)
                    : [...prev.subjectsFollowing, subject]
            }));
        } else if (type === 'strength') {
            setProfileData(prev => ({
                ...prev,
                strengthAreas: prev.strengthAreas.includes(subject)
                    ? prev.strengthAreas.filter(s => s !== subject)
                    : [...prev.strengthAreas, subject]
            }));
        } else if (type === 'weak') {
            setProfileData(prev => ({
                ...prev,
                weakAreas: prev.weakAreas.includes(subject)
                    ? prev.weakAreas.filter(s => s !== subject)
                    : [...prev.weakAreas, subject]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        // Simulate API call
        setTimeout(() => {
            alert('Profile updated successfully! (Demo)');
            setSaving(false);
            navigate('/profile');
        }, 1000);
    };

    const calculateProfileCompletion = () => {
        const fields = [
            profileData.fullName,
            profileData.email,
            profileData.degree,
            profileData.year,
            profileData.semester,
            profileData.subjectsFollowing.length > 0,
            profileData.studyStyle,
            profileData.availabilityHours
        ];
        const completed = fields.filter(field => field && field !== '' && field !== false).length;
        return Math.round((completed / fields.length) * 100);
    };

    const profileCompletion = calculateProfileCompletion();

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/profile')}>
                    ← Back to Profile
                </button>
                <h1>Edit Student Profile</h1>
                <div className="profile-completion">
                    <div className="completion-bar">
                        <div className="completion-fill" style={{ width: `${profileCompletion}%` }}></div>
                    </div>
                    <span>{profileCompletion}% Complete</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                {/* Account Information */}
                <div className="form-section">
                    <h2>Account Information</h2>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="your.email@university.edu"
                        />
                    </div>
                </div>

                {/* Academic Information */}
                <div className="form-section">
                    <h2>Academic Information</h2>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Degree Program *</label>
                            <select
                                name="degree"
                                value={profileData.degree}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Computer Science">Computer Science</option>
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Business">Business</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Year *</label>
                            <select
                                name="year"
                                value={profileData.year}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Year 1">Year 1</option>
                                <option value="Year 2">Year 2</option>
                                <option value="Year 3">Year 3</option>
                                <option value="Year 4">Year 4</option>
                                <option value="Postgraduate">Postgraduate</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Semester *</label>
                            <select
                                name="semester"
                                value={profileData.semester}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                                <option value="Trimester 1">Trimester 1</option>
                                <option value="Trimester 2">Trimester 2</option>
                                <option value="Trimester 3">Trimester 3</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Subjects Currently Following *</label>
                        <div className="subjects-grid">
                            {availableSubjects.map(subject => (
                                <label key={subject} className="subject-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={profileData.subjectsFollowing.includes(subject)}
                                        onChange={() => handleSubjectToggle(subject, 'following')}
                                    />
                                    {subject}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Strength Areas</label>
                            <div className="subjects-grid">
                                {profileData.subjectsFollowing.map(subject => (
                                    <label key={subject} className="subject-checkbox strength">
                                        <input
                                            type="checkbox"
                                            checked={profileData.strengthAreas.includes(subject)}
                                            onChange={() => handleSubjectToggle(subject, 'strength')}
                                        />
                                        {subject}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Weak Areas</label>
                            <div className="subjects-grid">
                                {profileData.subjectsFollowing.map(subject => (
                                    <label key={subject} className="subject-checkbox weak">
                                        <input
                                            type="checkbox"
                                            checked={profileData.weakAreas.includes(subject)}
                                            onChange={() => handleSubjectToggle(subject, 'weak')}
                                        />
                                        {subject}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Preferred Study Style *</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="studyStyle"
                                        value="Solo"
                                        checked={profileData.studyStyle === 'Solo'}
                                        onChange={handleInputChange}
                                    />
                                    Solo
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="studyStyle"
                                        value="Group"
                                        checked={profileData.studyStyle === 'Group'}
                                        onChange={handleInputChange}
                                    />
                                    Group
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="studyStyle"
                                        value="Hybrid"
                                        checked={profileData.studyStyle === 'Hybrid'}
                                        onChange={handleInputChange}
                                    />
                                    Hybrid
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Daily Study Time Availability *</label>
                            <select
                                name="availabilityHours"
                                value={profileData.availabilityHours}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="1-2 hours">1-2 hours</option>
                                <option value="2-3 hours">2-3 hours</option>
                                <option value="3-4 hours">3-4 hours</option>
                                <option value="4-5 hours">4-5 hours</option>
                                <option value="5+ hours">5+ hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/profile')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-save" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentProfileEdit;