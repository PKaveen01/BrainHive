import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    console.log('Home component rendering');
    const navigate = useNavigate();

    return (
        <div className="home">
            {/* Navigation */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">BrainHive</div>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#testimonials">Testimonials</a>
                        <a href="#about">About</a>
                        <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
                        <button className="btn-get-started" onClick={() => navigate('/register')}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>One platform for learning, sharing, and collaboration</h1>
                    <p>BrainHive transforms your academic journey with personalized learning paths, structured peer support, and collaborative study groups.</p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/register')}>Get Started for Free →</button>
                        <button className="btn-secondary">Explore Features</button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3>10,000+</h3>
                        <p>Active Students</p>
                    </div>
                    <div className="stat-item">
                        <h3>5,000+</h3>
                        <p>Shared Resources</p>
                    </div>
                    <div className="stat-item">
                        <h3>1,200+</h3>
                        <p>Study Groups</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <h2>Everything you need to excel</h2>
                <p className="features-subtitle">Built specifically for university students to manage their academic life in one unified workspace.</p>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Personalized Learning</h3>
                        <p>Your academic profile adapts to your strengths and weaknesses, recommending resources exactly when you need them.</p>
                        <ul>
                            <li>✓ Smart resource discovery</li>
                            <li>✓ Progress tracking</li>
                            <li>✓ Tailored study paths</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3>Peer & Tutor Support</h3>
                        <p>Get unstuck faster by connecting with verified peer tutors who have excelled in your exact courses.</p>
                        <ul>
                            <li>✓ 1-on-1 tutoring sessions</li>
                            <li>✓ Verified credibility scores</li>
                            <li>✓ Instant help requests</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3>Group Collaboration</h3>
                        <p>Form study groups, share files, manage tasks, and coordinate schedules seamlessly in one dedicated space.</p>
                        <ul>
                            <li>✓ Shared task boards</li>
                            <li>✓ Group chat & files</li>
                            <li>✓ Synchronized calendars</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials">
                <h2>Loved by students</h2>
                <p className="testimonials-subtitle">See how BrainHive is changing the way students learn and collaborate.</p>
                
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="stars">🌟🌟🌟</div>
                        <p>"The tutor matching is incredible. I found someone who explained Data Structures in a way that finally clicked for me."</p>
                        <div className="testimonial-author">
                            <strong>Sarah Jenkins</strong>
                            <span>Computer Science, Year 3</span>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="stars">🌟🌟🌟</div>
                        <p>"Our study group uses the task board to manage our final project. It's so much better than messy group chats."</p>
                        <div className="testimonial-author">
                            <strong>Marcus Chen</strong>
                            <span>Engineering, Year 2</span>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="stars">🌟🌟🌟</div>
                        <p>"The personalized resource recommendations saved me hours of searching for good study materials before finals."</p>
                        <div className="testimonial-author">
                            <strong>Elena Rodriguez</strong>
                            <span>Pre-Med, Year 4</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">BrainHive</div>
                    <p className="footer-quote">"BrainHive transforms user accounts into academic identities that drive personalized learning, structured peer support, and collaborative productivity."</p>
                </div>
            </footer>
        </div>
    );
};

// THIS IS CRITICAL - MUST BE AT THE BOTTOM!
export default Home;