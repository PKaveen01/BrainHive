import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

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

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-badge">
                        🎓 The Ultimate Student Platform
                    </div>
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

            {/* Stats Section */}
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

            {/* Features Section */}
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

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials animate-on-scroll">
                <div className="section-header">
                    <h2>Loved by students</h2>
                    <p className="section-subtitle">See how BrainHive is changing the way students learn and collaborate.</p>
                </div>
                
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <div className="stars">★★★★★</div>
                        <p>"The tutor matching is incredible. I found someone who explained Data Structures in a way that finally clicked for me."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar">SJ</div>
                            <div className="author-info">
                                <strong>Sarah Jenkins</strong>
                                <span>Computer Science, Year 3</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <div className="stars">★★★★★</div>
                        <p>"Our study group uses the task board to manage our final project. It's so much better than messy group chats."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar">MC</div>
                            <div className="author-info">
                                <strong>Marcus Chen</strong>
                                <span>Engineering, Year 2</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <div className="stars">★★★★★</div>
                        <p>"The personalized resource recommendations saved me hours of searching for good study materials before finals."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar">ER</div>
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
                    <p>Join thousands of students who are already using BrainHive to learn smarter, collaborate better, and achieve more.</p>
                    <button className="btn-primary-large" onClick={() => navigate('/register/student')}>
                        Start Your Journey Today
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
                <div className="cta-bg-shapes"></div>
            </section>

            {/* Footer */}
            <footer className="footer">
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