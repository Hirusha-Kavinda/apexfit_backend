const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRole) => (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Allow guest token for meeting access
  if (token === 'guest-token') {
    req.user = { id: 'guest', role: 'USER', firstName: 'Guest User' };
    // Optionally check if guest access is allowed for this route
    if (requiredRole && requiredRole.toUpperCase() !== 'USER') {
      return res.status(403).json({ message: 'Insufficient permissions for guest user' });
    }
    return next();
  }

  // Regular JWT verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (requiredRole && decoded.role !== requiredRole.toUpperCase()) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;