import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_BASE = 'http://localhost:8080/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
                    '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

const TutorProfileEdit = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        qualification: '',
        yearsOfExperience: '',
        bio: '',
        expertSubjects: [],
        availabilitySlots: [],
        maxConcurrentStudents: '5',
        isAvailable: true,
    });

    useEffect(() => {
        fetchProfileAndSubjects();
    }, []);

    const fetchProfileAndSubjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const [profileRes, subjectsRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/tutor/profile`, { credentials: 'include' }),
                fetch(`${API_BASE}/auth/subjects`, { credentials: 'include' }),
            ]);

            if (profileRes.status === 401) {
                navigate('/login');
                return;
            }
            if (!profileRes.ok) throw new Error('Failed to load profile');

            const data = await profileRes.json();

            setProfileData({
                fullName: data.fullName || '',
                email: data.email || '',
                qualification: data.qualification || '',
                yearsOfExperience: data.yearsOfExperience != null ? String(data.yearsOfExperience) : '',
                bio: data.bio || '',
                expertSubjects: data.expertSubjects || [],
                availabilitySlots: data.availabilitySlots || [],
                maxConcurrentStudents: data.maxConcurrentStudents != null ? String(data.maxConcurrentStudents) : '5',
                isAvailable: data.isAvailable != null ? data.isAvailable : true,
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
        const { name, value, type, checked } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleExpertSubjectToggle = (subject) => {
        setProfileData(prev => ({
            ...prev,
            expertSubjects: prev.expertSubjects.includes(subject)
                ? prev.expertSubjects.filter(s => s !== subject)
                : [...prev.expertSubjects, subject],
        }));
    };

    const handleAvailabilityToggle = (day, time) => {
        const slot = `${day} ${time}`;
        setProfileData(prev => ({
            ...prev,
            availabilitySlots: prev.availabilitySlots.includes(slot)
                ? prev.availabilitySlots.filter(s => s !== slot)
                : [...prev.availabilitySlots, slot],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg('');

        try {
            const payload = {
                qualification: profileData.qualification,
                bio: profileData.bio,
                yearsOfExperience: parseInt(profileData.yearsOfExperience, 10) || 0,
                maxConcurrentStudents: parseInt(profileData.maxConcurrentStudents, 10) || 5,
                isAvailable: profileData.isAvailable,
                expertSubjects: profileData.expertSubjects,
                availabilitySlots: profileData.availabilitySlots,
            };

            const response = await fetch(`${API_BASE}/dashboard/tutor/profile`, {
                method: 'PUT',
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
            setTimeout(() => navigate('/tutor/profile'), 1200);
        } catch (err) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
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

    // Fall back to showing currently-selected subjects if the API returned none
    const subjectsToShow = availableSubjects.length > 0 ? availableSubjects : profileData.expertSubjects;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/tutor/profile')}>
                    ← Back to Profile
                </button>
                <h1>Edit Tutor Profile</h1>
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
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profileData.fullName}
                                disabled
                                className="input-disabled"
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
                            />
                            <small className="field-hint">Contact support to change your email.</small>
                        </div>
                    </div>
                </div>

                {/* Expertise */}
                <div className="form-section">
                    <h2>Expertise & Background</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Qualification / Degree *</label>
                            <input
                                type="text"
                                name="qualification"
                                value={profileData.qualification}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., M.Sc. in Computer Science, PhD Candidate"
                            />
                        </div>

                        <div className="form-group">
                            <label>Years of Experience</label>
                            <input
                                type="number"
                                name="yearsOfExperience"
                                value={profileData.yearsOfExperience}
                                onChange={handleInputChange}
                                placeholder="e.g., 3"
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Expert Subjects *</label>
                        {subjectsToShow.length === 0 ? (
                            <p className="field-hint">No subjects available. Please contact an administrator.</p>
                        ) : (
                            <div className="subjects-grid">
                                {subjectsToShow.map(subject => (
                                    <label key={subject} className="subject-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={profileData.expertSubjects.includes(subject)}
                                            onChange={() => handleExpertSubjectToggle(subject)}
                                        />
                                        {subject}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Bio / Introduction *</label>
                        <textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            rows="5"
                            required
                            placeholder="Tell students about your teaching approach, experience, and what makes you a great tutor..."
                            maxLength={1000}
                        ></textarea>
                        <small className="field-hint">{profileData.bio.length}/1000 characters</small>
                    </div>
                </div>

                {/* Availability & Settings */}
                <div className="form-section">
                    <h2>Availability & Settings</h2>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={profileData.isAvailable}
                                onChange={handleInputChange}
                                style={{ marginRight: '8px' }}
                            />
                            I am currently available to take new students
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Availability Slots</label>
                        <p className="field-hint" style={{ marginBottom: '0.5rem' }}>
                            Select the time slots when you're available for tutoring sessions.
                        </p>
                        <div className="availability-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Day / Time</th>
                                        {TIME_SLOTS.slice(0, 6).map(time => (
                                            <th key={time}>{time}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map(day => (
                                        <tr key={day}>
                                            <td className="availability-day">{day}</td>
                                            {TIME_SLOTS.slice(0, 6).map(time => (
                                                <td key={`${day}-${time}`} className="availability-cell">
                                                    <input
                                                        type="checkbox"
                                                        checked={profileData.availabilitySlots.includes(`${day} ${time}`)}
                                                        onChange={() => handleAvailabilityToggle(day, time)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Max Concurrent Students</label>
                        <select
                            name="maxConcurrentStudents"
                            value={profileData.maxConcurrentStudents}
                            onChange={handleInputChange}
                        >
                            <option value="1">1 student at a time</option>
                            <option value="2">2 students at a time</option>
                            <option value="3">3 students at a time</option>
                            <option value="5">5 students at a time</option>
                            <option value="10">10 students at a time</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/tutor/profile')}>
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

export default TutorProfileEdit;
