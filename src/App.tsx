import React from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { CreatePage } from './pages/CreatePage';

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
        routeAfterAuth(u.bio);
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
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/listing/:id" element={<ListingDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/create" element={<CreatePage />} />
      </Routes>

      <GlobalLoginModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
