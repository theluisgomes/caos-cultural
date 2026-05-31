import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

/**
 * Forwards interaction signals to analytics pipeline (Pub/Sub → BigQuery stub).
 * Wire to real Pub/Sub topic in production.
 */
export const forwardInteraction = onDocumentCreated(
  { document: 'interactions/{id}', region: 'southamerica-east1' },
  event => {
    const data = event.data?.data();
    logger.info('Interaction signal', {
      id: event.params.id,
      kind: data?.kind,
      targetType: data?.targetType,
      targetId: data?.targetId,
      actorUserId: data?.actorUserId,
      pipeline: 'pubsub-bigquery-vertex-stub',
    });
  }
);
