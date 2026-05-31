import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageInstance, isFirebaseConfigured } from '../lib/firebase';

export type StorageFolder = 'users' | 'agents' | 'works';

/**
 * Uploads an image to Cloud Storage and returns the public download URL.
 * Path pattern: `{folder}/{ownerId}/{kind}-{timestamp}.{ext}`
 */
export async function uploadImage(
  folder: StorageFolder,
  ownerId: string,
  file: File,
  kind: 'avatar' | 'cover' | 'portfolio' | 'work'
): Promise<string> {
  if (!isFirebaseConfigured()) {
    return URL.createObjectURL(file);
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${ownerId}/${kind}-${Date.now()}.${ext}`;
  const storageRef = ref(getStorageInstance(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
