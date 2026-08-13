import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'farmer' | 'vet' | 'authority';

export interface UserProfile {
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  getRoleForEmail: (email: string) => UserRole | null;
  loginWithPassword: (email: string, pass: string) => { success: boolean; message?: string; boundRole?: UserRole };
  sendOtp: (email: string) => { success: boolean; otp?: string; message: string };
  verifyOtpAndLogin: (email: string, otp: string) => { success: boolean; message?: string; boundRole?: UserRole };
  registerUser: (email: string, pass: string, fullName: string, role: UserRole) => { success: boolean; message?: string };
  switchActiveRole: (newRole: UserRole) => void;
  updateAccountRole: (newRole: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    email: 'admin@amu.gov',
    password: 'admin123',
    fullName: 'System Admin',
    role: 'authority',
  },
  {
    email: 'farmer@amu.gov',
    password: 'admin123',
    fullName: 'Demo Farmer',
    role: 'farmer',
  },
  {
    email: 'vet@amu.gov',
    password: 'admin123',
    fullName: 'Dr. Demo Veterinarian',
    role: 'vet',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('amu_users_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = [...parsed];
        DEFAULT_USERS.forEach((def) => {
          if (!merged.some((u) => u.email.toLowerCase() === def.email.toLowerCase())) {
            merged.push(def);
          }
        });
        return merged;
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('amu_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    const savedRole = localStorage.getItem('amu_active_role') as UserRole | null;
    if (savedRole && ['farmer', 'vet', 'authority'].includes(savedRole)) {
      return savedRole;
    }
    const savedUser = localStorage.getItem('amu_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.role || 'authority';
      } catch (e) {
        return 'authority';
      }
    }
    return null;
  });

  const [pendingOTPs, setPendingOTPs] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('amu_users_v2', JSON.stringify(users));
  }, [users]);

  const getRoleForEmail = (email: string): UserRole | null => {
    if (!email || !email.trim()) return null;
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    return found ? found.role : null;
  };

  const loginWithPassword = (email: string, pass: string) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass
    );

    if (!found) {
      return {
        success: false,
        message: 'Invalid credentials. Use demo accounts or register a new account.',
      };
    }

    setUser(found);
    setActiveRole(found.role);
    localStorage.setItem('amu_current_user', JSON.stringify(found));
    localStorage.setItem('amu_active_role', found.role);
    localStorage.setItem('amu_auth', 'ok');
    return { success: true, boundRole: found.role };
  };

  const sendOtp = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const generatedOtp = '123456';
    setPendingOTPs((prev) => ({ ...prev, [trimmedEmail]: generatedOtp }));

    return {
      success: true,
      otp: generatedOtp,
      message: `OTP dispatched to ${trimmedEmail}! (Demo OTP: 123456)`,
    };
  };

  const verifyOtpAndLogin = (email: string, otp: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const storedOtp = pendingOTPs[trimmedEmail] || '123456';

    if (otp.trim() !== storedOtp) {
      return { success: false, message: 'Invalid OTP code. Use demo code: 123456' };
    }

    let found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      found = {
        email: trimmedEmail,
        fullName: trimmedEmail.split('@')[0],
        role: 'farmer',
      };
      setUsers((prev) => [...prev, found!]);
    }

    setUser(found);
    setActiveRole(found.role);
    localStorage.setItem('amu_current_user', JSON.stringify(found));
    localStorage.setItem('amu_active_role', found.role);
    localStorage.setItem('amu_auth', 'ok');

    setPendingOTPs((prev) => {
      const copy = { ...prev };
      delete copy[trimmedEmail];
      return copy;
    });

    return { success: true, boundRole: found.role };
  };

  const registerUser = (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      return { success: false, message: 'An account with this email already exists!' };
    }

    const newUser: UserProfile = {
      email: trimmedEmail,
      password: pass,
      fullName: fullName.trim() || trimmedEmail.split('@')[0],
      role: role,
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    setActiveRole(newUser.role);
    localStorage.setItem('amu_current_user', JSON.stringify(newUser));
    localStorage.setItem('amu_active_role', newUser.role);
    localStorage.setItem('amu_auth', 'ok');

    return { success: true };
  };

  const switchActiveRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    localStorage.setItem('amu_active_role', newRole);
  };

  const updateAccountRole = (newRole: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    setActiveRole(newRole);
    setUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === user.email.toLowerCase() ? updatedUser : u))
    );
    localStorage.setItem('amu_current_user', JSON.stringify(updatedUser));
    localStorage.setItem('amu_active_role', newRole);
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('amu_current_user');
    localStorage.removeItem('amu_active_role');
    localStorage.removeItem('amu_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user || localStorage.getItem('amu_auth') === 'ok',
        getRoleForEmail,
        loginWithPassword,
        sendOtp,
        verifyOtpAndLogin,
        registerUser,
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
