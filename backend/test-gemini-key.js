/**
 * Script de diagnóstico da API do Gemini
 * Rode com: node test-gemini-key.js
 */
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

async function diagnosticar() {
  console.log('\n🔍 === DIAGNÓSTICO DA API GEMINI ===\n');

  // 1. Verificar se a chave existe
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY não encontrada no .env');
    return;
  }
  console.log(`✅ Chave encontrada. Prefixo: ${apiKey.substring(0, 6)}...`);
  console.log(`   Tamanho: ${apiKey.length} caracteres`);

  if (!apiKey.startsWith('AIza')) {
    console.warn('⚠️  AVISO: A chave NÃO começa com "AIza". Chaves do Google AI Studio começam com "AIza...".');
    console.warn('   Gere uma nova em: https://aistudio.google.com/app/apikey');
  }

  // 2. Testar com gemini-2.0-flash
  console.log('\n📡 Testando conexão com gemini-2.0-flash...');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Responda apenas com "OK" sem nada mais.',
    });
    console.log(`🟢 SUCESSO com gemini-2.0-flash! Resposta: "${response.text.trim()}"`);
  } catch (error) {
    console.log(`❌ FALHOU com gemini-2.0-flash`);
    console.log(`   Código: ${error.status || 'N/A'}`);
    console.log(`   Mensagem: ${error.message?.substring(0, 200)}`);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.log('\n🚨 DIAGNÓSTICO: COTA EXCEDIDA (Erro 429)');
      console.log('   Sua chave esgotou o limite gratuito de requisições.');
      console.log('   SOLUÇÕES:');
      console.log('   1. Gere uma NOVA chave em: https://aistudio.google.com/app/apikey');
      console.log('   2. Use outro projeto Google Cloud');
      console.log('   3. Aguarde o reset da cota (geralmente 1 minuto)');
    }

    if (error.message?.includes('401') || error.message?.includes('API_KEY_INVALID')) {
      console.log('\n🚨 DIAGNÓSTICO: CHAVE INVÁLIDA (Erro 401)');
      console.log('   A chave não é reconhecida pelo Google.');
      console.log('   Gere uma nova em: https://aistudio.google.com/app/apikey');
    }
  }

  // 3. Testar com gemini-2.5-flash (modelo mais novo)
  console.log('\n📡 Testando conexão com gemini-2.5-flash...');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Responda apenas com "OK" sem nada mais.',
    });
    console.log(`🟢 SUCESSO com gemini-2.5-flash! Resposta: "${response.text.trim()}"`);
  } catch (error) {
    console.log(`❌ FALHOU com gemini-2.5-flash`);
    console.log(`   Mensagem: ${error.message?.substring(0, 200)}`);
  }

  console.log('\n=== FIM DO DIAGNÓSTICO ===\n');
}

diagnosticar();
