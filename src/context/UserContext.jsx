import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      setProfile(response.data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (apiCall, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(data);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  const value = {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    clearProfile,
    setProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};