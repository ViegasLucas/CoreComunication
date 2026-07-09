#!/usr/bin/env node
/**
 * Script de teste end-to-end da integração frontend <-> backend
 * Validações:
 * 1. Backend respondendo na porta 3001
 * 2. Frontend rodando na porta 5173
 * 3. Endpoint /api/chat funcionando com token
 * 4. Bloqueio LGPD funcionando
 * 5. Resposta SBI do Gemini
 */

require('dotenv').config({ path: './backend/.env' });
const http = require('http');
const { getAuth } = require('firebase-admin/auth');
const { initializeApp, cert, getApps } = require('firebase-admin/app');

console.log('\n🧪 TESTE END-TO-END: Integração Frontend <-> Backend\n');
console.log('═'.repeat(70));

// ── Inicializar Firebase ─────────────────────────────────────────
let auth;
try {
  if (!getApps().length) {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
      serviceAccount = require('./backend/serviceAccountKey.json');
    }
    initializeApp({ credential: cert(serviceAccount) });
  }
  auth = getAuth();
  console.log('[✓] Firebase Admin inicializado\n');
} catch (error) {
  console.error('[✗] Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}

// ── Testes ─────────────────────────────────────────────────────────

const tests = [
  {
    name: '1. Backend respondendo (GET /api/health)',
    run: async () => {
      return new Promise((resolve) => {
        http.get('http://localhost:3001/api/health', (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            const json = JSON.parse(data);
            resolve({
              pass: res.statusCode === 200 && json.status === 'ok',
              detail: `Status: ${json.status} | Timestamp: ${json.timestamp}`,
            });
          });
        }).on('error', () => resolve({ pass: false, detail: 'Erro de conexão' }));
      });
    },
  },
  {
    name: '2. Frontend respondendo (GET http://localhost:5173)',
    run: async () => {
      return new Promise((resolve) => {
        http.get('http://localhost:5173/', (res) => {
          resolve({ pass: res.statusCode === 200, detail: `Status: ${res.statusCode}` });
        }).on('error', () => resolve({ pass: false, detail: 'Erro de conexão' }));
      });
    },
  },
  {
    name: '3. POST /api/chat SEM token (deve falhar com 401)',
    run: async () => {
      return makeRequest('POST', '/api/chat', { message: 'teste' }, null).then((response) => {
        return {
          pass: response.status === 401,
          detail: `Status: ${response.status} | ${response.body.error || 'OK'}`,
        };
      });
    },
  },
  {
    name: '4. POST /api/chat COM token válido',
    run: async () => {
      const token = await auth.createCustomToken('test-user-e2e-' + Date.now());
      return makeRequest('POST', '/api/chat', { message: 'João atrasou a entrega e bloqueou o time' }, token).then(
        (response) => {
          const isValid =
            response.status === 200 &&
            response.body.reply &&
            response.body.hasOwnProperty('blocked') &&
            response.body.hasOwnProperty('user');
          return {
            pass: isValid,
            detail: `Status: ${response.status} | blocked: ${response.body.blocked} | Has reply: !!${response.body.reply}`,
          };
        }
      );
    },
  },
  {
    name: '5. LGPD: Bloqueio de dados sensíveis (CPF)',
    run: async () => {
      const token = await auth.createCustomToken('test-user-e2e-' + Date.now());
      return makeRequest('POST', '/api/chat', { message: 'CPF: 123.456.789-00 - problema de performance' }, token).then(
        (response) => {
          const isBlocked = response.status === 200 && response.body.blocked === true;
          return {
            pass: isBlocked,
            detail: `Status: ${response.status} | blocked: ${response.body.blocked} | Message preview: ${response.body.reply?.substring(0, 50)}...`,
          };
        }
      );
    },
  },
  {
    name: '6. LGPD: Bloqueio de diagnóstico médico',
    run: async () => {
      const token = await auth.createCustomToken('test-user-e2e-' + Date.now());
      return makeRequest('POST', '/api/chat', { message: 'Maria tem depressão e não consegue trabalhar' }, token).then(
        (response) => {
          const isBlocked = response.status === 200 && response.body.blocked === true;
          return {
            pass: isBlocked,
            detail: `Status: ${response.status} | blocked: ${response.body.blocked}`,
          };
        }
      );
    },
  },
  {
    name: '7. Input curto (validação básica)',
    run: async () => {
      const token = await auth.createCustomToken('test-user-e2e-' + Date.now());
      return makeRequest('POST', '/api/chat', { message: 'curto' }, token).then((response) => {
        return {
          pass: response.status === 200,
          detail: `Status: ${response.status} | Response: ${response.body.reply?.substring(0, 50)}...`,
        };
      });
    },
  },
];

// ── Função auxiliar ─────────────────────────────────────────────────

function makeRequest(method, path, body, token) {
  return new Promise((resolve) => {
    const url = new URL('http://localhost:3001' + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, body: { error: err.message } });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ── Executar testes ────────────────────────────────────────────────

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n${test.name}`);
      const result = await test.run();

      if (result.pass) {
        console.log(`  ✅ PASS | ${result.detail}`);
        passed++;
      } else {
        console.log(`  ❌ FAIL | ${result.detail}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ERRO | ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`\n📊 RESULTADO: ${passed}/${tests.length} testes passaram\n`);

  if (failed === 0) {
    console.log('🎉 ✨ Integração frontend <-> backend funcionando perfeitamente!');
    console.log('\nPróximos passos:');
    console.log('1. Abra http://localhost:5173 no navegador');
    console.log('2. Faça login com uma conta Firebase');
    console.log('3. Abra a modal de IA (botão "Descobrir Perfil")');
    console.log('4. Digite uma situação de feedback para testar');
    console.log('5. Verifique a resposta SBI do Gemini\n');
  } else {
    console.log(`⚠️  ${failed} teste(s) falharam. Revise os erros acima.\n`);
  }

  console.log('═'.repeat(70) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
