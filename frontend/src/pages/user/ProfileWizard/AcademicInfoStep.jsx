import React from 'react';

const AcademicInfoStep = ({ data, updateData, errors }) => {
    const programs = [
        'Computer Science',
        'Software Engineering',
        'Information Technology',
        'Data Science',
        'Engineering',
        'Business',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Economics',
        'Other'
    ];
    
    const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate'];
    const semesters = ['Semester 1', 'Semester 2', 'Trimester 1', 'Trimester 2', 'Trimester 3'];

    return (
        <div className="step-content">
            <h2>Tell us about your studies</h2>
            
            <div className="form-group">
                <label>Degree Program *</label>
                <select
                    value={data.degreeProgram}
                    onChange={(e) => updateData({ degreeProgram: e.target.value })}
                    className={errors.degreeProgram ? 'error' : ''}
                >
                    <option value="">Select a program...</option>
                    {programs.map(program => (
                        <option key={program} value={program}>{program}</option>
                    ))}
                </select>
                {errors.degreeProgram && <span className="error-message">{errors.degreeProgram}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Current Year *</label>
                    <select
                        value={data.currentYear}
                        onChange={(e) => updateData({ currentYear: e.target.value })}
                        className={errors.currentYear ? 'error' : ''}
                    >
                        <option value="">Select year...</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    {errors.currentYear && <span className="error-message">{errors.currentYear}</span>}
                </div>

                <div className="form-group">
                    <label>Current Semester *</label>
                    <select
                        value={data.currentSemester}
                        onChange={(e) => updateData({ currentSemester: e.target.value })}
                        className={errors.currentSemester ? 'error' : ''}
                    >
                        <option value="">Select semester...</option>
                        {semesters.map(semester => (
                            <option key={semester} value={semester}>{semester}</option>
                        ))}
                    </select>
                    {errors.currentSemester && <span className="error-message">{errors.currentSemester}</span>}
                </div>
            </div>
        </div>
    );
};

export default AcademicInfoStep;