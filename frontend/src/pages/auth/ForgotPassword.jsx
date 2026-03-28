import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dummy OTP (in real app, this would be sent to email)
    const dummyOTP = '123456';

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Simulate API call
        setTimeout(() => {
            if (email && email.includes('@')) {
                setSuccess(`Verification code sent to ${email}`);
                setStep(2);
            } else {
                setError('Please enter a valid email address');
            }
            setLoading(false);
        }, 1000);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Simulate API call
        setTimeout(() => {
            if (otp === dummyOTP) {
                setSuccess('OTP verified successfully!');
                setStep(3);
            } else {
                setError('Invalid verification code. Please try again.');
            }
            setLoading(false);
        }, 1000);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Simulate API call
        setTimeout(() => {
            if (newPassword.length < 6) {
                setError('Password must be at least 6 characters long');
                setLoading(false);
                return;
            }
            
            if (newPassword !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            
            setSuccess('Password reset successfully! Redirecting to login...');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
            setLoading(false);
        }, 1000);
    };

    const handleResendOTP = () => {
        setLoading(true);
        setTimeout(() => {
            setSuccess('New verification code sent to your email');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🧠 BrainHive</div>
                    <h2>Reset Password</h2>
                    <p className="auth-subtitle">
                        {step === 1 && "Enter your email to receive a verification code"}
                        {step === 2 && "Enter the verification code sent to your email"}
                        {step === 3 && "Create a new password for your account"}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="progress-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Email</div>
                    </div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Verify</div>
                    </div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Reset</div>
                    </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✓</span>
                        {success}
                    </div>
                )}

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-icon">
                                <span className="icon">📧</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <small className="form-hint">
                                Enter the email you used to register
                            </small>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>

                        <div className="auth-footer">
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={() => navigate('/login')}
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="auth-form">
                        <div className="form-group">
                            <label>Verification Code</label>
                            <div className="input-icon">
                                <span className="icon">🔐</span>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <small className="form-hint">
                                We've sent a 6-digit code to {email}
                            </small>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <div className="resend-section">
                            <p>Didn't receive the code?</p>
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={handleResendOTP}
                                disabled={loading}
                            >
                                Resend Code
                            </button>
                        </div>

                        <div className="auth-footer">
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={() => setStep(1)}
                            >
                                ← Use different email
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-icon">
                                <span className="icon">🔒</span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <small className="form-hint">
                                Minimum 6 characters
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-icon">
                                <span className="icon">✓</span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="password-requirements">
                            <p>Password must contain:</p>
                            <ul>
                                <li className={newPassword.length >= 6 ? 'valid' : ''}>
                                    ✓ At least 6 characters
                                </li>
                                <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                                    ✓ At least one uppercase letter
                                </li>
                                <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                                    ✓ At least one number
                                </li>
                            </ul>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <div className="auth-footer">
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={() => navigate('/login')}
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* Help Section */}
                <div className="help-section">
                    <p>Need help?</p>
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={() => window.location.href = 'mailto:support@brainhive.com'}
                    >
                        Contact Support
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="auth-decoration">
                <div className="decoration-circle"></div>
                <div className="decoration-circle-2"></div>
            </div>
        </div>
    );
};

export default ForgotPassword;