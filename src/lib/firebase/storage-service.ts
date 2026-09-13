import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './storage';

/**
 * Faz upload de um arquivo local para o Firebase Storage.
 *
 * Caminho no bucket: receipts/{userId}/{transactionId}/{timestamp}.{ext}
 *
 * @param userId         ID do usuário autenticado.
 * @param transactionId  ID da transação (definitivo em edição, temporário em criação).
 * @param uri            URI local do arquivo retornada pelo picker.
 * @param mimeType       MIME type do arquivo (ex: "image/jpeg", "application/pdf").
 * @param onProgress     Callback opcional com percentual de progresso (0–100).
 * @returns              URL pública do arquivo após o upload.
 */
export async function uploadAttachment(
  userId: string,
  transactionId: string,
  uri: string,
  mimeType: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const extFromUri = uri.split('.').pop()?.split('?')[0] ?? '';
  const ext = extFromUri || mimeTypeToExt(mimeType);
  const path = `receipts/${userId}/${transactionId}/${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);

  const uploadTask = uploadBytesResumable(storageRef, blob, {
    contentType: mimeType,
  });

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

/**
 * @deprecated Usar uploadAttachment com mimeType explícito.
 */
export async function uploadReceipt(
  userId: string,
  transactionId: string,
  uri: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return uploadAttachment(userId, transactionId, uri, 'image/jpeg', onProgress);
}

/**
 * Obtém a URL de download de um arquivo armazenado no Firebase Storage.
 * Aceita tanto um storage path limpo quanto uma URL completa do Storage.
 */
export async function getAttachmentDownloadUrl(storagePath: string): Promise<string> {
  const path = storagePath.startsWith('https://')
    ? extractStoragePath(storagePath)
    : storagePath;

  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/** Mapeia MIME type para extensão de arquivo. */
function mimeTypeToExt(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg': return 'jpg';
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/heic': return 'heic';
    case 'application/pdf': return 'pdf';
    case 'text/plain': return 'txt';
    default: return 'bin';
  }
}

/**
 * Extrai o storage path de uma URL de download do Firebase Storage.
 * Ex: "https://firebasestorage.googleapis.com/v0/b/bucket/o/receipts%2F..." → "receipts/..."
 */
function extractStoragePath(url: string): string {
  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/o\/(.+)$/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    // parse error — retorna a string original
  }
  return url;
}
