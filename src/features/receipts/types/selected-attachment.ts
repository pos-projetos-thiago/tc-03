/**
 * Representa um arquivo selecionado localmente — ainda não enviado ao Storage.
 * Abstração única para imagens (expo-image-picker) e documentos (expo-document-picker).
 */
export interface SelectedAttachment {
  /** URI local do arquivo no dispositivo. */
  uri: string;
  /** Nome original do arquivo (ex: "recibo.pdf"). */
  name: string;
  /** MIME type do arquivo (ex: "image/jpeg", "application/pdf", "text/plain"). */
  mimeType: string;
  /** Tamanho em bytes, quando disponível. */
  size: number | null;
}

/** Retorna `true` se o arquivo é uma imagem que pode ter preview. */
export function isImage(attachment: SelectedAttachment): boolean {
  return attachment.mimeType.startsWith('image/');
}

/** Retorna um rótulo legível para o tipo do arquivo. */
export function attachmentTypeLabel(attachment: SelectedAttachment): string {
  if (attachment.mimeType === 'application/pdf') return 'PDF';
  if (attachment.mimeType === 'text/plain') return 'TXT';
  if (attachment.mimeType.startsWith('image/')) return 'Imagem';
  return attachment.mimeType;
}

/** Formata o tamanho em bytes para exibição (KB / MB). */
export function formatAttachmentSize(bytes: number | null): string {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
