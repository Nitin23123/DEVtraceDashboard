const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyToken
 * Reads Authorization: Bearer <token> header, verifies JWT, attaches req.user = { id, email }
 * Returns 401 if token is missing, malformed, or expired.
 */
const verifyToken = (req, res, next) => {
  // DEV-ONLY auth bypass for local use. Active only when NOT in production AND the
  // explicit DEV_AUTH_BYPASS flag is set. Render sets NODE_ENV=production, so this
  // can never fire in the deployed backend even if the flag were present.
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true') {
    req.user = { id: 1, email: 'dev@local' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
