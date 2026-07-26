import { useQuery } from '@tanstack/react-query';
import { fetchAgendaItems, fetchUserAgendas } from '../services/agenda';

export function useAgenda(userId: string | undefined) {
  return useQuery({
    queryKey: ['agenda', userId],
    queryFn: () => (userId ? fetchAgendaItems(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
}

export function useUserAgendas(userId: string | undefined) {
  return useQuery({
    queryKey: ['agendas', userId],
    queryFn: () => (userId ? fetchUserAgendas(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
}
