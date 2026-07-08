const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    serviceAccount = require('../../serviceAccountKey.json');
  }
} catch (error) {
  console.error("Erro ao carregar Service Account do Firebase:", error.message);
  console.warn("Certifique-se de configurar FIREBASE_SERVICE_ACCOUNT_KEY ou criar o arquivo serviceAccountKey.json");
}

let db = null;
let auth = null;

if (serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("Firebase Admin inicializado com sucesso.");
  
  db = getFirestore();
  auth = getAuth();
}

module.exports = { db, auth };
