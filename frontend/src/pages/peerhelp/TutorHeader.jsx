import React from 'react';

const TutorHeader = ({ user, dashboardData }) => (
    <header className="dashboard-header">
        <div>
            <h1>Welcome back, Dr. {user?.name || 'Mitchell'}!</h1>
            <p className="header-subtitle">
                {dashboardData?.user?.department || user?.email || 'Tutor Portal'}
            </p>
        </div>
        <div className="header-actions">
            <span className="status-badge online">Online & Available</span>
        </div>
    </header>
);

export default TutorHeader;
