export interface UploadFileInput {
  uri: string;
  name: string;
  mimeType: string;
}

/**
 * Contrato do serviço de upload de recibos.
 */
export interface IReceiptService {
  upload(
    userId: string,
    transactionId: string,
    file: UploadFileInput,
    onProgress?: (progress: number) => void,
  ): Promise<string>; // retorna a URL pública

  delete(userId: string, transactionId: string, fileName: string): Promise<void>;
}
