import { SchemaType } from 'firebase/ai';
import type { Part } from 'firebase/ai';
import * as LegacyFS from 'expo-file-system/legacy';

import { geminiModel } from '@/src/lib/firebase/ai';
import type { SelectedAttachment } from '../types/selected-attachment';
import type { ExtractionResult } from '../types/extraction-result';

// ---------------------------------------------------------------------------
// Schema de resposta estruturada
// ---------------------------------------------------------------------------

/**
 * Schema JSON passado ao Gemini para forçar saída estruturada.
 * Usando responseMimeType "application/json" + responseSchema, o modelo
 * retorna JSON válido conforme o contrato — sem necessidade de JSON.parse frágil.
 */
const EXTRACTION_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    type: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Transaction type: income, expense, investment, or null',
    },
    amount: {
      type: SchemaType.NUMBER,
      nullable: true,
      description: 'Positive monetary value, or null if not found',
    },
    category: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Suggested category, or null',
    },
    description: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Short transaction description, or null',
    },
    date: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'ISO 8601 date string, or null if not present in document',
    },
    confidence: {
      type: SchemaType.STRING,
      description: 'Overall confidence: high, medium, or low',
    },
    rawText: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Raw text extracted from the document',
    },
  },
  required: ['confidence'],
};

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a financial data extractor. Analyze the provided document or image and extract transaction information.

Rules:
- Identify if there is a financial transaction in the content
- Use "income" for money received/deposited (depósito, crédito, recebimento, PIX recebido)
- Use "expense" for money spent/paid (pagamento, débito, saque, compra, Uber, mercado)
- Use "investment" only when the content clearly represents an investment operation
- Return null for type if you cannot determine it with confidence
- NEVER invent a monetary value — return null if not explicitly present
- NEVER invent a date — return null if not explicitly present
- Return amount as a positive number (e.g., 10, 35.50, 500)
- Return date as ISO 8601 string if found (e.g., "2024-03-15T00:00:00.000Z")
- Set confidence to "high" if all key fields are clearly identified
- Set confidence to "medium" if most fields are identified but some are inferred
- Set confidence to "low" if the content is ambiguous or incomplete
- rawText should contain the main text content you analyzed
- Respond ONLY with the JSON object, no explanations

Examples:
"deposite 10 reais na conta" → type: income, amount: 10, category: "Depósito", description: "Depósito em conta"
"paguei 35 reais no mercado" → type: expense, amount: 35, category: "Alimentação", description: "Compra no mercado"
"PIX recebido de João no valor de 500 reais" → type: income, amount: 500, category: "PIX", description: "PIX recebido de João"
"Uber R$ 28,90" → type: expense, amount: 28.90, category: "Transporte", description: "Corrida Uber"`;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Serviço de extração de dados de transação via Firebase AI Logic (Gemini).
 * Responsável exclusivamente por enviar o conteúdo ao modelo e retornar
 * um ExtractionResult estruturado.
 *
 * NÃO cria transações. NÃO persiste dados.
 */
export async function extractTransactionFromAttachment(
  attachment: SelectedAttachment,
): Promise<ExtractionResult> {
  const parts = await buildParts(attachment);

  const response = await geminiModel.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: EXTRACTION_SCHEMA,
    },
    systemInstruction: SYSTEM_PROMPT,
  });

  const text = response.response.text();
  const parsed = JSON.parse(text) as Partial<ExtractionResult>;

  return normalizeResult(parsed);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constrói as partes da mensagem para o Gemini de acordo com o tipo do arquivo.
 *
 * - TXT: lê como texto via expo-file-system/legacy readAsStringAsync e envia como part de texto
 * - Imagem / PDF: lê como base64 via expo-file-system/legacy readAsStringAsync (EncodingType.Base64)
 *   e envia como inlineData (Gemini suporta PDF nativo via inlineData)
 *
 * Usa expo-file-system/legacy porque suporta URIs content:// (Android DocumentPicker)
 * e file:// (iOS / cache do DocumentPicker) de forma confiável.
 * A API nova (new File(uri)) rejeita URIs content:// via validatePath().
 */
async function buildParts(attachment: SelectedAttachment): Promise<Part[]> {
  const { uri, mimeType } = attachment;

  // TXT — envia como texto puro para economizar tokens
  if (mimeType === 'text/plain') {
    const text = await LegacyFS.readAsStringAsync(uri, {
      encoding: LegacyFS.EncodingType.UTF8,
    });
    return [
      { text: 'Analyze this document content and extract transaction information:' },
      { text },
    ];
  }

  // Imagem ou PDF — envia como base64 para entrada multimodal
  const base64 = await LegacyFS.readAsStringAsync(uri, {
    encoding: LegacyFS.EncodingType.Base64,
  });

  return [
    { text: 'Analyze this document and extract transaction information:' },
    {
      inlineData: {
        mimeType,
        data: base64,
      },
    },
  ];
}

/**
 * Normaliza e valida o objeto retornado pelo Gemini,
 * garantindo que o contrato ExtractionResult seja sempre respeitado.
 */
function normalizeResult(raw: Partial<ExtractionResult>): ExtractionResult {
  const validTypes = ['income', 'expense', 'investment'] as const;
  const validConfidences = ['high', 'medium', 'low'] as const;

  return {
    type: validTypes.includes(raw.type as (typeof validTypes)[number])
      ? (raw.type as ExtractionResult['type'])
      : null,
    amount: typeof raw.amount === 'number' && raw.amount > 0 ? raw.amount : null,
    category: typeof raw.category === 'string' && raw.category.trim()
      ? raw.category.trim()
      : null,
    description: typeof raw.description === 'string' && raw.description.trim()
      ? raw.description.trim()
      : null,
    date: typeof raw.date === 'string' && raw.date.trim() ? raw.date.trim() : null,
    confidence: validConfidences.includes(raw.confidence as (typeof validConfidences)[number])
      ? (raw.confidence as ExtractionResult['confidence'])
      : 'low',
    rawText: typeof raw.rawText === 'string' ? raw.rawText : null,
  };
}
