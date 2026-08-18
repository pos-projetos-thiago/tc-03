import {
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase/firestore';
import type { PaginatedResult } from '@/src/shared/types/pagination';
import type { TransactionDTO } from '../types/transaction-dto';
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from '../types/transaction';
import type { TransactionFilter } from '../types/transaction-filter';
import type { ITransactionService } from '../types/transaction-service.interface';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLLECTION = 'transactions';
const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converte um DocumentSnapshot do Firestore para o modelo de domínio Transaction.
 */
function toTransaction(snapshot: DocumentSnapshot): Transaction {
  const dto = snapshot.data() as TransactionDTO;
  return {
    id: snapshot.id,
    userId: dto.userId,
    type: dto.type,
    amount: dto.amount,
    category: dto.category,
    description: dto.description,
    date: dto.date.toDate().toISOString(),
    receiptUrl: dto.receiptUrl,
    createdAt: dto.createdAt.toDate().toISOString(),
    updatedAt: dto.updatedAt.toDate().toISOString(),
  };
}

/**
 * Converte uma string ISO 8601 para Timestamp do Firestore.
 */
function toTimestamp(iso: string): Timestamp {
  return Timestamp.fromDate(new Date(iso));
}

// ---------------------------------------------------------------------------
// Service implementation
// ---------------------------------------------------------------------------

class FirestoreTransactionService implements ITransactionService {
  async getPage(
    userId: string,
    cursor?: unknown,
    filter?: TransactionFilter,
  ): Promise<PaginatedResult<Transaction>> {
    const ref = collection(db, COLLECTION);

    // Constraints base: escopo do usuário + ordenação
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('date', 'desc'),
    ];

    // Filtros opcionais
    if (filter?.type) {
      constraints.push(where('type', '==', filter.type));
    }
    if (filter?.category) {
      constraints.push(where('category', '==', filter.category));
    }
    if (filter?.dateRange) {
      constraints.push(where('date', '>=', Timestamp.fromDate(filter.dateRange.start)));
      constraints.push(where('date', '<=', Timestamp.fromDate(filter.dateRange.end)));
    }

    // Paginação via cursor
    if (cursor) {
      constraints.push(startAfter(cursor as DocumentSnapshot));
    }

    // Busca PAGE_SIZE + 1 para saber se há próxima página
    constraints.push(limit(PAGE_SIZE + 1));

    const snapshot = await getDocs(query(ref, ...constraints));
    const docs = snapshot.docs;

    const hasMore = docs.length > PAGE_SIZE;
    const items = docs.slice(0, PAGE_SIZE).map(toTransaction);
    const nextCursor = hasMore ? docs[PAGE_SIZE - 1] : null;

    return { items, cursor: nextCursor, hasMore };
  }

  async create(userId: string, data: CreateTransactionInput): Promise<Transaction> {
    const now = Timestamp.now();

    const dto: TransactionDTO = {
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: toTimestamp(data.date),
      receiptUrl: data.receiptUrl,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await addDoc(collection(db, COLLECTION), dto);

    return {
      id: ref.id,
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      receiptUrl: data.receiptUrl,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTransactionInput,
  ): Promise<Transaction> {
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error(`Transação não encontrada: ${id}`);
    }

    const existing = snapshot.data() as TransactionDTO;

    if (existing.userId !== userId) {
      throw new Error('Operação não autorizada.');
    }

    const now = Timestamp.now();

    // Constrói apenas os campos que serão atualizados
    const patch: Partial<TransactionDTO> & { updatedAt: Timestamp } = {
      updatedAt: now,
    };
    if (data.type !== undefined) patch.type = data.type;
    if (data.amount !== undefined) patch.amount = data.amount;
    if (data.category !== undefined) patch.category = data.category;
    if (data.description !== undefined) patch.description = data.description;
    if (data.date !== undefined) patch.date = toTimestamp(data.date);
    if (data.receiptUrl !== undefined) patch.receiptUrl = data.receiptUrl;

    await updateDoc(ref, patch);

    // Retorna o documento atualizado como modelo de domínio
    const updated: TransactionDTO = { ...existing, ...patch };
    return {
      id,
      userId: existing.userId,
      type: updated.type,
      amount: updated.amount,
      category: updated.category,
      description: updated.description,
      date: updated.date.toDate().toISOString(),
      receiptUrl: updated.receiptUrl,
      createdAt: existing.createdAt.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error(`Transação não encontrada: ${id}`);
    }

    const dto = snapshot.data() as TransactionDTO;

    if (dto.userId !== userId) {
      throw new Error('Operação não autorizada.');
    }

    await deleteDoc(ref);
  }
}

// Singleton — mesmo padrão do authService
export const transactionService: ITransactionService = new FirestoreTransactionService();
