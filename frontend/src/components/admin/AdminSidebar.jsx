import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import './AdminSidebar.css';
import logoImage from '../../assets/images/logo.png';

const NAV_ITEMS = [
    { path: '/admin/overview', icon: 'overview', label: 'Overview' },
    { path: '/admin/users', icon: 'users', label: 'User Management' },
    { path: '/admin/tutors', icon: 'tutors', label: 'Tutor Approvals', badgeKey: 'pendingTutors' },
    { path: '/admin/resources/pending', icon: 'pending', label: 'Pending Resources', badgeKey: 'pendingResources' },
    { path: '/admin/resources/active', icon: 'resources', label: 'Active Resources' },
    { path: '/admin/resources/reported', icon: 'reported', label: 'Reported Content', badgeKey: 'pendingReports' },
    { path: '/admin/groups', icon: 'groups', label: 'Group Management' },
    { path: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
];

const renderIcon = (icon) => {
    switch (icon) {
        case 'overview':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13H9V21H3V13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M15 3H21V21H15V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M9 8H15V21H9V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            );
        case 'users':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 19C4 16.7909 6.23858 15 9 15C11.7614 15 14 16.7909 14 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M15.5 19C15.5 17.3431 16.8431 16 18.5 16C20.1569 16 21.5 17.3431 21.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        case 'tutors':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L12 4L21 8L12 12L3 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M7 10.5V14.5C7 16.433 9.23858 18 12 18C14.7614 18 17 16.433 17 14.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M21 8V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        case 'pending':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'resources':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 19.3284 4 18.5V5.5Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        case 'reported':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 21V5C5 4.44772 5.44772 4 6 4H17L15 8L17 12H6C5.44772 12 5 12.4477 5 13V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'groups':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3.5 19C3.5 16.7909 5.51472 15 8 15C10.4853 15 12.5 16.7909 12.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M11.5 19C11.5 16.7909 13.5147 15 16 15C18.4853 15 20.5 16.7909 20.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        case 'analytics':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 16V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 16V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M17 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        case 'settings':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.79 16.88A2 2 0 1 1 16.96 19.71L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.85V21A2 2 0 1 1 10 21V20.91A1.65 1.65 0 0 0 8.91 19.39A1.65 1.65 0 0 0 7.09 19.72L7.03 19.78A2 2 0 1 1 4.2 16.95L4.26 16.89A1.65 1.65 0 0 0 4.59 15.07A1.65 1.65 0 0 0 3.06 14H3A2 2 0 1 1 3 10H3.09A1.65 1.65 0 0 0 4.61 8.91A1.65 1.65 0 0 0 4.28 7.09L4.22 7.03A2 2 0 1 1 7.05 4.2L7.11 4.26A1.65 1.65 0 0 0 8.93 4.59H9A1.65 1.65 0 0 0 10 3.06V3A2 2 0 1 1 14 3V3.09A1.65 1.65 0 0 0 15.09 4.61A1.65 1.65 0 0 0 16.91 4.28L16.97 4.22A2 2 0 1 1 19.8 7.05L19.74 7.11A1.65 1.65 0 0 0 19.41 8.93V9A1.65 1.65 0 0 0 20.94 10H21A2 2 0 1 1 21 14H20.91A1.65 1.65 0 0 0 19.39 15.09Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'logout':
            return (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8L19 12M19 12L15 16M19 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 4H7C5.89543 4 5 4.89543 5 6V18C5 19.1046 5.89543 20 7 20H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        default:
            return null;
    }
};

const AdminSidebar = ({ stats = {} }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <img src={logoImage} alt="BrainHive Logo" className="logo-icon-image" />
                <span className="logo-text">BrainHive Admin</span>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">A</div>
                <div className="user-info">
                    <h4>Admin User</h4>
                    <p>System Administrator</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <h3>Dashboard</h3>
                    <ul>
                        {NAV_ITEMS.map(({ path, icon, label, badgeKey }) => {
                            const badge = badgeKey ? (stats[badgeKey] ?? 0) : 0;
                            const isActive =
                                location.pathname === path ||
                                (path !== '/admin/overview' && location.pathname.startsWith(path));

                            return (
                                <li
                                    key={path}
                                    className={isActive ? 'active' : ''}
                                    onClick={() => navigate(path)}
                                >
                                    {renderIcon(icon)}
                                    <span className="nav-label">{label}</span>
                                    {badge > 0 && <span className="nav-badge">{badge}</span>}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>Settings</h3>
                    <ul>
                        <li
                            className={location.pathname === '/admin/settings' ? 'active' : ''}
                            onClick={() => navigate('/admin/settings')}
                        >
                            {renderIcon('settings')}
                            <span className="nav-label">System Settings</span>
                        </li>
                        <li className="logout-item" onClick={handleLogout}>
                            {renderIcon('logout')}
                            <span className="nav-label">Logout</span>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default AdminSidebar;