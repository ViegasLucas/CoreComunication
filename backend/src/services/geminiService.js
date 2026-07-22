const { GoogleGenAI } = require('@google/genai');
const { OpenAI } = require('openai');
const { GATEKEEPER_PROMPT } = require('../prompts/gatekeeperPrompt');
const { getSbiSystemPrompt } = require('../prompts/sbiPrompt');
const { PROFILE_DISCOVERY_PROMPT } = require('../prompts/profileDiscoveryPrompt');
const { getPdiSystemPrompt } = require('../prompts/pdiGeneratorPrompt');
const { getOneOnOneSystemPrompt } = require('../prompts/oneOnOneGeneratorPrompt');

// ── Constantes ────────────────────────────────────────────────
const MODEL_SBI = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MODEL_GATEKEEPER = 'gemini-2.0-flash'; // SLM para validação LGPD

// ── Lazy singleton ────────────────────────────────────────────
let _genAI = null;
let _groqAI = null;

function getAIClient() {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    if (!_groqAI) {
      _groqAI = new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' });
      console.log(`[Groq] ✅ Cliente inicializado. Key prefix: ${groqKey.substring(0, 4)}...`);
    }
    return { type: 'groq', client: _groqAI };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('[Gemini/Groq] Nenhuma API Key configurada. Adicione GEMINI_API_KEY ou GROQ_API_KEY ao arquivo .env');
  }
  
  if (!_genAI) {
    if (!apiKey.startsWith('AIza')) {
      console.warn('[Gemini] ⚠️  ATENÇÃO: Sua GEMINI_API_KEY não começa com "AIza". Chaves válidas começam com "AIza...".');
    }
    _genAI = new GoogleGenAI({ apiKey });
    console.log(`[Gemini] ✅ Cliente SDK inicializado. Key prefix: ${apiKey.substring(0, 4)}...`);
  }
  return { type: 'gemini', client: _genAI };
}

// Prompts externalizados importados acima.
/**
 * RECUSA PADRÃO (LGPD Violation)
 */
const LGPD_REFUSAL_MESSAGE = `⚠️ **ALERTA DE COMPLIANCE (LGPD)**
O seu relato contém dados extremamente sensíveis (como CIDs médicos, laudos clínicos ou documentos pessoais). Para a segurança da sua empresa, a política da ClearIT bloqueou o envio destas informações para a IA.

Por favor, **remova esses dados** e envie apenas os comportamentos práticos e entregas que deseja discutir no feedback.

**❌ O que REMOVER:** Diagnósticos médicos (burnout, depressão, atestados, etc) e números de documentos (CPF, RG).
**✅ O que MANTER:** Comportamentos observáveis (Ex: "Não cumpriu o prazo", "Teve postura agressiva na reunião").`;

/**
 * RECUSA PADRÃO (Toxicidade / Discurso de Ódio)
 */
const TOXIC_REFUSAL_MESSAGE = `⚠️ **ALERTA DE CONDUTA**
Por favor, mantenha um tom profissional. Xingamentos direcionados, insultos graves e discurso de ódio não são tolerados na plataforma.

Tente reescrever o seu relato focando exclusivamente nos fatos e comportamentos profissionais que deseja debater.`;

// ── Filtro LGPD (pré-processamento do input) ─────────────────

/**
 * Padrões de dados pessoais sensíveis que devem ser bloqueados antes
 * de enviar ao modelo (defesa em profundidade — o modelo também filtra,
 * mas é melhor nunca enviar ao servidor da Google).
 */
const LGPD_PATTERNS = [
  { name: 'CPF', regex: /\d{3}\.??\d{3}\.??\d{3}-?\d{2}/g },
  { name: 'RG', regex: /\d{1,2}\.??\d{3}\.??\d{3}-?[A-Za-z0-9]?/g },
  { name: 'Telefone', regex: /(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g },
  { name: 'E-mail', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'CEP', regex: /\d{5}-?\d{3}/g },
  { name: 'Endereço', regex: /(rua|avenida|av\.?|travessa|r\.|alameda)\s+[\w\d\s,.-]{3,100}/ig },
  { name: 'Salário', regex: /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g },
  { name: 'Saúde', regex: /\b(doença|internamento|hospital|diagnóstico|sintoma|tratamento)\b/ig },
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
 * Verifica se o texto contém dados pessoais sensíveis (Híbrido: RegEx + SLM).
 * @param {string} text
 * @returns {Promise<{ blocked: boolean, type: 'LGPD' | 'TOXIC' | null, reason: string | null }>}
 */
async function checkLGPD(text) {
  // 1. Validação RegEx (rápida e determinística)
  for (const pattern of LGPD_PATTERNS) {
    if (pattern.regex.test(text)) {
      // Reset lastIndex para regex com flag /g
      pattern.regex.lastIndex = 0;
      return { blocked: true, type: 'LGPD', reason: pattern.name };
    }
    pattern.regex.lastIndex = 0;
  }
  
  // 2. Validação SLM (Gatekeeper de contexto semântico)
  try {
    const aiService = getAIClient();
    if (aiService.type === 'groq') {
      const response = await aiService.client.chat.completions.create({
        model: 'llama-3.1-8b-instant', // SLM ultrarrápido ideal para DLP
        messages: [
          { role: 'system', content: GATEKEEPER_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0,
        max_tokens: 100,
        response_format: { type: 'json_object' }
      });
      const result = JSON.parse(response.choices[0].message.content);
      if (result.is_sensitive || result.is_toxic) {
        return { blocked: true, type: result.is_toxic ? 'TOXIC' : 'LGPD', reason: result.reason || 'DLP SLM Detection' };
      }
    } else {
      const response = await aiService.client.models.generateContent({
        model: MODEL_GATEKEEPER,
        contents: text,
        config: {
          systemInstruction: GATEKEEPER_PROMPT,
          responseMimeType: "application/json",
          temperature: 0,
        },
      });
      const result = JSON.parse(response.text);
      if (result.is_sensitive || result.is_toxic) {
        return { blocked: true, type: result.is_toxic ? 'TOXIC' : 'LGPD', reason: result.reason || 'DLP SLM Detection' };
      }
    }
  } catch (error) {
    console.error('[Gatekeeper SLM] Erro ao validar LGPD, caindo de volta para regex (Fail-Open):', error.message);
  }

  return { blocked: false, type: null, reason: null };
}

// ── Função principal ──────────────────────────────────────────

/**
 * Gera um roteiro de feedback SBI usando o Gemini.
 * @param {string} userMessage - Descrição da situação pelo líder
 * @param {string} profileTone - Tom do perfil do líder
 * @returns {Promise<{ reply: string, blocked: boolean }>}
 */
async function generateSBIFeedback(userMessage, profileTone = 'neutro', contextData = '') {
  // 1. Filtro LGPD Híbrido (RegEx + SLM) antes de enviar ao modelo
  const checkResult = await checkLGPD(userMessage);
  if (checkResult.blocked) {
    if (checkResult.type === 'TOXIC') {
      return { reply: TOXIC_REFUSAL_MESSAGE, blocked: true };
    }

    // Comportamento configurável via env: se LGPD_REDACT=true, redigimos e prosseguimos,
    // caso contrário recusamos a requisição (padrão seguro).
    if (process.env.LGPD_REDACT === 'true') {
      const redacted = redactLGPD(userMessage);
      console.warn(`[Gemini] Input continha ${checkResult.reason} — redigido antes do envio.`);
      // adiciona nota para o modelo/contexto
      userMessage = `${redacted}\n\n(Nota: algumas informações sensíveis foram removidas por conformidade com a LGPD.)`;
    } else {
      console.warn(`[Gemini] Requisição bloqueada por LGPD: ${checkResult.reason} detectado no input.`);
      return {
        reply: LGPD_REFUSAL_MESSAGE,
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

  // 3. Chamada à API
  try {
    const aiService = getAIClient();
    let reply = '';

    if (aiService.type === 'groq') {
      const response = await aiService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: getSbiSystemPrompt(profileTone) + contextData },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      reply = response.choices[0].message.content;
      console.log(`[Groq] Resposta gerada com sucesso via Llama 3.`);
    } else {
      const response = await aiService.client.models.generateContent({
        model: MODEL_SBI,
        contents: userMessage,
        config: {
          systemInstruction: getSbiSystemPrompt(profileTone) + contextData,
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      });
      reply = response.text;
      console.log(`[Gemini] Resposta gerada com sucesso. Tokens usados: ~${Math.ceil(reply.length / 4)}`);
    }

    return { reply, blocked: false };
  } catch (error) {
    console.error('[AI Service] Erro ao chamar a API (Fallback ativado):', error.message);
    
    // MOCK RESPONSE PARA O MVP (Modo Custo Zero)
    const mockReply = `## 🧊 Check-in
"Olá! Como estão as coisas por aí nesta semana? Queria aproveitar nosso papo de hoje para conversar sobre a nossa última entrega."

## 🎯 O Feedback (SBI)
**Situação:** Durante a entrega final da sprint passada, na última sexta-feira.
**Comportamento:** Observei que os relatórios foram enviados após o horário combinado, e faltaram algumas métricas que haviam sido solicitadas pela diretoria.
**Impacto:** Como consequência, não tivemos tempo hábil para revisar os dados juntos, o que gerou insegurança na apresentação para o cliente na segunda-feira de manhã.

## 🤝 Próximos Passos (Plano de Ação)
- Como você avalia a organização do tempo durante essa sprint?
- Quais ajustes podemos fazer para garantir que o envio aconteça com margem de revisão da próxima vez?
- Existe algum bloqueio ou dificuldade técnica em que eu possa te apoiar?

*(Nota: Esta é uma resposta mock gerada localmente pelo Modo Custo Zero. Quando a API estiver ativa, ela será gerada dinamicamente baseada no seu relato.)*`;
    
    return { reply: mockReply, blocked: false };
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

    let finalUserMessage = userMessage;

    const localCheck = await checkLGPD(userMessage);
    if (localCheck.blocked) {
      if (localCheck.type === 'TOXIC') {
        const aiService = getAIClient();
        
        const lastModelMessage = history.slice().reverse().find(msg => msg.role === 'model');
        const lastQuestion = lastModelMessage && lastModelMessage.parts && lastModelMessage.parts.length > 0 
          ? lastModelMessage.parts[0].text 
          : "Nenhuma pergunta anterior identificada no histórico.";

        const dynamicRepromptSystem = `Você é o agente da ClearIT conduzindo a Descoberta de Perfil.
O usuário acabou de tentar enviar uma resposta contendo Linguagem tóxica / Discurso de Ódio.
Sua missão agora é:
1. Atuar como moderador: Recusar cordialmente o envio desses dados, dando um breve alerta educado e profissional. Use formatação Markdown (ex: emojis de alerta ⚠️, negritos).
2. Repetir de forma amigável a última pergunta que você fez, pedindo para o usuário responder focando apenas em comportamentos profissionais.

Última pergunta que você fez e que precisa ser respondida: "${lastQuestion}"`;

        let refusalText = '';
        try {
          if (aiService.type === 'groq') {
            const response = await aiService.client.chat.completions.create({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: dynamicRepromptSystem },
                { role: 'user', content: `A resposta bloqueada do usuário foi: "${userMessage}"` }
              ],
              temperature: 0.5,
              max_tokens: 300,
            });
            refusalText = response.choices[0].message.content || '';
          } else {
            const response = await aiService.client.models.generateContent({
              model: MODEL_SBI,
              contents: `A resposta bloqueada do usuário foi: "${userMessage}"`,
              config: {
                systemInstruction: dynamicRepromptSystem,
                temperature: 0.5,
                maxOutputTokens: 300,
              },
            });
            refusalText = response.text || '';
          }
        } catch (e) {
          console.error('[AI Profile] Erro ao gerar recusa dinâmica:', e.message);
          refusalText = `⚠️ **ALERTA DE CONDUTA:** Por favor, mantenha um tom profissional. Xingamentos não são tolerados.\n\nVamos tentar de novo? Relembrando:\n*"${lastQuestion}"*`;
        }

        return { reply: refusalText, blocked: true };
      } else if (localCheck.type === 'LGPD') {
        // Correção Graciosa (Graceful Correction):
        // Em vez de bloquear, injetamos uma instrução secreta no final da mensagem do usuário para que o LLM 
        // absorva a parte útil, dê um leve alerta, e siga em frente com a próxima pergunta.
        finalUserMessage = `${userMessage}\n\n[INSTRUÇÃO DE SISTEMA OCULTA: O usuário respondeu à sua pergunta, mas acabou incluindo dados pessoais sensíveis (como CPF, laudos ou documentos). Aja como moderador: absorva a parte útil da resposta dele para continuar a avaliação, dê um breve e amigável alerta de privacidade no início da sua resposta pedindo para ele não enviar esses dados novamente no futuro, e então SIGA EM FRENTE fazendo a PRÓXIMA pergunta do roteiro de perfil. Não trave o teste e não repita a pergunta anterior se ele já respondeu o que importava.]`;
      }
    }

    if (history.length > 0 && history[0].role === 'model') {
      history.unshift({ role: 'user', parts: [{ text: 'Olá, vamos iniciar o teste de perfil.' }] });
    }

    let reply = '';
    const aiService = getAIClient();

    if (aiService.type === 'groq') {
      // Converte o histórico (formato Gemini) para o formato OpenAI/Groq
      const messages = [
        { role: 'system', content: PROFILE_DISCOVERY_PROMPT }
      ];
      for (const msg of history) {
        messages.push({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.parts[0].text });
      }
      messages.push({ role: 'user', content: finalUserMessage });

      const response = await aiService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.5,
        max_tokens: 500,
      });
      reply = response.choices[0].message.content || '';
    } else {
      const contents = [...history, { role: 'user', parts: [{ text: finalUserMessage }] }];
      const response = await aiService.client.models.generateContent({
        model: MODEL_SBI,
        contents,
        config: {
          systemInstruction: PROFILE_DISCOVERY_PROMPT,
          temperature: 0.5,
          maxOutputTokens: 500,
        },
      });
      reply = response.text || '';
    }

    return {
      reply,
      blocked: false,
    };
  } catch (error) {
    console.error('[AI Profile] Erro ao processar (Fallback ativado):', error.message);
    
    // MOCK RESPONSE PARA O MVP (Modo Custo Zero)
    // Se for o início do chat, faz mais uma pergunta. Se já houver histórico, dá o resultado final.
    let mockReply = "Entendo. E como você costuma lidar com feedbacks difíceis na sua equipe?";
    if (history && history.length > 2) {
      mockReply = "[RESULTADO_PERFIL: ENGAJADO] Pelo seu histórico, noto que você tem um perfil muito voltado para desenvolver a equipe e manter todos motivados, mesmo em momentos de conflito. Este é o perfil 'Engajado'.";
    }

    return {
      reply: mockReply,
      blocked: false,
    };
  }
}

/**
 * Gera um Plano de Desenvolvimento Individual (PDI)
 * @param {string} userMessage - Contexto e desafios do liderado
 * @param {string} profileTone - Tom do perfil do líder
 * @returns {Promise<{ reply: string, blocked: boolean }>}
 */
async function generatePDI(userMessage, profileTone = 'neutro', contextData = '') {
  const checkResult = await checkLGPD(userMessage);
  if (checkResult.blocked) {
    if (checkResult.type === 'TOXIC') {
      return { reply: TOXIC_REFUSAL_MESSAGE, blocked: true };
    }
    if (process.env.LGPD_REDACT === 'true') {
      const redacted = redactLGPD(userMessage);
      userMessage = `${redacted}\n\n(Nota: algumas informações sensíveis foram removidas por conformidade com a LGPD.)`;
    } else {
      return { reply: LGPD_REFUSAL_MESSAGE, blocked: true };
    }
  }

  try {
    const aiService = getAIClient();
    let reply = '';

    if (aiService.type === 'groq') {
      const response = await aiService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: getPdiSystemPrompt(profileTone) + contextData },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      reply = response.choices[0].message.content || '';
    } else {
      const response = await aiService.client.models.generateContent({
        model: MODEL_SBI,
        contents: userMessage,
        config: {
          systemInstruction: getPdiSystemPrompt(profileTone) + contextData,
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });
      reply = response.text || '';
    }

    return { reply, blocked: false };
  } catch (error) {
    console.error('[AI PDI] Erro:', error.message);
    return { reply: "Desculpe, ocorreu um erro ao gerar o PDI. Tente novamente mais tarde.", blocked: false };
  }
}

/**
 * Gera uma Pauta de Reunião de 1:1
 * @param {string} userMessage - Contexto da reunião
 * @param {string} profileTone - Tom do perfil do líder
 * @returns {Promise<{ reply: string, blocked: boolean }>}
 */
async function generateOneOnOne(userMessage, profileTone = 'neutro', contextData = '') {
  const checkResult = await checkLGPD(userMessage);
  if (checkResult.blocked) {
    if (checkResult.type === 'TOXIC') {
      return { reply: TOXIC_REFUSAL_MESSAGE, blocked: true };
    }
    if (process.env.LGPD_REDACT === 'true') {
      const redacted = redactLGPD(userMessage);
      userMessage = `${redacted}\n\n(Nota: algumas informações sensíveis foram removidas por conformidade com a LGPD.)`;
    } else {
      return { reply: LGPD_REFUSAL_MESSAGE, blocked: true };
    }
  }

  try {
    const aiService = getAIClient();
    let reply = '';

    if (aiService.type === 'groq') {
      const response = await aiService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: getOneOnOneSystemPrompt(profileTone) + contextData },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      reply = response.choices[0].message.content || '';
    } else {
      const response = await aiService.client.models.generateContent({
        model: MODEL_SBI,
        contents: userMessage,
        config: {
          systemInstruction: getOneOnOneSystemPrompt(profileTone) + contextData,
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });
      reply = response.text || '';
    }

    return { reply, blocked: false };
  } catch (error) {
    console.error('[AI 1:1] Erro:', error.message);
    return { reply: "Desculpe, ocorreu um erro ao gerar a pauta de 1:1. Tente novamente mais tarde.", blocked: false };
  }
}

module.exports = { generateSBIFeedback, generateProfileDiscovery, generatePDI, generateOneOnOne, checkLGPD, redactLGPD };
