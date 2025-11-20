import React, { useState, useEffect } from 'react';
import { Map, ArrowDown } from 'lucide-react';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ListingCard } from './components/ListingCard';
import { MapVisualizer } from './components/MapVisualizer';
import { Footer } from './components/Footer';
import { UserDashboard } from './components/UserDashboard';
import { LoginModal } from './components/LoginModal';
import { Onboarding } from './components/Onboarding';
import { EditProfile } from './components/EditProfile';
import { ListingDetails } from './components/ListingDetails';
import { fetchCulturalListings } from './services/geminiService';
import { mockAuth } from './services/mockAuth';
import { Listing, UserProfile, ListingType, ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [category, setCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Auth & User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Init Session
  useEffect(() => {
    const initSession = () => {
      const session = mockAuth.getSession();
      if (session) {
        setUser(session);
      }
      setIsCheckingAuth(false);
    };
    initSession();
  }, []);

  // Load Content
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fetchedListings = await fetchCulturalListings(category);
      setListings(fetchedListings);
      
      // Mock user specific listings
      setUserListings([
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
            tags: ['Visual Art']
        },
      ]);
      setLoading(false);
    };
    loadData();
  }, [category]);

  // Handlers
  const handleLogin = async (email: string) => {
    const loggedUser = await mockAuth.login(email);
    if (loggedUser) {
      setUser(loggedUser);
      setIsLoginOpen(false);
      setCurrentView('HOME'); // or PROFILE
    }
  };

  const handleRegister = async (email: string) => {
    const newUser = await mockAuth.register(email, 'password');
    setUser(newUser);
    setIsLoginOpen(false);
    setCurrentView('ONBOARDING'); // Redirect to onboarding
  };

  const handleGoogleLogin = async () => {
    const googleUser = await mockAuth.googleLogin();
    setUser(googleUser);
    setIsLoginOpen(false);
    // If bio is empty, assume new user -> onboarding
    if (!googleUser.bio) {
      setCurrentView('ONBOARDING');
    } else {
      setCurrentView('PROFILE');
    }
  };

  const handleOnboardingComplete = async (updatedUser: UserProfile) => {
    const saved = await mockAuth.updateProfile(updatedUser);
    setUser(saved);
    setCurrentView('PROFILE');
  };

  const handleProfileUpdate = async (updatedUser: UserProfile) => {
    const saved = await mockAuth.updateProfile(updatedUser);
    setUser(saved);
    setCurrentView('PROFILE');
  };

  const handleProfileClick = () => {
    if (user) {
      setCurrentView('PROFILE');
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLogout = () => {
      mockAuth.logout();
      setUser(null);
      setCurrentView('HOME');
  };

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('LISTING_DETAILS');
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setSelectedListing(null);
    setCurrentView('HOME');
  };

  // Views
  if (currentView === 'ONBOARDING' && user) {
    return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  if (currentView === 'EDIT_PROFILE' && user) {
      return (
        <EditProfile 
            user={user} 
            onSave={handleProfileUpdate} 
            onCancel={() => setCurrentView('PROFILE')} 
        />
      );
  }

  if (currentView === 'LISTING_DETAILS' && selectedListing) {
    return <ListingDetails listing={selectedListing} onBack={handleBackToHome} />;
  }

  const renderMainContent = () => {
    if (currentView === 'PROFILE' && user) {
      return (
        <UserDashboard 
            user={user} 
            myListings={userListings} 
            onEdit={() => setCurrentView('EDIT_PROFILE')}
        />
      );
    }

    return (
      <>
        {/* Hero Section */}
        <section className="relative pt-40 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-zinc-800 mb-8">
          <div className="flex flex-col justify-end">
            <h1 className="text-[13vw] sm:text-[11vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter text-white uppercase break-words mix-blend-screen">
              <span className="block">Onde o</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-600">
                CAOS
              </span>
              <span className="block">vira Arte.</span>
            </h1>
            
            <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <p className="text-xl md:text-2xl text-zinc-400 max-w-lg font-light leading-relaxed">
                Um ecossistema vivo para mapear, conectar e descobrir eventos, espaços e criadores.
              </p>
              <div className="hidden md:flex items-center gap-2 text-brand-500 font-mono text-sm animate-bounce">
                <ArrowDown size={20} />
                <span>EXPLORE O INEXPLORADO</span>
              </div>
            </div>
          </div>
        </section>

        <CategoryBar selected={category} onSelect={setCategory} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 min-h-[60vh]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="bg-zinc-800 aspect-[4/5] rounded-sm"></div>
                  <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {listings.length === 0 ? (
                <div className="text-center py-20 border border-zinc-800 rounded-lg border-dashed">
                  <h2 className="text-3xl font-bold text-white mb-2">Vazio.</h2>
                  <p className="text-zinc-500">Ainda não há arte nesta categoria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {listings.map((listing) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      onClick={() => handleListingClick(listing)} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Floating Map Toggle */}
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40">
          <button 
            onClick={() => setShowMap(true)}
            className="bg-white text-black px-6 py-3.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2 font-bold text-sm tracking-wide"
          >
            <span>MAPA</span>
            <Map size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 z-[60] bg-zinc-950 animate-in fade-in duration-300">
              <div className="h-full w-full relative">
                  <MapVisualizer listings={listings} onClose={() => setShowMap(false)} />
              </div>
          </div>
        )}
      </>
    );
  };

  if (isCheckingAuth) return <div className="min-h-screen bg-zinc-950"></div>;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-brand-500 selection:text-white">
      <Header 
        onProfileClick={handleProfileClick} 
        onLogoClick={() => setCurrentView('HOME')} 
      />
      
      {renderMainContent()}

      <Footer />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};

export default App;