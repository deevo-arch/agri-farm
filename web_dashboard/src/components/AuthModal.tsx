import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext, UserRole } from "../context/AuthContext";
import { validateAndRedeemAdminCode } from "../services/adminInviteService";
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
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Wheat,
  ShoppingCart,
  KeyRound
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
  const { loginWithPassword, registerUser, verifyOtp, resendConfirmationEmail } = useAuthContext();

  const [mode, setMode] = useState<'login' | 'register' | 'verify-otp'>(initialMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [adminInviteCode, setAdminInviteCode] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setSuccessMessage(null);
    setOtpCode('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'verify-otp') {
        if (!otpCode || !otpCode.trim()) {
          setErrorMessage("Please enter valid verification code");
          setIsLoading(false);
          return;
        }
        const res = await verifyOtp(email, otpCode.trim());
        if (res.success) {
          onClose();
          if (selectedRole === 'farmer') {
            navigate('/farmer-verification');
          } else if (selectedRole === 'vet') {
            navigate('/vet-verification');
          } else {
            navigate('/dashboard');
          }
        } else {
          setErrorMessage(res.message || "Invalid OTP code");
        }
      } else if (mode === 'login') {
        const res = await loginWithPassword(email, password);
        if (res.success) {
          onClose();
          navigate('/dashboard');
        } else {
          setErrorMessage(res.message || "Invalid credentials.");
        }
      } else {
        // REGISTRATION
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match!");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }
        if (selectedRole === 'authority') {
          const check = validateAndRedeemAdminCode(adminInviteCode, email);
          if (!check.success) {
            setErrorMessage(check.message);
            setIsLoading(false);
            return;
          }
        }
        const res = await registerUser(email, password, fullName, selectedRole);
        if (res.success) {
          // Switch to OTP Verification screen
          setMode('verify-otp');
          setSuccessMessage("Verification email sent! Enter the 6-digit code or click confirmation link.");
        } else {
          setErrorMessage(res.message || "Registration failed");
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    }

    setIsLoading(false);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return <span className="detected-role-badge badge-farmer"><Wheat size={12} /> Farmer</span>;
      case 'vet':
        return <span className="detected-role-badge badge-vet"><Stethoscope size={12} /> Veterinarian</span>;
      case 'authority':
        return <span className="detected-role-badge badge-admin"><ShieldCheck size={12} /> Admin</span>;
      case 'consumer':
        return <span className="detected-role-badge badge-consumer"><ShoppingCart size={12} /> Consumer</span>;
    }
  };

  // Dynamic values for ReflectiveCard
  const cardUserName = mode === 'register'
    ? (fullName.trim() ? fullName.toUpperCase() : "NEW APPLICANT")
    : (email.trim() ? email.toUpperCase() : "USER@AGRIFARM.GOV");

  const cardUserRole = mode === 'register'
    ? (selectedRole === 'farmer' ? "FARMER WORKSPACE" : selectedRole === 'vet' ? "VETERINARIAN HUB" : selectedRole === 'consumer' ? "CONSUMER PORTAL" : "ADMIN AUTHORITY")
    : "AGRI FARM";

  return (
    <div className="auth-overlay">
      <div className="auth-landscape-modal-wrapper">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <BorderGlow
          colors={['#2d8f4e', '#4ade80', '#16a34a']}
          backgroundColor="#f0f5ed"
          borderRadius={24}
          glowRadius={30}
          glowIntensity={1.0}
        >
          <div className="auth-landscape-modal">
            <div className="landscape-modal-grid">
              {/* LEFT COLUMN: HERO GRAPHICS */}
              <div className="landscape-left-hero">
                <div className="particle-text-container-modal">
                  <ParticleText
                    text="Agri Farm"
                    particleSize={1.8}
                    density={3}
                    color="#1a2e1a"
                    highlightColor="#2d8f4e"
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

                <div className="reflective-card-wrapper-modal">
                  <ReflectiveCard
                    userName={cardUserName}
                    userRole={cardUserRole}
                    idNumber={randomSecurityId}
                    overlayColor="rgba(45, 143, 78, 0.15)"
                    blurStrength={10}
                    glassDistortion={15}
                    metalness={0.8}
                    roughness={0.5}
                    displacementStrength={25}
                    noiseScale={1.5}
                    specularConstant={2.0}
                    grayscale={0.5}
                    color="#2d8f4e"
                  />
                </div>

                <div className="hero-footer-note">
                  <span>© 2026 Agri Farm. All rights reserved. | Official Livestock & Food Safety Portal</span>
                </div>
              </div>

              {/* RIGHT COLUMN: FORM */}
              <div className="landscape-right-form">
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

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="modal-form">
                  {errorMessage && (
                    <div className="auth-alert alert-error neu-inset">
                      <AlertCircle size={15} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="auth-alert alert-success neu-inset">
                      <CheckCircle2 size={15} />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* ROLE PICKER — Registration only */}
                  {mode === 'register' && (
                    <div className="role-selection-section">
                      <label className="section-label">Choose Account Role:</label>
                      <div className="role-cards-grid">
                        <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
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

                        <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
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

                        <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
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

                        <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
                          <div
                            className={`role-card neu-btn ${selectedRole === 'consumer' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('consumer')}
                          >
                            <div className="role-icon">🛒</div>
                            <div className="role-info">
                              <h4>Consumer</h4>
                              <p>Food safety checks</p>
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

                  {/* OTP Verification Input when mode === 'verify-otp' */}
                  {mode === 'verify-otp' ? (
                    <div className="form-group">
                      <label htmlFor="otp-code">6-Digit Verification Code</label>
                      <div className="input-wrapper neu-inset">
                        <KeyRound size={15} className="input-icon" />
                        <input
                          id="otp-code"
                          type="text"
                          maxLength={12}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter verification code"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="resend-link-row" style={{ marginTop: '10px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="text-btn-neu"
                          style={{ background: 'none', border: 'none', color: '#2d8f4e', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
                          onClick={async () => {
                            const res = await resendConfirmationEmail(email);
                            if (res.success) {
                              setSuccessMessage(res.message || "Code resent to inbox!");
                            } else {
                              setErrorMessage(res.message || "Failed to resend code");
                            }
                          }}
                        >
                          📩 Resend Confirmation Code
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Email Address */}
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
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

                      {/* Password */}
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label htmlFor="password">Password</label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2d8f4e',
                                fontWeight: 600,
                                fontSize: '11px',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              onClick={() => {
                                if (!email.trim()) {
                                  setErrorMessage("Please enter your email address first.");
                                } else {
                                  setSuccessMessage(`Password reset instruction sent to ${email}`);
                                  setErrorMessage(null);
                                }
                              }}
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <div className="input-wrapper neu-inset">
                          <Lock size={15} className="input-icon" />
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password (min 6 characters)"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Confirm Password (Registration) */}
                      {mode === 'register' && (
                        <>
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

                          {/* 12-Digit Admin Invite Code requirement for Authority */}
                          {selectedRole === 'authority' && (
                            <div className="form-group">
                              <label htmlFor="admin-invite-code">12-Digit Admin Invite Code</label>
                              <div className="input-wrapper neu-inset">
                                <KeyRound size={15} className="input-icon" />
                                <input
                                  id="admin-invite-code"
                                  type="text"
                                  maxLength={14}
                                  value={adminInviteCode}
                                  onChange={(e) => setAdminInviteCode(e.target.value)}
                                  placeholder="Enter 12-digit code (e.g. ADMN-9942-8812)"
                                  required
                                  disabled={isLoading}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
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
                          {mode === 'verify-otp'
                            ? 'Verify Code & Access Portal'
                            : mode === 'login'
                            ? 'Sign In'
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
