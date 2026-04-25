import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TutorSidebar.css';
import logoImage from '../../assets/images/logo.png';

const TutorSidebar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            const { default: authService } = await import('../../services/auth.service');
            await authService.logout();
        } catch (_) {
            localStorage.removeItem('user');
        }
        navigate('/');
    };





    const isActive = (path) => {
        if (path === '/dashboard/tutor') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const displayName = user?.name || user?.email?.split('@')[0] || 'Tutor';

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={logoImage} alt="BrainHive Logo" className="logo-icon-image" />
                <span className="logo-text">BrainHive</span>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                    <h4>{displayName}</h4>
                    <p>Tutor</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {/* Teaching & Schedule */}
                <div className="nav-section">
                    <h3>Teaching &amp; Schedule</h3>
                    <ul>
                        <li
                            className={location.pathname === '/dashboard/tutor' ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 10.5V17L12 21L19 17V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Overview</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/requests') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/requests')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M5 18V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M19 18C19 15.2386 15.866 13 12 13C8.13401 13 5 15.2386 5 18" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <span>Help Requests</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/sessions') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/sessions')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 13H16M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>My Sessions</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/availability') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/availability')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Availability</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/lectures') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/lectures')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3L2 8L12 13L22 8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 11V17C6 17 8 20 12 20C16 20 18 17 18 17V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 8V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Lectures</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/ratings') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/ratings')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L14.85 8.3L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.15 8.3L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Ratings &amp; Feedback</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/analytics') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/analytics')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 20V14M8 20V10M12 20V4M16 20V10M20 20V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Analytics</span>
                        </li>
                    </ul>
                </div>

                {/* Resources */}
                <div className="nav-section">
                    <h3>Resources</h3>
                    <ul>
                        <li
                            className={isActive('/dashboard/tutor/resources/discovery') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/resources/discovery')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Discover Resources</span>
                        </li>
                        <li
                            className={isActive('/dashboard/tutor/resources/bookmarked') ? 'active' : ''}
                            onClick={() => navigate('/dashboard/tutor/resources/bookmarked')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17L5 21V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Bookmarked</span>
                        </li>
                        <li
                            className={isActive('/upload') ? 'active' : ''}
                            onClick={() => navigate('/upload')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3V15M12 15L9 12M12 15L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 17V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Upload Resource</span>
                        </li>
                        <li
                            className={isActive('/resources/my-uploads') ? 'active' : ''}
                            onClick={() => navigate('/resources/my-uploads')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M8 7H16M8 12H14M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>My Uploads</span>
                        </li>
                    </ul>
                </div>

                {/* Settings */}
                <div className="nav-section">
                    <h3>Settings</h3>
                    <ul>
                        <li
                            className={
                                location.pathname === '/tutor/profile' ||
                                    location.pathname === '/tutor/profile/edit'
                                    ? 'active' : ''
                            }
                            onClick={() => navigate('/tutor/profile')}
                        >
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>My Profile</span>
                        </li>
                        <li className="logout-item" onClick={handleLogout}>
                            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 8L19 12M19 12L15 16M19 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 4H7C5.89543 4 5 4.89543 5 6V18C5 19.1046 5.89543 20 7 20H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default TutorSidebar;
