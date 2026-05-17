import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ListingDetails } from '../components/ListingDetails';
import { Listing } from '../types';

interface LocationState {
  listing?: Listing;
}

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const listing = state?.listing;

  if (!listing) return <Navigate to="/" replace />;

  return <ListingDetails listing={listing} onBack={() => navigate('/')} />;
};
