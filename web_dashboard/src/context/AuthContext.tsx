import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'farmer' | 'vet' | 'authority' | 'consumer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  is_verified?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  getRoleForEmail: (email: string) => Promise<UserRole | null>;
  loginWithPassword: (email: string, pass: string) => Promise<{ success: boolean; message?: string; boundRole?: UserRole }>;
  registerUser: (email: string, pass: string, fullName: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; message?: string; boundRole?: UserRole }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; message?: string }>;
  switchActiveRole: (newRole: UserRole) => void;
  updateAccountRole: (newRole: UserRole) => void;
  logout: () => void;
}

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('agri_access_token');
  });
  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('agri_active_role') as UserRole | null;
    if (saved && ['farmer', 'vet', 'authority', 'consumer'].includes(saved)) return saved;
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate stored token
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('agri_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const json = await res.json();
          const userData = json.data;
          const profile: UserProfile = {
            id: userData.id,
            email: userData.email,
            fullName: userData.full_name,
            role: userData.role as UserRole,
            is_verified: userData.is_verified,
          };
          setUser(profile);
          setAccessToken(token);

          // Restore active role or default to user's role
          const savedRole = localStorage.getItem('agri_active_role') as UserRole;
          if (savedRole && ['farmer', 'vet', 'authority', 'consumer'].includes(savedRole)) {
            setActiveRole(savedRole);
          } else {
            setActiveRole(profile.role);
          }
        } else {
          // Token invalid — clear
          localStorage.removeItem('agri_access_token');
          localStorage.removeItem('agri_active_role');
          setAccessToken(null);
        }
      } catch {
        localStorage.removeItem('agri_access_token');
        setAccessToken(null);
      }

      setIsLoading(false);
    };

    validateToken();
  }, []);

  const getRoleForEmail = async (email: string): Promise<UserRole | null> => {
    if (!email?.trim()) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/check-role?email=${encodeURIComponent(email.trim())}`);
      if (res.ok) {
        const json = await res.json();
        return json.data?.role || null;
      }
    } catch {}
    return null;
  };

  const loginWithPassword = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const json = await res.json();

      if (!res.ok) {
        return { success: false, message: json.message || 'Login failed' };
      }

      const data = json.data;
      const token = data.access_token;
      const userData = data.user;

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role as UserRole,
        is_verified: userData.is_verified,
      };

      setUser(profile);
      setAccessToken(token);
      setActiveRole(profile.role);

      localStorage.setItem('agri_access_token', token);
      localStorage.setItem('agri_active_role', profile.role);

      return { success: true, boundRole: profile.role };
    } catch (e: any) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const registerUser = async (email: string, pass: string, fullName: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, fullName, role }),
      });

      const json = await res.json();

      if (!res.ok) {
        return { success: false, message: json.message || 'Registration failed' };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.message || 'OTP verification failed' };
      }

      const data = json.data;
      const tok = data.access_token;
      const userData = data.user;

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role as UserRole,
        is_verified: userData.is_verified,
      };

      setUser(profile);
      setAccessToken(tok);
      setActiveRole(profile.role);

      localStorage.setItem('agri_access_token', tok);
      localStorage.setItem('agri_active_role', profile.role);

      return { success: true, boundRole: profile.role };
    } catch {
      return { success: false, message: 'Network error verifying OTP code.' };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.message || 'Failed to resend code' };
      return { success: true, message: 'Verification code resent to inbox!' };
    } catch {
      return { success: false, message: 'Network error resending code.' };
    }
  };

  const switchActiveRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    localStorage.setItem('agri_active_role', newRole);
  };

  const updateAccountRole = (newRole: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    setActiveRole(newRole);
    localStorage.setItem('agri_active_role', newRole);
  };

  const logout = () => {
    // Fire-and-forget server logout
    if (accessToken) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => {});
    }

    setUser(null);
    setAccessToken(null);
    setActiveRole(null);
    localStorage.removeItem('agri_access_token');
    localStorage.removeItem('agri_active_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        accessToken,
        getRoleForEmail,
        loginWithPassword,
        registerUser,
        verifyOtp,
        resendConfirmationEmail,
        switchActiveRole,
        updateAccountRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
