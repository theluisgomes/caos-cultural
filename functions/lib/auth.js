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
exports.upsertUserOnLogin = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const identity_1 = require("firebase-functions/v2/identity");
const logger = __importStar(require("firebase-functions/logger"));
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
function handleFromEmail(email) {
    const local = email.split('@')[0] || 'user';
    return `@${local.replace(/[^a-zA-Z0-9_.]/g, '_').slice(0, 24)}`;
}
/** Creates `users/{uid}` when a Firebase Auth account is first created (Gen2). */
exports.upsertUserOnLogin = (0, identity_1.beforeUserCreated)(async (event) => {
    var _a, _b;
    const user = event.data;
    if (!(user === null || user === void 0 ? void 0 : user.uid))
        return;
    const email = (_a = user.email) !== null && _a !== void 0 ? _a : '';
    const name = ((_b = user.displayName) === null || _b === void 0 ? void 0 : _b.trim()) || (email ? email.split('@')[0] : 'Usuário');
    const now = new Date().toISOString();
    await db.collection('users').doc(user.uid).set({
        id: user.uid,
        email,
        name,
        handle: email ? handleFromEmail(email) : `@user_${user.uid.slice(0, 8)}`,
        role: 'VISITOR',
        bio: '',
        location: '',
        avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        coverUrl: 'https://picsum.photos/seed/cover_new/1200/400',
        disciplines: [],
        stats: { followers: 0, following: 0, eventsAttended: 0, projectsCreated: 0 },
        joinDate: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        trustTier: 'email',
        createdAt: now,
        updatedAt: now,
    }, { merge: true });
    logger.info('User document created via auth trigger', { uid: user.uid });
});
//# sourceMappingURL=auth.js.map