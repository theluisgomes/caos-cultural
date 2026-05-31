import { setGlobalOptions } from 'firebase-functions';
import { seedCulturalData } from './seed.js';
import { upsertUserOnLogin } from './auth.js';
import { forwardInteraction } from './interactions.js';

setGlobalOptions({ maxInstances: 10, region: 'southamerica-east1' });

export { seedCulturalData, upsertUserOnLogin, forwardInteraction };
