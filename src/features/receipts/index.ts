// API pública da feature receipts
export type { Receipt } from './types/receipt';
export type { IReceiptService, UploadFileInput } from './types/receipt-service.interface';
export type { SelectedAttachment } from './types/selected-attachment';
export {
  isImage,
  attachmentTypeLabel,
  formatAttachmentSize,
} from './types/selected-attachment';
export type { ExtractionResult } from './types/extraction-result';

// Hooks
export { useTransactionExtraction } from './hooks/use-transaction-extraction';

// Componentes
export { AttachmentPicker } from './components/attachment-picker';
