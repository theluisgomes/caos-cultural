import React from 'react';
import { useNavigate } from 'react-router-dom';
import { About } from '../components/About';
import { useAuth } from '../context/AuthContext';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { openLogin } = useAuth();

  return (
    <About
      onBack={() => navigate('/')}
      onJoin={() => {
        navigate('/');
        openLogin();
      }}
    />
  );
};
