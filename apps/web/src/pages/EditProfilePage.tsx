import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { EditProfile } from '../components/EditProfile';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  const handleSave = async (updated: UserProfile) => {
    await updateProfile(updated);
    navigate('/profile');
  };

  return (
    <EditProfile
      user={user}
      onSave={handleSave}
      onCancel={() => navigate('/profile')}
    />
  );
};
