import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ListingDetails } from '../components/ListingDetails';
import { useListing } from '../hooks/useListings';
import { ListingType } from '../types';

export const WorkDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: listing, isLoading } = useListing(id);

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Carregando obra...</div>;
  }

  if (!listing || listing.type !== ListingType.WORK) return <Navigate to="/obras" replace />;

  return (
    <ListingDetails
      listing={listing}
      onBack={() => navigate(-1)}
      onNavigateAgent={() => listing.authorId && navigate(`/agente/${listing.authorId}`)}
      onNavigateSpace={() => navigate('/espacos')}
      onNavigateEvents={() => navigate('/eventos')}
    />
  );
};
