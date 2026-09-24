/**
 * Parse free-form venue/location strings (e.g. La Cumbuca) into
 * place → street → neighborhood → city parts for image resolution.
 */

export type LocationParts = {
  place: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  /** Full query string useful for Street View / geocoding. */
  query: string;
};

const STREET_HINT =
  /\b(rua|av\.?|avenida|praça|praca|alameda|travessa|estrada|rodovia|boulevard|largo|viaduto|beco)\b/i;

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = value.replace(/\s+/g, ' ').trim();
  return t.length ? t : null;
}

/**
 * Split "Venue - Street, n - Neighborhood" style labels.
 */
export function parseLocationParts(input: {
  location?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}): LocationParts {
  const city = clean(input.city);
  const state = clean(input.state);
  const explicitNeighborhood = clean(input.neighborhood);
  const location = clean(input.location) ?? '';

  const segments = location
    .split(/\s+[-–—]\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  let place: string | null = null;
  let street: string | null = null;
  let neighborhood = explicitNeighborhood;

  if (segments.length === 0) {
    // no-op
  } else if (segments.length === 1) {
    place = segments[0]!;
  } else if (segments.length === 2) {
    place = segments[0]!;
    const second = segments[1]!;
    if (STREET_HINT.test(second) || /,\s*\d/.test(second)) {
      street = second;
    } else if (!neighborhood) {
      neighborhood = second;
    } else {
      street = second;
    }
  } else {
    place = segments[0]!;
    const last = segments[segments.length - 1]!;
    if (!neighborhood) neighborhood = last;
    const middle = segments.slice(1, -1).join(' - ');
    if (middle) street = middle;
    // If last looks like a street and neighborhood was explicit, keep street from middle+last
    if (explicitNeighborhood && STREET_HINT.test(last)) {
      street = [...segments.slice(1)].join(' - ');
      neighborhood = explicitNeighborhood;
    }
  }

  // Drop garbage neighborhoods that are actually full addresses
  if (neighborhood && (STREET_HINT.test(neighborhood) || neighborhood.includes(','))) {
    if (!street) street = neighborhood;
    neighborhood = explicitNeighborhood && !STREET_HINT.test(explicitNeighborhood)
      ? explicitNeighborhood
      : null;
  }

  const query = [place, street, neighborhood, city, state].filter(Boolean).join(', ');

  return { place, street, neighborhood, city, state, query };
}
