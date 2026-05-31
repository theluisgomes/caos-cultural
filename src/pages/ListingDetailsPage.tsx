import React from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ListingDetails } from '../components/ListingDetails';
import { useListing } from '../hooks/useListings';
import { Listing } from '../types';

interface LocationState {
  listing?: Listing;
}

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { data: fetched, isLoading } = useListing(state?.listing ? undefined : id);
  const listing = state?.listing ?? fetched ?? null;

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Carregando...</div>;
  }

  if (!listing) return <Navigate to="/" replace />;

  return (
    <ListingDetails
      listing={listing}
      onBack={() => navigate(-1)}
      onNavigateAgent={() => navigate(`/agente/${listing.authorId || listing.id}`)}
      onNavigateSpace={() => navigate('/espacos')}
      onNavigateEvents={() => navigate('/eventos')}
    />
  );
};
