import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ListingDetails } from '../components/ListingDetails';
import { ProjectMetrics } from '../components/metrics/ProjectMetrics';
import { EndorsementBadges } from '../components/reputation/EndorsementBadges';
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
    <div className="min-h-screen bg-zinc-950">
      <ListingDetails
        listing={listing}
        onBack={() => navigate(-1)}
        onNavigateAgent={() => listing.authorId && navigate(`/agente/${listing.authorId}`)}
        onNavigateSpace={() => navigate('/espacos')}
        onNavigateEvents={() => navigate('/eventos')}
      />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">
          Desempenho do projeto
        </h2>
        <ProjectMetrics targetType="work" targetId={listing.id} />
        <EndorsementBadges target={listing} targetType="work" className="mt-6" />
      </section>
    </div>
  );
};
