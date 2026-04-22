import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM',
               '3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];

const TutorAvailabilityPage = () => {
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]); // from TutorProfile
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSlots = useCallback(async () => {
        try {
            setError('');
            const res = await api.get('/dashboard/tutor/profile');
            setSlots(res.data?.availabilitySlots || []);
        } catch (err) {
            if (err?.response?.status === 401) { navigate('/login'); return; }
            setError('Failed to load availability. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchSlots(); }, [fetchSlots]);

    const toggle = (day, time) => {
        const slot = `${day} ${time}`;
        setSlots(prev =>
            prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
        );
        setSuccess('');
    };

    const selectAll = (day) => {
        const daySlots = TIMES.map(t => `${day} ${t}`);
        const allSelected = daySlots.every(s => slots.includes(s));
        setSlots(prev =>
            allSelected
                ? prev.filter(s => !daySlots.includes(s))
                : [...new Set([...prev, ...daySlots])]
        );
        setSuccess('');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await api.put('/dashboard/tutor/profile', { availabilitySlots: slots });
            setSuccess('✅ Availability saved successfully!');
        } catch (err) {
            if (err?.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to save availability.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <TutorLayout title="⏰ Availability">
            {error && <div className="profile-alert profile-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
            {success && <div className="profile-alert profile-alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

            <div className="dashboard-card">
                <div className="card-header">
                    <h2>Weekly Schedule</h2>
                    <span className="header-subtitle" style={{ fontSize: '0.9rem' }}>
                        {slots.length} slot{slots.length !== 1 ? 's' : ''} selected
                    </span>
                </div>

                {loading ? (
                    <p className="header-subtitle" style={{ padding: '1rem' }}>Loading availability...</p>
                ) : (
                    <div style={{ overflowX: 'auto', padding: '0.5rem 0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Day</th>
                                    {TIMES.map(t => (
                                        <th key={t} style={{ ...thStyle, fontSize: '0.75rem', padding: '8px 4px' }}>{t}</th>
                                    ))}
                                    <th style={thStyle}>All</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map(day => {
                                    const daySlots = TIMES.map(t => `${day} ${t}`);
                                    const allSelected = daySlots.every(s => slots.includes(s));
                                    return (
                                        <tr key={day} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{day}</td>
                                            {TIMES.map(time => {
                                                const slot = `${day} ${time}`;
                                                const checked = slots.includes(slot);
                                                return (
                                                    <td key={slot} style={{ textAlign: 'center', padding: '6px 4px' }}>
                                                        <div
                                                            onClick={() => toggle(day, time)}
                                                            style={{
                                                                width: '28px', height: '28px',
                                                                borderRadius: '6px',
                                                                background: checked ? '#2563eb' : '#f1f5f9',
                                                                border: `2px solid ${checked ? '#2563eb' : '#e2e8f0'}`,
                                                                cursor: 'pointer',
                                                                margin: '0 auto',
                                                                transition: 'all 0.15s',
                                                            }}
                                                        />
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={() => selectAll(day)}
                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="btn-cancel" onClick={fetchSlots} disabled={loading || saving}>Reset</button>
                    <button className="btn-save" onClick={handleSave} disabled={loading || saving}>
                        {saving ? 'Saving...' : 'Save Availability'}
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', padding: '0.75rem 1rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#2563eb' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#f1f5f9', border: '2px solid #e2e8f0' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Unavailable</span>
                </div>
            </div>
        </TutorLayout>
    );
};

const thStyle = {
    background: '#f8fafc',
    padding: '10px 8px',
    textAlign: 'center',
    fontWeight: 600,
    color: '#64748b',
    fontSize: '0.8rem',
    borderBottom: '2px solid #e2e8f0',
};

export default TutorAvailabilityPage;
