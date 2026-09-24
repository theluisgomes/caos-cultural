import { parseLocationParts, type LocationParts } from './locationParts';

/**
 * Image strategy for listings without a real event/space photo.
 *
 * We do NOT scrape Wikipedia/Openverse by venue name — those matches were
 * frequently wrong (homonyms, unrelated pages).
 *
 * Priority:
 * 1. event   — explicit cover uploaded/scraped with the event
 * 2. street  — Google Street View from the address string (Maps key required)
 * 3. branded — generated SVG card with place + neighborhood (honest, never fake photo)
 */

export type ImageSourceLevel = 'event' | 'street' | 'branded';

export type ContextualImageInput = {
  seed: string;
  /** Event/space title shown on branded covers. */
  title?: string | null;
  eventCoverUrl?: string | null;
  location?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  /** Only used for Street View when trusted (real geocode). Prefer address text. */
  coordinates?: { lat: number; lng: number } | null;
  /** When false, ignore coordinates (e.g. synthetic jitter). Default true. */
  trustCoordinates?: boolean;
  width?: number;
  height?: number;
};

export type ContextualImageResult = {
  url: string;
  level: ImageSourceLevel;
  parts: LocationParts;
};

function mapsKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return typeof key === 'string' && key.length > 0 ? key : undefined;
}

function streetViewFromAddress(
  parts: LocationParts,
  coordinates: { lat: number; lng: number } | null | undefined,
  trustCoordinates: boolean,
  width: number,
  height: number,
): string | null {
  const key = mapsKey();
  if (!key) return null;

  const size = `${width}x${height}`;

  // Prefer textual address — avoids wrong Street View on synthetic coords.
  const address =
    [parts.street, parts.place, parts.neighborhood, parts.city, parts.state]
      .filter(Boolean)
      .join(', ') || parts.query;

  if (address && (parts.street || parts.place || parts.neighborhood)) {
    return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(address)}&fov=75&pitch=5&key=${key}`;
  }

  if (trustCoordinates && coordinates) {
    return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${coordinates.lat},${coordinates.lng}&fov=75&pitch=5&key=${key}`;
  }

  return null;
}

/** Stable palette from a string — same neighborhood → same mood. */
function paletteFor(key: string): { bg: string; accent: string; mist: string } {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const hues = [340, 12, 28, 200, 220, 260, 300];
  const h = hues[hash % hues.length]!;
  const h2 = (h + 40) % 360;
  return {
    bg: `hsl(${h} 28% 10%)`,
    accent: `hsl(${h} 72% 48%)`,
    mist: `hsl(${h2} 35% 18%)`,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(value: string, max: number): string {
  const t = value.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Honest placeholder: designed card, not a stock photo pretending to be the venue.
 * `variant: 'hero'` omits typography so detail pages can overlay a real title safely.
 */
export function brandedCoverDataUrl(input: {
  title?: string | null;
  parts: LocationParts;
  width?: number;
  height?: number;
  variant?: 'card' | 'hero';
}): string {
  const width = input.width ?? 600;
  const height = input.height ?? 750;
  const variant = input.variant ?? 'card';
  const place = input.parts.place || input.title || 'Evento';
  const line2 = [input.parts.neighborhood, input.parts.city].filter(Boolean).join(' · ') || 'Local a confirmar';
  const paletteKey = input.parts.neighborhood || input.parts.city || place;
  const { bg, accent, mist } = paletteFor(paletteKey);

  const headline = escapeXml(truncate(place, 42));
  const sub = escapeXml(truncate(line2, 48));
  const mark = escapeXml(truncate((input.parts.neighborhood || input.parts.city || 'CAOS').toUpperCase(), 18));

  const typography =
    variant === 'hero'
      ? ''
      : `
  <rect x="28" y="28" width="56" height="4" fill="${accent}"/>
  <text x="28" y="64" fill="${accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="0.22em">${mark}</text>
  <text x="28" y="${height * 0.62}" fill="#fafafa" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="800">${headline}</text>
  <text x="28" y="${height * 0.62 + 36}" fill="#a1a1aa" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="500">${sub}</text>
  <text x="28" y="${height - 36}" fill="#71717a" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="0.16em">SEM FOTO DO EVENTO</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="55%" stop-color="${mist}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
    <pattern id="grain" width="80" height="80" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="14" r="1" fill="#fff" opacity="0.05"/>
      <circle cx="40" cy="48" r="1.2" fill="#fff" opacity="0.04"/>
      <circle cx="68" cy="22" r="0.8" fill="#fff" opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#grain)"/>
  <circle cx="${width * 0.82}" cy="${height * 0.18}" r="${Math.min(width, height) * 0.28}" fill="${accent}" opacity="0.18"/>
  <circle cx="${width * 0.12}" cy="${height * 0.78}" r="${Math.min(width, height) * 0.22}" fill="${accent}" opacity="0.12"/>
  ${typography}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** True when the listing uses a generated SVG cover (text may collide with page titles). */
export function isBrandedCoverUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith('data:image/svg'));
}

/** Hero background without typography — safe under detail-page titles. */
export function heroBackgroundUrl(imageUrl: string, parts?: LocationParts): string {
  if (!isBrandedCoverUrl(imageUrl)) return imageUrl;
  return brandedCoverDataUrl({
    parts: parts ?? { place: null, street: null, neighborhood: null, city: null, state: null, query: '' },
    width: 1200,
    height: 640,
    variant: 'hero',
  });
}

/**
 * Resolve image for a listing. Never returns scraped lookalike venue photos.
 */
export function resolveContextualImage(input: ContextualImageInput): ContextualImageResult {
  const width = input.width ?? 600;
  const height = input.height ?? 750;
  const parts = parseLocationParts({
    location: input.location,
    neighborhood: input.neighborhood,
    city: input.city,
    state: input.state,
  });

  const cover = input.eventCoverUrl?.trim();
  if (cover && !cover.includes('picsum.photos')) {
    return { url: cover, level: 'event', parts };
  }

  const street = streetViewFromAddress(
    parts,
    input.coordinates,
    input.trustCoordinates !== false,
    width,
    Math.round(height * 0.75),
  );
  if (street) {
    return { url: street, level: 'street', parts };
  }

  return {
    url: brandedCoverDataUrl({
      title: input.title,
      parts,
      width,
      height,
    }),
    level: 'branded',
    parts,
  };
}
