import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { mockAuth } from '../services/mockAuth';
import { registerWithEmail, signInWithEmail, signInWithGoogle, signOutUser } from '../services/auth';
import {
  ensureUserDocument,
  loadUserProfile,
  saveUserProfile,
} from '../services/userProfileFirestore';
import { ensureDefaultLists } from '../services/lists';
import { isFirebaseConfigured, getAuthInstance, getFirestoreInstance } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  isCheckingAuth: boolean;
  /** True when Firebase env is present and the real backend is active. */
  useFirebase: boolean;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  register: (email: string, password: string) => Promise<UserProfile>;
  googleLogin: () => Promise<UserProfile | null>;
  logout: () => void;
  updateProfile: (updated: UserProfile) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function syncFirebaseUser(fbUser: FirebaseUser | null): Promise<UserProfile | null> {
  if (!fbUser) return null;
  const db = getFirestoreInstance();
  await ensureUserDocument(db, fbUser);
  await ensureDefaultLists(fbUser.uid);
  return loadUserProfile(db, fbUser.uid);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const useFirebase = isFirebaseConfigured();

  useEffect(() => {
    if (!useFirebase) {
      const session = mockAuth.getSession();
      setUser(session);
      if (session) ensureDefaultLists(session.id).catch(() => {});
      setIsCheckingAuth(false);
      return;
    }

    const auth = getAuthInstance();
    const unsub = onAuthStateChanged(auth, async fbUser => {
      try {
        if (!fbUser) {
          setUser(null);
          return;
        }
        const profile = await syncFirebaseUser(fbUser);
        if (profile) setUser(profile);
      } finally {
        setIsCheckingAuth(false);
      }
    });

    return () => unsub();
  }, [useFirebase]);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!useFirebase) {
        const logged = await mockAuth.login(email, password);
        if (logged) setUser(logged);
        closeLogin();
        return logged;
      }
      await signInWithEmail(email, password);
      const fbUser = getAuthInstance().currentUser;
      if (!fbUser) return null;
      const profile = await syncFirebaseUser(fbUser);
      if (profile) setUser(profile);
      closeLogin();
      return profile;
    },
    [useFirebase, closeLogin]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      if (!useFirebase) {
        const created = await mockAuth.register(email, password);
        setUser(created);
        closeLogin();
        return created;
      }
      const credUser = await registerWithEmail(email, password);
      const profile = await syncFirebaseUser(credUser);
      if (!profile) throw new Error('Falha ao criar perfil.');
      setUser(profile);
      closeLogin();
      return profile;
    },
    [useFirebase, closeLogin]
  );

  const googleLogin = useCallback(async () => {
    if (!useFirebase) {
      const g = await mockAuth.googleLogin();
      setUser(g);
      closeLogin();
      return g;
    }
    const fbUser = await signInWithGoogle();
    if (!fbUser) {
      // Redirect flow was started; page navigation will continue the auth handshake.
      return null;
    }
    const profile = await syncFirebaseUser(fbUser);
    if (!profile) throw new Error('Falha ao carregar perfil.');
    setUser(profile);
    closeLogin();
    return profile;
  }, [useFirebase, closeLogin]);

  const logout = useCallback(async () => {
    if (!useFirebase) {
      mockAuth.logout();
      setUser(null);
      return;
    }
    await signOutUser();
    setUser(null);
  }, [useFirebase]);

  const updateProfile = useCallback(
    async (updated: UserProfile) => {
      if (!useFirebase) {
        const saved = await mockAuth.updateProfile(updated);
        setUser(saved);
        return saved;
      }
      const db = getFirestoreInstance();
      await saveUserProfile(db, updated);
      setUser(updated);
      return updated;
    },
    [useFirebase]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isCheckingAuth,
      useFirebase,
      isLoginOpen,
      openLogin,
      closeLogin,
      login,
      register,
      googleLogin,
      logout,
      updateProfile,
    }),
    [
      user,
      isCheckingAuth,
      useFirebase,
      isLoginOpen,
      openLogin,
      closeLogin,
      login,
      register,
      googleLogin,
      logout,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
