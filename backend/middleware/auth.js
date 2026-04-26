const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sigkill-secret-key-2026';

/**
 * Auth middleware — extrage userId din JWT și îl pune pe req.userId
 * Dacă nu e token valid, răspunde cu 401.
 */
module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔒 AUTH FAIL: No token for', req.method, req.originalUrl);
      return res.status(401).json({ error: 'Autentificare necesară' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    console.log('🔑 AUTH OK: userId =', req.userId, '→', req.method, req.originalUrl);
    next();
  } catch (error) {
    console.log('🔒 AUTH FAIL: Invalid token for', req.method, req.originalUrl, error.message);
    res.status(401).json({ error: 'Token invalid sau expirat' });
  }
};
