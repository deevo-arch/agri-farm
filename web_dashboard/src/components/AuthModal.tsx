import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext, UserRole } from "../context/AuthContext";
import ParticleText from "./ParticleText";
import BorderGlow from "./BorderGlow";
import ReflectiveCard from "./ReflectiveCard";
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Wheat
} from "lucide-react";
import "../styles/AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login'
}: AuthModalProps) {
  const navigate = useNavigate();
  const { loginWithPassword, registerUser, getRoleForEmail, sendOtp, verifyOtpAndLogin } = useAuthContext();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Random ID Number generated per modal session
  const randomSecurityId = useMemo(() => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    return `${part1}-${part2}-${part3}`;
  }, [isOpen]);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setOtpMessage(null);
    setOtpSent(false);
  }, [initialMode, isOpen]);

  // Real-time email role detection during login
  const detectedRole = useMemo(() => {
    if (mode === 'login' && email.trim()) {
      return getRoleForEmail(email.trim());
    }
    return null;
  }, [email, mode, getRoleForEmail]);

  if (!isOpen) return null;

  const handleFillDemo = (demoEmail: string, role: UserRole) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword("admin123");
    setAuthMethod("password");
    setSelectedRole(role);
    setErrorMessage(null);
    setOtpMessage(null);
  };

  const handleSendOtp = () => {
    if (!email) {
      setErrorMessage("Please enter your email address first.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    
    setTimeout(() => {
      const res = sendOtp(email);
      setIsLoading(false);
      if (res.success) {
        setOtpSent(true);
        setOtpMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setOtpMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        if (authMethod === 'password') {
          const res = loginWithPassword(email, password);
          setIsLoading(false);
          if (res.success) {
            onClose();
            navigate('/dashboard');
          } else {
            setErrorMessage(res.message || "Invalid credentials. Use demo accounts or register a new account.");
          }
        } else {
          // OTP Login
          const res = verifyOtpAndLogin(email, otpCode);
          setIsLoading(false);
          if (res.success) {
            onClose();
            navigate('/dashboard');
          } else {
            setErrorMessage(res.message || "Invalid OTP code. Use demo code: 123456");
          }
        }
      } else {
        // REGISTRATION MODE
        if (authMethod === 'password') {
          if (password !== confirmPassword) {
            setIsLoading(false);
            setErrorMessage("Passwords do not match!");
            return;
          }
          const res = registerUser(email, password, fullName, selectedRole);
          setIsLoading(false);
          if (res.success) {
            onClose();
            navigate('/dashboard');
          } else {
            setErrorMessage(res.message || "Registration failed");
          }
        } else {
          // OTP Register
          const res = verifyOtpAndLogin(email, otpCode);
          setIsLoading(false);
          if (res.success) {
            onClose();
            navigate('/dashboard');
          } else {
            setErrorMessage(res.message || "Invalid OTP code. Use demo code: 123456");
          }
        }
      }
    }, 400);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setOtpMessage(null);
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return <span className="detected-role-badge badge-farmer"><Wheat size={12} /> Farmer Account Detected</span>;
      case 'vet':
        return <span className="detected-role-badge badge-vet"><Stethoscope size={12} /> Vet Account Detected</span>;
      case 'authority':
        return <span className="detected-role-badge badge-admin"><ShieldCheck size={12} /> Admin Account Detected</span>;
    }
  };

  // Dynamic values for ReflectiveCard
  const cardUserName = mode === 'register'
    ? (fullName.trim() ? fullName.toUpperCase() : "NEW APPLICANT")
    : (email.trim() ? email.toUpperCase() : "USER@AGRIFARM.GOV");

  const cardUserRole = mode === 'register'
    ? (selectedRole === 'farmer' ? "FARMER WORKSPACE" : selectedRole === 'vet' ? "VETERINARIAN HUB" : "ADMIN AUTHORITY")
    : "AGRI FARM";

  return (
    <div className="auth-overlay">
      <div className="auth-landscape-modal-wrapper">
        {/* Floating Always-Visible Top-Right Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <BorderGlow
          colors={['#8b5cf6', '#c084fc', '#38bdf8']}
          backgroundColor="#13111c"
          borderRadius={24}
          glowRadius={30}
          glowIntensity={1.0}
        >
          <div className="auth-landscape-modal">
            <div className="landscape-modal-grid">
              {/* LEFT COLUMN: HERO GRAPHICS WITH REFLECTIVE CARD */}
              <div className="landscape-left-hero">
                <div className="particle-text-container-modal">
                  <ParticleText
                    text="Agri Farm"
                    particleSize={1.8}
                    density={3}
                    color="#ffffff"
                    highlightColor="#8b5cf6"
                    scatter={100}
                    gatherDuration={1200}
                    stagger={250}
                    pointerRepel={35}
                    repelRadius={80}
                    idleDrift={0.6}
                    trigger="hover"
                    fontSize="2rem"
                    fontWeight={800}
                    fontFamily="inherit"
                    glow
                  />
                </div>

                {/* REACT BITS REFLECTIVE CARD COMPONENT */}
                <div className="reflective-card-wrapper-modal">
                  <ReflectiveCard
                    userName={cardUserName}
                    userRole={cardUserRole}
                    idNumber={randomSecurityId}
                    overlayColor="rgba(0, 0, 0, 0.2)"
                    blurStrength={10}
                    glassDistortion={15}
                    metalness={0.8}
                    roughness={0.5}
                    displacementStrength={25}
                    noiseScale={1.5}
                    specularConstant={2.0}
                    grayscale={0.5}
                    color="#ffffff"
                  />
                </div>

                <div className="hero-footer-note">
                  <span>📧 Secure Email Verification Active</span>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE FORM */}
              <div className="landscape-right-form">
                {/* Quick Demo Credentials Bar */}
                <div className="demo-accounts-bar neu-inset">
                  <div className="demo-title">
                    <Sparkles size={14} className="text-violet-400" />
                    <span>1-Click Demo Accounts (Password: <strong>admin123</strong>):</span>
                  </div>
                  <div className="demo-buttons">
                    <button
                      type="button"
                      className="demo-chip neu-btn"
                      onClick={() => handleFillDemo('admin@amu.gov', 'authority')}
                    >
                      <span className="demo-chip-icon">🛡️</span> Admin
                    </button>
                    <button
                      type="button"
                      className="demo-chip neu-btn"
                      onClick={() => handleFillDemo('farmer@amu.gov', 'farmer')}
                    >
                      <span className="demo-chip-icon">🌾</span> Farmer
                    </button>
                    <button
                      type="button"
                      className="demo-chip neu-btn"
                      onClick={() => handleFillDemo('vet@amu.gov', 'vet')}
                    >
                      <span className="demo-chip-icon">🩺</span> Vet
                    </button>
                  </div>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="auth-mode-tabs neu-inset">
                  <button
                    className={`mode-tab ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => switchMode('login')}
                    disabled={isLoading}
                  >
                    Sign In
                  </button>
                  <button
                    className={`mode-tab ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => switchMode('register')}
                    disabled={isLoading}
                  >
                    Create Account
                  </button>
                </div>

                {/* Auth Method Switcher (Password vs Email OTP) */}
                <div className="auth-method-selector">
                  <button
                    type="button"
                    className={`method-btn ${authMethod === 'password' ? 'active' : ''}`}
                    onClick={() => setAuthMethod('password')}
                  >
                    <Lock size={13} /> Password Login
                  </button>
                  <button
                    type="button"
                    className={`method-btn ${authMethod === 'otp' ? 'active' : ''}`}
                    onClick={() => setAuthMethod('otp')}
                  >
                    <Mail size={13} /> Email OTP
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="modal-form">
                  {errorMessage && (
                    <div className="auth-alert alert-error neu-inset">
                      <AlertCircle size={15} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {otpMessage && (
                    <div className="auth-alert alert-success neu-inset">
                      <CheckCircle2 size={15} />
                      <span>{otpMessage}</span>
                    </div>
                  )}

                  {/* REGISTRATION ONLY ROLE PICKER WITH BORDER GLOW CARDS */}
                  {mode === 'register' && (
                    <div className="role-selection-section">
                      <label className="section-label">Choose Account Role (Required on Registration):</label>
                      <div className="role-cards-grid">
                        <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={12}>
                          <div
                            className={`role-card neu-btn ${selectedRole === 'farmer' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('farmer')}
                          >
                            <div className="role-icon">🌾</div>
                            <div className="role-info">
                              <h4>Farmer</h4>
                              <p>Livestock & treatments</p>
                            </div>
                          </div>
                        </BorderGlow>

                        <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={12}>
                          <div
                            className={`role-card neu-btn ${selectedRole === 'vet' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('vet')}
                          >
                            <div className="role-icon">🩺</div>
                            <div className="role-info">
                              <h4>Veterinarian</h4>
                              <p>Prescriptions & logs</p>
                            </div>
                          </div>
                        </BorderGlow>

                        <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={12}>
                          <div
                            className={`role-card neu-btn ${selectedRole === 'authority' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('authority')}
                          >
                            <div className="role-icon">🛡️</div>
                            <div className="role-info">
                              <h4>Admin</h4>
                              <p>Full system control</p>
                            </div>
                          </div>
                        </BorderGlow>
                      </div>
                    </div>
                  )}

                  {/* Full Name for Registration */}
                  {mode === 'register' && (
                    <div className="form-group">
                      <label htmlFor="fullname">Full Name</label>
                      <div className="input-wrapper neu-inset">
                        <User size={15} className="input-icon" />
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
                    </div>
                  )}

                  {/* Email Address */}
                  <div className="form-group">
                    <div className="label-with-detected">
                      <label htmlFor="email">Email Address</label>
                      {mode === 'login' && detectedRole && renderRoleBadge(detectedRole)}
                    </div>
                    <div className="input-wrapper neu-inset">
                      <Mail size={15} className="input-icon" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field (If Password mode) */}
                  {authMethod === 'password' && (
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-wrapper neu-inset">
                        <Lock size={15} className="input-icon" />
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password (e.g. admin123)"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password (If Registering with Password) */}
                  {mode === 'register' && authMethod === 'password' && (
                    <div className="form-group">
                      <label htmlFor="confirm-password">Confirm Password</label>
                      <div className="input-wrapper neu-inset">
                        <Lock size={15} className="input-icon" />
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  {/* OTP Section (If OTP Mode) */}
                  {authMethod === 'otp' && (
                    <div className="otp-group-container">
                      <div className="otp-request-row">
                        <button
                          type="button"
                          className="send-otp-btn neu-btn"
                          onClick={handleSendOtp}
                          disabled={isLoading || !email}
                        >
                          {otpSent ? 'Resend Email OTP' : 'Send Free Email OTP'}
                        </button>
                      </div>

                      <div className="form-group">
                        <label htmlFor="otp">Enter 6-Digit OTP</label>
                        <div className="input-wrapper neu-inset">
                          <Lock size={15} className="input-icon" />
                          <input
                            id="otp"
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Enter 6-digit code (e.g. 123456)"
                            maxLength={6}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="modal-submit-btn btn-primary-neu"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>
                          {mode === 'login'
                            ? (detectedRole ? `Sign In (${detectedRole.toUpperCase()})` : 'Sign In')
                            : `Create ${selectedRole.toUpperCase()} Account`}
                        </span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
