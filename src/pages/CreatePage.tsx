import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateListing } from '../components/CreateListing';
import { useAuth } from '../context/AuthContext';

export const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();

  return (
    <CreateListing
      user={user}
      onBack={() => navigate('/')}
      onLoginRequired={() => {
        navigate('/');
        openLogin();
      }}
    />
  );
};
