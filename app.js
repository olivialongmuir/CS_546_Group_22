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
  cookie: {
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Handlebars initialization
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  helpers: {
    eq: (a, b) => a === b,
    // Embed a value as JSON inside an inline <script> block.
    // Escapes characters that could break out of the script tag or confuse HTML parsers, without breaking JSON validity.
    jsonForScript: (value) => {
      const json = JSON.stringify(value);
      if (json === undefined) return 'null';
      return json
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
    }
  }
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