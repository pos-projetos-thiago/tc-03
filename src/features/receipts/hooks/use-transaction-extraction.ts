import { useCallback, useState } from 'react';

import { extractTransactionFromAttachment } from '../services/transaction-extraction.service';
import type { SelectedAttachment } from '../types/selected-attachment';
import type { ExtractionResult } from '../types/extraction-result';

interface UseTransactionExtractionResult {
  /** Inicia a análise do arquivo. Retorna null em caso de erro. */
  analyze: (attachment: SelectedAttachment) => Promise<ExtractionResult | null>;
  /** true enquanto a IA está processando. */
  isAnalyzing: boolean;
  /** Resultado da última análise bem-sucedida. */
  result: ExtractionResult | null;
  /** Mensagem de erro da última análise, ou null. */
  error: string | null;
  /** Limpa o resultado e o erro. */
  reset: () => void;
}

/**
 * Hook de extração de dados de transação por IA.
 * Encapsula o estado de análise e delega ao serviço de extração.
 *
 * A transação NUNCA é criada automaticamente.
 * O resultado é exposto para que o formulário pré-preencha os campos,
 * mas o usuário sempre confirma antes de salvar.
 */
export function useTransactionExtraction(): UseTransactionExtractionResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (attachment: SelectedAttachment): Promise<ExtractionResult | null> => {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);

      try {
        const extracted = await extractTransactionFromAttachment(attachment);
        setResult(extracted);
        return extracted;
      } catch (err) {
        const message = mapExtractionError(err);
        setError(message);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { analyze, isAnalyzing, result, error, reset };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapExtractionError(err: unknown): string {
  if (err instanceof Error) {
    // Erros comuns do Firebase AI
    if (err.message.includes('PERMISSION_DENIED') || err.message.includes('API_KEY')) {
      return 'A IA não está configurada. Verifique a configuração do Firebase AI Logic.';
    }
    if (err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota')) {
      return 'Limite de uso da IA atingido. Tente novamente mais tarde.';
    }
    if (err.message.includes('INVALID_ARGUMENT')) {
      return 'O arquivo não pôde ser processado. Tente com outro formato.';
    }
    // Preserva a mensagem original para facilitar diagnóstico.
    // Não mascarar com "Falha de rede" — erros HTTP da SDK contêm "fetch"
    // na mensagem mas não são necessariamente problemas de conectividade.
    return err.message;
  }
  return 'Não foi possível analisar o documento. Tente novamente.';
}
