/**
 * Notes:
 * This file contains all middleware routes.
 * If further organization is required, consider grouping middleware by page
 */

const constructorMethod = (app) => {
  /**
   * Default middlware - runs every time any route is requested
   */
  app.use('/', (req, res, next) => {
    /*
    * If the user posts to the server with a property called _method, rewrite the request's method
    * To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    * rewritten in this middleware to a PUT route
    */
    if (req.body && req.body._method) {
      req.method = req.body._method;
      delete req.body._method;
    }

    // Console logging
    const auth = req.session.userId ? 'Authenticated' : 'Non-Authenticated';
    console.log(`[${new Date().toUTCString()}] ${req.method} ${req.originalUrl} (${auth})`);

    // Check login status
    res.locals.isLoggedIn = Boolean(req.session && req.session.userId);
    res.locals.isAdmin = req.session && req.session.userType === 'admin';

    next();
  });

  /**
   * Protect admin page
   */
  app.use([
    '/admin',
  ], (req, res, next) => {
    if (!req.session.userId) res.redirect('/login');
    if (req.session.userType !== 'admin') {
      return res.status(403).render('error', {title: 'Forbidden'});
    }

    next();
  });

  /**
   * Only admin users can change or delete restaurants and reports
   */
  app.use([
    '/restaurants/:id',
    '/rodentReports/:id'
  ], (req, res, next) => {
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      if (!req.session.userId) res.redirect('/login');
      if (req.session.userType !== 'admin') {
        return res.status(403).render('error', {title: 'Forbidden'});
      }
    }

    next();
  })

  /**
   * Logged in already so redirect to profile page
   */
  app.use(['/login', '/register'], (req, res, next) => {
    if (req.session.userId) {
      res.redirect('/profile');
    }

    next();
  });

  /**
   * Only logged in users can post rodent reports
   */
  app.use('/rodentReports', (req, res, next) => {
    if (req.method === 'POST') {
      if (!req.session.userId) {
        return res.status(403).render('error', {title: 'Forbidden'});
      }
    }

    next();
  });

  /**
   * Only restaurant owners and admins can register new restaurants
   */
  app.use('/api/restaurants', (req, res, next) => {
    if (req.method === 'POST') {
      if (!req.session.userId) {
        return res.status(401).redirect('/login');
      }
      if (req.session.userType !== 'restaurant' && req.session.userType !== 'admin') {
        return res.status(403).render('error', {title: 'Forbidden'});
      }
    }

    next();
  });

  /**
   * Only logged users can react and delete comments
   */
  app.use([
    '/comments/:id/delete',
    '/comments/:id/like',
    '/comments/:id/dislike'
  ], (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({error: 'Must be logged in'});
    }

    next();
  });

  /**
   * Trying to interact with comments while not logged in redirects to login page
   */
  app.use([
    '/profile',
    '/restaurants/:id/comments',
    '/api/restaurants/:id/comments'
  ], (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).redirect('/login');
    }

    next();
  })

}

export default constructorMethod;