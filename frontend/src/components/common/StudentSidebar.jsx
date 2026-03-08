import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import './StudentSidebar.css';

/**
 * Shared sidebar for all student pages.
 *
 * Props:
 *  - user          : current user object { name, email }
 *  - activeTab     : string – for dashboard-internal tabs ('dashboard','my-requests','lectures')
 *  - onTabChange   : fn(tab) – called when a dashboard-internal tab is selected
 *                    (only used on StudentDashboard; other pages can omit it)
 */
const StudentSidebar = ({ user, activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    // Decide if a nav-level path is "active" (for pages outside the dashboard)
    const isPath = (path) => location.pathname === path;

    // For dashboard internal tabs, fall back to path-based detection
    const tabActive = (tab) => activeTab === tab;
    const pathActive = (path) => isPath(path);

    return (
        <div className="sidebar">
            <div className="sidebar-logo">🧠 BrainHive</div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        'S'}
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
                            className={
                                (pathActive('/dashboard/student') && tabActive('dashboard') && !pathActive('/upload') && !pathActive('/resources/my-uploads') && !pathActive('/resources/bookmarked')) ? 'active' : ''
                            }
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
                            className={pathActive('/dashboard/student') && !tabActive('dashboard') ? 'active' : pathActive('/dashboard/student') && !onTabChange ? 'active' : ''}
                            onClick={() => {
                                navigate('/dashboard/student');
                            }}
                        >
                            <span>🔍</span> Discovery
                        </li>
                        <li
                            className={pathActive('/upload') ? 'active' : ''}
                            onClick={() => navigate('/upload')}
                        >
                            <span>📤</span> Upload
                        </li>
                        <li
                            className={pathActive('/resources/my-uploads') ? 'active' : ''}
                            onClick={() => navigate('/resources/my-uploads')}
                        >
                            <span>🗂️</span> My Uploads
                        </li>
                        <li
                            className={pathActive('/resources/bookmarked') ? 'active' : ''}
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
                            className={pathActive('/request-help') ? 'active' : ''}
                            onClick={() => navigate('/request-help')}
                        >
                            <span>🙋</span> Request Help
                        </li>
                        <li
                            className={onTabChange && tabActive('my-requests') ? 'active' : ''}
                            onClick={() => {
                                if (onTabChange) onTabChange('my-requests');
                                else navigate('/dashboard/student');
                            }}
                        >
                            <span>📋</span> My Requests
                        </li>
                        <li
                            className={pathActive('/find-tutors') ? 'active' : ''}
                            onClick={() => navigate('/find-tutors')}
                        >
                            <span>👨‍🏫</span> Find Tutors
                        </li>
                        <li
                            className={onTabChange && tabActive('lectures') ? 'active' : ''}
                            onClick={() => {
                                if (onTabChange) onTabChange('lectures');
                                else navigate('/dashboard/student');
                            }}
                        >
                            <span>🎓</span> Lectures
                        </li>
                    </ul>
                </div>

                {/* ── Study Groups ── */}
                <div className="nav-section">
                    <h3>👥 Study Groups</h3>
                    <ul>
                        <li
                            className={pathActive('/my-groups') ? 'active' : ''}
                            onClick={() => navigate('/my-groups')}
                        >
                            <span>📁</span> My Groups
                        </li>
                        <li
                            className={pathActive('/create-group') ? 'active' : ''}
                            onClick={() => navigate('/create-group')}
                        >
                            <span>✨</span> Create Group
                        </li>
                    </ul>
                </div>

                {/* ── Analytics ── */}
                <div className="nav-section">
                    <h3>📊 Analytics</h3>
                    <ul>
                        <li
                            className={pathActive('/progress') ? 'active' : ''}
                            onClick={() => navigate('/progress')}
                        >
                            <span>📈</span> Progress Reports
                        </li>
                        <li
                            className={pathActive('/insights') ? 'active' : ''}
                            onClick={() => navigate('/insights')}
                        >
                            <span>💡</span> Learning Insights
                        </li>
                    </ul>
                </div>

                {/* ── Settings ── */}
                <div className="nav-section">
                    <h3>⚙️ Settings</h3>
                    <ul>
                        <li
                            className={pathActive('/profile') ? 'active' : ''}
                            onClick={() => navigate('/profile')}
                        >
                            <span>👤</span> Profile
                        </li>
                        <li
                            className={pathActive('/schedule') ? 'active' : ''}
                            onClick={() => navigate('/schedule')}
                        >
                            <span>📅</span> Schedule
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
