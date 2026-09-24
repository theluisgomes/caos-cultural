#!/usr/bin/env node
/**
 * DEPRECATED — auto-scraping venue photos via Wikipedia/Openverse produced
 * many wrong matches (homonyms). The app now uses:
 *   1) real event coverUrl
 *   2) Street View from address (VITE_GOOGLE_MAPS_API_KEY)
 *   3) branded SVG covers
 *
 * This script is kept only as a hard stop so it is not run by accident.
 */

console.error(`
enrich-location-images.mjs is deprecated.

Auto Wikipedia/Openverse matching was too unreliable for venue photos.
Use event cover uploads, Street View (Maps key), or branded covers instead.
`);
process.exit(1);
