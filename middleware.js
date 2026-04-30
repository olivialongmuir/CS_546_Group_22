export const logger = (req, res, next) => {
  const auth = req.session.userId ? 'Authenticated' : 'Non-Authenticated';
  console.log(`[${new Date().toUTCString()}] ${req.method} ${req.originalUrl} (${auth})`);
  next();
};

export const loginRedirect = (req, res, next) => {
  if (req.session.userId) return res.redirect('/profile');
  next();
};

export const protectedRoute = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  if (req.session.userType !== 'admin') {
    return res.status(403).render('error', { title: 'Forbidden' });
  }
  next();
};
