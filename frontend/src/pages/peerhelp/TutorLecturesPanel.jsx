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
}) => (
    <div className="dashboard-grid">
        <div className="dashboard-card">
            <div className="card-header">
                <h2>Create Lecture</h2>
            </div>
            <form className="lecture-form" onSubmit={handleCreateLecture}>
                <label className="lecture-label" htmlFor="subjectId">Subject</label>
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

                <label className="lecture-label" htmlFor="title">Lecture Title</label>
                <input
                    id="title"
                    type="text"
                    value={lectureForm.title}
                    onChange={(e) => handleLectureInput('title', e.target.value)}
                    placeholder="e.g. Introduction to Binary Trees"
                />
                {lectureErrors.title && <p className="form-error">{lectureErrors.title}</p>}

                <label className="lecture-label" htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={lectureForm.description}
                    onChange={(e) => handleLectureInput('description', e.target.value)}
                    placeholder="What students will learn in this lecture"
                    rows={4}
                />
                {lectureErrors.description && <p className="form-error">{lectureErrors.description}</p>}

                <label className="lecture-label" htmlFor="scheduledAt">Date & Time</label>
                <input
                    id="scheduledAt"
                    type="datetime-local"
                    value={lectureForm.scheduledAt}
                    onChange={(e) => handleLectureInput('scheduledAt', e.target.value)}
                />
                {lectureErrors.scheduledAt && <p className="form-error">{lectureErrors.scheduledAt}</p>}

                <label className="lecture-label" htmlFor="durationMinutes">Duration (minutes)</label>
                <input
                    id="durationMinutes"
                    type="number"
                    min="15"
                    max="240"
                    value={lectureForm.durationMinutes}
                    onChange={(e) => handleLectureInput('durationMinutes', e.target.value)}
                />
                {lectureErrors.durationMinutes && <p className="form-error">{lectureErrors.durationMinutes}</p>}

                <label className="lecture-label" htmlFor="meetingLink">Meeting Link (optional)</label>
                <input
                    id="meetingLink"
                    type="url"
                    value={lectureForm.meetingLink}
                    onChange={(e) => handleLectureInput('meetingLink', e.target.value)}
                    placeholder="https://..."
                />
                {lectureErrors.meetingLink && <p className="form-error">{lectureErrors.meetingLink}</p>}

                {lectureMessage && <p className="lecture-message">{lectureMessage}</p>}

                <button type="submit" className="btn-accept" disabled={lectureSubmitting}>
                    {lectureSubmitting ? 'Creating...' : 'Create Lecture'}
                </button>
            </form>
        </div>

        <div className="dashboard-card">
            <div className="card-header">
                <h2>My Lectures</h2>
                <button type="button" className="view-all" onClick={fetchPeerHelpData}>Refresh</button>
            </div>
            <div className="card-content">
                {myLectures.length === 0 && (
                    <p className="header-subtitle">You have not created any lectures yet.</p>
                )}
                {myLectures.map((lecture) => (
                    <div key={lecture.id} className="session-item">
                        <h3>{lecture.title}</h3>
                        <p><strong>Subject:</strong> {lecture.subjectName}</p>
                        <p>{lecture.description}</p>
                        <span className="session-time">📅 {lecture.scheduledAt} • {lecture.durationMinutes} mins</span>
                        {lecture.meetingLink && (
                            <p>
                                <a href={lecture.meetingLink} target="_blank" rel="noreferrer">Join meeting</a>
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default TutorLecturesPanel;
