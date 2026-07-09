/**
 * Utilitários de autenticação para desenvolvimento/teste
 * Em produção, usar Firebase Authentication de verdade
 */

const AUTH_TOKEN_KEY = 'sl_auth_token';
const AUTH_USER_KEY = 'sl_auth_user';

/**
 * Gera um token JWT mock para testes
 * Em produção, isso viria do Firebase
 */
export const generateMockToken = (uid, email) => {
  // Estrutura: base64(header).base64(payload).base64(signature)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      uid,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // Válido por 24h
    })
  );
  const signature = btoa('mock-signature-' + uid);
  return `${header}.${payload}.${signature}`;
};

/**
 * Salva o token no localStorage quando usuário faz login
 */
export const saveAuthToken = (uid, email) => {
  const token = generateMockToken(uid, email);
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ uid, email }));
  return token;
};

/**
 * Recupera o token armazenado no localStorage
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token || null;
  } catch (error) {
    console.error('[Auth] Erro ao recuperar token:', error);
    return null;
  }
};

/**
 * Recupera dados do usuário logado
 */
export const getAuthUser = () => {
  try {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('[Auth] Erro ao recuperar usuário:', error);
    return null;
  }
};

/**
 * Limpa os tokens quando usuário faz logout
 */
export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

/**
 * Valida se o token está armazenado
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default {
  generateMockToken,
  saveAuthToken,
  getAuthToken,
  getAuthUser,
  clearAuthToken,
  isAuthenticated,
};
