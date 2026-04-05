import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import './StudentSidebar.css';

const StudentSidebar = ({ user, activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    const isPath = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div className="sidebar-logo">🧠 BrainHive</div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div className="user-info">
                    <h4>{user?.name || user?.email?.split('@')[0] || 'Student'}</h4>
                    <p>Student</p>
                </div>
            </div>

            <nav className="sidebar-nav">

                {/* ── Dashboard ── */}
                <div className="nav-section">
                    <h3>🏠 Dashboard</h3>
                    <ul>
                        <li
                            className={isPath('/dashboard/student') && (!activeTab || activeTab === 'dashboard') ? 'active' : ''}
                            onClick={() => {
                                if (onTabChange) onTabChange('dashboard');
                                navigate('/dashboard/student');
                            }}
                        >
                            <span>📊</span> Dashboard
                        </li>
                    </ul>
                </div>

                {/* ── Resources ── */}
                <div className="nav-section">
                    <h3>📚 Resources</h3>
                    <ul>
                        <li
                            className={isPath('/resources/discovery') ? 'active' : ''}
                            onClick={() => navigate('/resources/discovery')}
                        >
                            <span>🔍</span> Discovery
                        </li>
                        <li
                            className={isPath('/upload') ? 'active' : ''}
                            onClick={() => navigate('/upload')}
                        >
                            <span>📤</span> Upload
                        </li>
                        <li
                            className={isPath('/resources/my-uploads') ? 'active' : ''}
                            onClick={() => navigate('/resources/my-uploads')}
                        >
                            <span>🗂️</span> My Uploads
                        </li>
                        <li
                            className={isPath('/resources/bookmarked') ? 'active' : ''}
                            onClick={() => navigate('/resources/bookmarked')}
                        >
                            <span>🔖</span> Bookmarked
                        </li>
                    </ul>
                </div>

                {/* ── Peer Help ── */}
                <div className="nav-section">
                    <h3>🤝 Peer Help</h3>
                    <ul>
                        <li
                            className={isPath('/request-help') ? 'active' : ''}
                            onClick={() => navigate('/request-help')}
                        >
                            <span>🙋</span> Request Help
                        </li>
                        <li
                            className={isPath('/my-requests') ? 'active' : (activeTab === 'my-requests' ? 'active' : '')}
                            onClick={() => {
                                if (onTabChange) onTabChange('my-requests');
                                navigate('/my-requests');
                            }}
                        >
                            <span>📋</span> My Requests
                        </li>
                        <li
                            className={isPath('/find-tutors') ? 'active' : ''}
                            onClick={() => navigate('/find-tutors')}
                        >
                            <span>👨‍🏫</span> Find Tutors
                        </li>
                        <li
                            className={activeTab === 'lectures' ? 'active' : ''}
                            onClick={() => {
                                if (onTabChange) onTabChange('lectures');
                                else navigate('/dashboard/student', { state: { activeTab: 'lectures' } });
                            }}
                        >
                            <span>🎓</span> Lectures
                        </li>
                    </ul>
                </div>

                {/* ── Collaboration ── */}
                <div className="nav-section">
                    <h3>👥 Collaboration</h3>
                    <ul>
                        <li
                            className={isPath('/collaboration/groups') ? 'active' : ''}
                            onClick={() => navigate('/collaboration/groups')}
                        >
                            <span>🏠</span> Study Groups
                        </li>
                    </ul>
                </div>

                {/* ── Settings ── */}
                <div className="nav-section">
                    <h3>⚙️ Settings</h3>
                    <ul>
                        <li
                            className={isPath('/profile') ? 'active' : ''}
                            onClick={() => navigate('/profile')}
                        >
                            <span>👤</span> Profile
                        </li>
                        <li className="logout-item" onClick={handleLogout}>
                            <span>🚪</span> Logout
                        </li>
                    </ul>
                </div>

            </nav>
        </div>
    );
};

export default StudentSidebar;
