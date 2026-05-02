// MAIN APP HERE

import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import { logger, loginRedirect, protectedRoute, adminOnly } from './middleware.js';

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  // let the next middleware run:
  next();
};

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
  name: 'SqueakPeekSession',
  secret: 'squeakpeek_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));
app.use(rewriteUnsupportedBrowserMethods);

app.use(logger);

app.use((req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session && req.session.userId);
  res.locals.isAdmin = req.session && req.session.userType === 'admin';
  next();
});


//middlewear for page hits
app.use('/login', loginRedirect);
app.use('/register', loginRedirect);
app.use('/profile', protectedRoute);
app.use('/admin', adminOnly);



app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  partialsDir: 'views/partials' 
}));

app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});