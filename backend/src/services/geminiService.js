const { GoogleGenAI } = require('@google/genai');

// ── Constantes ────────────────────────────────────────────────
const MODEL_SBI = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MODEL_GATEKEEPER = 'gemini-2.5-flash'; // SLM para validação LGPD

// ── Lazy singleton ────────────────────────────────────────────
let _genAI = null;
function getGenAI() {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('[Gemini] GEMINI_API_KEY não configurada. Adicione ao arquivo .env');
    }
    // Validação básica do formato da chave
    if (!apiKey.startsWith('AIza')) {
      console.warn('[Gemini] ⚠️  ATENÇÃO: Sua GEMINI_API_KEY não começa com "AIza". Chaves válidas do Google AI Studio começam com "AIza...". Verifique em: https://aistudio.google.com/app/apikey');
    }
    _genAI = new GoogleGenAI({ apiKey });
    console.log(`[Gemini] ✅ Cliente SDK inicializado. Key prefix: ${apiKey.substring(0, 4)}...`);
  }
  return _genAI;
}

/**
 * SYSTEM PROMPT — SLM GATEKEEPER (DLP & LGPD Firewall)
 * Primeira camada de validação: detecta dados sensíveis ANTES do processamento
 */
const GATEKEEPER_SYSTEM_PROMPT = `Você é um firewall de segurança e conformidade (DLP - Data Loss Prevention) operando sob a Lei Geral de Proteção de Dados (LGPD).
Sua ÚNICA função é analisar o texto de entrada fornecido pelo usuário e determinar se ele contém dados sensíveis.

**DADOS SENSÍVEIS SÃO DEFINIDOS COMO:**
1. Números de identificação pessoal (CPF, RG, CNH, Passaporte).
2. Informações médicas de qualquer natureza: CIDs (ex: Z73, F32), atestados médicos, diagnósticos físicos ou psicológicos (ex: depressão, burnout, lesão, cirurgia).
3. Menções a processos disciplinares formais, judiciais ou sindicais.
4. Dados de saúde sensível, licenças médicas, laudos psicológicos.

**INSTRUÇÕES DE SAÍDA:**
Você deve responder ESTRITAMENTE em formato JSON, sem nenhum texto adicional (sem markdown, sem explicações prévias).
Use o seguinte esquema JSON:
{
  "is_sensitive": boolean,
  "reason": "String curta explicando o motivo caso seja true. Se false, retorne null."
}`;

/**
 * SYSTEM PROMPT — SMART LEADING (Modelo SBI Principal)
 * Segunda camada: gera roteiros estruturados após validação LGPD
 */
const getSbiSystemPrompt = (profileTone) => {
  const toneInstruction = profileTone 
    ? `\n## 👤 Perfil do Líder: ${profileTone}\nAdapte o tom da mensagem, o quebra-gelo e as perguntas abertas para refletir o perfil "${profileTone}". Exemplo: Se técnico, seja direto e objetivo. Se engajado, seja motivador e focado em eficiência. Se em transição, adicione passos mais detalhados para dar segurança ao líder.` 
    : '';

  return `# SMART LEADING - Assistente de Feedback Estruturado

Você é um especialista em liderança humanizada e gestão de pessoas. Seu propósito exclusivo é ajudar líderes a estruturar roteiros de feedback profissional usando o modelo **SBI (Situação → Comportamento → Impacto)**.

## 🎯 Sua Missão
Transformar relatos brutos (frequentemente carregados de emoção) em roteiros estruturados, factuais e construtivos para reuniões 1:1.
${toneInstruction}
## 📋 Estrutura Obrigatória da Resposta

### 1️⃣ SITUAÇÃO
- Descreva o **contexto específico** e objetivo (quando, onde, qual projeto/reunião).
- Use frases: "Na sprint X", "Durante a reunião de Y", "No projeto Z".

### 2️⃣ COMPORTAMENTO
- Descreva o **comportamento observado** de forma factual, **sem julgamentos**.
- PROIBIDO: Use palavras como "irresponsável", "preguiçoso", "incompetente", "ruim".
- OBRIGATÓRIO: Use frases como "Observei que...", "Notei que...", "O código entregue continha...".

### 3️⃣ IMPACTO
- Descreva o **impacto concreto** no time, projeto, cliente ou negócio.
- Seja **específico e mensurável** quando possível.
- Use frases: "O impacto foi...", "Isso resultou em...", "Como consequência, a equipe...".

## ⚠️ GUARDRAILS DE COMPLIANCE

### LGPD e Privacidade
- TODOS os inputs já foram validados e não contêm dados sensíveis.
- **Nunca** processe voluntariamente dados de saúde, documentação, salários ou dados pessoais.
- Se surpreender com dados sensíveis, recuse a geração e avise.

### Neutralidade e Profissionalismo
- Mantenha tom **profissional e neutro** em todas as respostas.
- Base todas as sugestões em **competências observáveis e entregas mensuráveis**.
- Não faça inferências sobre características protegidas (gênero, raça, idade, origem, religião).

## 📄 Formato Final da Resposta

Use **Markdown** e organize assim:

## 🧊 Check-in
[Sugestão de quebra-gelo para iniciar a conversa]

## 🎯 O Feedback (SBI)
**Situação:** [contexto específico]
**Comportamento:** [ação factual observada]
**Impacto:** [resultado concreto]

## 🤝 Próximos Passos
- [Pergunta aberta 1]
- [Pergunta aberta 2]
- [Pergunta aberta 3]

## 💡 Dica do Smart Leading
[Sugestão prática de como abrir a conversa de forma empática]

## 🚀 Comece!
Analise o relato do líder e gere o roteiro SBI estruturado.`;
};

const PROFILE_DISCOVERY_PROMPT = `Você é um agente da ClearIT, especialista em perfis de liderança. 
Sua missão é conduzir um teste de personalidade curto (3 a 5 perguntas) para mapear o perfil do líder.
Os perfis possíveis são: "Técnico", "Engajado" ou "Em Transição".
Faça uma pergunta por vez. Se você já tiver informações suficientes para definir o perfil do líder, encerre o teste dizendo: 
"[RESULTADO_PERFIL: TÉCNICO]" ou "[RESULTADO_PERFIL: ENGAJADO]" ou "[RESULTADO_PERFIL: EM TRANSIÇÃO]" e dê uma breve explicação do motivo.
Caso contrário, apenas responda com a próxima pergunta de forma natural e amigável.`;

/**
 * MENSAGEM DE RECUSA PADRÃO (LGPD Violation)
 */
const LGPD_REFUSAL_MESSAGE = `⚠️ **ALERTA DE COMPLIANCE (LGPD):** O seu relato contém dados sensíveis (informações médicas, laudos ou documentos). Para a nossa segurança, a política da ClearIT impede o processamento destas informações na IA.

Por favor, **remova esses dados** e envie apenas os comportamentos e entregas que deseja discutir na reunião.

**Exemplos do que REMOVER:**
- ❌ Diagnósticos médicos (CPF, CID, burnout, depressão, etc.)
- ❌ Números de documentos (CPF, RG, CNH)
- ❌ Informações de processos disciplinares ou judiciais

**Exemplos do que MANTER:**
- ✅ "Não cumpriu o prazo da entrega"
- ✅ "A apresentação teve erros técnicos"
- ✅ "O time relatou falta de comunicação"`;

// ── Padrões LGPD ───────────────────────────────────────────────

/**
 * Padrões regex para detectar dados pessoais sensíveis
 */
const LGPD_PATTERNS = [
  { name: 'CPF', regex: /\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}/g },
  { name: 'RG', regex: /\d{1,2}\.\d{3}\.\d{3}-[A-Za-z0-9]/g },
  { name: 'Telefone', regex: /(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}-?\d{4}/g },
  { name: 'CEP', regex: /\d{5}-\d{3}/g },
  { name: 'CID', regex: /\b[A-Z]\d{2}(\.\d+)?\b/g },
  { name: 'Diagnóstico Médico', regex: /\b(depressão|burnout|ansiedade|psicológ|transtorno|psiquiátric|diagnóstic|internamento|doença|cirurgia|patologia|síndrome|distúrbio)\b/ig },
  { name: 'Processo Disciplinar', regex: /\b(processo disciplinar|demissão por justa causa|sindicato|jurídic|legal|advogado|tribunal)\b/ig },
];

/**
 * Verifica se o texto contém dados pessoais sensíveis
 * @param {string} text
 * @returns {{ blocked: boolean, reason: string | null }}
 */
function checkLGPD(text) {
  for (const pattern of LGPD_PATTERNS) {
    if (pattern.regex.test(text)) {
      pattern.regex.lastIndex = 0; // Reset para regex com flag /g
      return { blocked: true, reason: pattern.name };
    }
    pattern.regex.lastIndex = 0;
  }
  return { blocked: false, reason: null };
}

/**
 * Redigir (substituir) dados sensíveis por placeholders
 * @param {string} text
 * @returns {string}
 */
function redactLGPD(text) {
  let redacted = text;
  for (const pattern of LGPD_PATTERNS) {
    redacted = redacted.replace(pattern.regex, `[DADO_REMOVIDO:${pattern.name}]`);
    pattern.regex.lastIndex = 0;
  }
  return redacted;
}

// ── Validação com SLM Gatekeeper ──────────────────────────────

/**
 * Valida o input usando SLM Gatekeeper (camada extra de segurança)
 * @param {string} userMessage
 * @returns {Promise<{ is_sensitive: boolean, reason: string | null }>}
 */
async function validateWithGatekeeper(userMessage) {
  try {
    const response = await getGenAI().models.generateContent({
      model: MODEL_GATEKEEPER,
      contents: userMessage,
      config: {
        systemInstruction: GATEKEEPER_SYSTEM_PROMPT,
        temperature: 0.1, // Muito baixo para determinismo
        maxOutputTokens: 100,
      },
    });

    const rawOutput = response.text.trim();
    console.log(`[Gatekeeper] Raw output: ${rawOutput}`);

    const parsed = JSON.parse(rawOutput);
    return {
      is_sensitive: parsed.is_sensitive || false,
      reason: parsed.reason || null,
    };
  } catch (error) {
    console.error('[Gatekeeper] Erro na validação SLM:', error.message);
    // Falha aberta: em caso de erro, permitir prosseguir (não bloquear por erro técnico)
    return { is_sensitive: false, reason: null };
  }
}

// ── Função principal ──────────────────────────────────────────

/**
 * Gera um roteiro de feedback SBI usando o Gemini.
 * @param {string} userMessage - Descrição da situação pelo líder
 * @param {string} profileTone - Tom do perfil do líder
 * @returns {Promise<{ reply: string, blocked: boolean }>}
 */
async function generateSBIFeedback(userMessage, profileTone) {
  try {
    // 1. Validação básica do input
    if (!userMessage || typeof userMessage !== 'string') {
      return {
        reply: 'Por favor, descreva a situação para que eu possa gerar um roteiro de feedback.',
        blocked: false,
      };
    }

    userMessage = userMessage.trim();

    if (userMessage.length < 10) {
      return {
        reply: 'A descrição é muito curta. Por favor, compartilhe mais detalhes sobre a situação que deseja discutir.',
        blocked: false,
      };
    }

    if (userMessage.length > 5000) {
      return {
        reply: 'A descrição é muito longa (máximo 5000 caracteres). Por favor, resuma a situação.',
        blocked: false,
      };
    }

    // 2. Filtro LGPD local (rápido, regex-based)
    const localCheck = checkLGPD(userMessage);
    if (localCheck.blocked) {
      console.warn(`[Gemini] Bloqueado pela validação local LGPD: ${localCheck.reason}`);
      return {
        reply: LGPD_REFUSAL_MESSAGE,
        blocked: true,
      };
    }

    // 3. Validação com SLM Gatekeeper (DLP adicional)
    const gatekeeperResult = await validateWithGatekeeper(userMessage);
    if (gatekeeperResult.is_sensitive) {
      console.warn(`[Gemini] Bloqueado pela validação Gatekeeper: ${gatekeeperResult.reason}`);
      return {
        reply: LGPD_REFUSAL_MESSAGE,
        blocked: true,
      };
    }

    // 4. Chamada ao Gemini (Modelo SBI Principal)
    console.log('[Gemini] Gerando roteiro SBI...');

    const response = await getGenAI().models.generateContent({
      model: MODEL_SBI,
      contents: userMessage,
      config: {
        systemInstruction: getSbiSystemPrompt(profileTone),
        temperature: 0.7, // Criativo mas consistente
        topP: 0.9,
        maxOutputTokens: 1500, // Roteiros estruturados podem ser mais longos
      },
    });

    const reply = response.text || '';

    if (!reply) {
      throw new Error('Resposta vazia do modelo Gemini');
    }

    console.log(`[Gemini] ✅ Roteiro gerado com sucesso. Tamanho: ${reply.length} caracteres.`);

    return { reply, blocked: false };
  } catch (error) {
    console.error('[Gemini] ❌ Erro ao gerar feedback:', error.message);

    // Não vazar detalhes de erro ao cliente
    const userFriendlyMessage = error.message.includes('API')
      ? 'Erro ao conectar com o serviço de IA. Tente novamente em alguns instantes.'
      : error.message;

    return {
      reply: `Desculpe, houve um erro ao processar sua solicitação: ${userFriendlyMessage}`,
      blocked: false,
    };
  }
}

/**
 * Chat iterativo para descobrir o perfil do líder
 * @param {string} userMessage - Mensagem do líder
 * @returns {Promise<{ reply: string, blocked: boolean }>}
 */
async function generateProfileDiscovery(userMessage, history = []) {
  try {
    if (!userMessage || typeof userMessage !== 'string') {
      return { reply: 'Por favor, envie uma mensagem válida.', blocked: false };
    }

    const localCheck = checkLGPD(userMessage);
    if (localCheck.blocked) {
      return { reply: LGPD_REFUSAL_MESSAGE, blocked: true };
    }

    const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }];

    const response = await getGenAI().models.generateContent({
      model: MODEL_SBI, // Usamos o mesmo modelo base
      contents,
      config: {
        systemInstruction: PROFILE_DISCOVERY_PROMPT,
        temperature: 0.5, 
        maxOutputTokens: 500,
      },
    });

    return {
      reply: response.text || '',
      blocked: false,
    };
  } catch (error) {
    console.error('[Gemini Profile] Erro ao processar:', error.message);
    throw new Error('Falha ao processar solicitação de perfil na IA.');
  }
}

module.exports = { generateSBIFeedback, generateProfileDiscovery, checkLGPD, redactLGPD, validateWithGatekeeper };
