import { useCallback, useState } from 'react';

import { uploadReceipt } from '@/src/lib/firebase/storage-service';

interface UseReceiptUploadResult {
  /** Faz o upload do arquivo e retorna a URL pública, ou null em caso de erro. */
  upload: (userId: string, transactionId: string, uri: string) => Promise<string | null>;
  /** Progresso do upload em % (0–100). Null enquanto não iniciado. */
  progress: number | null;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Encapsula o upload de recibo para o Firebase Storage.
 * Mantido independente do form para ser reutilizável em outros contextos.
 */
export function useReceiptUpload(): UseReceiptUploadResult {
  const [progress, setProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (userId: string, transactionId: string, uri: string): Promise<string | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const url = await uploadReceipt(userId, transactionId, uri, (pct) => {
          setProgress(pct);
        });
        return url;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível enviar o recibo.';
        setError(message);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { upload, progress, isUploading, error, clearError };
}
