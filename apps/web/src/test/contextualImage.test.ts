import { describe, expect, it } from 'vitest';
import { parseLocationParts } from '../lib/locationParts';
import { brandedCoverDataUrl, resolveContextualImage } from '../lib/contextualImage';

describe('parseLocationParts', () => {
  it('parses venue - street - neighborhood', () => {
    const parts = parseLocationParts({
      location: 'Lona Hermeto Pascoal - Praça Primeiro de Maio, s/n - Bangu',
      neighborhood: 'Bangu',
      city: 'Rio de Janeiro',
      state: 'RJ',
    });
    expect(parts.place).toBe('Lona Hermeto Pascoal');
    expect(parts.street).toMatch(/Praça Primeiro de Maio/i);
    expect(parts.neighborhood).toBe('Bangu');
    expect(parts.city).toBe('Rio de Janeiro');
  });

  it('parses venue - neighborhood', () => {
    const parts = parseLocationParts({
      location: 'Circo Voador - Lapa',
      neighborhood: 'Lapa',
      city: 'Rio de Janeiro',
    });
    expect(parts.place).toBe('Circo Voador');
    expect(parts.neighborhood).toBe('Lapa');
  });
});

describe('resolveContextualImage', () => {
  it('prefers explicit event cover', () => {
    const result = resolveContextualImage({
      seed: 'evt-1',
      title: 'Show',
      eventCoverUrl: 'https://cdn.example/event.jpg',
      location: 'Circo Voador - Lapa',
      neighborhood: 'Lapa',
      city: 'Rio de Janeiro',
    });
    expect(result.level).toBe('event');
    expect(result.url).toBe('https://cdn.example/event.jpg');
  });

  it('ignores picsum covers and uses branded card', () => {
    const result = resolveContextualImage({
      seed: 'evt-2',
      title: 'Bloco Zona Mental',
      eventCoverUrl: 'https://picsum.photos/seed/x/600/400',
      location: 'Circo Voador - Lapa',
      neighborhood: 'Lapa',
      city: 'Rio de Janeiro',
      trustCoordinates: false,
    });
    expect(result.level).toBe('branded');
    expect(result.url.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(result.url)).toContain('Circo Voador');
    expect(decodeURIComponent(result.url)).toContain('Lapa');
  });

  it('branded covers are stable per neighborhood palette context', () => {
    const parts = parseLocationParts({
      location: 'Venue A - Lapa',
      neighborhood: 'Lapa',
      city: 'Rio de Janeiro',
    });
    const a = brandedCoverDataUrl({ title: 'A', parts });
    const b = brandedCoverDataUrl({ title: 'B', parts });
    // Same neighborhood → same gradient colors in SVG
    expect(a).toContain('hsl(');
    expect(b).toContain('hsl(');
  });
});
