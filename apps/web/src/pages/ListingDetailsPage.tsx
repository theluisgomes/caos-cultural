import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ListingDetails } from '../components/ListingDetails';
import { useRoutedListing } from '../hooks/useListings';
import { ListingType } from '../types';

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: listing, isLoading } = useRoutedListing();

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Carregando...</div>;
  }

  if (!listing) return <Navigate to="/" replace />;

  // Espaços e eventos têm páginas dedicadas (fase 4); links legados continuam funcionando.
  if (listing.type === ListingType.SPACE) {
    return <Navigate to={`/espaco/${listing.id}`} replace state={{ listing }} />;
  }
  if (listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE) {
    return <Navigate to={`/evento/${listing.id}`} replace state={{ listing }} />;
  }

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
