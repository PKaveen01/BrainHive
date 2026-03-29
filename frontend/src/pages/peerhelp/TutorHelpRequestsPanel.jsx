import React from 'react';

const TutorHelpRequestsPanel = ({
    availableRequests,
    acceptMessage,
    fetchPeerHelpData,
    handleDecline,
    openAcceptForm,
    acceptingRequestId,
    submitAcceptForm,
    acceptForm,
    acceptErrors,
    handleAcceptInput,
    setAcceptingRequestId,
    acceptSubmitting,
    upcomingSessions,
    setActiveTab
}) => (
    <div className="dashboard-grid">
        <div className="dashboard-card">
            <div className="card-header">
                <h2>Pending Help Requests</h2>
                <button type="button" className="view-all" onClick={fetchPeerHelpData}>Refresh</button>
            </div>
            <div className="card-content">
                {availableRequests.length === 0 && (
                    <p className="header-subtitle">No live help requests found in database.</p>
                )}
                {acceptMessage && <p className="lecture-message">{acceptMessage}</p>}
                {availableRequests.map((request) => (
                    <div key={request.id} className="request-block">
                        <div className="request-item">
                            <div className="request-info">
                                <h3>{request.student}</h3>
                                <p>{request.subject}</p>
                                <span className="request-time">📅 {request.time}</span>
                            </div>
                            <div className="request-actions">
                                <button className="btn-decline" onClick={() => handleDecline(request.student)}>
                                    Decline
                                </button>
                                <button className="btn-accept" onClick={() => openAcceptForm(request.id)}>
                                    Accept
                                </button>
                            </div>
                        </div>

                        {acceptingRequestId === request.id && (
                            <form
                                className="accept-request-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    submitAcceptForm(request);
                                }}
                            >
                                <label className="lecture-label" htmlFor={`start-${request.id}`}>Session Start</label>
                                <input
                                    id={`start-${request.id}`}
                                    type="datetime-local"
                                    value={acceptForm.scheduledStartTime}
                                    onChange={(e) => handleAcceptInput('scheduledStartTime', e.target.value)}
                                />
                                {acceptErrors.scheduledStartTime && <p className="form-error">{acceptErrors.scheduledStartTime}</p>}

                                <label className="lecture-label" htmlFor={`end-${request.id}`}>Session End</label>
                                <input
                                    id={`end-${request.id}`}
                                    type="datetime-local"
                                    value={acceptForm.scheduledEndTime}
                                    onChange={(e) => handleAcceptInput('scheduledEndTime', e.target.value)}
                                />
                                {acceptErrors.scheduledEndTime && <p className="form-error">{acceptErrors.scheduledEndTime}</p>}

                                <label className="lecture-label" htmlFor={`link-${request.id}`}>Meeting Link (optional)</label>
                                <input
                                    id={`link-${request.id}`}
                                    type="url"
                                    value={acceptForm.meetingLink}
                                    onChange={(e) => handleAcceptInput('meetingLink', e.target.value)}
                                    placeholder="https://..."
                                />

                                <label className="lecture-label" htmlFor={`notes-${request.id}`}>Notes (optional)</label>
                                <textarea
                                    id={`notes-${request.id}`}
                                    rows={3}
                                    value={acceptForm.notes}
                                    onChange={(e) => handleAcceptInput('notes', e.target.value)}
                                />

                                <div className="request-actions">
                                    <button
                                        type="button"
                                        className="btn-decline"
                                        onClick={() => setAcceptingRequestId(null)}
                                        disabled={acceptSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-accept" disabled={acceptSubmitting}>
                                        {acceptSubmitting ? 'Scheduling...' : 'Confirm Accept'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="dashboard-card">
            <div className="card-header">
                <h2>Upcoming Sessions</h2>
                <button type="button" className="view-all" onClick={() => setActiveTab('my-sessions')}>View schedule →</button>
            </div>
            <div className="card-content">
                {upcomingSessions.length === 0 && (
                    <p className="header-subtitle">No live upcoming sessions found in database.</p>
                )}
                {upcomingSessions.map((session) => (
                    <div key={session.id} className="session-item">
                        <h3>{session.title}</h3>
                        <p>With: {session.student}</p>
                        <span className="session-time">📅 {session.time}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default TutorHelpRequestsPanel;
