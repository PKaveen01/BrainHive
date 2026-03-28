import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const TutorProfileEdit = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    // Dummy data for edit form
    const [profileData, setProfileData] = useState({
        fullName: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@university.edu',
        qualification: 'Ph.D. in Computer Science',
        expertSubjects: [
            'Data Structures', 'Algorithms', 'Database Systems',
            'Operating Systems', 'Computer Networks', 'Software Engineering'
        ],
        yearsExperience: '8',
        bio: 'Experienced computer science educator with a passion for helping students understand complex concepts. I believe in making learning interactive and enjoyable. My teaching approach focuses on practical examples and real-world applications.',
        availabilitySlots: [
            'Monday 2:00 PM', 'Monday 4:00 PM', 'Tuesday 10:00 AM',
            'Wednesday 3:00 PM', 'Thursday 1:00 PM', 'Friday 11:00 AM',
            'Saturday 10:00 AM', 'Saturday 2:00 PM'
        ],
        maxConcurrentStudents: '5',
    });

    const [availableSubjects] = useState([
        'Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems',
        'Computer Networks', 'Web Development', 'Software Engineering',
        'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
        'Cloud Computing', 'Mobile Development', 'Programming Fundamentals'
    ]);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', 
                       '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleExpertSubjectToggle = (subject) => {
        setProfileData(prev => ({
            ...prev,
            expertSubjects: prev.expertSubjects.includes(subject)
                ? prev.expertSubjects.filter(s => s !== subject)
                : [...prev.expertSubjects, subject]
        }));
    };

    const handleAvailabilityToggle = (day, time) => {
        const slot = `${day} ${time}`;
        setProfileData(prev => ({
            ...prev,
            availabilitySlots: prev.availabilitySlots.includes(slot)
                ? prev.availabilitySlots.filter(s => s !== slot)
                : [...prev.availabilitySlots, slot]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        // Simulate API call
        setTimeout(() => {
            alert('Profile updated successfully! (Demo)');
            setSaving(false);
            navigate('/tutor/profile');
        }, 1000);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/tutor/profile')}>
                    ← Back to Profile
                </button>
                <h1>Edit Tutor Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                {/* Account Information */}
                <div className="form-section">
                    <h2>Account Information</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profileData.fullName}
                                onChange={handleInputChange}
                                required
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
                            />
                        </div>
                    </div>
                </div>

                {/* Expertise & Verification */}
                <div className="form-section">
                    <h2>Expertise & Verification</h2>
                    
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
                                name="yearsExperience"
                                value={profileData.yearsExperience}
                                onChange={handleInputChange}
                                placeholder="Number of years"
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Expert Subjects *</label>
                        <div className="subjects-grid">
                            {availableSubjects.map(subject => (
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
                    </div>

                    <div className="form-group">
                        <label>Bio / Introduction *</label>
                        <textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            rows="4"
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Availability & Settings */}
                <div className="form-section">
                    <h2>Availability & Settings</h2>
                    
                    <div className="form-group">
                        <label>Availability Slots *</label>
                        <div className="availability-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        {timeSlots.slice(0, 6).map(time => (
                                            <th key={time}>{time}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {daysOfWeek.map(day => (
                                        <tr key={day}>
                                            <td className="availability-day">{day}</td>
                                            {timeSlots.slice(0, 6).map(time => (
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