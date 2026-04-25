import React from 'react';

const TutorStatsCards = ({ upcomingSessionsCount, availableRequestsCount, myLecturesCount }) => (
    <div className="stats-grid">
        <div className="stat-card">
            <h3>{upcomingSessionsCount}</h3>
            <p>Upcoming Sessions</p>
        </div>
        <div className="stat-card">
            <h3>{availableRequestsCount}</h3>
            <p>Open Requests</p>
        </div>
        <div className="stat-card">
            <h3>{myLecturesCount}</h3>
            <p>My Lectures</p>
        </div>
    </div>
);




export default TutorStatsCards;
