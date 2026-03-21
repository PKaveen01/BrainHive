import React from 'react';

const PreferencesStep = ({ data, updateData, errors }) => {
    const studyStyles = [
        { value: 'Solo', label: 'Solo', description: 'I prefer studying alone' },
        { value: 'Group', label: 'Group', description: 'I prefer studying in groups' },
        { value: 'Both', label: 'Both', description: 'I enjoy both solo and group study' }
    ];
    
    const times = ['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 5 PM)', 'Evening (5 PM - 9 PM)', 'Night (9 PM - 6 AM)'];

    return (
        <div className="step-content">
            <h2>Study Preferences</h2>

            <div className="form-group">
                <label>Preferred Study Style *</label>
                <div className="study-style-options">
                    {studyStyles.map(style => (
                        <label key={style.value} className={`style-option ${data.studyStyle === style.value ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="studyStyle"
                                value={style.value}
                                checked={data.studyStyle === style.value}
                                onChange={(e) => updateData({ studyStyle: e.target.value })}
                            />
                            <div className="style-content">
                                <strong>{style.label}</strong>
                                <span>{style.description}</span>
                            </div>
                        </label>
                    ))}
                </div>
                {errors.studyStyle && <span className="error-message">{errors.studyStyle}</span>}
            </div>

            <div className="form-group">
                <label>Daily Study Availability (hours per day) *</label>
                <div className="availability-slider">
                    <input
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        value={data.availabilityHours}
                        onChange={(e) => updateData({ availabilityHours: parseInt(e.target.value) })}
                    />
                    <div className="availability-values">
                        <span>1 hr</span>
                        <span>8+ hrs</span>
                    </div>
                    <div className="selected-value">
                        {data.availabilityHours} hours/day
                    </div>
                </div>
                {errors.availabilityHours && <span className="error-message">{errors.availabilityHours}</span>}
            </div>

            <div className="form-group">
                <label>Preferred Time of Day *</label>
                <div className="time-options">
                    {times.map(time => (
                        <label key={time} className={`time-option ${data.preferredTime === time ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="preferredTime"
                                value={time}
                                checked={data.preferredTime === time}
                                onChange={(e) => updateData({ preferredTime: e.target.value })}
                            />
                            <span>{time}</span>
                        </label>
                    ))}
                </div>
                {errors.preferredTime && <span className="error-message">{errors.preferredTime}</span>}
            </div>
        </div>
    );
};

export default PreferencesStep;