import React, { useState } from 'react';

const SubjectsStep = ({ data, updateData, subjects, errors }) => {
    const [activeTab, setActiveTab] = useState('subjects');

    const handleSubjectToggle = (subjectId) => {
        const currentSubjects = [...data.subjects];
        const index = currentSubjects.indexOf(subjectId);
        
        if (index === -1) {
            currentSubjects.push(subjectId);
        } else {
            currentSubjects.splice(index, 1);
            // Also remove from strong/weak if subject is removed
            const newStrong = data.strongSubjects.filter(id => id !== subjectId);
            const newWeak = data.weakSubjects.filter(id => id !== subjectId);
            updateData({ 
                subjects: currentSubjects,
                strongSubjects: newStrong,
                weakSubjects: newWeak
            });
            return;
        }
        
        updateData({ subjects: currentSubjects });
    };

    const handleStrengthToggle = (subjectId, type) => {
        if (type === 'strong') {
            // Remove from weak if present
            const newWeak = data.weakSubjects.filter(id => id !== subjectId);
            const newStrong = [...data.strongSubjects];
            const strongIndex = newStrong.indexOf(subjectId);
            
            if (strongIndex === -1) {
                newStrong.push(subjectId);
            } else {
                newStrong.splice(strongIndex, 1);
            }
            
            updateData({ 
                strongSubjects: newStrong,
                weakSubjects: newWeak
            });
        } else {
            // Remove from strong if present
            const newStrong = data.strongSubjects.filter(id => id !== subjectId);
            const newWeak = [...data.weakSubjects];
            const weakIndex = newWeak.indexOf(subjectId);
            
            if (weakIndex === -1) {
                newWeak.push(subjectId);
            } else {
                newWeak.splice(weakIndex, 1);
            }
            
            updateData({ 
                strongSubjects: newStrong,
                weakSubjects: newWeak
            });
        }
    };

    const getSubjectName = (id) => {
        const subject = subjects.find(s => s.id === id);
        return subject ? subject.name : '';
    };

    return (
        <div className="step-content">
            <h2>Current Subjects</h2>
            <p>Select the subjects you are currently taking and rate your confidence level.</p>

            <div className="subjects-tabs">
                <button 
                    className={activeTab === 'subjects' ? 'active' : ''}
                    onClick={() => setActiveTab('subjects')}
                >
                    Select Subjects
                </button>
                <button 
                    className={activeTab === 'strength' ? 'active' : ''}
                    onClick={() => setActiveTab('strength')}
                    disabled={data.subjects.length === 0}
                >
                    Assess Your Strength
                </button>
            </div>

            {activeTab === 'subjects' && (
                <div className="subjects-selection">
                    <div className="subjects-grid">
                        {subjects.map(subject => (
                            <label key={subject.id} className="subject-checkbox">
                                <input
                                    type="checkbox"
                                    checked={data.subjects.includes(subject.id)}
                                    onChange={() => handleSubjectToggle(subject.id)}
                                />
                                <span>{subject.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.subjects && <span className="error-message">{errors.subjects}</span>}
                </div>
            )}

            {activeTab === 'strength' && (
                <div className="strength-assessment">
                    <p>For each subject, rate your confidence level:</p>
                    {data.subjects.map(subjectId => {
                        const subjectName = getSubjectName(subjectId);
                        const isStrong = data.strongSubjects.includes(subjectId);
                        const isWeak = data.weakSubjects.includes(subjectId);
                        
                        return (
                            <div key={subjectId} className="strength-item">
                                <div className="strength-subject">{subjectName}</div>
                                <div className="strength-options">
                                    <label className={isWeak ? 'selected weak' : ''}>
                                        <input
                                            type="radio"
                                            name={`strength-${subjectId}`}
                                            checked={isWeak}
                                            onChange={() => handleStrengthToggle(subjectId, 'weak')}
                                        />
                                        <span>Weak</span>
                                    </label>
                                    <label className={!isStrong && !isWeak ? 'selected average' : ''}>
                                        <input
                                            type="radio"
                                            name={`strength-${subjectId}`}
                                            checked={!isStrong && !isWeak}
                                            onChange={() => {
                                                updateData({
                                                    strongSubjects: data.strongSubjects.filter(id => id !== subjectId),
                                                    weakSubjects: data.weakSubjects.filter(id => id !== subjectId)
                                                });
                                            }}
                                        />
                                        <span>Average</span>
                                    </label>
                                    <label className={isStrong ? 'selected strong' : ''}>
                                        <input
                                            type="radio"
                                            name={`strength-${subjectId}`}
                                            checked={isStrong}
                                            onChange={() => handleStrengthToggle(subjectId, 'strong')}
                                        />
                                        <span>Strong</span>
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubjectsStep;