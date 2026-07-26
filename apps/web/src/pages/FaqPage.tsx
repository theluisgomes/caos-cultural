import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FAQ } from '../components/FAQ';

export const FaqPage: React.FC = () => {
  const navigate = useNavigate();
  return <FAQ onBack={() => navigate('/')} />;
};
