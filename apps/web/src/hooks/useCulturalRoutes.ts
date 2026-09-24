import { useQuery } from '@tanstack/react-query';
import { fetchRoute, fetchUserRoutes } from '../services/culturalRoutes';

export function useCulturalRoutes(userId: string | undefined) {
  return useQuery({
    queryKey: ['culturalRoutes', userId],
    queryFn: () => (userId ? fetchUserRoutes(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
}

export function useCulturalRoute(routeId: string | undefined) {
  return useQuery({
    queryKey: ['culturalRoute', routeId],
    queryFn: () => (routeId ? fetchRoute(routeId) : Promise.resolve(null)),
    enabled: Boolean(routeId),
  });
}
