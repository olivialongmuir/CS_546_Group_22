// MAIN APP HERE

import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import configMiddleware from './middleware.js';
import exphbs from 'express-handlebars';
import session from 'express-session';

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

// Handlebars initialization
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  partialsDir: 'views/partials', 
  helpers: { eq: (a, b) => a === b }
}));

app.set('view engine', 'handlebars');

// Calls middleware routes
configMiddleware(app);

// Calls regular routes
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});