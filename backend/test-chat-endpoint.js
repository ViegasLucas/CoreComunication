#!/usr/bin/env node
/**
 * Script de teste para o endpoint POST /api/chat
 * Uso: node test-chat-endpoint.js
 * 
 * PRÉ-REQUISITO: Servidor rodando com `npm run dev`
 */

require('dotenv').config();
const { getAuth } = require('firebase-admin/auth');
const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const http = require('http');

// ── Inicializar Firebase ───────────────────────────────────
let auth;
try {
  if (!getApps().length) {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
      serviceAccount = require('./serviceAccountKey.json');
    }
    initializeApp({ credential: cert(serviceAccount) });
  }
  auth = getAuth();
  console.log('[Test] ✅ Firebase Admin inicializado\n');
} catch (error) {
  console.error('[Test] ❌ Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}

// ── Configuração ───────────────────────────────────────────
const BASE_URL = 'http://localhost:3001';
const TEST_UID = 'test-user-' + Date.now();
const TESTS = [
  {
    name: '❌ Chat SEM Token (deve falhar)',
    message: 'O João não entregou a tarefa no prazo',
    token: null,
    expectError: true,
  },
  {
    name: '❌ Chat COM Token INVÁLIDO (deve falhar)',
    message: 'O João não entregou a tarefa no prazo',
    token: 'invalid-token-xyz',
    expectError: true,
  },
  {
    name: '✅ Chat COM Token VÁLIDO - Input válido',
    message: 'O João atrasou a entrega do projeto X e isso bloqueou o time de testes',
    token: null, // Será preenchido
    expectError: false,
  },
  {
    name: '⚠️ Chat COM Token VÁLIDO - Input com dados sensíveis (LGPD)',
    message: 'O Maria tem depressão (CID F32) e não consegue concentrar no código. CPF: 123.456.789-00',
    token: null, // Será preenchido
    expectError: false, // Será bloqueado pela API (blocked=true)
  },
  {
    name: '✅ Chat COM Token VÁLIDO - Input muito curto',
    message: 'João atrasou',
    token: null, // Será preenchido
    expectError: false, // API responde com feedback de validação
  },
];

// ── Funções auxiliares ─────────────────────────────────────

/**
 * Gera um ID token de teste para um UID específico
 */
async function generateTestToken(uid) {
  try {
    const customToken = await auth.createCustomToken(uid);
    console.log(`   [Token] Custom token gerado para UID: ${uid}`);
    return customToken;
  } catch (error) {
    console.error('   [Token] Erro ao gerar token:', error.message);
    throw error;
  }
}

/**
 * Faz requisição HTTP para a API
 */
function makeRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ── Execução dos testes ────────────────────────────────────

async function runTests() {
  console.log('🧪 Iniciando testes do endpoint POST /api/chat\n');

  // Gerar tokens válidos para os testes
  try {
    const validToken = await generateTestToken(TEST_UID);
    for (let i = 2; i < TESTS.length; i++) {
      TESTS[i].token = validToken;
    }
  } catch (error) {
    console.error('❌ Erro ao gerar token de teste. Abortando.\n');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    console.log(`📝 ${test.name}`);

    try {
      const response = await makeRequest('POST', '/api/chat', { message: test.message }, test.token);

      console.log(`   └─ Status: ${response.status}`);
      console.log(`   └─ Response:`, JSON.stringify(response.body, null, 2));

      // Validações
      let testPassed = false;

      if (test.expectError) {
        // Esperamos erro (status 4xx ou 5xx)
        testPassed = response.status >= 400;
        console.log(`   └─ ${testPassed ? '✅ PASS' : '❌ FAIL'} (Esperado: erro)\n`);
      } else {
        // Esperamos sucesso (status 200)
        testPassed = response.status === 200;
        if (response.status === 200) {
          // Verificar estrutura da resposta
          const hasReply = response.body.reply !== undefined;
          const hasBlocked = response.body.blocked !== undefined;
          const hasUser = response.body.user !== undefined;
          testPassed = hasReply && hasBlocked && hasUser;
          console.log(`   └─ Estrutura: reply=${hasReply}, blocked=${hasBlocked}, user=${hasUser}`);
          if (response.body.blocked) {
            console.log(`   └─ ⚠️  Bloqueado por LGPD (esperado para dados sensíveis)`);
          }
        }
        console.log(`   └─ ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
      }

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`   └─ ❌ Erro na requisição: ${error.message}\n`);
      failed++;
    }
  }

  // Resumo
  console.log('═'.repeat(60));
  console.log(`📊 RESUMO: ${passed}/${TESTS.length} testes passaram`);
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram!');
  } else {
    console.log(`⚠️  ${failed} teste(s) falharam`);
  }
  console.log('═'.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

// Executar
runTests().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
