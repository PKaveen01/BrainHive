import React from 'react';

const TutorSidebar = ({ user, activeTab, setActiveTab, handleLogout }) => (
    <div className="sidebar">
        <div className="sidebar-logo">BrainHive</div>

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
                        Help Requests
                    </li>
                    <li className={activeTab === 'my-sessions' ? 'active' : ''} onClick={() => setActiveTab('my-sessions')}>
                        My Sessions
                    </li>
                    <li className={activeTab === 'availability' ? 'active' : ''} onClick={() => setActiveTab('availability')}>
                        Availability
                    </li>
                    <li className={activeTab === 'lectures' ? 'active' : ''} onClick={() => setActiveTab('lectures')}>
                        Lectures
                    </li>
                    <li className={activeTab === 'ratings' ? 'active' : ''} onClick={() => setActiveTab('ratings')}>
                        Ratings & Feedback
                    </li>
                </ul>
            </div>

            <div className="nav-section">
                <h3>Profile</h3>
                <ul>
                    <li>My Profile</li>
                    <li>Settings</li>
                    <li onClick={handleLogout} style={{ cursor: 'pointer', color: '#e53e3e' }}>
                        Logout
                    </li>
                </ul>
            </div>
        </nav>
    </div>
);

export default TutorSidebar;
