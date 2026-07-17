// firebase-lazy.js
// Importação dinâmica do Firebase para não bloquear o bundle principal (FCP/LCP)
// O Firebase é carregado sob demanda apenas quando necessário.

let _auth = null;
let _firebasePromise = null;

/**
 * Retorna a instância auth do Firebase.
 * Na primeira chamada, importa dinamicamente; nas seguintes, retorna do cache.
 */
export function getFirebaseAuth() {
  if (_auth) return Promise.resolve(_auth);
  
  if (!_firebasePromise) {
    _firebasePromise = import('./firebase').then(({ auth }) => {
      _auth = auth;
      return auth;
    });
  }
  
  return _firebasePromise;
}

/**
 * Wrapper para onAuthStateChanged que carrega o Firebase sob demanda.
 */
export async function onAuthStateChangedLazy(callback) {
  const auth = await getFirebaseAuth();
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(auth, callback);
}

/**
 * Wrapper para signOut que carrega o Firebase sob demanda.
 */
export async function signOutLazy() {
  const auth = await getFirebaseAuth();
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
}
