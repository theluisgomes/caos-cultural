import { describe, expect, it } from 'vitest';
import { listingMatchesJourney } from '../services/mappers';
import { ListingType } from '../types';

describe('listingMatchesJourney', () => {
  it('filters events journey', () => {
    const event = { type: ListingType.EVENT } as any;
    const artist = { type: ListingType.ARTIST } as any;
    expect(listingMatchesJourney(event, 'events')).toBe(true);
    expect(listingMatchesJourney(artist, 'events')).toBe(false);
  });
});
