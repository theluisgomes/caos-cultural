import { describe, expect, it } from 'vitest';
import { deriveCulturalProfile, listCulturalSeries, seriesKeyOf } from '../services/culturalProfiles';
import { ListingType, type Listing } from '../types';

function eventListing(id: string, title: string, startsAt: string): Listing {
  return {
    id,
    type: ListingType.EVENT,
    title,
    subtitle: 'Casa das Caldeiras',
    description: 'Festival de música e arte',
    imageUrl: `https://picsum.photos/seed/${id}/600/400`,
    price: 'Grátis',
    rating: 4.5,
    reviews: 10,
    tags: ['Música', 'Festival'],
    meta: { startsAt },
  };
}

describe('seriesKeyOf', () => {
  it('strips year and accents to group editions', () => {
    expect(seriesKeyOf('Festival Afluentes 2026')).toBe('festival-afluentes');
    expect(seriesKeyOf('Festival Afluentes 2025')).toBe('festival-afluentes');
    expect(seriesKeyOf('Exposição Sombras')).toBe('exposicao-sombras');
  });
});

describe('deriveCulturalProfile', () => {
  const listings = [
    eventListing('e1', 'Festival Afluentes 2025', '2025-05-01T20:00:00.000Z'),
    eventListing('e2', 'Festival Afluentes 2026', '2026-05-01T20:00:00.000Z'),
    eventListing('e3', 'Noite Techno', '2026-06-01T22:00:00.000Z'),
  ];

  it('groups occurrences of the same series, newest first', () => {
    const derived = deriveCulturalProfile(listings, 'festival-afluentes')!;
    expect(derived.profile.name).toBe('Festival Afluentes');
    expect(derived.occurrences.map(o => o.id)).toEqual(['e2', 'e1']);
  });

  it('returns null when no occurrence matches', () => {
    expect(deriveCulturalProfile(listings, 'inexistente')).toBeNull();
  });

  it('lists only series with more than one occurrence', () => {
    const series = listCulturalSeries(listings);
    expect(series).toHaveLength(1);
    expect(series[0].profile.id).toBe('festival-afluentes');
  });
});
