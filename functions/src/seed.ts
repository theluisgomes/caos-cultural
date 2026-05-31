import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

const now = () => new Date().toISOString();

const SEED_AGENTS = [
  {
    id: 'agent_livia',
    ownerUserId: 'seed',
    kind: 'artist',
    displayName: 'Lívia K.',
    slug: 'livia-k',
    tagline: 'Luz, som e dissonância',
    bio: 'Artista multimídia baseada em São Paulo.',
    disciplines: ['Visual Arts', 'Projection Mapping'],
    techniques: ['Mapping', 'Instalação'],
    professions: ['Artista Multimídia'],
    languages: ['pt-BR'],
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    neighborhood: 'Pinheiros',
    identity: {},
    socialLinks: {},
    avatarUrl: 'https://picsum.photos/seed/livia-k/600/400',
    coverUrl: 'https://picsum.photos/seed/livia-cover/1200/400',
    portfolioImages: [],
    isPublic: true,
    isVerified: true,
    acceptsCommissions: true,
    acceptsBookings: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const SEED_SPACES = [
  {
    id: 'space_white_cube',
    slug: 'white-cube',
    ownerAgentId: null,
    managerUserIds: [],
    name: 'The White Cube',
    kind: 'gallery',
    description: 'Galeria minimalista para exposições pop-up.',
    address: {
      street: null,
      number: null,
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      postalCode: null,
    },
    geo: { lat: -23.561, lng: -46.699 },
    capacity: 120,
    amenities: ['Projetor', 'Som'],
    priceRange: 'mid',
    openingHours: {},
    contact: {},
    coverUrl: 'https://picsum.photos/seed/white-cube/600/400',
    images: [],
    tags: ['Galeria', 'Exposição'],
    isVerified: true,
    isPublished: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const SEED_EVENTS = [
  {
    id: 'event_sombras',
    slug: 'sombras-digitais',
    title: 'Sombras Digitais',
    kind: 'exhibition',
    subtitle: 'Arte digital imersiva',
    description: 'Arte digital entre o real e o virtual.',
    coverUrl: 'https://picsum.photos/seed/sombras/600/400',
    images: [],
    startsAt: now(),
    endsAt: null,
    timezone: 'America/Sao_Paulo',
    spaceId: 'space_white_cube',
    locationLabel: 'Galeria Vermelho, Pinheiros',
    geo: { lat: -23.561, lng: -46.699 },
    organizerAgentIds: ['agent_livia'],
    featuredAgentIds: ['agent_livia'],
    categories: ['Arte Digital', 'Exposição', 'Patrocinado'],
    tags: ['Visual', 'Imersivo', 'patrocinado'],
    ticketing: {
      isFree: true,
      priceFromBRL: null,
      priceToBRL: null,
      externalUrl: null,
      soldInternally: false,
      capacity: 200,
      ticketsSold: 0,
    },
    ageRating: 'free',
    isPublished: true,
    isCancelled: false,
    stats: { saves: 42, likes: 18, attended: 0 },
    createdAt: now(),
    updatedAt: now(),
  },
];

const SEED_WORKS = [
  {
    id: 'work_luz_01',
    authorAgentId: 'agent_livia',
    title: 'Interferência #01',
    description: 'Série sobre luz urbana.',
    medium: 'digital',
    technique: 'Projeção',
    year: 2025,
    dimensions: '1920x1080',
    durationSeconds: null,
    coverUrl: 'https://picsum.photos/seed/work-luz/600/400',
    images: [],
    audioUrl: null,
    videoUrl: null,
    editionOf: null,
    priceBRL: 1200,
    isForSale: true,
    isSold: false,
    tags: ['Digital', 'Luz'],
    isPublished: true,
    stats: { saves: 12, likes: 8, views: 140 },
    createdAt: now(),
    updatedAt: now(),
  },
];

export const seedCulturalData = onCall(
  { region: 'southamerica-east1', maxInstances: 3 },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Login required.');
    }

    const userSnap = await db.collection('users').doc(request.auth.uid).get();
    const isAdmin =
      userSnap.exists && userSnap.data()?.adminRole === 'super_admin';

    if (!isAdmin && process.env.FUNCTIONS_EMULATOR !== 'true') {
      throw new HttpsError('permission-denied', 'Admin only in production.');
    }

    let agents = [...SEED_AGENTS];
    let spaces = [...SEED_SPACES];
    let events = [...SEED_EVENTS];
    let works = [...SEED_WORKS];

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate JSON with keys agents, spaces, events, works (arrays). São Paulo cultural scene. Each agent needs id, displayName, kind, disciplines, city. Each space needs id, name, kind, geo lat/lng. Each event needs id, title, spaceId, organizerAgentIds, geo. Each work needs id, title, authorAgentId, coverUrl. Use realistic cross-references. Max 3 each.`,
                }],
              }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.agents)) agents = [...agents, ...parsed.agents.map((a: Record<string, unknown>) => ({ ...a, isPublic: true, createdAt: now(), updatedAt: now() }))];
          if (Array.isArray(parsed.spaces)) spaces = [...spaces, ...parsed.spaces.map((s: Record<string, unknown>) => ({ ...s, isPublished: true, createdAt: now(), updatedAt: now() }))];
          if (Array.isArray(parsed.events)) events = [...events, ...parsed.events.map((e: Record<string, unknown>) => ({ ...e, isPublished: true, createdAt: now(), updatedAt: now() }))];
          if (Array.isArray(parsed.works)) works = [...works, ...parsed.works.map((w: Record<string, unknown>) => ({ ...w, isPublished: true, createdAt: now(), updatedAt: now() }))];
          logger.info('Gemini seed merged', { agents: agents.length, spaces: spaces.length });
        }
      } catch (err) {
        logger.warn('Gemini seed failed, using static seed', err);
      }
    }

    const batch = db.batch();
    for (const agent of agents) {
      batch.set(db.collection('agents').doc(agent.id as string), agent, { merge: true });
    }
    for (const space of spaces) {
      batch.set(db.collection('spaces').doc(space.id as string), space, { merge: true });
    }
    for (const event of events) {
      batch.set(db.collection('events').doc(event.id as string), event, { merge: true });
    }
    for (const work of works) {
      batch.set(db.collection('works').doc(work.id as string), work, { merge: true });
    }
    await batch.commit();

    logger.info('Seed complete', { uid: request.auth.uid });
    return {
      agents: agents.length,
      spaces: spaces.length,
      events: events.length,
      works: works.length,
      gemini: Boolean(geminiKey),
    };
  }
);
