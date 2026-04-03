import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TutorLayout from './TutorLayout';

const StarRow = ({ label, score }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
        <span style={{ width: '130px', fontSize: '0.9rem', color: '#64748b', flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${(score / 5) * 100}%`, background: '#f59e0b', height: '100%', borderRadius: '999px', transition: 'width 0.5s' }} />
        </div>
        <span style={{ width: '36px', textAlign: 'right', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{score.toFixed(1)}</span>
    </div>
);

const TutorRatingsPage = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetch = useCallback(async () => {
        try {
            setError('');
            const res = await api.get('/dashboard/tutor/profile');
            setProfileData(res.data);
        } catch (err) {
            if (err?.response?.status === 401) { navigate('/login'); return; }
            setError('Failed to load rating data.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetch(); }, [fetch]);

    const avg = profileData?.averageRating ?? 0;
    const total = profileData?.totalSessions ?? 0;
    const score = profileData?.credibilityScore ?? 0;

    // Placeholder breakdown until a ratings API endpoint is available
    const breakdown = [
        { label: 'Knowledge',     score: Math.min(5, avg * 1.02) },
        { label: 'Communication', score: Math.min(5, avg * 0.99) },
        { label: 'Punctuality',   score: Math.min(5, avg * 1.01) },
        { label: 'Helpfulness',   score: Math.min(5, avg * 1.00) },
        { label: 'Clarity',       score: Math.min(5, avg * 0.98) },
    ];

    const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

    return (
        <TutorLayout title="⭐ Ratings & Feedback">
            {error && <div className="profile-alert profile-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

            {loading ? (
                <p className="header-subtitle">Loading ratings...</p>
            ) : (
                <div className="dashboard-grid">
                    {/* Summary */}
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                        <div className="card-header"><h2>Overall Rating</h2></div>
                        <div style={{ padding: '2rem 1rem' }}>
                            <div style={{ fontSize: '5rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {avg.toFixed(1)}
                            </div>
                            <div style={{ fontSize: '1.5rem', color: '#f59e0b', margin: '0.5rem 0' }}>
                                {stars(avg)}
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Based on {total} session{total !== 1 ? 's' : ''}</p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>{total}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Sessions</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>{score.toFixed(1)}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Credibility Score</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category breakdown */}
                    <div className="dashboard-card">
                        <div className="card-header"><h2>Category Breakdown</h2></div>
                        <div style={{ padding: '1rem 0' }}>
                            {avg > 0 ? (
                                breakdown.map((item) => (
                                    <StarRow key={item.label} label={item.label} score={item.score} />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⭐</div>
                                    <p className="header-subtitle">No ratings yet. Complete sessions to receive feedback.</p>
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0.5rem 0', borderTop: '1px solid #f1f5f9' }}>
                            Category breakdown is estimated — detailed per-category ratings API can be connected here.
                        </p>
                    </div>

                    {/* Recent feedback placeholder */}
                    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header"><h2>Recent Feedback</h2></div>
                        <div className="card-content">
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                                <p>Individual student feedback will appear here once the ratings API endpoint is connected.</p>
                                <p style={{ fontSize: '0.85rem' }}>Endpoint: <code>/api/peerhelp/ratings</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TutorLayout>
    );
};

export default TutorRatingsPage;
