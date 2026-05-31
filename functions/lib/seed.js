"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCulturalData = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
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
        categories: ['Arte Digital', 'Exposição'],
        tags: ['Visual', 'Imersivo'],
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
exports.seedCulturalData = (0, https_1.onCall)({ region: 'southamerica-east1', maxInstances: 3 }, async (request) => {
    var _a, _b, _c, _d, _e, _f;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Login required.');
    }
    const userSnap = await db.collection('users').doc(request.auth.uid).get();
    const isAdmin = userSnap.exists && ((_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.adminRole) === 'super_admin';
    if (!isAdmin && process.env.FUNCTIONS_EMULATOR !== 'true') {
        throw new https_1.HttpsError('permission-denied', 'Admin only in production.');
    }
    let agents = [...SEED_AGENTS];
    let spaces = [...SEED_SPACES];
    let events = [...SEED_EVENTS];
    let works = [...SEED_WORKS];
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
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
            });
            const json = await res.json();
            const text = (_f = (_e = (_d = (_c = (_b = json === null || json === void 0 ? void 0 : json.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text;
            if (text) {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed.agents))
                    agents = [...agents, ...parsed.agents.map((a) => (Object.assign(Object.assign({}, a), { isPublic: true, createdAt: now(), updatedAt: now() })))];
                if (Array.isArray(parsed.spaces))
                    spaces = [...spaces, ...parsed.spaces.map((s) => (Object.assign(Object.assign({}, s), { isPublished: true, createdAt: now(), updatedAt: now() })))];
                if (Array.isArray(parsed.events))
                    events = [...events, ...parsed.events.map((e) => (Object.assign(Object.assign({}, e), { isPublished: true, createdAt: now(), updatedAt: now() })))];
                if (Array.isArray(parsed.works))
                    works = [...works, ...parsed.works.map((w) => (Object.assign(Object.assign({}, w), { isPublished: true, createdAt: now(), updatedAt: now() })))];
                logger.info('Gemini seed merged', { agents: agents.length, spaces: spaces.length });
            }
        }
        catch (err) {
            logger.warn('Gemini seed failed, using static seed', err);
        }
    }
    const batch = db.batch();
    for (const agent of agents) {
        batch.set(db.collection('agents').doc(agent.id), agent, { merge: true });
    }
    for (const space of spaces) {
        batch.set(db.collection('spaces').doc(space.id), space, { merge: true });
    }
    for (const event of events) {
        batch.set(db.collection('events').doc(event.id), event, { merge: true });
    }
    for (const work of works) {
        batch.set(db.collection('works').doc(work.id), work, { merge: true });
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
});
//# sourceMappingURL=seed.js.map