import { z } from 'zod';
import { GeoPoint, Id, IsoDate } from './common';

export const MapPinTargetType = z.enum(['space', 'event']);
export type MapPinTargetType = z.infer<typeof MapPinTargetType>;

export const MapPin = z.object({
  id: Id,
  userId: Id,
  targetType: MapPinTargetType,
  targetId: Id,
  label: z.string().min(1).max(160),
  geo: GeoPoint,
  createdAt: IsoDate,
});
export type MapPin = z.infer<typeof MapPin>;
