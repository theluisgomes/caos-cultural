import { useQuery } from '@tanstack/react-query';
import { ensureDefaultLists, fetchListItems } from '../services/lists';

export function useLists(userId: string | undefined) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: async () => {
      if (!userId) return [];
      return ensureDefaultLists(userId);
    },
    enabled: Boolean(userId),
  });
}

export function useListItems(listId: string | undefined) {
  return useQuery({
    queryKey: ['listItems', listId],
    queryFn: () => (listId ? fetchListItems(listId) : Promise.resolve([])),
    enabled: Boolean(listId),
  });
}
