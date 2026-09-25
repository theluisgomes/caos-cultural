import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';
import { CategoryBar } from '../CategoryBar';
import { MacroJourneyBar } from './MacroJourneyBar';
import { FeedModeToggle, FeedMode } from './FeedModeToggle';
import { SearchFilterPanel } from '../search/SearchFilterPanel';
import { FeedGrid } from './FeedGrid';
import { MapVisualizer } from '../MapVisualizer';
import { FeedControls } from '../algorithm/FeedControls';
import { useListings } from '../../hooks/useListings';
import { applySearchFilters } from '../../services/content';
import { saveSearchSubscription } from '../../services/search';
import { applyFeedRanking } from '../../services/algorithm';
import { useAuth } from '../../context/AuthContext';
import type { JourneyKind } from '../../services/mappers';
import { SearchFilters } from '../../domain/feed';
import { Listing, ListingType } from '../../types';

interface FeedPageProps {
  journey: JourneyKind;
  title: string;
  subtitle: string;
  showCategoryBar?: boolean;
  /** When true, hides the large hero (used when home has its own highlight carousel). */
  compactHero?: boolean;
}

const defaultFilters: SearchFilters = {
  kinds: [],
  city: null,
  neighborhood: null,
  radiusKm: null,
  dateFrom: null,
  dateTo: null,
  categories: [],
  disciplines: [],
  techniques: [],
  agentKinds: [],
  ageRanges: [],
  genders: [],
  races: [],
  spaceKinds: [],
  eventKinds: [],
  priceMax: null,
  query: '',
};

export const FeedPage: React.FC<FeedPageProps> = ({
  journey,
  title,
  subtitle,
  showCategoryBar = true,
  compactHero = false,
}) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [mode, setMode] = useState<FeedMode>('discover');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showMap, setShowMap] = useState(false);
  const { data: listings = [], isLoading } = useListings(category, journey);
  const { user } = useAuth();

  const displayed = useMemo(() => {
    let result = listings;
    if (mode === 'search') {
      result = applySearchFilters(listings, filters);
    } else if (user) {
      result = applyFeedRanking(listings, user.id);
    }
    return result;
  }, [listings, mode, filters, user]);

  const handleListingClick = (listing: Listing) => {
    if (listing.type === ListingType.WORK) {
      navigate(`/obra/${listing.id}`, { state: { listing } });
      return;
    }
    if (listing.type === ListingType.SPACE) {
      navigate(`/espaco/${listing.id}`, { state: { listing } });
      return;
    }
    if (listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE) {
      navigate(`/evento/${listing.id}`, { state: { listing } });
      return;
    }
    navigate(`/listing/${listing.id}`, { state: { listing } });
  };

  return (
    <>
      <section
        className={`relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-zinc-800 ${
          compactHero ? 'pt-6 pb-6' : 'pt-16 pb-6 md:pt-36 md:pb-10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1
              className={`font-black tracking-tighter text-white uppercase ${
                compactHero ? 'text-2xl md:text-3xl' : 'text-2xl leading-snug md:text-6xl'
              }`}
            >
              {title}
            </h1>
            {!compactHero && <p className="text-zinc-400 mt-3 max-w-xl">{subtitle}</p>}
          </div>
          <FeedModeToggle mode={mode} onChange={setMode} />
        </div>
        {mode === 'discover' && <FeedControls className="mt-6" />}
      </section>

      <MacroJourneyBar />
      {showCategoryBar && <CategoryBar selected={category} onSelect={setCategory} />}

      {mode === 'search' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchFilterPanel journey={journey} filters={filters} onChange={setFilters} />
          {user && (
            <button
              type="button"
              onClick={() => saveSearchSubscription(user.id, filters)}
              className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-500 hover:text-brand-400"
            >
              Salvar busca e receber atualizações
            </button>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 min-h-[50vh]">
        <FeedGrid listings={displayed} loading={isLoading} onListingClick={handleListingClick} journey={journey} />
      </main>

      <div className="fixed bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMap(true)}
          className="bg-white text-black px-6 py-3.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2 font-bold text-sm tracking-wide"
        >
          <span>MAPA</span>
          <Map size={18} strokeWidth={2.5} />
        </button>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[60] bg-zinc-950">
          <MapVisualizer
            listings={displayed}
            onClose={() => setShowMap(false)}
            onListingClick={listing => {
              setShowMap(false);
              handleListingClick(listing);
            }}
          />
        </div>
      )}
    </>
  );
};
