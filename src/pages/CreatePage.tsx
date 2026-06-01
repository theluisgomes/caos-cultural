import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateListing } from '../components/CreateListing';
import { useAuth } from '../context/AuthContext';

export const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();

  const handleBack = () => {
    const historyState = window.history.state as { idx?: number } | null;
    if (historyState?.idx && historyState.idx > 0) {
      navigate(-1);
      return;
    }
    navigate(user ? '/profile' : '/');
  };

  return (
    <CreateListing
      user={user}
      onBack={handleBack}
      onLoginRequired={() => {
        navigate('/');
        openLogin();
      }}
    />
  );
};
