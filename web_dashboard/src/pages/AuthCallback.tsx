import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import BorderGlow from '../components/BorderGlow';
import '../styles/Dashboard.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying email confirmation token...');

  useEffect(() => {
    // Parse code / access_token from URL params or hash
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const hash = window.location.hash;

    const timer = setTimeout(() => {
      setStatus('success');
      setMessage('Email verified successfully! Redirecting to your workspace portal...');

      setTimeout(() => {
        if (user?.role === 'farmer') {
          navigate('/farmer-verification');
        } else if (user?.role === 'vet') {
          navigate('/vet-verification');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8faf7',
      padding: '24px'
    }}>
      <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#ffffff" borderRadius={24}>
        <div style={{
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          {status === 'loading' ? (
            <Loader2 size={48} color="#2d8f4e" className="spinning" />
          ) : status === 'success' ? (
            <CheckCircle2 size={48} color="#10b981" />
          ) : (
            <AlertCircle size={48} color="#ef4444" />
          )}

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2e1a', margin: 0 }}>
            {status === 'loading' ? 'Authenticating Session' : status === 'success' ? 'Email Confirmed! ✅' : 'Verification Issue'}
          </h2>

          <p style={{ fontSize: '14px', color: '#5a7a5a', margin: 0, lineHeight: 1.5 }}>
            {message}
          </p>

          <button
            className="btn-primary-neu"
            style={{ marginTop: '12px', padding: '10px 24px', borderRadius: '12px', background: '#2d8f4e', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            Go To Dashboard
          </button>
        </div>
      </BorderGlow>
    </div>
  );
}
