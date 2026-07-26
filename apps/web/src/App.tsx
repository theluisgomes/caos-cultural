import React from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { I18nProvider } from './lib/i18n';
import { AppLayout } from './layouts/AppLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { HomePage, ExplorarPage } from './pages/HomePage';
import { EventosPage } from './pages/EventosPage';
import { AgentesPage } from './pages/AgentesPage';
import { EspacosPage } from './pages/EspacosPage';
import { ObrasPage } from './pages/ObrasPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { CreatePage } from './pages/CreatePage';
import { SearchSwipePage } from './pages/SearchSwipePage';
import { AgendaPage } from './pages/AgendaPage';
import { MapPage } from './pages/MapPage';
import { AgentPersonaPage } from './pages/AgentPersonaPage';
import { ProPanelPage } from './pages/ProPanelPage';
import { VerificationPage } from './pages/VerificationPage';
import { BoostPage } from './pages/BoostPage';
import { RoutesPage } from './pages/RoutesPage';
import { WorkDetailsPage } from './pages/WorkDetailsPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const GlobalLoginModal: React.FC = () => {
  const navigate = useNavigate();
  const { isLoginOpen, closeLogin, login, register, googleLogin } = useAuth();

  const routeAfterAuth = (bio: string | undefined) => {
    navigate(bio ? '/profile' : '/onboarding');
  };

  return (
    <LoginModal
      isOpen={isLoginOpen}
      onClose={closeLogin}
      onLogin={async (email, password) => {
        const u = await login(email, password);
        if (u) navigate('/');
      }}
      onRegister={async (email, password) => {
        await register(email, password);
        navigate('/onboarding');
      }}
      onGoogleLogin={async () => {
        const u = await googleLogin();
        if (u) routeAfterAuth(u.bio);
      }}
    />
  );
};

const AppShell: React.FC = () => {
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth) return <div className="min-h-screen bg-zinc-950" />;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-brand-500 selection:text-white">
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explorar" element={<ExplorarPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/agentes" element={<AgentesPage />} />
          <Route path="/espacos" element={<EspacosPage />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchSwipePage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/rotas" element={<RoutesPage />} />
          <Route path="/pro" element={<ProPanelPage />} />
        </Route>

        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/listing/:id" element={<ListingDetailsPage />} />
        <Route path="/obra/:id" element={<WorkDetailsPage />} />
        <Route path="/agente/:id" element={<AgentPersonaPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/verificacao" element={<VerificationPage />} />
        <Route path="/turbinar" element={<BoostPage />} />
      </Routes>

      <GlobalLoginModal />
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
