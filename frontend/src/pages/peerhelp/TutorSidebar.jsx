import React from 'react';

const TutorSidebar = ({ user, activeTab, setActiveTab, handleLogout }) => (
    <div className="sidebar">
        <div className="sidebar-logo">🧠 BrainHive</div>
        <div className="sidebar-user">
            <div className="user-avatar">
                {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="user-info">
                <h4>Dr. {user?.name || 'Sarah Mitchell'}</h4>
                <p>Tutor</p>
            </div>
        </div>
        <nav className="sidebar-nav">
            <div className="nav-section">
                <h3>Teaching & Schedule</h3>
                <ul>
                    <li className={activeTab === 'help-requests' ? 'active' : ''} onClick={() => setActiveTab('help-requests')}>
                        <span>🙋</span> Help Requests
                    </li>
                    <li className={activeTab === 'my-sessions' ? 'active' : ''} onClick={() => setActiveTab('my-sessions')}>
                        <span>📅</span> My Sessions
                    </li>
                    <li className={activeTab === 'availability' ? 'active' : ''} onClick={() => setActiveTab('availability')}>
                        <span>⏰</span> Availability
                    </li>
                    <li className={activeTab === 'lectures' ? 'active' : ''} onClick={() => setActiveTab('lectures')}>
                        <span>🎓</span> Lectures
                    </li>
                    <li className={activeTab === 'ratings' ? 'active' : ''} onClick={() => setActiveTab('ratings')}>
                        <span>⭐</span> Ratings & Feedback
                    </li>
                    <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                        <span>📊</span> Analytics
                    </li>
                </ul>
            </div>
            <div className="nav-section">
                <h3>Profile</h3>
                <ul>
                    <li>
                        <span>👤</span> My Profile
                    </li>
                    <li>
                        <span>⚙️</span> Settings
                    </li>
                    <li onClick={handleLogout} className="logout-item">
                        <span>🚪</span> Logout
                    </li>
                </ul>
            </div>
        </nav>
    </div>
);

export default TutorSidebar;
