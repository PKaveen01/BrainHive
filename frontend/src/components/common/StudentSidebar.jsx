import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import './StudentSidebar.css';
import logoImage from '../../assets/images/logo.png';

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
            <div className="sidebar-logo">
                <img src={logoImage} alt="BrainHive Logo" className="logo-icon-image" />
                <span className="logo-text">BrainHive</span>
            </div>

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
                {/* Dashboard */}
                <div className="nav-section">
                    <h3>Dashboard</h3>
                    <ul>
                        <li
                            className={isPath('/dashboard/student') && (!activeTab || activeTab === 'dashboard') ? 'active' : ''}
                            onClick={() => {
                                if (onTabChange) onTabChange('dashboard');
                                navigate('/dashboard/student');
                            }}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 10.5V17L12 21L19 17V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Dashboard</span>
                        </li>
                    </ul>
                </div>

                {/* Resources */}
                <div className="nav-section">
                    <h3>Resources</h3>
                    <ul>
                        <li
                            className={isPath('/resources/discovery') ? 'active' : ''}
                            onClick={() => navigate('/resources/discovery')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Discovery</span>
                        </li>
                        <li
                            className={isPath('/upload') ? 'active' : ''}
                            onClick={() => navigate('/upload')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3V15M12 15L9 12M12 15L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 17V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Upload</span>
                        </li>
                        <li
                            className={isPath('/resources/my-uploads') ? 'active' : ''}
                            onClick={() => navigate('/resources/my-uploads')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                <path d="M8 7H16M8 12H14M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>My Uploads</span>
                        </li>
                        <li
                            className={isPath('/resources/bookmarked') ? 'active' : ''}
                            onClick={() => navigate('/resources/bookmarked')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17L5 21V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Bookmarked</span>
                        </li>
                    </ul>
                </div>

                {/* Peer Help */}
                <div className="nav-section">
                    <h3>Peer Help</h3>
                    <ul>
                        <li
                            className={isPath('/request-help') ? 'active' : ''}
                            onClick={() => navigate('/request-help')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 18V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M19 18C19 15.2386 15.866 13 12 13C8.13401 13 5 15.2386 5 18" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                            <span>Request Help</span>
                        </li>
                        <li
                            className={isPath('/my-requests') ? 'active' : (activeTab === 'my-requests' ? 'active' : '')}
                            onClick={() => {
                                if (onTabChange) onTabChange('my-requests');
                                navigate('/my-requests');
                            }}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M9 3H15V7H9V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 11V15M14 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>My Requests</span>
                        </li>
                        <li
                            className={isPath('/find-tutors') ? 'active' : ''}
                            onClick={() => navigate('/find-tutors')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Find Tutors</span>
                        </li>
                        <li
                            className={activeTab === 'lectures' ? 'active' : ''}
                            onClick={() => {
                                if (onTabChange) onTabChange('lectures');
                                else navigate('/dashboard/student');
                            }}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 6V4M12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10M12 6C13.1046 6 14 6.89543 14 8C14 9.10457 13.1046 10 12 10M12 10V12M8 20H16M6 20H4V16L12 4L20 16V20H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Lectures</span>
                        </li>
                    </ul>
                </div>

                {/* Collaboration */}
                <div className="nav-section">
                    <h3>Collaboration</h3>
                    <ul>
                        <li
                            className={isPath('/collaboration/groups') ? 'active' : ''}
                            onClick={() => navigate('/collaboration/groups')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21V19C17 16.8 15.2 15 13 15H11C8.8 15 7 16.8 7 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M20 21V19C20 16.8 18.2 15 16 15M4 21V19C4 16.8 5.8 15 8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Study Groups</span>
                        </li>
                    </ul>
                </div>

                {/* Settings */}
                <div className="nav-section">
                    <h3>Settings</h3>
                    <ul>
                        <li
                            className={isPath('/profile') ? 'active' : ''}
                            onClick={() => navigate('/profile')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Profile</span>
                        </li>
                        <li className="logout-item" onClick={handleLogout}>
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 8L19 12M19 12L15 16M19 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 4H7C5.89543 4 5 4.89543 5 6V18C5 19.1046 5.89543 20 7 20H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default StudentSidebar;