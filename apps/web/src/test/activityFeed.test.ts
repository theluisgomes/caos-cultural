import { describe, expect, it } from 'vitest';
import { buildActivityFeed, filterActivity } from '../services/activityFeed';
import { actionsForListing } from '../services/cardActions';
import { estimateDurationLabel } from '../domain/culturalRoute';
import { ListingType, type Listing } from '../types';

function listing(id: string, type: ListingType, extra: Partial<Listing> = {}): Listing {
  return {
    id,
    type,
    title: `Item ${id}`,
    subtitle: 'São Paulo',
    description: 'Descrição',
    imageUrl: `https://picsum.photos/seed/${id}/600/400`,
    price: 'Grátis',
    rating: 4.5,
    reviews: 3,
    tags: ['Música'],
    ...extra,
  };
}

describe('actionsForListing', () => {
  it('maps each card type to the actions the study defines', () => {
    expect(actionsForListing(listing('a', ListingType.ARTIST))).toEqual(['save_list', 'follow']);
    expect(actionsForListing(listing('e', ListingType.EVENT))).toEqual(['save_agenda', 'follow']);
    expect(actionsForListing(listing('s', ListingType.SPACE))).toEqual(['follow', 'save_map']);
    expect(actionsForListing(listing('w', ListingType.WORK))).toEqual(['save_list']);
  });
});

describe('buildActivityFeed', () => {
  const listings = [
    listing('e1', ListingType.EVENT, { meta: { startsAt: '2026-08-01T20:00:00.000Z' } }),
    listing('s1', ListingType.SPACE),
    listing('a1', ListingType.ARTIST),
  ];

  it('flags items coming from followed profiles and sorts them first', () => {
    const feed = buildActivityFeed(listings, ['s1']);
    expect(feed[0].fromFollowing).toBe(true);
    expect(feed[0].targetId).toBe('s1');
    expect(feed.some(item => item.targetHref === '/espaco/s1')).toBe(true);
  });

  it('filters by section', () => {
    const feed = buildActivityFeed(listings, []);
    expect(filterActivity(feed, 'events').every(item => item.filter === 'events')).toBe(true);
    expect(filterActivity(feed, 'spaces')).toHaveLength(1);
    expect(filterActivity(feed, 'all')).toHaveLength(feed.length);
  });
});

describe('estimateDurationLabel', () => {
  it('estimates 45 minutes per stop', () => {
    expect(estimateDurationLabel(0)).toBe('—');
    expect(estimateDurationLabel(1)).toBe('45min');
    expect(estimateDurationLabel(2)).toBe('1h30');
    expect(estimateDurationLabel(4)).toBe('3h');
  });
});
