const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 1) {
    return next();
  }
  return res.status(403).render('errors/403', {
    layout: false,
    message: 'Access Forbidden'
  });
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, redirectIfAuthenticated };
