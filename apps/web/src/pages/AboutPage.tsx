import React from 'react';
import { useNavigate } from 'react-router-dom';
import { About } from '../components/About';
import { FirebaseAdminPanel } from '../components/FirebaseAdminPanel';
import { useAuth } from '../context/AuthContext';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { openLogin } = useAuth();

  return (
    <>
      <About
        onBack={() => navigate('/')}
        onJoin={() => {
          navigate('/');
          openLogin();
        }}
      />
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <FirebaseAdminPanel />
      </div>
    </>
  );
};
