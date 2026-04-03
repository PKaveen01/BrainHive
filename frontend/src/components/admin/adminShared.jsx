import React, { useState } from 'react';

/* ── useActionMessage ─────────────────────────────────────────────────────── */
export const useActionMessage = () => {
    const [msg, setMsg] = useState(null);
    const show = (text, isError = false) => {
        setMsg({ text, error: isError });
        setTimeout(() => setMsg(null), 4000);
    };
    return [msg, show];
};

/* ── ActionBanner ─────────────────────────────────────────────────────────── */
export const ActionBanner = ({ msg }) => {
    if (!msg) return null;
    return (
        <div className={`admin-banner ${msg.error ? 'admin-banner-error' : 'admin-banner-success'}`}>
            {msg.error ? '⚠️' : '✅'} {msg.text}
        </div>
    );
};

/* ── LoadingState ─────────────────────────────────────────────────────────── */
export const LoadingState = ({ text = 'Loading…' }) => (
    <div className="loading-state">{text}</div>
);

/* ── EmptyState ───────────────────────────────────────────────────────────── */
export const EmptyState = ({ icon, title, body, onRefresh }) => (
    <div className="empty-state">
        <div className="empty-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        {onRefresh && (
            <button className="btn-secondary" onClick={onRefresh}>↻ Refresh</button>
        )}
    </div>
);

/* ── formatDate helper ────────────────────────────────────────────────────── */
export const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

/* ── formatFileSize helper ────────────────────────────────────────────────── */
const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── Determine viewer mode from resource ─────────────────────────────────── */
const getViewerMode = (resource) => {
    if (!resource) return 'none';

    const mime     = (resource.fileType || '').toLowerCase();
    const path     = (resource.filePath || resource.link || '').toLowerCase();
    const ext      = path.split('?')[0].split('.').pop();

    if (resource.link && !resource.filePath) return 'link';
    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image';
    if (mime.startsWith('video/') || ['mp4','webm','ogg'].includes(ext)) return 'video';
    if (mime.startsWith('audio/') || ['mp3','wav','ogg','m4a'].includes(ext)) return 'audio';
    if (resource.filePath) return 'file'; // downloadable but can't inline
    return 'none';
};

/* ── ResourceViewerModal ──────────────────────────────────────────────────── */
export const ResourceViewerModal = ({ resource, onClose, footer }) => {
    if (!resource) return null;

    const mode      = getViewerMode(resource);
    const fileUrl   = resource.filePath || resource.link || null;
    const fmt       = formatDate;
    const fmtSize   = formatFileSize;

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="resource-viewer-modal">

                {/* ── Modal header ── */}
                <div className="rvm-header">
                    <div className="rvm-title-row">
                        <span className="type-badge" style={{ marginRight: '0.5rem' }}>{resource.type}</span>
                        <h3 className="rvm-title">{resource.title}</h3>
                    </div>
                    <button className="rvm-close" onClick={onClose} title="Close">✕</button>
                </div>

                {/* ── Viewer pane ── */}
                <div className="rvm-viewer">
                    {mode === 'pdf' && (
                        <iframe
                            src={fileUrl}
                            title={resource.title}
                            className="rvm-iframe"
                            allow="fullscreen"
                        />
                    )}

                    {mode === 'image' && (
                        <div className="rvm-image-wrap">
                            <img src={fileUrl} alt={resource.title} className="rvm-image" />
                        </div>
                    )}

                    {mode === 'video' && (
                        <div className="rvm-media-wrap">
                            <video controls className="rvm-video" src={fileUrl}>
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {mode === 'audio' && (
                        <div className="rvm-media-wrap">
                            <audio controls className="rvm-audio" src={fileUrl}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}

                    {mode === 'link' && (
                        <div className="rvm-link-pane">
                            <div className="rvm-link-icon">🔗</div>
                            <p className="rvm-link-label">External Resource Link</p>
                            <a
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rvm-open-btn"
                            >
                                Open Link ↗
                            </a>
                            <p className="rvm-link-url">{resource.link}</p>
                        </div>
                    )}

                    {mode === 'file' && (
                        <div className="rvm-link-pane">
                            <div className="rvm-link-icon">📄</div>
                            <p className="rvm-link-label">
                                {resource.fileName || 'File'} cannot be previewed inline.
                            </p>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rvm-open-btn"
                            >
                                Open / Download ↗
                            </a>
                        </div>
                    )}

                    {mode === 'none' && (
                        <div className="rvm-link-pane">
                            <div className="rvm-link-icon">❓</div>
                            <p className="rvm-link-label">No file or link is attached to this resource.</p>
                        </div>
                    )}
                </div>

                {/* ── Metadata strip ── */}
                <div className="rvm-meta">
                    <div className="rvm-meta-row">
                        <span className="rvm-meta-label">Subject</span>
                        <span>{resource.subject}</span>
                    </div>
                    {resource.semester && (
                        <div className="rvm-meta-row">
                            <span className="rvm-meta-label">Semester</span>
                            <span>{resource.semester}</span>
                        </div>
                    )}
                    <div className="rvm-meta-row">
                        <span className="rvm-meta-label">Uploaded by</span>
                        <span>
                            {resource.uploadedBy}
                            {resource.uploadedByEmail && (
                                <span className="sub-email" style={{ marginLeft: '6px' }}>
                                    ({resource.uploadedByEmail})
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="rvm-meta-row">
                        <span className="rvm-meta-label">Upload date</span>
                        <span>{fmt(resource.uploadedAt)}</span>
                    </div>
                    {resource.fileName && (
                        <div className="rvm-meta-row">
                            <span className="rvm-meta-label">File</span>
                            <span>
                                {resource.fileName}
                                {fmtSize(resource.fileSize) && (
                                    <span className="sub-email" style={{ marginLeft: '6px' }}>
                                        ({fmtSize(resource.fileSize)})
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                    <div className="rvm-meta-row">
                        <span className="rvm-meta-label">Status</span>
                        <span className={`status-badge ${(resource.status || '').toLowerCase()}`}>
                            {resource.status}
                        </span>
                    </div>
                    {resource.description && (
                        <div className="rvm-meta-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                            <span className="rvm-meta-label">Description</span>
                            <span style={{ color: '#475569', fontSize: '0.845rem', lineHeight: 1.5 }}>
                                {resource.description}
                            </span>
                        </div>
                    )}
                    {resource.moderationNotes && (
                        <div className="rvm-meta-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                            <span className="rvm-meta-label">Report / Notes</span>
                            <span className="report-reason">{resource.moderationNotes}</span>
                        </div>
                    )}
                    {fileUrl && mode !== 'link' && (
                        <div className="rvm-meta-row">
                            <span className="rvm-meta-label">Direct link</span>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', fontSize: '0.8rem', wordBreak: 'break-all' }}
                            >
                                Open in new tab ↗
                            </a>
                        </div>
                    )}
                </div>

                {/* ── Action footer ── */}
                {footer && (
                    <div className="rvm-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
