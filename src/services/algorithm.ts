import type { Listing } from '../types';

const PREFS_KEY = 'caos_feed_prefs';

export interface FeedPreferences {
  boostTags: string[];
  suppressTags: string[];
  resetAt: string | null;
}

const defaultPrefs = (): FeedPreferences => ({
  boostTags: [],
  suppressTags: [],
  resetAt: null,
});

export function loadFeedPreferences(userId: string): FeedPreferences {
  try {
    return JSON.parse(localStorage.getItem(`${PREFS_KEY}_${userId}`) || 'null') ?? defaultPrefs();
  } catch {
    return defaultPrefs();
  }
}

export function saveFeedPreferences(userId: string, prefs: FeedPreferences): void {
  localStorage.setItem(`${PREFS_KEY}_${userId}`, JSON.stringify(prefs));
}

export function applyFeedRanking(listings: Listing[], userId: string | undefined): Listing[] {
  if (!userId) return listings;
  const prefs = loadFeedPreferences(userId);
  if (prefs.resetAt) return [...listings].sort(() => Math.random() - 0.5);

  return [...listings].sort((a, b) => score(a, prefs) - score(b, prefs));
}

function score(listing: Listing, prefs: FeedPreferences): number {
  let s = listing.rating;
  if (listing.sponsored) s += 2;
  for (const tag of listing.tags) {
    if (prefs.boostTags.includes(tag)) s -= 1;
    if (prefs.suppressTags.includes(tag)) s += 5;
  }
  return s;
}

export function boostTag(userId: string, tag: string): FeedPreferences {
  const prefs = loadFeedPreferences(userId);
  if (!prefs.boostTags.includes(tag)) prefs.boostTags.push(tag);
  prefs.suppressTags = prefs.suppressTags.filter(t => t !== tag);
  saveFeedPreferences(userId, prefs);
  return prefs;
}

export function suppressTag(userId: string, tag: string): FeedPreferences {
  const prefs = loadFeedPreferences(userId);
  if (!prefs.suppressTags.includes(tag)) prefs.suppressTags.push(tag);
  prefs.boostTags = prefs.boostTags.filter(t => t !== tag);
  saveFeedPreferences(userId, prefs);
  return prefs;
}

export function resetFeed(userId: string): FeedPreferences {
  const prefs = { ...defaultPrefs(), resetAt: new Date().toISOString() };
  saveFeedPreferences(userId, prefs);
  return prefs;
}
