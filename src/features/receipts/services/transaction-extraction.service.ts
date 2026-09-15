import { GenerativeModel, GoogleAIBackend, SchemaType, getAI, getGenerativeModel } from 'firebase/ai';
import type { Part } from 'firebase/ai';
import * as LegacyFS from 'expo-file-system/legacy';

import app from '@/src/lib/firebase/config';
import type { SelectedAttachment } from '../types/selected-attachment';
import type { ExtractionResult } from '../types/extraction-result';

/**
 * Schema JSON passado ao Gemini para saída estruturada.
 * Usando responseMimeType "application/json" + responseSchema, o modelo
 * retorna JSON válido sem necessidade de parsing frágil.
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

/**
 * Lazy singleton para o modelo Gemini.
 * Criado aqui dentro do service para evitar circular dependencies no Metro/Hermes.
 */
let _geminiModel: GenerativeModel | null = null;
function getGeminiModel(): GenerativeModel {
  if (!_geminiModel) {
    const firebaseAI = getAI(app, { backend: new GoogleAIBackend() });
    _geminiModel = getGenerativeModel(firebaseAI, { model: 'gemini-3.5-flash-lite' });
  }
  return _geminiModel;
}

/**
 * Extrai dados de transação de um arquivo via Firebase AI Logic (Gemini).
 * Não cria transações nem persiste dados — apenas retorna um ExtractionResult estruturado.
 */
export async function extractTransactionFromAttachment(
  attachment: SelectedAttachment,
): Promise<ExtractionResult> {
  const parts = await buildParts(attachment);

  const response = await getGeminiModel().generateContent({
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

/**
 * Constrói as partes da mensagem para o Gemini de acordo com o tipo do arquivo.
 *
 * TXT: lido como texto puro via expo-file-system/legacy (suporta URIs content:// e file://).
 * Imagem/PDF: lido como base64 e enviado como inlineData.
 *
 * A API nova (new File(uri)) rejeita URIs content:// via validatePath(),
 * por isso usamos expo-file-system/legacy.
 */
async function buildParts(attachment: SelectedAttachment): Promise<Part[]> {
  const { uri, mimeType } = attachment;

  if (mimeType === 'text/plain') {
    const text = await LegacyFS.readAsStringAsync(uri, {
      encoding: LegacyFS.EncodingType.UTF8,
    });
    return [
      { text: 'Analyze this document content and extract transaction information:' },
      { text },
    ];
  }

  const base64 = await LegacyFS.readAsStringAsync(uri, {
    encoding: LegacyFS.EncodingType.Base64,
  });

  return [
    { text: 'Analyze this document and extract transaction information:' },
    { inlineData: { mimeType, data: base64 } },
  ];
}

/**
 * Normaliza o objeto retornado pelo Gemini garantindo o contrato ExtractionResult.
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
