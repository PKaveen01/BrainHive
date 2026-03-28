import React from 'react';

const ReviewStep = ({ data, subjects }) => {
    const getSubjectName = (id) => {
        const subject = subjects.find(s => s.id === id);
        return subject ? subject.name : '';
    };

    return (
        <div className="step-content review-step">
            <h2>Review your profile</h2>

            <div className="review-section">
                <div className="review-header">
                    <h3>Academic Info</h3>
                    <button className="edit-btn">Edit</button>
                </div>
                <div className="review-content">
                    <p><strong>Program:</strong> {data.degreeProgram}</p>
                    <p><strong>Year / Semester:</strong> {data.currentYear}, {data.currentSemester}</p>
                </div>
            </div>

            <div className="review-section">
                <div className="review-header">
                    <h3>Subjects & Strengths</h3>
                    <button className="edit-btn">Edit</button>
                </div>
                <div className="review-content">
                    <div className="subjects-list">
                        <p><strong>Following:</strong> {data.subjects.map(id => getSubjectName(id)).join(', ')}</p>
                        <p><strong>Strong in:</strong> {data.strongSubjects.map(id => getSubjectName(id)).join(', ') || 'None'}</p>
                        <p><strong>Need help with:</strong> {data.weakSubjects.map(id => getSubjectName(id)).join(', ') || 'None'}</p>
                    </div>
                </div>
            </div>

            <div className="review-section">
                <div className="review-header">
                    <h3>Study Preferences</h3>
                    <button className="edit-btn">Edit</button>
                </div>
                <div className="review-content">
                    <p><strong>Style:</strong> {data.studyStyle}</p>
                    <p><strong>Availability:</strong> {data.availabilityHours} hours/day ({data.preferredTime})</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;