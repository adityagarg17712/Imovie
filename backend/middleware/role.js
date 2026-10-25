const { APIError } = require('./errorHandler');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new APIError(
          `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};

const adminOnly = authorize('admin');

module.exports = {
  authorize,
  adminOnly,
};
