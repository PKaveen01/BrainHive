import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/auth.service';
import './UploadResource.css';

const UploadResource = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('upload');

    const [uploadType, setUploadType] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationStatus, setValidationStatus] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});

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

    const [uploads, setUploads] = useState([]);
    const [loadingUploads, setLoadingUploads] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [ratingModal, setRatingModal] = useState({ show: false, resourceId: null });
    const [userRating, setUserRating] = useState(5);
    const [review, setReview] = useState('');
    const [detailsModal, setDetailsModal] = useState({ show: false, resource: null });
    const [reviews, setReviews] = useState([]);

    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        views: 0,
        downloads: 0
    });

    // ============= SUBJECTS BY FACULTY =============
    const subjectsByFaculty = {
        'Faculty of Computing': [
            'Data Structures',
            'Database Systems',
            'Programming (Java)',
            'Programming (Python)',
            'Web Development',
            'Operating Systems',
            'Computer Networks',
            'Software Engineering',
            'Algorithms',
            'Artificial Intelligence',
            'Machine Learning',
            'Cyber Security',
            'Cloud Computing',
            'Mobile Development',
            'Computer Architecture',
            'Discrete Mathematics',
        ],
        'Faculty of Engineering': [
            'Engineering Mathematics',
            'Circuit Theory',
            'Electronics',
            'Digital Systems',
            'Signals & Systems',
            'Thermodynamics',
            'Fluid Mechanics',
            'Mechanics of Materials',
            'Control Systems',
            'Telecommunications',
        ],
        'Faculty of Business': [
            'Accounting',
            'Financial Management',
            'Marketing',
            'Business Statistics',
            'Economics (Micro)',
            'Economics (Macro)',
            'Organizational Behavior',
            'Operations Management',
            'Business Law',
            'Entrepreneurship',
        ],
        'Faculty of Science': [
            'Calculus',
            'Linear Algebra',
            'Statistics & Probability',
            'Physics',
            'Chemistry',
            'Biology',
            'Environmental Science',
        ],
        'Faculty of Medicine': [
            'Anatomy',
            'Physiology',
            'Biochemistry',
            'Pharmacology',
            'Pathology',
            'Medical Ethics',
            'Public Health',
        ],
        'Faculty of Law': [
            'Constitutional Law',
            'Criminal Law',
            'Contract Law',
            'International Law',
            'Human Rights Law',
        ],
        'Faculty of Arts & Social Sciences': [
            'Psychology',
            'Sociology',
            'Political Science',
            'History',
            'Philosophy',
            'English Literature',
            'Media Studies',
            'Education',
        ],
        'General': [
            'Mathematics',
            'Research Methods',
            'Communication Skills',
            'Other',
        ],
    };

    const semesters = [
        'Y1S1', 'Y1S2',
        'Y2S1', 'Y2S2',
        'Y3S1', 'Y3S2',
        'Y4S1', 'Y4S2'
    ];

    const licenses = [
        { value: 'copyright', label: 'All Rights Reserved' },
        { value: 'cc-by', label: 'Creative Commons Attribution' },
        { value: 'cc-by-sa', label: 'Creative Commons ShareAlike' },
        { value: 'cc-by-nc', label: 'Creative Commons NonCommercial' },
        { value: 'public-domain', label: 'Public Domain' }
    ];

    // ============= USER ID MAPPING =============
    const getDatabaseUserId = (authUser) => {
        if (!authUser) return null;
        return '1';
    };

    // ============= INITIALIZATION =============
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const dbUserId = getDatabaseUserId(currentUser);
        if (dbUserId) {
            fetchAllUploads(dbUserId);
        } else {
            setError('Could not identify user. Please check your login.');
            setLoadingUploads(false);
        }
    }, []);

    // ============= FETCH BOOKMARK STATUS =============
    const fetchBookmarkStatus = async (resources) => {
        try {
            const dbUserId = getDatabaseUserId(user);
            const bookmarkStatus = {};

            for (const resource of resources) {
                try {
                    const response = await api.get(`/resources/${resource.id}/bookmarked/status?userId=${dbUserId}`);
                    bookmarkStatus[resource.id] = response.data.isBookmarked;
                } catch (error) {
                    console.error(`Error checking bookmark status for ${resource.id}:`, error);
                    bookmarkStatus[resource.id] = false;
                }
            }

            const bookmarked = new Set(
                Object.keys(bookmarkStatus).filter(id => bookmarkStatus[id])
            );
            setBookmarkedIds(bookmarked);
        } catch (error) {
            console.error('Error fetching bookmark status:', error);
        }
    };

    // ============= FETCH ALL UPLOADS =============
    const fetchAllUploads = async (userId) => {
        try {
            setLoadingUploads(true);
            setError(null);

            const response = await api.get(`/resources/user/${userId}`);

            let uploadsData = [];
            if (Array.isArray(response.data)) {
                uploadsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                uploadsData = response.data.content || response.data.data || [];
            }

            setUploads(uploadsData);
            await fetchBookmarkStatus(uploadsData);

            const pending = uploadsData.filter(u => u?.status === 'pending').length;
            const active = uploadsData.filter(u => u?.status === 'active').length;
            const totalViews = uploadsData.reduce((sum, u) => sum + (u?.viewCount || 0), 0);
            const totalDownloads = uploadsData.reduce((sum, u) => sum + (u?.downloadCount || 0), 0);

            setStats({
                total: uploadsData.length,
                pending,
                active,
                views: totalViews,
                downloads: totalDownloads
            });

        } catch (error) {
            console.error('Error fetching uploads:', error);
            setError(error.response?.data?.message || error.message || 'Failed to fetch uploads');
        } finally {
            setLoadingUploads(false);
        }
    };

    // ============= ENHANCED FORM VALIDATION =============
    const validateField = (name, value) => {
        switch (name) {
            case 'title':
                if (!value || !value.trim()) return 'Title is required';
                if (value.trim().length < 5) return 'Title must be at least 5 characters';
                if (value.trim().length > 100) return 'Title must be less than 100 characters';
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
                    if (!urlToValidate.match(/^https?:\/\//i)) {
                        urlToValidate = 'https://' + urlToValidate;
                    }
                    try {
                        new URL(urlToValidate);
                        return null;
                    } catch (e) {
                        return 'Please enter a valid URL';
                    }
                }
                return null;

            case 'file':
                if (uploadType !== 'link' && uploadType !== 'video' && uploadType !== 'article') {
                    if (!value) return 'Please select a file to upload';
                    if (value.size > 50 * 1024 * 1024) return 'File size must be less than 50MB';

                    if (uploadType === 'pdf') {
                        if (!value.type.includes('pdf') && !value.name.toLowerCase().endsWith('.pdf')) {
                            return 'Please upload a valid PDF file';
                        }
                    }
                    if (uploadType === 'document') {
                        if (!value.name.match(/\.(doc|docx)$/i)) {
                            return 'Please upload a valid Word document (DOC/DOCX)';
                        }
                    }
                    if (uploadType === 'presentation') {
                        if (!value.name.match(/\.(ppt|pptx)$/i)) {
                            return 'Please upload a valid PowerPoint presentation (PPT/PPTX)';
                        }
                    }
                    if (uploadType === 'image') {
                        if (!value.type.startsWith('image/')) {
                            return 'Please upload a valid image file (JPG, PNG, GIF)';
                        }
                    }
                }
                return null;

            case 'tags':
                if (value) {
                    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    if (tagsArray.length > 0) {
                        if (tagsArray.some(tag => tag.length > 20)) {
                            return 'Each tag must be less than 20 characters';
                        }
                        if (tagsArray.length > 5) {
                            return 'Maximum 5 tags allowed';
                        }
                    }
                }
                return null;

            default:
                return null;
        }
    };

    const validateForm = () => {
        const errors = {};

        // Validate all required fields
        errors.title = validateField('title', formData.title);
        errors.subject = validateField('subject', formData.subject);
        errors.semester = validateField('semester', formData.semester);

        if (uploadType === 'link' || uploadType === 'video' || uploadType === 'article') {
            errors.link = validateField('link', formData.link);
        } else {
            errors.file = validateField('file', formData.file);
        }

        errors.tags = validateField('tags', formData.tags);

        // Remove null values
        Object.keys(errors).forEach(key => {
            if (errors[key] === null) delete errors[key];
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
            setFormErrors(prev => ({ ...prev, [fieldName]: error }));
        } else {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    // ============= FILE UPLOAD HANDLER =============
    const uploadFileWithProgress = async (file, formDataFields, userId) => {
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
                    } catch (e) {
                        errorMessage = xhr.responseText || errorMessage;
                    }
                    reject(new Error(errorMessage));
                }
            });

            xhr.addEventListener('error', (event) => {
                reject(new Error('Network error occurred - please check if backend is running on port 8080'));
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

    // ============= UPLOAD HANDLERS =============
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Validate on change after field has been touched
        if (touched[name]) {
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
                alert(`File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of 50MB. Please compress your file.`);
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
                reader.onloadend = () => {
                    setShowPreview(true);
                };
                reader.readAsDataURL(file);
            }

            if (touched.file) {
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

        // Clear relevant errors
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.file;
            delete newErrors.link;
            return newErrors;
        });
    };

    const validateResource = async () => {
        setValidationStatus('validating');
        setTimeout(() => {
            setValidationStatus('valid');
        }, 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
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
            const firstError = document.querySelector('.error-text');
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
                alert('Unable to identify user. Please log in again.');
                return;
            }

            await validateResource();

            if (uploadType === 'pdf' || uploadType === 'document' || uploadType === 'presentation' || uploadType === 'image') {
                try {
                    if (formData.file.size > 50 * 1024 * 1024) {
                        throw new Error('File size exceeds 50MB limit');
                    }

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

                    const response = await uploadFileWithProgress(formData.file, formDataFields, dbUserId);

                    if (response) {
                        alert('Resource uploaded successfully! It will be active after moderation review.');
                        resetForm();
                        fetchAllUploads(dbUserId);
                        setActiveTab('my-uploads');
                    }
                } catch (error) {
                    let errorMessage = 'Failed to upload file: ';
                    if (error.message.includes('413') || error.message.includes('large') || error.message.includes('size')) {
                        errorMessage = 'File too large. Maximum file size is 50MB. Please compress your file and try again.';
                    } else if (error.message.includes('Network')) {
                        errorMessage = 'Network error. Please check if backend is running at http://localhost:8080';
                    } else {
                        errorMessage += error.message;
                    }
                    alert(errorMessage);
                    setValidationStatus('failed');
                }
            } else {
                const linkData = {
                    title: formData.title.trim(),
                    description: formData.description.trim() || '',
                    subject: formData.subject,
                    semester: formData.semester,
                    type: uploadType,
                    link: formData.link,
                    tags: formData.tags || '',
                    visibility: formData.visibility,
                    courseCode: formData.courseCode || '',
                    license: formData.license,
                    allowRatings: formData.allowRatings,
                    allowComments: formData.allowComments,
                    userId: dbUserId
                };

                try {
                    const response = await api.post('/resources/upload/link', linkData);
                    if (response.data) {
                        alert('Resource added successfully! It will be active after moderation review.');
                        resetForm();
                        fetchAllUploads(dbUserId);
                        setActiveTab('my-uploads');
                    }
                } catch (error) {
                    alert('Failed to add link: ' + (error.response?.data?.message || error.message));
                    setValidationStatus('failed');
                }
            }
        } catch (error) {
            setValidationStatus('failed');
            alert(error.response?.data?.message || error.message || 'Error uploading resource');
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
    };

    // ============= CRUD OPERATIONS =============
    const handleDelete = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;
        try {
            await api.delete(`/resources/${resourceId}`);
            fetchAllUploads(getDatabaseUserId(user));
            alert('Resource deleted successfully');
        } catch (error) {
            alert('Failed to delete resource');
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                title: editingResource.title.trim(),
                description: editingResource.description?.trim() || '',
                subject: editingResource.subject,
                semester: editingResource.semester,
                tags: editingResource.tags,
                visibility: editingResource.visibility,
                courseCode: editingResource.courseCode,
                license: editingResource.license,
                allowRatings: editingResource.allowRatings,
                allowComments: editingResource.allowComments
            };
            await api.put(`/resources/${editingResource.id}`, updatedData);
            alert('Resource updated successfully');
            setShowEditModal(false);
            fetchAllUploads(getDatabaseUserId(user));
        } catch (error) {
            alert('Failed to update resource');
        }
    };

    // ============= BOOKMARK OPERATIONS =============
    const handleBookmark = async (resourceId) => {
        try {
            const dbUserId = getDatabaseUserId(user);
            if (bookmarkedIds.has(resourceId)) {
                await api.delete(`/resources/${resourceId}/bookmark?userId=${dbUserId}`);
                setBookmarkedIds(prev => { const s = new Set(prev); s.delete(resourceId); return s; });
                alert('Bookmark removed');
            } else {
                await api.post(`/resources/${resourceId}/bookmark?userId=${dbUserId}`);
                setBookmarkedIds(prev => new Set([...prev, resourceId]));
                alert('Resource bookmarked');
            }
        } catch (error) {
            alert('Failed to update bookmark');
        }
    };

    // ============= RATING OPERATIONS =============
    const handleRate = async () => {
        if (!review.trim()) {
            alert('Please write a review before submitting.');
            return;
        }

        try {
            const dbUserId = getDatabaseUserId(user);
            const currentUser = authService.getCurrentUser();

            const newReview = {
                id: Date.now(),
                userId: dbUserId,
                userName: currentUser?.name || currentUser?.fullName || 'Anonymous User',
                userAvatar: (currentUser?.name?.charAt(0) || currentUser?.fullName?.charAt(0) || 'U').toUpperCase(),
                rating: userRating,
                review: review.trim(),
                date: new Date().toISOString(),
                helpful: 0
            };

            setUploads(prevUploads =>
                prevUploads.map(upload => {
                    if (upload.id === ratingModal.resourceId) {
                        const existingReviews = upload.reviews || [];
                        const updatedReviews = [...existingReviews, newReview];
                        const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

                        return {
                            ...upload,
                            reviews: updatedReviews,
                            averageRating: newAverageRating,
                            ratingCount: updatedReviews.length
                        };
                    }
                    return upload;
                })
            );

            alert(`Review submitted successfully!\n\nRating: ${userRating} stars\nReview: ${review}`);
            setRatingModal({ show: false, resourceId: null });
            setUserRating(5);
            setReview('');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        }
    };

    // ============= VIEW DETAILS & DOWNLOAD =============
    const handleViewDetails = (resource) => {
        setDetailsModal({ show: true, resource });
    };

    const handleDownload = async (resource) => {
        try {
            if (resource.filePath) {
                const newTab = window.open('', '_blank');

                if (!newTab) {
                    alert('Popup blocked by browser');
                    return;
                }

                await api.post(`/resources/${resource.id}/download`);
                newTab.location.href = resource.filePath;
            } else if (resource.link) {
                const newTab = window.open('', '_blank');

                if (!newTab) {
                    alert('Popup blocked by browser');
                    return;
                }

                await api.post(`/resources/${resource.id}/download`);
                newTab.location.href = resource.link;
            } else {
                alert('No file or link found for this resource');
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert(error.response?.data?.message || 'Failed to download resource');
        }
    };

    // ============= UTILITY FUNCTIONS =============
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-badge active';
            case 'pending': return 'status-badge pending';
            case 'rejected': return 'status-badge rejected';
            case 'flagged': return 'status-badge flagged';
            default: return 'status-badge';
        }
    };

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return '📄';
            case 'document': return '📝';
            case 'presentation': return '📊';
            case 'image': return '🖼️';
            case 'video': return '🎥';
            case 'link': return '🔗';
            case 'article': return '📰';
            default: return '📦';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const formatReviewDate = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} years ago`;
        } catch (e) {
            return 'Recently';
        }
    };

    const getYearText = (sem) => {
        if (sem.startsWith('Y1')) return ' (1st Year)';
        if (sem.startsWith('Y2')) return ' (2nd Year)';
        if (sem.startsWith('Y3')) return ' (3rd Year)';
        if (sem.startsWith('Y4')) return ' (4th Year)';
        return '';
    };

    // ============= REUSABLE SUBJECT SELECT =============
    const SubjectSelect = ({ value, onChange, name, className }) => (
        <select name={name} value={value} onChange={onChange} required className={className} onBlur={() => handleBlur('subject')}>
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

    const filteredUploads = uploads.filter(upload => {
        if (filter !== 'all' && upload.status !== filter) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (upload.title?.toLowerCase() || '').includes(term) ||
                (upload.subject?.toLowerCase() || '').includes(term) ||
                (upload.description?.toLowerCase() || '').includes(term);
        }
        return true;
    });

    // Helper function to render stars
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <span className="stars-container">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="star full">★</span>
                ))}
                {hasHalfStar && <span className="star half">½</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="star empty">☆</span>
                ))}
            </span>
        );
    };

    return (
        <div className="upload-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">BrainHive</div>
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div className="user-info">
                        <h4>{user?.name || user?.fullName || 'User'}</h4>
                        <p>Student</p>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Resources</h3>
                        <ul>
                            <li onClick={() => navigate('/dashboard/student')}>Discovery</li>
                            <li className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>Upload</li>
                            <li className={activeTab === 'my-uploads' ? 'active' : ''} onClick={() => setActiveTab('my-uploads')}>My Uploads</li>
                            <li onClick={() => navigate('/resources/bookmarked')}>Bookmarked</li>
                        </ul>
                    </div>
                    <div className="nav-section">
                        <h3>Peer Help</h3>
                        <ul>
                            <li onClick={() => navigate('/request-help')}>Request Help</li>
                            <li onClick={() => navigate('/find-tutors')}>Find Tutors</li>
                        </ul>
                    </div>
                    <div className="nav-section">
                        <h3>Study Groups</h3>
                        <ul>
                            <li onClick={() => navigate('/my-groups')}>My Groups</li>
                            <li onClick={() => navigate('/create-group')}>Create Group</li>
                        </ul>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="content-header">
                    <div>
                        <h1 className="page-title">
                            {activeTab === 'upload' ? 'Upload Resource' : 'My Uploads'}
                        </h1>
                        <p className="page-subtitle">
                            {activeTab === 'upload'
                                ? 'Share your study materials with the BrainHive community'
                                : "Manage all resources you've uploaded"}
                        </p>
                    </div>
                    <div className="header-actions">
                        {activeTab === 'my-uploads' && (
                            <button onClick={() => setActiveTab('upload')} className="primary-btn">
                                + Upload New
                            </button>
                        )}
                        <button onClick={() => navigate('/dashboard/student')} className="back-btn">
                            ← Dashboard
                        </button>
                    </div>
                </div>

                {activeTab === 'upload' ? (
                    <div className="upload-content">
                        {/* Type Selector */}
                        <div className="type-selector-card">
                            <h3 className="section-title">Select Resource Type</h3>
                            <div className="type-grid">
                                {[
                                    { type: 'pdf', icon: '📄', label: 'PDF' },
                                    { type: 'document', icon: '📝', label: 'Document' },
                                    { type: 'presentation', icon: '📊', label: 'Presentation' },
                                    { type: 'image', icon: '🖼️', label: 'Image' },
                                    { type: 'video', icon: '🎥', label: 'Video' },
                                    { type: 'link', icon: '🔗', label: 'Link' },
                                    { type: 'article', icon: '📰', label: 'Article' },
                                    { type: 'other', icon: '📦', label: 'Other' }
                                ].map((item) => (
                                    <button
                                        key={item.type}
                                        onClick={() => handleTypeChange(item.type)}
                                        className={`type-btn ${uploadType === item.type ? 'active' : ''}`}
                                    >
                                        <span className="type-icon">{item.icon}</span>
                                        <span className="type-label">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload Form */}
                        <form onSubmit={handleSubmit} className="upload-form">
                            <div className="form-card">
                                <h2 className="card-title">Basic Information</h2>

                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('title')}
                                        placeholder="e.g., Binary Trees Complete Notes"
                                        required
                                        className={`form-input ${formErrors.title && touched.title ? 'error' : ''}`}
                                    />
                                    {formErrors.title && touched.title && <span className="error-text">{formErrors.title}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Subject *</label>
                                        <SubjectSelect
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className={`form-select ${formErrors.subject && touched.subject ? 'error' : ''}`}
                                        />
                                        {formErrors.subject && touched.subject && <span className="error-text">{formErrors.subject}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Semester *</label>
                                        <select
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('semester')}
                                            required
                                            className={`form-select ${formErrors.semester && touched.semester ? 'error' : ''}`}
                                        >
                                            <option value="">Select Semester</option>
                                            {semesters.map(sem => (
                                                <option key={sem} value={sem}>
                                                    {sem}{getYearText(sem)}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.semester && touched.semester && <span className="error-text">{formErrors.semester}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Course Code</label>
                                        <input
                                            type="text"
                                            name="courseCode"
                                            value={formData.courseCode}
                                            onChange={handleInputChange}
                                            placeholder="e.g., CS301"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tags</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('tags')}
                                            placeholder="e.g., algorithms, exam, notes"
                                            className={`form-input ${formErrors.tags && touched.tags ? 'error' : ''}`}
                                        />
                                        <p className="input-hint">Separate with commas (max 5 tags, each max 20 characters)</p>
                                        {formErrors.tags && touched.tags && <span className="error-text">{formErrors.tags}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of this resource..."
                                        rows="3"
                                        className="form-textarea"
                                    />
                                </div>
                            </div>

                            {/* File Upload Section */}
                            {(uploadType === 'pdf' || uploadType === 'document' || uploadType === 'presentation' || uploadType === 'image') && (
                                <div className="form-card">
                                    <h2 className="card-title">Upload File</h2>
                                    <div className={`file-dropzone ${formErrors.file && touched.file ? 'error' : ''}`}>
                                        <input
                                            type="file"
                                            accept={
                                                uploadType === 'pdf' ? '.pdf' :
                                                    uploadType === 'document' ? '.doc,.docx' :
                                                        uploadType === 'presentation' ? '.ppt,.pptx' :
                                                            uploadType === 'image' ? 'image/*' : '.pdf'
                                            }
                                            onChange={handleFileChange}
                                            onBlur={() => handleBlur('file')}
                                            required
                                            className="file-input"
                                        />
                                        <div className="dropzone-content">
                                            <span className="upload-icon">📤</span>
                                            <p className="dropzone-text">Click to browse or drag and drop</p>
                                            <p className="dropzone-hint">
                                                {uploadType === 'pdf' && 'PDF files only (Max 50MB)'}
                                                {uploadType === 'document' && 'Word documents (DOC, DOCX) (Max 50MB)'}
                                                {uploadType === 'presentation' && 'PowerPoint presentations (PPT, PPTX) (Max 50MB)'}
                                                {uploadType === 'image' && 'Images (JPG, PNG, GIF) (Max 50MB)'}
                                            </p>
                                            {formData.fileName && (
                                                <div className="selected-file">
                                                    <span>📎</span>
                                                    {formData.fileName} ({formData.fileSize} MB)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {formErrors.file && touched.file && <span className="error-text">{formErrors.file}</span>}
                                    <p className="file-size-hint">Maximum file size: 50MB</p>
                                    {showPreview && formData.file && uploadType === 'image' && (
                                        <div className="preview-section">
                                            <h3 className="preview-title">Preview</h3>
                                            <img src={URL.createObjectURL(formData.file)} alt="Preview" className="image-preview" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Link Section */}
                            {(uploadType === 'link' || uploadType === 'video' || uploadType === 'article') && (
                                <div className="form-card">
                                    <h2 className="card-title">Resource Link</h2>
                                    <div className="form-group">
                                        <label className="form-label">
                                            {uploadType === 'video' ? 'Video URL *' : 'Resource URL *'}
                                        </label>
                                        <input
                                            type="url"
                                            name="link"
                                            value={formData.link}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('link')}
                                            placeholder={uploadType === 'video' ? "https://youtube.com/watch?v=..." : "https://example.com/resource"}
                                            required
                                            className={`form-input ${formErrors.link && touched.link ? 'error' : ''}`}
                                        />
                                        {formErrors.link && touched.link && <span className="error-text">{formErrors.link}</span>}
                                        {uploadType === 'video' && (
                                            <p className="input-hint">Supports YouTube, Vimeo, and other video platforms</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Settings */}
                            <div className="form-card">
                                <h2 className="card-title">Settings</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Visibility</label>
                                        <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="form-select">
                                            <option value="public">Public - Everyone can view</option>
                                            <option value="private">Private - Only me</option>
                                            <option value="study-group">Study Group Only</option>
                                            <option value="course">Same Course Only</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">License</label>
                                        <select name="license" value={formData.license} onChange={handleInputChange} className="form-select">
                                            {licenses.map(license => (
                                                <option key={license.value} value={license.value}>{license.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="allowRatings" checked={formData.allowRatings} onChange={handleInputChange} className="checkbox-input" />
                                        <span>Allow ratings and reviews</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleInputChange} className="checkbox-input" />
                                        <span>Allow comments and discussions</span>
                                    </label>
                                </div>
                            </div>

                            {/* Validation Status */}
                            {validationStatus && (
                                <div className={`validation-message ${validationStatus}`}>
                                    <div className="validation-content">
                                        {validationStatus === 'validating' && (<><div className="spinner"></div><span>Validating your resource...</span></>)}
                                        {validationStatus === 'valid' && (<><span className="status-icon">✓</span><span>Resource validated! Ready for upload.</span></>)}
                                        {validationStatus === 'failed' && (<><span className="status-icon">✗</span><span>Validation failed. Please check your resource and try again.</span></>)}
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar */}
                            {loading && uploadType !== 'link' && (
                                <div className="progress-card">
                                    <div className="progress-header">
                                        <span className="progress-label">Uploading...</span>
                                        <span className="progress-percentage">{uploadProgress}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="form-card">
                                <div className="guidelines-section">
                                    <h3 className="guidelines-title">Upload Guidelines</h3>
                                    <ul className="guidelines-list">
                                        <li>Ensure you have the rights to share the resource</li>
                                        <li>Provide accurate and descriptive titles</li>
                                        <li>Add relevant tags to help others find your resource</li>
                                        <li>Resources will be reviewed by moderators before going public</li>
                                        <li>Inappropriate content will be removed</li>
                                        <li>Maximum file size: 50MB</li>
                                    </ul>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={resetForm} className="cancel-btn">
                                        Clear Form
                                    </button>
                                    <button type="submit" disabled={loading} className="submit-btn">
                                        {loading ? `Uploading ${uploadProgress}%...` : 'Upload Resource'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* ============= MY UPLOADS SECTION ============= */
                    <div className="my-uploads-content">
                        {error && (
                            <div className="error-message">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue"><span className="icon">📚</span></div>
                                <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Uploads</div></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green"><span className="icon">✓</span></div>
                                <div><div className="stat-value">{stats.active}</div><div className="stat-label">Active</div></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon orange"><span className="icon">⏱️</span></div>
                                <div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending Review</div></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple"><span className="icon">👁️</span></div>
                                <div><div className="stat-value">{stats.views}</div><div className="stat-label">Total Views</div></div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="filters-section">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search your uploads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="filter-tabs">
                                <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({stats.total})</button>
                                <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending ({stats.pending})</button>
                                <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active ({stats.active})</button>
                            </div>
                        </div>

                        {/* Uploads Grid */}
                        {loadingUploads ? (
                            <div className="loading-spinner">Loading your uploads...</div>
                        ) : filteredUploads.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No uploads found</h3>
                                <p>
                                    {searchTerm
                                        ? `No results for "${searchTerm}"`
                                        : uploads.length === 0
                                            ? "You haven't uploaded any resources yet."
                                            : "No resources match the selected filter."}
                                </p>
                                {!searchTerm && uploads.length === 0 && (
                                    <button onClick={() => setActiveTab('upload')} className="primary-btn">
                                        Upload Your First Resource
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="uploads-grid">
                                {filteredUploads.map((upload) => (
                                    <div key={upload.id} className="resource-card" onClick={() => handleViewDetails(upload)}>
                                        <div className="resource-card-header">
                                            <div className="resource-type-icon">{getTypeIcon(upload.type)}</div>
                                            <div className="resource-card-actions">
                                                <span className={getStatusBadgeClass(upload.status)}>{upload.status || 'pending'}</span>
                                            </div>
                                        </div>
                                        <div className="resource-card-body">
                                            <h3 className="resource-card-title">{upload.title}</h3>
                                            <div className="resource-meta">
                                                <span className="resource-subject">{upload.subject}</span>
                                                <span className="resource-semester">{upload.semester}</span>
                                            </div>
                                            {upload.description && (
                                                <p className="resource-description">
                                                    {upload.description.substring(0, 100)}{upload.description.length > 100 ? '...' : ''}
                                                </p>
                                            )}
                                            {upload.tags && (
                                                <div className="resource-tags">
                                                    {upload.tags.split(',').map((tag, i) => (
                                                        <span key={i} className="tag">{tag.trim()}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="resource-stats">
                                                <div className="stat-item" title="Views"><span>👁️</span> {upload.viewCount || 0}</div>
                                                <div className="stat-item" title="Downloads"><span>📥</span> {upload.downloadCount || 0}</div>
                                                <div className="stat-item" title="Rating">
                                                    <span>⭐</span>
                                                    {upload.averageRating?.toFixed(1) || 0}
                                                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                                                        ({upload.ratingCount || 0} {upload.ratingCount === 1 ? 'review' : 'reviews'})
                                                    </span>
                                                </div>
                                                <div className="stat-item" title="Uploaded"><span>📅</span> {formatDate(upload.uploadedAt)}</div>
                                            </div>
                                        </div>
                                        <div className="resource-card-footer">
                                            <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className={`action-btn bookmark ${bookmarkedIds.has(upload.id) ? 'bookmarked' : ''}`}
                                                    onClick={() => handleBookmark(upload.id)}
                                                    title={bookmarkedIds.has(upload.id) ? "Remove Bookmark" : "Add Bookmark"}
                                                >
                                                    <span className="bookmark-icon">★</span>
                                                </button>
                                                <button
                                                    className="action-btn rate"
                                                    onClick={() => setRatingModal({ show: true, resourceId: upload.id })}
                                                    title="Rate Resource"
                                                >
                                                    Rate
                                                </button>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(upload)}
                                                    title="Edit Resource"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(upload.id)}
                                                    title="Delete Resource"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingResource && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Resource</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={editingResource.title}
                                    onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={editingResource.description || ''}
                                    onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Subject *</label>
                                <SubjectSelect
                                    name="subject"
                                    value={editingResource.subject}
                                    onChange={(e) => setEditingResource({ ...editingResource, subject: e.target.value })}
                                    className="form-select"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tags</label>
                                <input
                                    type="text"
                                    value={editingResource.tags || ''}
                                    onChange={(e) => setEditingResource({ ...editingResource, tags: e.target.value })}
                                    placeholder="Comma separated"
                                />
                                <small className="input-hint">Max 5 tags, each under 20 characters</small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal.show && (
                <div className="modal-overlay" onClick={() => setRatingModal({ show: false, resourceId: null })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Rate this Resource</h2>

                        <div className="rating-input">
                            <label>Your Rating:</label>
                            <div className="rating-stars">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${userRating >= star ? 'active' : ''}`}
                                        onClick={() => setUserRating(star)}
                                        title={`${star} star${star !== 1 ? 's' : ''}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <select value={userRating} onChange={(e) => setUserRating(parseInt(e.target.value))} className="rating-select">
                                <option value={5}>5 Stars - Excellent</option>
                                <option value={4}>4 Stars - Very Good</option>
                                <option value={3}>3 Stars - Good</option>
                                <option value={2}>2 Stars - Fair</option>
                                <option value={1}>1 Star - Poor</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Write a Review *</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="What did you think about this resource? Share your experience to help others..."
                                rows="4"
                                style={{ resize: 'vertical' }}
                                required
                            />
                            <small style={{ color: '#6b7280', fontSize: '11px', marginTop: '8px', display: 'block' }}>
                                Your review will be visible to other users and helps the community.
                            </small>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setRatingModal({ show: false, resourceId: null });
                                    setUserRating(5);
                                    setReview('');
                                }}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button type="button" onClick={handleRate} className="submit-btn">
                                Submit Rating & Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Details Modal with Reviews Section */}
            {detailsModal.show && detailsModal.resource && (
                <div className="modal-overlay" onClick={() => setDetailsModal({ show: false, resource: null })}>
                    <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="details-modal-header">
                            <div className="details-type-icon">{getTypeIcon(detailsModal.resource.type)}</div>
                            <div className="details-title-section">
                                <h2>{detailsModal.resource.title}</h2>
                                <div className="details-meta">
                                    <span className="details-subject">{detailsModal.resource.subject}</span>
                                    <span className="details-semester">{detailsModal.resource.semester}</span>
                                    <span className={getStatusBadgeClass(detailsModal.resource.status)}>{detailsModal.resource.status}</span>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={() => setDetailsModal({ show: false, resource: null })}>✕</button>
                        </div>

                        <div className="details-modal-body">
                            {detailsModal.resource.description && (
                                <div className="details-section">
                                    <h3>Description</h3>
                                    <p>{detailsModal.resource.description}</p>
                                </div>
                            )}

                            {detailsModal.resource.tags && (
                                <div className="details-section">
                                    <h3>Tags</h3>
                                    <div className="details-tags">
                                        {detailsModal.resource.tags.split(',').map((tag, i) => (
                                            <span key={i} className="tag">{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detailsModal.resource.courseCode && (
                                <div className="details-section">
                                    <h3>Course Code</h3>
                                    <p className="course-code">{detailsModal.resource.courseCode}</p>
                                </div>
                            )}

                            <div className="details-section">
                                <h3>Resource Content</h3>
                                <div className="details-content">
                                    {(detailsModal.resource.type === 'link' || detailsModal.resource.type === 'video') ? (
                                        <div className="link-preview">
                                            <div className="link-icon">🔗</div>
                                            <a href={detailsModal.resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">{detailsModal.resource.link}</a>
                                        </div>
                                    ) : detailsModal.resource.type === 'image' ? (
                                        <div className="image-preview-large">
                                            <img
                                                src={detailsModal.resource.filePath}
                                                alt={detailsModal.resource.title}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Preview+Not+Available'; }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="file-info">
                                            <div className="file-icon">📄</div>
                                            <div className="file-details">
                                                <p className="file-name">{detailsModal.resource.fileName || 'Document'}</p>
                                                <p className="file-size">{detailsModal.resource.fileSize ? `${detailsModal.resource.fileSize} MB` : 'Size not available'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Resource Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">License:</span>
                                        <span className="detail-value">{detailsModal.resource.license || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Visibility:</span>
                                        <span className="detail-value">{detailsModal.resource.visibility || 'public'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Uploaded:</span>
                                        <span className="detail-value">{formatDate(detailsModal.resource.uploadedAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Ratings:</span>
                                        <span className="detail-value">
                                            {renderStars(detailsModal.resource.averageRating || 0)}
                                            <span style={{ marginLeft: '8px' }}>⭐ {detailsModal.resource.averageRating?.toFixed(1) || 0} ({detailsModal.resource.ratingCount || 0} reviews)</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Settings</h3>
                                <div className="settings-indicators">
                                    <span className={`setting-badge ${detailsModal.resource.allowRatings ? 'enabled' : 'disabled'}`}>
                                        {detailsModal.resource.allowRatings ? '✓ Ratings Allowed' : '✗ Ratings Disabled'}
                                    </span>
                                    <span className={`setting-badge ${detailsModal.resource.allowComments ? 'enabled' : 'disabled'}`}>
                                        {detailsModal.resource.allowComments ? '💬 Comments Allowed' : '🔇 Comments Disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Statistics</h3>
                                <div className="stats-row">
                                    <div className="stat-box">
                                        <span className="stat-number">{detailsModal.resource.viewCount || 0}</span>
                                        <span className="stat-label">Views</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-number">{detailsModal.resource.downloadCount || 0}</span>
                                        <span className="stat-label">Downloads</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="details-section reviews-section">
                                <h3>
                                    Reviews & Feedback
                                    <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '10px', color: '#6b7280' }}>
                                        ({detailsModal.resource.reviews?.length || 0} {detailsModal.resource.reviews?.length === 1 ? 'review' : 'reviews'})
                                    </span>
                                </h3>

                                {detailsModal.resource.reviews && detailsModal.resource.reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {detailsModal.resource.reviews.map((review, index) => (
                                            <div key={review.id || index} className="review-item">
                                                <div className="review-header">
                                                    <div className="reviewer-avatar">
                                                        {review.userAvatar || review.userName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="reviewer-info">
                                                        <div className="reviewer-name">{review.userName || 'Anonymous User'}</div>
                                                        <div className="review-date">{formatReviewDate(review.date)}</div>
                                                    </div>
                                                    <div className="review-rating">
                                                        {renderStars(review.rating)}
                                                        <span style={{ marginLeft: '4px', fontSize: '12px', color: '#f59e0b' }}>
                                                            {review.rating}/5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="review-content">
                                                    <p>{review.review}</p>
                                                </div>
                                                <div className="review-footer">
                                                    <button className="helpful-btn" onClick={() => alert('Thanks for feedback!')}>
                                                        👍 Helpful ({review.helpful || 0})
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-reviews">
                                        <p>No reviews yet. Be the first to review this resource!</p>
                                        <button
                                            className="secondary-btn"
                                            onClick={() => {
                                                setDetailsModal({ show: false, resource: null });
                                                setRatingModal({ show: true, resourceId: detailsModal.resource.id });
                                            }}
                                            style={{ marginTop: '10px' }}
                                        >
                                            Rate the resource
                                        </button>
                                    </div>
                                )}

                                {/* Add Review Button */}
                                {detailsModal.resource.allowRatings && (
                                    <div className="add-review-button" style={{ marginTop: '16px', textAlign: 'center' }}>
                                        <button
                                            className="secondary-btn"
                                            onClick={() => {
                                                setDetailsModal({ show: false, resource: null });
                                                setRatingModal({ show: true, resourceId: detailsModal.resource.id });
                                            }}
                                        >
                                            Write a Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="details-modal-footer">
                            <button className="download-btn" onClick={() => handleDownload(detailsModal.resource)}>
                                Download Resource
                            </button>
                            <button className="close-btn" onClick={() => setDetailsModal({ show: false, resource: null })}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadResource;