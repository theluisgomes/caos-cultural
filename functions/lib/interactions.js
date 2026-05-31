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
exports.forwardInteraction = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
/**
 * Forwards interaction signals to analytics pipeline (Pub/Sub → BigQuery stub).
 * Wire to real Pub/Sub topic in production.
 */
exports.forwardInteraction = (0, firestore_1.onDocumentCreated)({ document: 'interactions/{id}', region: 'southamerica-east1' }, event => {
    var _a;
    const data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    logger.info('Interaction signal', {
        id: event.params.id,
        kind: data === null || data === void 0 ? void 0 : data.kind,
        targetType: data === null || data === void 0 ? void 0 : data.targetType,
        targetId: data === null || data === void 0 ? void 0 : data.targetId,
        actorUserId: data === null || data === void 0 ? void 0 : data.actorUserId,
        pipeline: 'pubsub-bigquery-vertex-stub',
    });
});
//# sourceMappingURL=interactions.js.map