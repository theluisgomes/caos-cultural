import {
  GeoPoint as FsGeoPoint,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { z } from 'zod';

/** Convert app values → Firestore-friendly payload (strip undefined). */
export function toFirestore<T extends Record<string, unknown>>(data: T): DocumentData {
  return stripUndefined(deepMapToFs(data)) as DocumentData;
}

/** Convert Firestore snapshot data → plain JSON-friendly values. */
export function fromFirestore(data: DocumentData | undefined): Record<string, unknown> {
  if (!data) return {};
  return deepMapFromFs(data) as Record<string, unknown>;
}

/** Parse a document snapshot with a Zod schema. Returns null if missing or invalid. */
export function parseDoc<S extends z.ZodType>(
  schema: S,
  snap: DocumentSnapshot | QueryDocumentSnapshot
): z.infer<S> | null {
  if (!snap.exists()) return null;
  const raw = { id: snap.id, ...fromFirestore(snap.data() as DocumentData) };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[firestore] schema mismatch for ${snap.ref.path}`, parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

/** Parse or throw — use on writes / trusted reads. */
export function parseDocOrThrow<S extends z.ZodType>(
  schema: S,
  snap: DocumentSnapshot | QueryDocumentSnapshot
): z.infer<S> {
  const value = parseDoc(schema, snap);
  if (!value) {
    throw new Error(`Invalid or missing document: ${snap.ref.path}`);
  }
  return value;
}

/** Validate before write; returns Firestore payload. */
export function prepareWrite<S extends z.ZodType>(
  schema: S,
  data: unknown
): DocumentData {
  const parsed = schema.parse(data);
  return toFirestore(parsed as Record<string, unknown>);
}

function deepMapToFs(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (Array.isArray(value)) return value.map(deepMapToFs);
  if (isPlainObject(value)) {
    if (
      typeof value.lat === 'number' &&
      typeof value.lng === 'number' &&
      Object.keys(value).length === 2
    ) {
      return new FsGeoPoint(value.lat, value.lng);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepMapToFs(v);
    }
    return out;
  }
  return value;
}

function deepMapFromFs(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof FsGeoPoint) return { lat: value.latitude, lng: value.longitude };
  if (Array.isArray(value)) return value.map(deepMapFromFs);
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepMapFromFs(v);
    }
    return out;
  }
  return value;
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out;
  }
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}
