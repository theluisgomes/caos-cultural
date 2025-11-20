import { UserProfile } from "../types";

const STORAGE_KEY = 'caos_user_session';

export const mockAuth = {
  login: async (email: string): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const user = JSON.parse(stored);
          if (user.email === email) resolve(user);
        }
        // Mock login for demo if not found in local storage but allows "demo" entry
        resolve({
          id: "u_demo",
          name: "Usuário Demo",
          email: email,
          handle: "@demo_user",
          role: "VISITOR",
          bio: "Entusiasta da cultura underground.",
          location: "São Paulo, SP",
          avatarUrl: "https://picsum.photos/seed/demo_av/200/200",
          coverUrl: "https://picsum.photos/seed/demo_cov/1200/400",
          disciplines: [],
          stats: { followers: 0, following: 0, eventsAttended: 0, projectsCreated: 0 },
          joinDate: "Nov 2024"
        });
      }, 800);
    });
  },

  register: async (email: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: UserProfile = {
          id: `u_${Date.now()}`,
          email,
          name: email.split('@')[0],
          handle: `@${email.split('@')[0]}`,
          role: "VISITOR", // Default, changed in onboarding
          bio: "",
          location: "São Paulo, SP",
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
          coverUrl: "https://picsum.photos/seed/cover_new/1200/400",
          disciplines: [],
          stats: { followers: 0, following: 0, eventsAttended: 0, projectsCreated: 0 },
          joinDate: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 1000);
    });
  },

  googleLogin: async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser: UserProfile = {
          id: "u_google_123",
          email: "art.lover@gmail.com",
          name: "Alex Google",
          handle: "@alex_g",
          role: "VISITOR",
          bio: "", // Empty bio triggers onboarding
          location: "Rio de Janeiro, RJ",
          avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          coverUrl: "https://picsum.photos/seed/google_bg/1200/400",
          disciplines: [],
          stats: { followers: 0, following: 0, eventsAttended: 0, projectsCreated: 0 },
          joinDate: "Nov 2024"
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
        resolve(googleUser);
      }, 1500);
    });
  },

  updateProfile: async (user: UserProfile): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      }, 500);
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getSession: (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};