import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorSidebar from '../peerhelp/TutorSidebar';
import authService from '../../services/auth.service';
import './Dashboard.css';

/**
 * Shared layout for every tutor dashboard page.
 * Handles auth check and provides `user` via children render-prop.
 *
 * Usage:
 *   <TutorLayout title="Help Requests">
 *       {(user) => <YourContent user={user} />}
 *   </TutorLayout>
 */
const TutorLayout = ({ title, children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const stored = authService.getCurrentUser();
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        setReady(true);
    }, [navigate]);

    if (!ready) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <TutorSidebar user={user} />
            <div className="main-content">
                {title && (
                    <header className="dashboard-header">
                        <div>
                            <h1>{title}</h1>
                            <p className="header-subtitle">{user?.email}</p>
                        </div>
                    </header>
                )}
                {typeof children === 'function' ? children(user) : children}
            </div>
        </div>
    );
};

export default TutorLayout;
