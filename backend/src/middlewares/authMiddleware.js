const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  // Guard: Firebase Admin não inicializou (falta Service Account)
  if (!auth) {
    return res.status(503).json({
      error: 'Serviço de autenticação indisponível. Contate o administrador.',
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken; // UID e e-mail ficam disponíveis em req.user nos controllers
    next();
  } catch (error) {
    console.error('[Auth] Token inválido ou expirado:', error.code || error.message);
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = verifyToken;
