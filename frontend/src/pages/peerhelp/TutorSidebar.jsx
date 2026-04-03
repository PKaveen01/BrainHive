import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { path: '/dashboard/tutor',            icon: '🏠', label: 'Overview'          },
    { path: '/dashboard/tutor/requests',   icon: '🙋', label: 'Help Requests'     },
    { path: '/dashboard/tutor/sessions',   icon: '📅', label: 'My Sessions'       },
    { path: '/dashboard/tutor/availability',icon: '⏰', label: 'Availability'      },
    { path: '/dashboard/tutor/lectures',   icon: '🎓', label: 'Lectures'          },
    { path: '/dashboard/tutor/ratings',    icon: '⭐', label: 'Ratings & Feedback'},
    { path: '/dashboard/tutor/analytics',  icon: '📊', label: 'Analytics'         },
];

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
            <div className="sidebar-logo">🧠 BrainHive</div>

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
                <div className="nav-section">
                    <h3>Teaching & Schedule</h3>
                    <ul>
                        {NAV_ITEMS.map(({ path, icon, label }) => (
                            <li
                                key={path}
                                className={isActive(path) ? 'active' : ''}
                                onClick={() => navigate(path)}
                            >
                                <span>{icon}</span> {label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>⚙️ Settings</h3>
                    <ul>
                        <li
                            className={
                                location.pathname === '/tutor/profile' ||
                                location.pathname === '/tutor/profile/edit'
                                    ? 'active' : ''
                            }
                            onClick={() => navigate('/tutor/profile')}
                        >
                            <span>👤</span> My Profile
                        </li>
                        <li onClick={handleLogout} className="logout-item">
                            <span>🚪</span> Logout
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default TutorSidebar;
