import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import api from '../../services/api';
import './AdminLayout.css';

const AdminLayout = ({ children, pageTitle }) => {
    const [stats, setStats] = useState({
        pendingTutors: 0,
        pendingResources: 0,
        pendingReports: 0,
    });

    useEffect(() => {
        api.get('/admin/stats')
            .then(res => { if (res.data) setStats(prev => ({ ...prev, ...res.data })); })
            .catch(() => {});
    }, []);

    return (
        <div className="admin-shell">
            <AdminSidebar stats={stats} />
            <div className="admin-main">
                <div className="admin-header">
                    <h1>{pageTitle}</h1>
                    <div className="admin-date">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </div>
                </div>
                <div className="admin-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
