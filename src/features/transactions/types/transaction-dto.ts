import type { Timestamp } from 'firebase/firestore';

/**
 * DTO — representa o documento como armazenado no Firestore.
 * O `id` não consta aqui: vem do DocumentSnapshot.id.
 * A única diferença estrutural em relação ao domain model é o tipo das datas.
 */
export interface TransactionDTO {
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Timestamp;
  receiptUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
