import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import StudentSidebar from '../../components/common/StudentSidebar';
import TutorSidebar from '../peerhelp/TutorSidebar';
import './UploadResource.css';

function UrIcon({ name, className = '', size = 18, filled = false }) {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className
    };

    switch (name) {
        case 'upload':
            return (
                <svg {...props}>
                    <path d="M12 16V4" />
                    <path d="M7 9l5-5 5 5" />
                    <path d="M4 20h16" />
                </svg>
            );
        case 'arrowLeft':
            return (
                <svg {...props}>
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                </svg>
            );
        case 'fileText':
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                </svg>
            );
        case 'fileEdit':
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M10 13l5-5 2 2-5 5-3 1z" />
                </svg>
            );
        case 'presentation':
            return (
                <svg {...props}>
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M8 20h8" />
                    <path d="M12 16v4" />
                    <path d="M8 10l2-2 2 2 3-3 2 2" />
                </svg>
            );
        case 'image':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            );
        case 'video':
            return (
                <svg {...props}>
                    <rect x="3" y="6" width="15" height="12" rx="2" />
                    <path d="M18 10l3-2v8l-3-2z" />
                </svg>
            );
        case 'link':
            return (
                <svg {...props}>
                    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
                    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 20" />
                </svg>
            );
        case 'article':
            return (
                <svg {...props}>
                    <path d="M4 5h16" />
                    <path d="M4 10h16" />
                    <path d="M4 15h10" />
                    <path d="M4 20h7" />
                </svg>
            );
        case 'archive':
            return (
                <svg {...props}>
                    <rect x="3" y="4" width="18" height="4" rx="1" />
                    <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                    <path d="M10 12h4" />
                </svg>
            );
        case 'check':
            return (
                <svg {...props}>
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            );
        case 'x':
            return (
                <svg {...props}>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                </svg>
            );
        case 'alertTriangle':
            return (
                <svg {...props}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                </svg>
            );
        default:
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
    }
}

const UploadResource = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const fileInputRef = useRef(null);

    const [uploadType, setUploadType] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationStatus, setValidationStatus] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        semester: '',
        type: 'pdf',
        file: null,
        link: '',
        tags: '',
        visibility: 'public',
        courseCode: '',
        allowRatings: true,
        allowComments: true,
        license: 'copyright'
    });

    // Subjects by faculty
    const subjectsByFaculty = {
        'Faculty of Computing': [
            'Data Structures', 'Database Systems', 'Programming (Java)', 'Programming (Python)',
            'Web Development', 'Operating Systems', 'Computer Networks', 'Software Engineering',
            'Algorithms', 'Artificial Intelligence', 'Machine Learning', 'Cyber Security',
            'Cloud Computing', 'Mobile Development', 'Computer Architecture', 'Discrete Mathematics',
        ],
        'Faculty of Engineering': [
            'Engineering Mathematics', 'Circuit Theory', 'Electronics', 'Digital Systems',
            'Signals & Systems', 'Thermodynamics', 'Fluid Mechanics', 'Mechanics of Materials',
            'Control Systems', 'Telecommunications',
        ],
        'Faculty of Business': [
            'Accounting', 'Financial Management', 'Marketing', 'Business Statistics',
            'Economics (Micro)', 'Economics (Macro)', 'Organizational Behavior',
            'Operations Management', 'Business Law', 'Entrepreneurship',
        ],
        'Faculty of Science': [
            'Calculus', 'Linear Algebra', 'Statistics & Probability', 'Physics',
            'Chemistry', 'Biology', 'Environmental Science',
        ],
        'Faculty of Medicine': [
            'Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology',
            'Medical Ethics', 'Public Health',
        ],
        'Faculty of Law': [
            'Constitutional Law', 'Criminal Law', 'Contract Law', 'International Law',
            'Human Rights Law',
        ],
        'Faculty of Arts & Social Sciences': [
            'Psychology', 'Sociology', 'Political Science', 'History', 'Philosophy',
            'English Literature', 'Media Studies', 'Education',
        ],
        'General': ['Mathematics', 'Research Methods', 'Communication Skills', 'Other'],
    };

    const semesters = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];
    const licenses = [
        { value: 'copyright', label: 'All Rights Reserved' },
        { value: 'cc-by', label: 'Creative Commons Attribution' },
        { value: 'cc-by-sa', label: 'Creative Commons ShareAlike' },
        { value: 'cc-by-nc', label: 'Creative Commons NonCommercial' },
        { value: 'public-domain', label: 'Public Domain' }
    ];

    const getDatabaseUserId = (authUser) => {
        if (!authUser) return null;
        if (authUser.userId) return String(authUser.userId);
        if (authUser.id) return String(authUser.id);
        return null;
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    // Validation functions
    const validateField = (name, value) => {
        switch (name) {
            case 'title':
                if (!value || !value.trim()) return 'Title is required';
                if (value.trim().length < 5) return 'Title must be at least 5 characters';
                if (value.trim().length > 100) return 'Title must be less than 100 characters';
                if (!/^[a-zA-Z0-9\s\-_,.!?()]+$/.test(value.trim())) return 'Title contains invalid characters';
                return null;

            case 'subject':
                if (!value) return 'Please select a subject';
                return null;

            case 'semester':
                if (!value) return 'Please select a semester';
                return null;

            case 'link':
                if (uploadType === 'link' || uploadType === 'video' || uploadType === 'article') {
                    if (!value) return 'URL is required';
                    let urlToValidate = value;
                    if (!urlToValidate.match(/^https?:\/\//i)) urlToValidate = 'https://' + urlToValidate;
                    try {
                        const url = new URL(urlToValidate);
                        if (!['http:', 'https:'].includes(url.protocol)) return 'URL must use HTTP or HTTPS protocol';
                        return null;
                    } catch (e) {
                        return 'Please enter a valid URL (e.g., https://example.com)';
                    }
                }
                return null;

            case 'file':
                if (uploadType !== 'link' && uploadType !== 'video' && uploadType !== 'article') {
                    if (!value) return 'Please select a file to upload';
                    if (value.size > 50 * 1024 * 1024) return `File size (${(value.size / (1024 * 1024)).toFixed(2)}MB) exceeds 50MB limit`;
                    
                    if (uploadType === 'pdf') {
                        if (!value.type.includes('pdf') && !value.name.toLowerCase().endsWith('.pdf'))
                            return 'Please upload a valid PDF file';
                    }
                    if (uploadType === 'document') {
                        if (!value.name.match(/\.(doc|docx)$/i))
                            return 'Please upload a valid Word document (DOC/DOCX)';
                    }
                    if (uploadType === 'presentation') {
                        if (!value.name.match(/\.(ppt|pptx)$/i))
                            return 'Please upload a valid PowerPoint presentation (PPT/PPTX)';
                    }
                    if (uploadType === 'image') {
                        if (!value.type.startsWith('image/'))
                            return 'Please upload a valid image file (JPG, PNG, GIF)';
                    }
                }
                return null;

            case 'tags':
                if (value) {
                    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    if (tagsArray.length > 5) return 'Maximum 5 tags allowed';
                    if (tagsArray.some(tag => tag.length > 20)) return 'Each tag must be less than 20 characters';
                    if (tagsArray.some(tag => !/^[a-zA-Z0-9\s\-_]+$/.test(tag))) return 'Tags can only contain letters, numbers, spaces, hyphens, and underscores';
                }
                return null;

            default:
                return null;
        }
    };

    const validateForm = () => {
        const errors = {};
        errors.title = validateField('title', formData.title);
        errors.subject = validateField('subject', formData.subject);
        errors.semester = validateField('semester', formData.semester);
        
        if (uploadType === 'link' || uploadType === 'video' || uploadType === 'article') {
            errors.link = validateField('link', formData.link);
        } else {
            errors.file = validateField('file', formData.file);
        }
        
        errors.tags = validateField('tags', formData.tags);
        
        Object.keys(errors).forEach(key => {
            if (errors[key] === null) delete errors[key];
        });
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const error = validateField(fieldName, formData[fieldName]);
        setFormErrors(prev => {
            if (error) {
                return { ...prev, [fieldName]: error };
            } else {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({ ...prev, [name]: newValue }));
        
        if (touched[name] || submitAttempted) {
            const error = validateField(name, newValue);
            setFormErrors(prev => {
                if (error) {
                    return { ...prev, [name]: error };
                } else {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                }
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileSizeMB = file.size / (1024 * 1024);
            
            if (fileSizeMB > 50) {
                setFormErrors(prev => ({ ...prev, file: `File size (${fileSizeMB.toFixed(2)}MB) exceeds 50MB limit` }));
                setTouched(prev => ({ ...prev, file: true }));
                return;
            }
            
            setFormData(prev => ({ 
                ...prev, 
                file: file, 
                fileName: file.name, 
                fileSize: fileSizeMB.toFixed(2) 
            }));
            
            if (uploadType === 'image' && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setShowPreview(true);
                reader.readAsDataURL(file);
            }
            
            if (touched.file || submitAttempted) {
                const error = validateField('file', file);
                setFormErrors(prev => {
                    if (error) {
                        return { ...prev, file: error };
                    } else {
                        const newErrors = { ...prev };
                        delete newErrors.file;
                        return newErrors;
                    }
                });
            }
        }
    };

    const handleTypeChange = (type) => {
        setUploadType(type);
        setFormData(prev => ({ 
            ...prev, 
            type: type, 
            file: null, 
            link: '', 
            fileName: null, 
            fileSize: null 
        }));
        setShowPreview(false);
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.file;
            delete newErrors.link;
            return newErrors;
        });
    };

    const uploadFileWithProgress = (file, formDataFields, userId) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const API_URL = 'http://localhost:8080';
            
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(progress);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        resolve(xhr.responseText);
                    }
                } else {
                    let errorMessage = `Upload failed with status ${xhr.status}`;
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.message || errorMessage;
                    } catch (e) {}
                    reject(new Error(errorMessage));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Network error - please check if backend is running on port 8080'));
            });
            
            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timeout - please try again with a smaller file'));
            });
            
            xhr.timeout = 300000;
            xhr.open('POST', `${API_URL}/api/resources/upload/file`);
            xhr.withCredentials = true;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', String(formDataFields.title));
            formData.append('description', String(formDataFields.description || ''));
            formData.append('subject', String(formDataFields.subject));
            formData.append('semester', String(formDataFields.semester));
            formData.append('type', String(formDataFields.type));
            formData.append('tags', String(formDataFields.tags || ''));
            formData.append('visibility', String(formDataFields.visibility));
            formData.append('courseCode', String(formDataFields.courseCode || ''));
            formData.append('license', String(formDataFields.license));
            formData.append('allowRatings', String(formDataFields.allowRatings));
            formData.append('allowComments', String(formDataFields.allowComments));
            formData.append('userId', String(userId));
            
            xhr.send(formData);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);
        
        const allFields = ['title', 'subject', 'semester'];
        if (uploadType === 'link' || uploadType === 'video' || uploadType === 'article') {
            allFields.push('link');
        } else {
            allFields.push('file');
        }
        if (formData.tags) allFields.push('tags');
        
        const newTouched = {};
        allFields.forEach(field => { newTouched[field] = true; });
        setTouched(newTouched);
        
        if (!validateForm()) {
            const firstError = document.querySelector('.ur-error-text');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        setLoading(true);
        setUploadProgress(0);
        setValidationStatus('validating');
        
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            
            const dbUserId = getDatabaseUserId(currentUser);
            if (!dbUserId) {
                throw new Error('Unable to identify user. Please log in again.');
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            setValidationStatus('valid');
            
            if (uploadType === 'pdf' || uploadType === 'document' || uploadType === 'presentation' || uploadType === 'image') {
                if (!formData.file) throw new Error('No file selected');
                if (formData.file.size > 50 * 1024 * 1024) throw new Error('File size exceeds 50MB limit');
                
                const formDataFields = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    subject: formData.subject,
                    semester: formData.semester,
                    type: uploadType,
                    tags: formData.tags,
                    visibility: formData.visibility,
                    courseCode: formData.courseCode,
                    license: formData.license,
                    allowRatings: formData.allowRatings,
                    allowComments: formData.allowComments
                };
                
                await uploadFileWithProgress(formData.file, formDataFields, dbUserId);
                alert('✓ Resource uploaded successfully!\n\nIt will be active after moderation review.');
                navigate('/resources/my-uploads');
            } else {
                const linkData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    subject: formData.subject,
                    semester: formData.semester,
                    type: uploadType,
                    link: formData.link,
                    tags: formData.tags,
                    visibility: formData.visibility,
                    courseCode: formData.courseCode,
                    license: formData.license,
                    allowRatings: formData.allowRatings,
                    allowComments: formData.allowComments,
                    userId: dbUserId
                };
                
                await api.post('/resources/upload/link', linkData);
                alert('✓ Resource added successfully!\n\nIt will be active after moderation review.');
                navigate('/resources/my-uploads');
            }
        } catch (error) {
            setValidationStatus('failed');
            const errorMessage = error.response?.data?.message || error.message || 'Error uploading resource';
            alert(`✗ Upload Failed\n\n${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            title: '', description: '', subject: '', semester: '',
            type: 'pdf', file: null, link: '', tags: '',
            visibility: 'public', courseCode: '', allowRatings: true,
            allowComments: true, license: 'copyright'
        });
        setUploadType('pdf');
        setShowPreview(false);
        setFormErrors({});
        setTouched({});
        setValidationStatus(null);
        setSubmitAttempted(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const getYearText = (sem) => {
        if (sem.startsWith('Y1')) return ' (1st Year)';
        if (sem.startsWith('Y2')) return ' (2nd Year)';
        if (sem.startsWith('Y3')) return ' (3rd Year)';
        if (sem.startsWith('Y4')) return ' (4th Year)';
        return '';
    };
    
    const SubjectSelect = ({ value, onChange, name, className }) => (
        <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            required 
            className={className} 
            onBlur={() => handleBlur('subject')}
        >
            <option value="">Select Subject</option>
            {Object.entries(subjectsByFaculty).map(([faculty, subjects]) => (
                <optgroup key={faculty} label={faculty}>
                    {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </optgroup>
            ))}
        </select>
    );
    
    const isTutor = user?.role === 'TUTOR' || user?.role === 'tutor' || user?.userType === 'TUTOR' || user?.userType === 'tutor';

    return (
        <div className="dashboard">
            {isTutor ? <TutorSidebar user={user} /> : <StudentSidebar user={user} />}
            <div className="main-content">
                <div className="ur-page-header">
                    <div className="ur-page-header-left">
                        <div className="ur-page-title-wrap">
                            <div className="ur-page-title-icon">
                                <UrIcon name="upload" size={22} />
                            </div>
                            <div>
                                <h1>Upload Resource</h1>
                                <p className="ur-page-subtitle">Share your study materials with the BrainHive community</p>
                            </div>
                        </div>
                    </div>
                    <button className="ur-btn-primary" onClick={() => navigate('/dashboard/student')}>
                        <UrIcon name="arrowLeft" size={16} />
                        <span>Dashboard</span>
                    </button>
                </div>
                
                {/* Type Selector */}
                <div className="ur-type-selector">
                    <h3 className="ur-section-title">Select Resource Type</h3>
                    <div className="ur-type-grid">
                        {[
                            { type: 'pdf', icon: 'fileText', label: 'PDF' },
                            { type: 'document', icon: 'fileEdit', label: 'Document' },
                            { type: 'presentation', icon: 'presentation', label: 'Presentation' },
                            { type: 'image', icon: 'image', label: 'Image' },
                            { type: 'video', icon: 'video', label: 'Video' },
                            { type: 'link', icon: 'link', label: 'Link' },
                            { type: 'article', icon: 'article', label: 'Article' },
                            { type: 'other', icon: 'archive', label: 'Other' }
                        ].map((item) => (
                            <button
                                key={item.type}
                                type="button"
                                onClick={() => handleTypeChange(item.type)}
                                className={`ur-type-btn ${uploadType === item.type ? 'ur-active' : ''}`}
                            >
                                <span className="ur-type-icon">
                                    <UrIcon name={item.icon} size={20} />
                                </span>
                                <span className="ur-type-label">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="ur-form">
                    {/* Basic Information */}
                    <div className="ur-form-card">
                        <h2 className="ur-card-title">Basic Information</h2>
                        
                        <div className="ur-form-group">
                            <label className="ur-form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('title')}
                                placeholder="e.g., Binary Trees Complete Notes"
                                className={`ur-form-input ${formErrors.title && (touched.title || submitAttempted) ? 'ur-error' : ''}`}
                            />
                            {formErrors.title && (touched.title || submitAttempted) && (
                                <span className="ur-error-text">{formErrors.title}</span>
                            )}
                        </div>
                        
                        <div className="ur-form-row">
                            <div className="ur-form-group">
                                <label className="ur-form-label">Subject *</label>
                                <SubjectSelect
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className={`ur-form-select ${formErrors.subject && (touched.subject || submitAttempted) ? 'ur-error' : ''}`}
                                />
                                {formErrors.subject && (touched.subject || submitAttempted) && (
                                    <span className="ur-error-text">{formErrors.subject}</span>
                                )}
                            </div>
                            
                            <div className="ur-form-group">
                                <label className="ur-form-label">Semester *</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('semester')}
                                    className={`ur-form-select ${formErrors.semester && (touched.semester || submitAttempted) ? 'ur-error' : ''}`}
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(sem => (
                                        <option key={sem} value={sem}>{sem}{getYearText(sem)}</option>
                                    ))}
                                </select>
                                {formErrors.semester && (touched.semester || submitAttempted) && (
                                    <span className="ur-error-text">{formErrors.semester}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="ur-form-row">
                            <div className="ur-form-group">
                                <label className="ur-form-label">Course Code (Optional)</label>
                                <input
                                    type="text"
                                    name="courseCode"
                                    value={formData.courseCode}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CS301"
                                    className="ur-form-input"
                                />
                            </div>
                            
                            <div className="ur-form-group">
                                <label className="ur-form-label">Tags (Optional)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('tags')}
                                    placeholder="e.g., algorithms, exam, notes"
                                    className={`ur-form-input ${formErrors.tags && (touched.tags || submitAttempted) ? 'ur-error' : ''}`}
                                />
                                <p className="ur-input-hint">Separate with commas (max 5 tags, each max 20 characters)</p>
                                {formErrors.tags && (touched.tags || submitAttempted) && (
                                    <span className="ur-error-text">{formErrors.tags}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="ur-form-group">
                            <label className="ur-form-label">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of this resource..."
                                rows="3"
                                className="ur-form-textarea"
                            />
                        </div>
                    </div>
                    
                    {/* File Upload Section */}
                    {(uploadType === 'pdf' || uploadType === 'document' || uploadType === 'presentation' || uploadType === 'image') && (
                        <div className="ur-form-card">
                            <h2 className="ur-card-title">Upload File</h2>
                            <div
                                className={`ur-file-dropzone ${formErrors.file && (touched.file || submitAttempted) ? 'ur-error' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file) handleFileChange({ target: { files: [file] } });
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept={
                                        uploadType === 'pdf' ? '.pdf' :
                                        uploadType === 'document' ? '.doc,.docx' :
                                        uploadType === 'presentation' ? '.ppt,.pptx' :
                                        uploadType === 'image' ? 'image/*' : '.pdf'
                                    }
                                    onChange={handleFileChange}
                                    onBlur={() => handleBlur('file')}
                                    className="ur-file-input"
                                    style={{ display: 'none' }}
                                />
                                <div className="ur-dropzone-content">
                                    <span className="ur-upload-icon">
                                        <UrIcon name="upload" size={34} />
                                    </span>
                                    <p className="ur-dropzone-text">Click to browse or drag and drop</p>
                                    <p className="ur-dropzone-hint">
                                        {uploadType === 'pdf' && 'PDF files only (Max 50MB)'}
                                        {uploadType === 'document' && 'Word documents (DOC, DOCX) (Max 50MB)'}
                                        {uploadType === 'presentation' && 'PowerPoint presentations (PPT, PPTX) (Max 50MB)'}
                                        {uploadType === 'image' && 'Images (JPG, PNG, GIF) (Max 50MB)'}
                                    </p>
                                    {formData.fileName && (
                                        <div className="ur-selected-file">
                                            <span className="ur-selected-file-icon"><UrIcon name="check" size={14} /></span>
                                            <span>{formData.fileName} ({formData.fileSize} MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {formErrors.file && (touched.file || submitAttempted) && (
                                <span className="ur-error-text">{formErrors.file}</span>
                            )}
                            {showPreview && formData.file && uploadType === 'image' && (
                                <div className="ur-preview-section">
                                    <h3 className="ur-preview-title">Preview</h3>
                                    <img src={URL.createObjectURL(formData.file)} alt="Preview" className="ur-image-preview" />
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Link Section */}
                    {(uploadType === 'link' || uploadType === 'video' || uploadType === 'article') && (
                        <div className="ur-form-card">
                            <h2 className="ur-card-title">Resource Link</h2>
                            <div className="ur-form-group">
                                <label className="ur-form-label">
                                    {uploadType === 'video' ? 'Video URL *' : 'Resource URL *'}
                                </label>
                                <input
                                    type="url"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('link')}
                                    placeholder={uploadType === 'video' ? "https://youtube.com/watch?v=..." : "https://example.com/resource"}
                                    className={`ur-form-input ${formErrors.link && (touched.link || submitAttempted) ? 'ur-error' : ''}`}
                                />
                                {formErrors.link && (touched.link || submitAttempted) && (
                                    <span className="ur-error-text">{formErrors.link}</span>
                                )}
                                {uploadType === 'video' && (
                                    <p className="ur-input-hint">Supports YouTube, Vimeo, and other video platforms</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Settings */}
                    <div className="ur-form-card">
                        <h2 className="ur-card-title">Settings</h2>
                        <div className="ur-form-row">
                            <div className="ur-form-group">
                                <label className="ur-form-label">Visibility</label>
                                <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="ur-form-select">
                                    <option value="public">Public - Everyone can view</option>
                                    <option value="private">Private - Only me</option>
                                    <option value="study-group">Study Group Only</option>
                                    <option value="course">Same Course Only</option>
                                </select>
                            </div>
                            <div className="ur-form-group">
                                <label className="ur-form-label">License</label>
                                <select name="license" value={formData.license} onChange={handleInputChange} className="ur-form-select">
                                    {licenses.map(license => (
                                        <option key={license.value} value={license.value}>{license.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="ur-checkbox-group">
                            <label className="ur-checkbox-label">
                                <input type="checkbox" name="allowRatings" checked={formData.allowRatings} onChange={handleInputChange} />
                                <span>Allow ratings and reviews</span>
                            </label>
                            <label className="ur-checkbox-label">
                                <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleInputChange} />
                                <span>Allow comments and discussions</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Validation Status */}
                    {validationStatus && (
                        <div className={`ur-validation-message ${validationStatus}`}>
                            <div className="ur-validation-content">
                                {validationStatus === 'validating' && (
                                    <>
                                        <div className="ur-spinner-small"></div>
                                        <span>Validating your resource...</span>
                                    </>
                                )}
                                {validationStatus === 'valid' && (
                                    <>
                                        <span className="ur-status-icon"><UrIcon name="check" size={16} /></span>
                                        <span>Resource validated! Ready for upload.</span>
                                    </>
                                )}
                                {validationStatus === 'failed' && (
                                    <>
                                        <span className="ur-status-icon"><UrIcon name="x" size={16} /></span>
                                        <span>Validation failed. Please check your resource and try again.</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Progress Bar */}
                    {loading && uploadType !== 'link' && uploadType !== 'video' && uploadType !== 'article' && (
                        <div className="ur-progress-card">
                            <div className="ur-progress-header">
                                <span className="ur-progress-label">Uploading...</span>
                                <span className="ur-progress-percentage">{uploadProgress}%</span>
                            </div>
                            <div className="ur-progress-track">
                                <div className="ur-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                    
                    {/* Form Actions */}
                    <div className="ur-form-card">
                        <div className="ur-guidelines-section">
                            <h3 className="ur-guidelines-title">Upload Guidelines</h3>
                            <ul className="ur-guidelines-list">
                                <li>Ensure you have the rights to share the resource</li>
                                <li>Provide accurate and descriptive titles</li>
                                <li>Add relevant tags to help others find your resource</li>
                                <li>Resources will be reviewed by moderators before going public</li>
                                <li>Inappropriate content will be removed</li>
                                <li>Maximum file size: 50MB</li>
                            </ul>
                        </div>
                        <div className="ur-form-actions">
                            <button type="button" onClick={resetForm} className="ur-cancel-btn">
                                Clear Form
                            </button>
                            <button type="submit" disabled={loading} className="ur-submit-btn">
                                {loading ? `Uploading ${uploadProgress}%...` : 'Upload Resource'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadResource;