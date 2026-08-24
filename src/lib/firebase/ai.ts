import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app from './config';

/**
 * Instância do Firebase AI Logic usando a mesma FirebaseApp já inicializada.
 * Usa o backend Gemini Developer API (GoogleAIBackend) — adequado para
 * projetos acadêmicos/teste. A API key é gerenciada pelo Firebase Console
 * (projeto vinculado à Gemini API Key) e NÃO é exposta no bundle do app.
 *
 * Pré-requisito no Firebase Console:
 *   Build → AI Logic → ativar "Gemini Developer API"
 */
const firebaseAI = getAI(app, { backend: new GoogleAIBackend() });

/**
 * Modelo gemini-3.5-flash-lite — Flash-Lite estável da série 3.x.
 * Confirmado disponível em 2026-08-24 na documentação oficial do Firebase AI Logic:
 *   https://firebase.google.com/docs/ai-logic/models
 * - NÃO requer plano Blaze quando usado com Gemini Developer API (GoogleAIBackend).
 * - Suporta: texto, imagens, PDF, código e saída JSON estruturada (responseSchema).
 * - Substitui os descontinuados gemini-2.x-flash (desativados em junho/2026) e
 *   gemini-2.5-flash (desativação prevista para outubro/2026).
 */
export const geminiModel = getGenerativeModel(firebaseAI, {
  model: 'gemini-3.5-flash-lite',
});