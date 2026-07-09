const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Produção / Vercel: lê da variável de ambiente (JSON minificado)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Desenvolvimento local: lê do arquivo (ignorado pelo .gitignore)
    serviceAccount = require('../../serviceAccountKey.json');
  }
} catch (error) {
  console.error('[Firebase] ❌ Falha ao carregar Service Account:', error.message);
  console.warn(
    '[Firebase] Configure FIREBASE_SERVICE_ACCOUNT_KEY no .env ou adicione o serviceAccountKey.json na pasta /backend'
  );
}

let db = null;
let auth = null;

if (serviceAccount) {
  // Guard contra múltipla inicialização (hot-reload local e ambientes serverless)
  const app = getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();

  console.log('[Firebase] ✅ Admin SDK inicializado com sucesso.');

  db = getFirestore(app);
  auth = getAuth(app);
} else {
  console.warn('[Firebase] ⚠️  Admin SDK NÃO inicializado. Rotas protegidas estarão indisponíveis.');
}

module.exports = { db, auth };
