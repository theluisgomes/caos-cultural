"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardInteraction = exports.upsertUserOnLogin = exports.seedCulturalData = void 0;
const firebase_functions_1 = require("firebase-functions");
const seed_js_1 = require("./seed.js");
Object.defineProperty(exports, "seedCulturalData", { enumerable: true, get: function () { return seed_js_1.seedCulturalData; } });
const auth_js_1 = require("./auth.js");
Object.defineProperty(exports, "upsertUserOnLogin", { enumerable: true, get: function () { return auth_js_1.upsertUserOnLogin; } });
const interactions_js_1 = require("./interactions.js");
Object.defineProperty(exports, "forwardInteraction", { enumerable: true, get: function () { return interactions_js_1.forwardInteraction; } });
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10, region: 'southamerica-east1' });
//# sourceMappingURL=index.js.map