const { GoogleGenAI } = require('@google/genai');

// ── Constantes ────────────────────────────────────────────────
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// ── Lazy singleton ────────────────────────────────────────────
// Instanciado na primeira chamada (depois do dotenv já ter rodado em app.js)
let _genAI = null;
function getGenAI() {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('[Gemini] GEMINI_API_KEY não configurada. Adicione ao arquivo .env');
    }
    _genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('[Gemini] Cliente inicializado com sucesso.');
  }
  return _genAI;
}

/**
 * SYSTEM PROMPT — define o comportamento fixo do modelo.
 * O modelo SEMPRE deve:
 *   1. Usar o framework SBI (Situação → Comportamento → Impacto)
 *   2. Respeitar a LGPD (não aceitar CPF, e-mail, telefone etc.)
 *   3. Responder apenas sobre feedbacks profissionais
 *   4. Gerar um roteiro de conversa 1:1 estruturado
 */
const SYSTEM_PROMPT = `
Você é o Smart Leading, um assistente de IA especializado em liderança humanizada e gestão de pessoas.
Seu único propósito é ajudar líderes a estruturar roteiros de feedback profissional usando o modelo SBI.

## Sua missão
Quando o líder descrever uma situação, gere um roteiro de conversa 1:1 estruturado em três partes:

### 1. SITUAÇÃO
Descreva o contexto específico de forma objetiva (quando, onde, qual projeto/reunião).

### 2. COMPORTAMENTO
Descreva o comportamento observado de forma factual, sem julgamentos ou generalizações.
Use frases como: "Observei que...", "Notei que...", "Na reunião X, você..."

### 3. IMPACTO
Descreva o impacto concreto no time, projeto ou cliente. Seja específico.
Use frases como: "O impacto disso foi...", "Isso gerou...", "Como resultado..."

## Regras obrigatórias (NUNCA viole)

### LGPD e Privacidade
- RECUSE qualquer input que contenha: CPF, RG, número de telefone, endereço residencial, dados de saúde, salário ou outros dados pessoais sensíveis.
- Se identificar esses dados, responda APENAS com a mensagem de recusa padrão abaixo (não gere roteiro).
- Nunca armazene, repita nem mencione dados pessoais sensíveis na sua resposta.

### Foco e escopo
- Responda SOMENTE sobre situações de feedback profissional em ambiente de trabalho.
- RECUSE pedidos fora deste escopo: código, receitas, notícias, opiniões políticas etc.
- NUNCA faça diagnósticos médicos ou psicológicos do colaborador.
- Mantenha sempre um tom empático, respeitoso e profissional.

## Mensagem de recusa padrão (use textualmente quando necessário)
"Não posso processar esta solicitação pois ela contém dados pessoais sensíveis protegidos pela LGPD. Por favor, descreva a situação de forma anônima, usando apenas o cargo ou função do colaborador (ex: 'desenvolvedor do time', 'analista de marketing')."

## Formato de resposta
Sempre responda em português do Brasil.
Seja direto e prático. O roteiro deve ser algo que o líder possa usar imediatamente na conversa.
Ao final do roteiro, adicione uma seção "💡 Dica do Smart Leading" com uma sugestão de como abrir a conversa de forma empática.
`.trim();

// ── Filtro LGPD (pré-processamento do input) ─────────────────

/**
 * Padrões de dados pessoais sensíveis que devem ser bloqueados antes
 * de enviar ao modelo (defesa em profundidade — o modelo também filtra,
 * mas é melhor nunca enviar ao servidor da Google).
 */
const LGPD_PATTERNS = [
  { name: 'CPF',        regex: /\d{3}\.??\d{3}\.??\d{3}-?\d{2}/g },
  { name: 'RG',         regex: /\d{1,2}\.??\d{3}\.??\d{3}-?[A-Za-z0-9]?/g },
  { name: 'Telefone',   regex: /(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g },
  { name: 'E-mail',     regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'CEP',        regex: /\d{5}-?\d{3}/g },
  { name: 'Endereço',   regex: /(rua|avenida|av\.?|travessa|r\.|alameda)\s+[\w\d\s,.-]{3,100}/ig },
  { name: 'Salário',    regex: /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g },
  { name: 'Saúde',      regex: /\b(doença|internamento|hospital|diagnóstico|sintoma|tratamento)\b/ig },
];

/**
 * Redige (substitui) dados sensíveis por placeholders antes de enviar ao provedor.
 * Substituições são do tipo: [DADO_REMOVIDO:TIPO]
 */
function redactLGPD(text) {
  let redacted = text;
  for (const pattern of LGPD_PATTERNS) {
    redacted = redacted.replace(pattern.regex, `[DADO_REMOVIDO:${pattern.name}]`);
    pattern.regex.lastIndex = 0;
  }
  return redacted;
}

/**
 * Verifica se o texto contém dados pessoais sensíveis.
 * @param {string} text
 * @returns {{ blocked: boolean, reason: string | null }}
 */
function checkLGPD(text) {
  for (const pattern of LGPD_PATTERNS) {
    if (pattern.regex.test(text)) {
      // Reset lastIndex para regex com flag /g
      pattern.regex.lastIndex = 0;
      return { blocked: true, reason: pattern.name };
    }
    pattern.regex.lastIndex = 0;
  }
  return { blocked: false, reason: null };
}

// ── Função principal ──────────────────────────────────────────

/**
 * Gera um roteiro de feedback SBI usando o Gemini.
 * @param {string} userMessage - Descrição da situação pelo líder
 * @returns {Promise<{ reply: string, blocked: boolean }>}
 */
async function generateSBIFeedback(userMessage) {
  // 1. Filtro LGPD local (antes de enviar ao modelo)
  const lgpdCheck = checkLGPD(userMessage);
  if (lgpdCheck.blocked) {
    // Comportamento configurável via env: se LGPD_REDACT=true, redigimos e prosseguimos,
    // caso contrário recusamos a requisição (padrão seguro).
    if (process.env.LGPD_REDACT === 'true') {
      const redacted = redactLGPD(userMessage);
      console.warn(`[Gemini] Input continha ${lgpdCheck.reason} — redigido antes do envio.`);
      // adiciona nota para o modelo/contexto
      userMessage = `${redacted}\n\n(Nota: algumas informações sensíveis foram removidas por conformidade com a LGPD.)`;
    } else {
      console.warn(`[Gemini] Requisição bloqueada por LGPD: ${lgpdCheck.reason} detectado no input.`);
      return {
        reply: 'Não posso processar esta solicitação pois ela contém dados pessoais sensíveis protegidos pela LGPD. Por favor, descreva a situação de forma anônima, usando apenas o cargo ou função do colaborador (ex: "desenvolvedor do time", "analista de marketing").',
        blocked: true,
      };
    }
  }

  // 2. Validação básica do tamanho do input
  if (userMessage.trim().length < 10) {
    return {
      reply: 'Por favor, descreva a situação com mais detalhes para que eu possa gerar um roteiro de feedback adequado.',
      blocked: false,
    };
  }

  // 3. Chamada ao Gemini
  try {
    const response = await getGenAI().models.generateContent({
      model: MODEL,
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,      // Criativo mas consistente
        topP: 0.9,
        maxOutputTokens: 1024, // Roteiros são concisos
      },
    });

    const reply = response.text;

    console.log(`[Gemini] Resposta gerada com sucesso. Tokens usados: ~${Math.ceil(reply.length / 4)}`);

    return { reply, blocked: false };
  } catch (error) {
    console.error('[Gemini] Erro ao chamar a API:', error.message);
    throw new Error('Falha ao processar sua solicitação com a IA. Tente novamente em instantes.');
  }
}

module.exports = { generateSBIFeedback };
