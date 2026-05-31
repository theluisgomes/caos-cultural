import { describe, expect, it } from 'vitest';
import { buildEventHighlights } from '../lib/eventHighlights';
import { Listing, ListingType } from '../types';

const mk = (id: string, days: number, sponsored = false): Listing => ({
  id,
  type: ListingType.EVENT,
  title: `Event ${id}`,
  subtitle: 'SP',
  description: '',
  imageUrl: 'https://example.com/x.jpg',
  rating: 4,
  reviews: 0,
  sponsored,
  tags: [],
  meta: { startsAt: new Date(Date.now() + days * 86400000).toISOString() },
});

describe('buildEventHighlights', () => {
  it('returns 6 slides with sponsored in center slot', () => {
    const slides = buildEventHighlights([
      mk('a', 10),
      mk('b', 5),
      mk('c', 1),
      mk('s', 15, true),
      mk('d', 20),
      mk('e', 25),
      mk('f', 30),
    ]);
    expect(slides).toHaveLength(6);
    expect(slides[2]?.sponsored).toBe(true);
  });
});
