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
 * @param uri            URI local do arquivo (retornada pelo expo-image-picker).
 * @param onProgress     Callback opcional com % de progresso (0–100).
 * @returns              URL pública do arquivo após o upload.
 */
export async function uploadReceipt(
  userId: string,
  transactionId: string,
  uri: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // Extrai a extensão do arquivo da URI (fallback para 'jpg')
  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const path = `receipts/${userId}/${transactionId}/${Date.now()}.${ext}`;

  // Converte a URI local em Blob via fetch nativo do React Native
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, blob);

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
