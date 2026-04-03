import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import './AdminSidebar.css';

const NAV_ITEMS = [
    { path: '/admin/overview',          icon: '📊', label: 'Overview' },
    { path: '/admin/users',             icon: '👥', label: 'User Management' },
    { path: '/admin/tutors',            icon: '👨‍🏫', label: 'Tutor Approvals',   badgeKey: 'pendingTutors' },
    { path: '/admin/resources/pending', icon: '⏳', label: 'Pending Resources', badgeKey: 'pendingResources' },
    { path: '/admin/resources/active',  icon: '📚', label: 'Active Resources' },
    { path: '/admin/resources/reported',icon: '🚩', label: 'Reported Content',  badgeKey: 'pendingReports' },
    { path: '/admin/groups',            icon: '👥', label: 'Group Management' },
    { path: '/admin/analytics',         icon: '📈', label: 'Analytics' },
];

const AdminSidebar = ({ stats = {} }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">🧠 BrainHive Admin</div>

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
                            const isActive = location.pathname === path ||
                                (path !== '/admin/overview' && location.pathname.startsWith(path));
                            return (
                                <li
                                    key={path}
                                    className={isActive ? 'active' : ''}
                                    onClick={() => navigate(path)}
                                >
                                    <span className="nav-icon">{icon}</span>
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
                        <li onClick={() => navigate('/admin/settings')}>
                            <span className="nav-icon">⚙️</span>
                            <span className="nav-label">System Settings</span>
                        </li>
                        <li className="logout-item" onClick={handleLogout}>
                            <span className="nav-icon">🚪</span>
                            <span className="nav-label">Logout</span>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
