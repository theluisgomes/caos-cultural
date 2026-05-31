import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadUserProfile, saveUserProfile } from '../services/userProfileFirestore';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { mockAuth } from '../services/mockAuth';
import type { UserProfile } from '../types';

export function useUserProfile(uid: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', uid],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!uid) return null;
      if (!isFirebaseConfigured()) return mockAuth.getSession();
      return loadUserProfile(getFirestoreInstance(), uid);
    },
    enabled: Boolean(uid),
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!isFirebaseConfigured()) {
        await mockAuth.updateProfile(profile);
        return profile;
      }
      await saveUserProfile(getFirestoreInstance(), profile);
      return profile;
    },
    onSuccess: profile => {
      qc.setQueryData(['userProfile', profile.id], profile);
    },
  });
}
