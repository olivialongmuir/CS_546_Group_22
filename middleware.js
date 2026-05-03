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
   * Redirects to profile page if already logged in
   */
  app.use(['/login', '/register'], (req, res, next) => {
    if (req.session.userId) res.redirect('/profile');

    next();
  });

  /**
   * Redirects to login page if not logged in
   */
  app.use('/profile', (req, res, next) => {
    if (!req.session.userId) res.redirect('/login');

    next();
  })

  /**
   * Redirects to login if not logged in. If access level is not admin, throw error
   */
  app.use('/admin', (res, req, next) => {
    if (!req.session.userId) res.redirect('/login');
    if (req.session.userType !== 'admin') {
      res.status(403).render('error', {title: 'Forbidden'});
    }

    next();
  })

  /**
   * Only logged in users can create a rodent report
   */
  app.use('/rodentReports', (res, req, next) => {
    if (req.method === 'POST') {
      if (!req.session.userId) res.status(403).render('error', {title: 'Forbiddent'});
    }

    next();
  })



}

export default constructorMethod;