import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import api from '../services/api';
import authService from '../services/auth.service';

const Home = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState('');
    const [activeReviewIndex, setActiveReviewIndex] = useState(0);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', reviewText: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const recentReviews = reviews.slice(0, 3);

    const isLoggedIn = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    const fetchReviews = useCallback(async () => {
        try {
            setReviewsLoading(true);
            setReviewsError('');

            const reviewEndpoints = ['/peerhelp/reviews', '/peerhelp/reviews/public'];
            let loaded = false;
            let lastError = null;

            for (const endpoint of reviewEndpoints) {
                try {
                    const response = await api.get(endpoint, { params: { limit: 12 } });
                    const reviewData = response?.data?.data || [];
                    setReviews(reviewData);
                    setActiveReviewIndex((prev) => (prev >= reviewData.length ? 0 : prev));
                    loaded = true;
                    break;
                } catch (endpointError) {
                    lastError = endpointError;
                    const status = endpointError?.response?.status;
                    if (status === 404 || status === 405) {
                        continue;
                    }
                    throw endpointError;
                }
            }

            if (!loaded && lastError) {
                throw lastError;
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
            setReviewsError('Unable to load reviews right now. Please try again soon.');
        } finally {
            setReviewsLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        if (reviews.length <= 1) return undefined;
        const timer = setInterval(() => {
            setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [reviews]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const validateReviewForm = () => {
        const errors = {};
        if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
            errors.rating = 'Rating must be between 1 and 5';
        }
        if (!reviewForm.title || reviewForm.title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters';
        }
        if (reviewForm.title && reviewForm.title.trim().length > 120) {
            errors.title = 'Title must be at most 120 characters';
        }
        if (!reviewForm.reviewText || reviewForm.reviewText.trim().length < 10) {
            errors.reviewText = 'Review must be at least 10 characters';
        }
        if (reviewForm.reviewText && reviewForm.reviewText.trim().length > 1200) {
            errors.reviewText = 'Review must be at most 1200 characters';
        }
        return errors;
    };

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        setFormSuccess('');

        const validationErrors = validateReviewForm();
        setFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            setIsSubmittingReview(true);
            const response = await api.post('/peerhelp/reviews', {
                rating: Number(reviewForm.rating),
                title: reviewForm.title.trim(),
                reviewText: reviewForm.reviewText.trim()
            });

            const createdReview = response?.data?.data;
            if (createdReview) {
                setReviews((prev) => {
                    const withoutDuplicate = prev.filter((item) => item.id !== createdReview.id);
                    return [createdReview, ...withoutDuplicate].slice(0, 12);
                });
                setActiveReviewIndex(0);
            }

            setReviewForm({ rating: 5, title: '', reviewText: '' });
            setFormErrors({});
            setFormSuccess('Thanks. Your review was submitted successfully.');
            await fetchReviews();
            setActiveReviewIndex(0);
        } catch (error) {
            console.error('Failed to submit review', error);
            const responseData = error?.response?.data;
            const validationErrors = responseData?.data;
            const firstValidationMessage = validationErrors && typeof validationErrors === 'object'
                ? Object.values(validationErrors).find((value) => typeof value === 'string')
                : '';
            const message = firstValidationMessage
                || responseData?.message
                || 'Could not submit review right now. Please try again.';
            setFormErrors({ submit: message });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const renderStars = (rating) => {
        const safe = Math.max(1, Math.min(5, rating || 0));
        return '★'.repeat(safe) + '☆'.repeat(5 - safe);
    };

    const handleStarSelect = (value) => {
        setReviewForm((prev) => ({ ...prev, rating: value }));
        setFormErrors((prev) => ({ ...prev, rating: undefined }));
    };

    const formatRole = (role) => {
        if (!role) return 'Member';
        return role
            .toLowerCase()
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    };

    const formatReviewDate = (isoDate) => {
        if (!isoDate) return '';
        try {
            return new Date(isoDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    return (
        <div className="home">
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo">
                        <span className="logo-icon">🧠</span>
                        BrainHive
                    </div>
                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#testimonials" className="nav-link">Testimonials</a>
                        <a href="#about" className="nav-link">About</a>
                        <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
                        <button className="btn-get-started" onClick={() => navigate('/register/student')}>Get Started</button>
                    </div>
                    <div className="mobile-menu-btn">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-badge">🎓 The Ultimate Student Platform</div>
                    <h1 className="hero-title">
                        One platform for <span className="gradient-text">learning</span>,
                        sharing, and <span className="gradient-text">collaboration</span>
                    </h1>
                    <p className="hero-description">
                        BrainHive transforms your academic journey with personalized learning paths,
                        structured peer support, and collaborative study groups. Join thousands of
                        students who are already excelling.
                    </p>
                    <div className="bhero-buttons">
                        <button className="bbtn-primary" onClick={() => navigate('/register/student')}>
                            Get Started for Free
                            <span className="bbtn-arrow">→</span>
                        </button>
                        <button className="bbtn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Explore Features
                        </button>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="stat-number">10K+</div>
                            <div className="bstat-label">Active Students</div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-number">5K+</div>
                            <div className="bstat-label">Resources Shared</div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-number">1.2K+</div>
                            <div className="bstat-label">Study Groups</div>
                        </div>
                    </div>
                </div>
                <div className="hero-illustration">
                    <div className="illustration-card">
                        <div className="card-header">
                            <div className="card-dot red"></div>
                            <div className="card-dot yellow"></div>
                            <div className="card-dot green"></div>
                        </div>
                        <div className="card-content">
                            <div className="activity-item">
                                <span className="activity-icon">📚</span>
                                <span>New resource shared: Data Structures</span>
                            </div>
                            <div className="activity-item">
                                <span className="activity-icon">👥</span>
                                <span>Study group created: Algorithms</span>
                            </div>
                            <div className="activity-item">
                                <span className="activity-icon">🤝</span>
                                <span>Peer help request answered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="stats animate-on-scroll">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-icon">🎓</div>
                        <h3>10,000+</h3>
                        <p>Active Students</p>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">📚</div>
                        <h3>5,000+</h3>
                        <p>Shared Resources</p>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">👥</div>
                        <h3>1,200+</h3>
                        <p>Study Groups</p>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">⭐</div>
                        <h3>4.9/5</h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            </section>

            <section id="features" className="features animate-on-scroll">
                <div className="section-header">
                    <h2>Everything you need to excel</h2>
                    <p className="section-subtitle">Built specifically for university students to manage their academic life in one unified workspace.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Personalized Learning</h3>
                        <p>Your academic profile adapts to your strengths and weaknesses, recommending resources exactly when you need them.</p>
                        <ul>
                            <li>✓ Smart resource discovery</li>
                            <li>✓ Progress tracking</li>
                            <li>✓ Tailored study paths</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3>Peer & Tutor Support</h3>
                        <p>Get unstuck faster by connecting with verified peer tutors who have excelled in your exact courses.</p>
                        <ul>
                            <li>✓ 1-on-1 tutoring sessions</li>
                            <li>✓ Verified credibility scores</li>
                            <li>✓ Instant help requests</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Group Collaboration</h3>
                        <p>Form study groups, share files, manage tasks, and coordinate schedules seamlessly in one dedicated space.</p>
                        <ul>
                            <li>✓ Shared task boards</li>
                            <li>✓ Group chat & files</li>
                            <li>✓ Synchronized calendars</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Analytics & Insights</h3>
                        <p>Track your study habits, identify improvement areas, and visualize your academic progress over time.</p>
                        <ul>
                            <li>✓ Performance analytics</li>
                            <li>✓ Study time tracking</li>
                            <li>✓ Goal achievement metrics</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section id="testimonials" className="testimonials reviews-section animate-on-scroll">
                <div className="section-header">
                    <h2>Student Reviews</h2>
                    <p className="section-subtitle">Real feedback from students and tutors using BrainHive every day.</p>
                </div>

                <div className="review-slider-shell">
                    <div className="review-slider-viewport">
                        {reviewsLoading && <div className="review-empty-state">Loading reviews...</div>}
                        {!reviewsLoading && reviewsError && <div className="review-empty-state review-error">{reviewsError}</div>}
                        {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                            <div className="review-empty-state">No reviews yet. Be the first to share your experience.</div>
                        )}

                        {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                            <div className="review-slide-card">
                                <div className="quote-icon">"</div>
                                <div className="stars">{renderStars(reviews[activeReviewIndex]?.rating)}</div>
                                <h3 className="review-title">{reviews[activeReviewIndex]?.title}</h3>
                                <p>"{reviews[activeReviewIndex]?.reviewText}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{(reviews[activeReviewIndex]?.reviewerName || 'U').charAt(0).toUpperCase()}</div>
                                    <div className="author-info">
                                        <strong>{reviews[activeReviewIndex]?.reviewerName}</strong>
                                        <span>
                                            {formatRole(reviews[activeReviewIndex]?.reviewerRole)}
                                            {reviews[activeReviewIndex]?.createdAt ? ` • ${formatReviewDate(reviews[activeReviewIndex]?.createdAt)}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!reviewsLoading && !reviewsError && reviews.length > 1 && (
                    <div className="review-dots">
                        {reviews.map((review, index) => (
                            <button
                                key={review.id || index}
                                className={`review-dot ${index === activeReviewIndex ? 'active' : ''}`}
                                onClick={() => setActiveReviewIndex(index)}
                                aria-label={`Go to review ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                )}

                {!reviewsLoading && !reviewsError && recentReviews.length > 0 && (
                    <div className="review-recent-grid">
                        {recentReviews.map((review, index) => (
                            <article key={review.id || `recent-${index}`} className="review-recent-card">
                                <div className="stars">{renderStars(review.rating)}</div>
                                <h4>{review.title}</h4>
                                <p>{review.reviewText}</p>
                                <div className="review-recent-meta">
                                    <strong>{review.reviewerName || 'User'}</strong>
                                    <span>
                                        {formatRole(review.reviewerRole)}
                                        {review.createdAt ? ` • ${formatReviewDate(review.createdAt)}` : ''}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className="review-form-wrap">
                    <div className="review-form-header">
                        <h3>Share Your Review</h3>
                        <p>
                            {isLoggedIn
                                ? `Logged in as ${currentUser?.name || currentUser?.email || 'User'}. Your review helps other learners decide faster.`
                                : 'Login first to submit your review.'}
                        </p>
                    </div>

                    <form className="review-form" onSubmit={handleReviewSubmit}>
                        <div className="review-form-row">
                            <label htmlFor="review-rating">Rating</label>
                            <div id="review-rating" className="rating-stars-input" role="radiogroup" aria-label="Select rating">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={reviewForm.rating === value}
                                        className={`rating-star-btn ${value <= reviewForm.rating ? 'filled' : ''}`}
                                        onClick={() => handleStarSelect(value)}
                                        title={`${value} star${value > 1 ? 's' : ''}`}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span className="rating-label">{reviewForm.rating}.0 out of 5</span>
                            </div>
                            {formErrors.rating && <span className="review-field-error">{formErrors.rating}</span>}
                        </div>

                        <div className="review-form-row">
                            <label htmlFor="review-title">Title</label>
                            <input
                                id="review-title"
                                type="text"
                                maxLength={120}
                                placeholder="Summarize your experience"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                            />
                            {formErrors.title && <span className="review-field-error">{formErrors.title}</span>}
                        </div>

                        <div className="review-form-row">
                            <label htmlFor="review-text">Review</label>
                            <textarea
                                id="review-text"
                                rows="4"
                                maxLength={1200}
                                placeholder="Tell others what worked for you"
                                value={reviewForm.reviewText}
                                onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewText: e.target.value }))}
                            ></textarea>
                            <div className="review-char-counter">{reviewForm.reviewText.length}/1200</div>
                            {formErrors.reviewText && <span className="review-field-error">{formErrors.reviewText}</span>}
                        </div>

                        {formErrors.submit && <div className="review-submit-error">{formErrors.submit}</div>}
                        {formSuccess && <div className="review-submit-success">{formSuccess}</div>}

                        <button type="submit" className="btn-primary-large review-submit-btn" disabled={isSubmittingReview}>
                            {isLoggedIn
                                ? (isSubmittingReview ? 'Submitting...' : 'Submit Review')
                                : 'Login to Submit Review'}
                        </button>
                    </form>
                </div>
            </section>

            <section className="cta animate-on-scroll">
                <div className="cta-content">
                    <h2>Ready to transform your academic journey?</h2>
                    <p>Join thousands of students who are already using BrainHive to learn smarter, collaborate better, and achieve more.</p>
                    <button className="btn-primary-large" onClick={() => navigate('/register/student')}>
                        Start Your Journey Today
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
                <div className="cta-bg-shapes"></div>
            </section>

            <footer className="footer" id="about">
                <div className="footer-content">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <span className="logo-icon">🧠</span>
                                BrainHive
                            </div>
                            <p>One platform where students learn, share resources, get peer help, and collaborate in groups.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-links-column">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#testimonials">Testimonials</a>
                                <a href="#">Pricing</a>
                            </div>
                            <div className="footer-links-column">
                                <h4>Company</h4>
                                <a href="#">About Us</a>
                                <a href="#">Blog</a>
                                <a href="#">Careers</a>
                            </div>
                            <div className="footer-links-column">
                                <h4>Support</h4>
                                <a href="#">Help Center</a>
                                <a href="#">Contact Us</a>
                                <a href="#">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-quote">
                        <p>"BrainHive transforms user accounts into academic identities that drive personalized learning, structured peer support, and collaborative productivity."</p>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 BrainHive. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;