import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

import heroBg from '../assets/images/brainhive-bg.jpg';
import feature1 from '../assets/images/feature1.jpg';
import feature2 from '../assets/images/feature2.jpg';
import feature3 from '../assets/images/feature3.jpg';
import feature4 from '../assets/images/feature4.jpg';
import student1 from '../assets/images/student1.jpg';
import student2 from '../assets/images/student2.jpg';
import student3 from '../assets/images/student3.jpg';
import logo from '../assets/images/logo.png';

// Counter Component for animated numbers
const AnimatedCounter = ({ targetValue, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        let start = 0;
                        const end = parseInt(targetValue);
                        const increment = end / (duration / 16);

                        const timer = setInterval(() => {
                            start += increment;
                            if (start >= end) {
                                setCount(end);
                                clearInterval(timer);
                            } else {
                                setCount(Math.floor(start));
                            }
                        }, 16);

                        return () => clearInterval(timer);
                    }
                });
            },
            { threshold: 0.3 }
        );

        const element = document.getElementById(`counter-${targetValue}`);
        if (element) observer.observe(element);

        return () => observer.disconnect();
    }, [targetValue, duration, hasAnimated]);

    return (
        <span id={`counter-${targetValue}`}>
            {count}
            {suffix}
        </span>
    );
};

// Rating Counter for 4.9/5
const RatingCounter = ({ targetValue, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        let start = 0;
                        const end = targetValue;
                        const increment = end / (duration / 16);

                        const timer = setInterval(() => {
                            start += increment;
                            if (start >= end) {
                                setCount(end);
                                clearInterval(timer);
                            } else {
                                setCount(parseFloat(start).toFixed(1));
                            }
                        }, 16);

                        return () => clearInterval(timer);
                    }
                });
            },
            { threshold: 0.3 }
        );

        const element = document.getElementById(`rating-counter`);
        if (element) observer.observe(element);

        return () => observer.disconnect();
    }, [targetValue, duration, hasAnimated]);

    return (
        <span id="rating-counter">
            {count}
            {suffix}
        </span>
    );
};

const Home = () => {
    console.log('Home component rendering');
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation on scroll
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

    return (
        <div className="home">
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo">
                       <img src={logo} alt="BrainHive Logo" className="logo-icon" />
                        BrainHive
                    </div>

                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#testimonials" className="nav-link">Testimonials</a>
                        <a href="#about" className="nav-link">About</a>
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="btn-get-started" onClick={() => navigate('/register/student')}>
                            Get Started
                        </button>
                    </div>

                    <div className="mobile-menu-btn">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                className="hero"
                style={{
                    backgroundImage: `linear-gradient(rgba(11, 18, 32, 0.70), rgba(11, 18, 32, 0.68)), url(${heroBg})`
                }}
            >
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>

                <div className="hero-content hero-content-centered">
                    <div className="hero-badge">
                        Built for modern university learning
                    </div>

                    <h1 className="hero-title">
                        One platform for <span className="gradient-text">learning</span>, sharing,
                        and <span className="gradient-text"> collaboration</span>
                    </h1>

                    <p className="hero-description">
                        BrainHive transforms your academic journey with accessible resources,
                        structured peer support, and collaborative study spaces designed to help
                        students stay organized and perform better.
                    </p>

                    <div className="bhero-buttons">
                        <button
                            className="bbtn-primary"
                            onClick={() => navigate('/register/student')}
                        >
                            Get Started for Free
                            <span className="bbtn-arrow">→</span>
                        </button>

                        <button
                            className="bbtn-secondary"
                            onClick={() =>
                                document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
                            }
                        >
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
            </section>

            {/* Stats Section with Animated Counters */}
            <section className="stats animate-on-scroll">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-icon">🎓</div>
                        <h3>
                            <AnimatedCounter targetValue={10000} suffix="+" />
                        </h3>
                        <p>Active Students</p>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">📚</div>
                        <h3>
                            <AnimatedCounter targetValue={5000} suffix="+" />
                        </h3>
                        <p>Shared Resources</p>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">👥</div>
                        <h3>
                            <AnimatedCounter targetValue={1200} suffix="+" />
                        </h3>
                        <p>Study Groups</p>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">⭐</div>
                        <h3>
                            <RatingCounter targetValue={4.9} suffix="/5" />
                        </h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features animate-on-scroll">
                <div className="section-header">
                    <h2>Everything you need to excel</h2>
                    <p className="section-subtitle">
                        Built specifically for university students to manage academic work,
                        collaborate with peers, and access learning resources in one unified workspace.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-image-wrapper">
                            <img src={feature1} alt="Resource sharing" className="feature-image" loading="lazy" />
                        </div>
                        <div className="feature-body">
                            <div className="feature-icon">🎯</div>
                            <h3>Personalized Learning</h3>
                            <p>
                                Discover relevant study materials and resources that support your
                                subjects, learning gaps, and academic goals.
                            </p>
                            <ul>
                                <li>Smart resource discovery</li>
                                <li>Progress tracking</li>
                                <li>Tailored study paths</li>
                            </ul>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-image-wrapper">
                            <img src={feature2} alt="Peer support and tutoring" className="feature-image" loading="lazy" />
                        </div>
                        <div className="feature-body">
                            <div className="feature-icon">🤝</div>
                            <h3>Peer & Tutor Support</h3>
                            <p>
                                Connect with peers and experienced student tutors to get support,
                                guidance, and help when you need it most.
                            </p>
                            <ul>
                                <li>1-on-1 tutoring sessions</li>
                                <li>Verified credibility scores</li>
                                <li>Instant help requests</li>
                            </ul>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-image-wrapper">
                            <img src={feature3} alt="Study group collaboration" className="feature-image" loading="lazy" />
                        </div>
                        <div className="feature-body">
                            <div className="feature-icon">👥</div>
                            <h3>Group Collaboration</h3>
                            <p>
                                Form study groups, share files, coordinate tasks, and stay aligned
                                with your teammates in one dedicated space.
                            </p>
                            <ul>
                                <li>Shared task boards</li>
                                <li>Group chat & files</li>
                                <li>Synchronized calendars</li>
                            </ul>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-image-wrapper">
                            <img src={feature4} alt="Academic analytics and insights" className="feature-image" loading="lazy" />
                        </div>
                        <div className="feature-body">
                            <div className="feature-icon">📊</div>
                            <h3>Analytics & Insights</h3>
                            <p>
                                Visualize study patterns, identify improvement areas, and monitor
                                academic engagement more effectively over time.
                            </p>
                            <ul>
                                <li>Performance analytics</li>
                                <li>Study time tracking</li>
                                <li>Goal achievement metrics</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials animate-on-scroll">
                <div className="section-header">
                    <h2>Loved by students</h2>
                    <p className="section-subtitle">
                        See how BrainHive is helping students learn more efficiently and collaborate
                        with confidence.
                    </p>
                </div>

                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <div className="stars">★★★★★</div>
                        <p>
                            "The tutor matching is incredibly useful. I found help for Data Structures
                            much faster than I expected."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar">
                                <img src={student1} alt="Sarah Jenkins" loading="lazy" />
                            </div>
                            <div className="author-info">
                                <strong>Sarah Jenkins</strong>
                                <span>Computer Science, Year 3</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <div className="stars">★★★★★</div>
                        <p>
                            "Our study group uses BrainHive to organize materials and tasks. It makes
                            collaboration much easier during project weeks."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar">
                                <img src={student2} alt="Marcus Chen" loading="lazy" />
                            </div>
                            <div className="author-info">
                                <strong>Marcus Chen</strong>
                                <span>Engineering, Year 2</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <div className="stars">★★★★★</div>
                        <p>
                            "The resource recommendations saved me time before finals. Everything feels
                            more organized and easier to find."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar">
                                <img src={student3} alt="Elena Rodriguez" loading="lazy" />
                            </div>
                            <div className="author-info">
                                <strong>Elena Rodriguez</strong>
                                <span>Pre-Med, Year 4</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta animate-on-scroll">
                <div className="cta-content">
                    <h2>Ready to transform your academic journey?</h2>
                    <p>
                        Join thousands of students who are already using BrainHive to learn smarter,
                        collaborate better, and achieve more.
                    </p>
                    <button
                        className="btn-primary-large"
                        onClick={() => navigate('/register/student')}
                    >
                        Start Your Journey Today
                        <span className="btn-arrow">→</span>
                    </button>
                    <p className="cta-fine-print">No credit card required • Free for students</p>
                </div>
                <div className="cta-bg-shapes"></div>
            </section>

            {/* Footer */}
            <footer id="about" className="footer">
                <div className="footer-content">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <img src={logo} alt="BrainHive Logo" className="logo-icon" />
                                BrainHive
                            </div>
                            <p>
                                One platform where students learn, share resources, get peer help,
                                and collaborate in groups.
                            </p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-links-column">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#testimonials">Testimonials</a>
                                <a href="#about">Overview</a>
                            </div>

                            <div className="footer-links-column">
                                <h4>Company</h4>
                                <a href="#about">About Us</a>
                                <a href="#features">Platform</a>
                                <a href="#testimonials">Community</a>
                            </div>

                            <div className="footer-links-column">
                                <h4>Support</h4>
                                <a href="#features">Help Center</a>
                                <a href="#testimonials">Student Stories</a>
                                <a href="#about">Privacy Policy</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-quote">
                        <p>
                            "BrainHive transforms user accounts into academic identities that drive
                            personalized learning, structured peer support, and collaborative productivity."
                        </p>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2026 BrainHive. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;