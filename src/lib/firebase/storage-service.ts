import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './storage';

/**
 * Faz o upload de um arquivo local (URI) para o Firebase Storage.
 *
 * Caminho no bucket:
 *   receipts/{userId}/{transactionId}/{timestamp}.{ext}
 *
 * @param userId         ID do usuário autenticado — isola os arquivos por usuário.
 * @param transactionId  ID da transação — pode ser o ID definitivo (edição)
 *                       ou um ID temporário gerado antes do save (criação).
 * @param uri            URI local do arquivo (retornada pelo picker).
 * @param mimeType       MIME type do arquivo (ex: "image/jpeg", "application/pdf").
 *                       Preservado como Content-Type no objeto do Storage.
 * @param onProgress     Callback opcional com % de progresso (0–100).
 * @returns              URL pública do arquivo após o upload.
 */
export async function uploadAttachment(
  userId: string,
  transactionId: string,
  uri: string,
  mimeType: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // Extrai a extensão do arquivo da URI (fallback baseado no mimeType)
  const extFromUri = uri.split('.').pop()?.split('?')[0] ?? '';
  const ext = extFromUri || mimeTypeToExt(mimeType);
  const path = `receipts/${userId}/${transactionId}/${Date.now()}.${ext}`;

  // Converte a URI local em Blob via fetch nativo do React Native
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);

  // Preserva o Content-Type correto no objeto armazenado
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
 * Alias de compatibilidade — mantém código existente funcionando.
 * Delega para uploadAttachment com mimeType padrão de imagem.
 *
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
 * Obtém a URL de download de um arquivo já armazenado no Firebase Storage
 * a partir da sua URL pública (download URL).
 *
 * A URL retornada pelo Storage já é a download URL — esta função é útil
 * para renovar tokens expirados ou obter a URL a partir de um storage path.
 *
 * @param storagePath  Caminho completo no bucket (ex: "receipts/uid/tid/file.pdf").
 *                     Se a URL completa do Storage for passada, extrai o path automaticamente.
 * @returns            URL de download renovada.
 */
export async function getAttachmentDownloadUrl(storagePath: string): Promise<string> {
  // Aceita tanto um path limpo quanto uma URL completa do Firebase Storage
  const path = storagePath.startsWith('https://')
    ? extractStoragePath(storagePath)
    : storagePath;

  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

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
 * Ex: "https://firebasestorage.googleapis.com/v0/b/bucket/o/receipts%2F..."
 *     → "receipts/..."
 */
function extractStoragePath(url: string): string {
  try {
    const urlObj = new URL(url);
    // O path do objeto fica após "/o/" na URL do Storage
    const match = urlObj.pathname.match(/\/o\/(.+)$/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    // Ignora erro de parse — retorna a string original
  }
  return url;
}
