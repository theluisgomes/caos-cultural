import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageInstance, isFirebaseConfigured } from '../lib/firebase';

export type StorageFolder = 'users' | 'agents' | 'works' | 'spaces';

export type StorageKind = 'avatar' | 'cover' | 'gallery' | 'portfolio' | 'work';

/**
 * Uploads an image to Cloud Storage and returns the public download URL.
 * Canonical path: `{folder}/{ownerId}/{kind}/{timestamp}.{ext}`
 */
export async function uploadImage(
  folder: StorageFolder,
  ownerId: string,
  file: File,
  kind: StorageKind
): Promise<{ url: string; storagePath: string }> {
  if (!isFirebaseConfigured()) {
    return { url: URL.createObjectURL(file), storagePath: `local/${folder}/${ownerId}/${kind}` };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${ownerId}/${kind}/${Date.now()}.${ext}`;
  const storageRef = ref(getStorageInstance(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  return { url, storagePath: path };
}
