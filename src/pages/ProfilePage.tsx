import React, { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserDashboard } from '../components/UserDashboard';
import { useAuth } from '../context/AuthContext';
import { Listing, ListingType } from '../types';

const MOCK_USER_LISTINGS: Listing[] = [
  {
    id: 'ul1',
    type: ListingType.EVENT,
    title: 'Projeção Urbana: A Luz',
    subtitle: 'Centro Histórico',
    description: 'Uma intervenção visual no centro.',
    imageUrl: 'https://picsum.photos/seed/proj/600/400',
    price: 'Grátis',
    rating: 5.0,
    reviews: 42,
    date: '12 Dez',
    tags: ['Visual Art'],
  },
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const myListings = useMemo(() => MOCK_USER_LISTINGS, []);

  if (!user) return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <UserDashboard
      user={user}
      myListings={myListings}
      onEdit={() => navigate('/profile/edit')}
      onLogout={handleLogout}
    />
  );
};
