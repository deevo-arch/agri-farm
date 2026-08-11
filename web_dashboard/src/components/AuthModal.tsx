import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import '../styles/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        if (email === 'admin@amu.gov' && password === 'admin123') {
          localStorage.setItem('amu_auth', 'ok');
          navigate('/dashboard');
        } else {
          alert('Invalid credentials. Use admin@amu.gov / admin123');
          setIsLoading(false);
        }
      } else {
        if (password === confirmPassword) {
          alert('Registration successful! Please login.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setIsLoading(false);
        } else {
          alert('Passwords do not match!');
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  React.useEffect(() => {
    setMode(initialMode);
    resetForm();
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="auth-overlay" onClick={onClose} />

      <div className="auth-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-inner-grid">
          {/* Left Column - Branding & Tabs */}
          <div className="modal-left-col">
            <div className="modal-logo-icon">
              <ShieldCheck size={36} strokeWidth={2.2} />
            </div>
            <h2>Agri Farm Portal</h2>
            <p>Antimicrobial & Farm Usage Management System</p>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
                disabled={isLoading}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
                disabled={isLoading}
              >
                Register
              </button>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="modal-right-col">
            <form onSubmit={handleSubmit} className="modal-form" key={mode}>
              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="fullname">Full Name</label>
                  <input
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <button type="submit" className="modal-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="modal-spinner"></span>
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {mode === 'login' && (
              <div className="modal-footer">
                <a href="#forgot-password">Forgot Password?</a>
                <div className="modal-divider">•</div>
                <a href="#help">Need Help?</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
