import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Onboarding } from '../components/Onboarding';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  const handleComplete = async (updated: UserProfile) => {
    await updateProfile(updated);
    navigate('/profile');
  };

  return <Onboarding user={user} onComplete={handleComplete} />;
};
