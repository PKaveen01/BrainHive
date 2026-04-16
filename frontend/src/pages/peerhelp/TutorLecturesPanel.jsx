import React from 'react';

const TutorLecturesPanel = ({
    lectureSubjects,
    lectureForm,
    handleLectureInput,
    lectureErrors,
    lectureMessage,
    handleCreateLecture,
    lectureSubmitting,
    myLectures,
    fetchPeerHelpData
}) => {
    const formatLectureDateTime = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-grid lecture-layout-grid">
            <div className="dashboard-card lecture-create-card">
                <div className="card-header">
                    <h2>Create New Lecture</h2>
                </div>
                <form className="lecture-form lecture-form-updated" onSubmit={handleCreateLecture}>
                    <div className="lecture-field">
                        <label className="lecture-label" htmlFor="subjectId">Subject *</label>
                        <select
                            id="subjectId"
                            value={lectureForm.subjectId}
                            onChange={(e) => handleLectureInput('subjectId', e.target.value)}
                        >
                            <option value="">Select subject</option>
                            {lectureSubjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                        {lectureErrors.subjectId && <p className="form-error">{lectureErrors.subjectId}</p>}
                    </div>

                    <div className="lecture-field">
                        <label className="lecture-label" htmlFor="title">Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={lectureForm.title}
                            onChange={(e) => handleLectureInput('title', e.target.value)}
                            placeholder="e.g. Introduction to Binary Trees"
                        />
                        {lectureErrors.title && <p className="form-error">{lectureErrors.title}</p>}
                    </div>

                    <div className="lecture-field">
                        <label className="lecture-label" htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            value={lectureForm.description}
                            onChange={(e) => handleLectureInput('description', e.target.value)}
                            placeholder="What students will learn in this lecture"
                            rows={4}
                        />
                        {lectureErrors.description && <p className="form-error">{lectureErrors.description}</p>}
                    </div>

                    <div className="lecture-field">
                        <label className="lecture-label" htmlFor="scheduledAt">Date & Time *</label>
                        <input
                            id="scheduledAt"
                            type="datetime-local"
                            value={lectureForm.scheduledAt}
                            onChange={(e) => handleLectureInput('scheduledAt', e.target.value)}
                        />
                        {lectureErrors.scheduledAt && <p className="form-error">{lectureErrors.scheduledAt}</p>}
                    </div>

                    <div className="lecture-field">
                        <label className="lecture-label" htmlFor="durationMinutes">Duration (minutes) *</label>
                        <input
                            id="durationMinutes"
                            type="number"
                            min="15"
                            max="240"
                            value={lectureForm.durationMinutes}
                            onChange={(e) => handleLectureInput('durationMinutes', e.target.value)}
                        />
                        {lectureErrors.durationMinutes && <p className="form-error">{lectureErrors.durationMinutes}</p>}
                    </div>

                    <div className="lecture-field">
                        <label className="lecture-label" htmlFor="meetingLink">Meeting Link (optional)</label>
                        <input
                            id="meetingLink"
                            type="url"
                            value={lectureForm.meetingLink}
                            onChange={(e) => handleLectureInput('meetingLink', e.target.value)}
                            placeholder="https://meet.google.com/..."
                        />
                        {lectureErrors.meetingLink && <p className="form-error">{lectureErrors.meetingLink}</p>}
                    </div>

                    {lectureMessage && <p className="lecture-message">{lectureMessage}</p>}

                    <button type="submit" className="btn-accept lecture-submit-btn" disabled={lectureSubmitting}>
                        {lectureSubmitting ? 'Creating...' : '+ Create Lecture'}
                    </button>
                </form>
            </div>

            <div className="dashboard-card lecture-list-card">
                <div className="card-header">
                    <h2>All Lectures ({myLectures.length})</h2>
                    <button type="button" className="view-all" onClick={fetchPeerHelpData}>Refresh</button>
                </div>
                <div className="card-content lecture-list-content">
                    {myLectures.length === 0 && (
                        <p className="header-subtitle">No lectures available yet.</p>
                    )}
                    {myLectures.map((lecture) => (
                        <article key={lecture.id} className="session-item lecture-item-updated">
                            <div className="lecture-item-top">
                                <h3>{lecture.title}</h3>
                                <span className="lecture-subject-chip">{lecture.subjectName || 'General'}</span>
                            </div>
                            <p className="lecture-description-text">{lecture.description || 'No description provided.'}</p>
                            <div className="lecture-meta-row">
                                <span className="session-time">{formatLectureDateTime(lecture.scheduledAt)}</span>
                                <span className="lecture-duration-chip">{lecture.durationMinutes} min</span>
                            </div>
                            {lecture.meetingLink && (
                                <a href={lecture.meetingLink} target="_blank" rel="noreferrer" className="join-link">
                                    Join meeting
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TutorLecturesPanel;
