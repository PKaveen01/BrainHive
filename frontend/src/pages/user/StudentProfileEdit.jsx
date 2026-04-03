import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_BASE = 'http://localhost:8080/api';

const StudentProfileEdit = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        degree: '',
        year: '',
        semester: '',
        subjectsFollowing: [],
        strengthAreas: [],
        weakAreas: [],
        studyStyle: '',
        availabilityHours: '3',
        preferredTime: '',
    });

    useEffect(() => {
        fetchProfileAndSubjects();
    }, []);

    const fetchProfileAndSubjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const [profileRes, subjectsRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/student/info`, { credentials: 'include' }),
                fetch(`${API_BASE}/auth/subjects`, { credentials: 'include' }),
            ]);

            if (profileRes.status === 401) {
                navigate('/login');
                return;
            }
            if (!profileRes.ok) throw new Error('Failed to load profile');

            const data = await profileRes.json();
            const subjects = data.focusAreas ? data.focusAreas.map(s => s.name) : [];
            const weakSubjects = data.weakSubjects || [];
            const strengthAreas = subjects.filter(s => !weakSubjects.includes(s));

            setProfileData({
                fullName: data.fullName || '',
                email: data.email || '',
                degree: data.program || '',
                year: data.year || '',
                semester: data.semester || '',
                subjectsFollowing: subjects,
                strengthAreas,
                weakAreas: weakSubjects,
                studyStyle: data.studyStyle || 'Solo',
                availabilityHours: data.availabilityHours ? String(data.availabilityHours) : '3',
                preferredTime: data.preferredTime || '',
            });

            if (subjectsRes.ok) {
                const subjectList = await subjectsRes.json();
                setAvailableSubjects(subjectList.map(s => s.name));
            }
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubjectToggle = (subject, type) => {
        if (type === 'following') {
            setProfileData(prev => {
                const isFollowing = prev.subjectsFollowing.includes(subject);
                const newFollowing = isFollowing
                    ? prev.subjectsFollowing.filter(s => s !== subject)
                    : [...prev.subjectsFollowing, subject];
                return {
                    ...prev,
                    subjectsFollowing: newFollowing,
                    strengthAreas: isFollowing ? prev.strengthAreas.filter(s => s !== subject) : prev.strengthAreas,
                    weakAreas: isFollowing ? prev.weakAreas.filter(s => s !== subject) : prev.weakAreas,
                };
            });
        } else if (type === 'strength') {
            setProfileData(prev => ({
                ...prev,
                strengthAreas: prev.strengthAreas.includes(subject)
                    ? prev.strengthAreas.filter(s => s !== subject)
                    : [...prev.strengthAreas, subject],
                weakAreas: prev.weakAreas.filter(s => s !== subject),
            }));
        } else if (type === 'weak') {
            setProfileData(prev => ({
                ...prev,
                weakAreas: prev.weakAreas.includes(subject)
                    ? prev.weakAreas.filter(s => s !== subject)
                    : [...prev.weakAreas, subject],
                strengthAreas: prev.strengthAreas.filter(s => s !== subject),
            }));
        }
    };

    const calculateProfileCompletion = () => {
        const fields = [
            profileData.degree,
            profileData.year,
            profileData.semester,
            profileData.subjectsFollowing.length > 0,
            profileData.studyStyle,
            profileData.preferredTime,
        ];
        const completed = fields.filter(f => f && f !== '' && f !== false).length;
        return Math.round((completed / fields.length) * 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg('');

        try {
            const payload = {
                degreeProgram: profileData.degree,
                currentYear: profileData.year,
                currentSemester: profileData.semester,
                studyStyle: profileData.studyStyle,
                availabilityHours: parseInt(profileData.availabilityHours, 10) || 0,
                preferredTime: profileData.preferredTime,
                subjectsFollowing: profileData.subjectsFollowing,   // ← now included
                weakSubjects: profileData.weakAreas,
            };

            const response = await fetch(`${API_BASE}/dashboard/student/profile`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to save profile');
            }

            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => navigate('/profile'), 1200);
        } catch (err) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const profileCompletion = calculateProfileCompletion();

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

            {error && (
                <div className="profile-alert profile-alert-error">⚠️ {error}</div>
            )}
            {successMsg && (
                <div className="profile-alert profile-alert-success">✓ {successMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                {/* Account Information */}
                <div className="form-section">
                    <h2>Account Information</h2>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={profileData.fullName}
                            disabled
                            className="input-disabled"
                            title="Name cannot be changed here"
                        />
                        <small className="field-hint">Contact support to change your name.</small>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="input-disabled"
                            title="Email cannot be changed here"
                        />
                        <small className="field-hint">Contact support to change your email.</small>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="form-section">
                    <h2>Academic Information</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Degree Program *</label>
                            <select name="degree" value={profileData.degree} onChange={handleInputChange} required>
                                <option value="">Select degree...</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Business">Business</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Year *</label>
                            <select name="year" value={profileData.year} onChange={handleInputChange} required>
                                <option value="">Select year...</option>
                                <option value="Year 1">Year 1</option>
                                <option value="Year 2">Year 2</option>
                                <option value="Year 3">Year 3</option>
                                <option value="Year 4">Year 4</option>
                                <option value="Postgraduate">Postgraduate</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Semester *</label>
                            <select name="semester" value={profileData.semester} onChange={handleInputChange} required>
                                <option value="">Select semester...</option>
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                                <option value="Trimester 1">Trimester 1</option>
                                <option value="Trimester 2">Trimester 2</option>
                                <option value="Trimester 3">Trimester 3</option>
                            </select>
                        </div>
                    </div>

                    {availableSubjects.length > 0 && (
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
                    )}

                    {profileData.subjectsFollowing.length > 0 && (
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
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Preferred Study Style *</label>
                            <div className="radio-group">
                                {['Solo', 'Group', 'Hybrid'].map(style => (
                                    <label key={style}>
                                        <input
                                            type="radio"
                                            name="studyStyle"
                                            value={style}
                                            checked={profileData.studyStyle === style}
                                            onChange={handleInputChange}
                                        />
                                        {style}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Preferred Study Time *</label>
                            <div className="radio-group">
                                {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                                    <label key={time}>
                                        <input
                                            type="radio"
                                            name="preferredTime"
                                            value={time}
                                            checked={profileData.preferredTime === time}
                                            onChange={handleInputChange}
                                        />
                                        {time}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Daily Study Hours</label>
                            <select name="availabilityHours" value={profileData.availabilityHours} onChange={handleInputChange}>
                                <option value="1">1 hour</option>
                                <option value="2">2 hours</option>
                                <option value="3">3 hours</option>
                                <option value="4">4 hours</option>
                                <option value="5">5+ hours</option>
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
