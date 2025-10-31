const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const compression = require('compression');
const promBundle = require('express-prom-bundle');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession);

// const tequila = require('./configs/tequila.config');
const createOidcStrategy = require('./configs/oidc.config');

const configApi = require('./configs/api.config');
const authConfig = require('./configs/auth.config');

const authRouter = require('./routes/auth.route');
const cseRouter = require('./routes/cse.route');
const peopleRouter = require('./routes/people.route');
const legacyPeopleRouter = require('./routes/legacy.people.route');
const unitRouter = require('./routes/unit.route');
const semanticRouter = require('./routes/semantic.route');
const addressRouter = require('./routes/address.route');
const insideRouter = require('./routes/inside.route');

const authMiddleware = require('./middlewares/auth.middleware');

const metricsApp = require('./metrics');

const metricsMiddleware = promBundle({
  buckets: [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
  includePath: true,
  autoregister: false,
  metricsApp
});

// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session.
/* istanbul ignore next */
passport.serializeUser(function (user, done) {
  done(null, user);
});
/* istanbul ignore next */
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('x-powered-by', false);
app.set('trust proxy', true);

// Gzip all responses > 1kb
app.use(compression());

// Log
app.use(
  morgan('combined', { skip: (req, res) => process.env.NODE_ENV === 'test' })
);

app.use(metricsMiddleware);

// Security
app.use(helmet.frameguard());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.use(cookieParser());

app.use(expressSession({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400000
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // Prune expired entries every 24h
  }),
  name: 'search',
  secret: authConfig.secret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

(async () => {
  const oidcStrategy = await createOidcStrategy();
  passport.use('oidc', oidcStrategy);
})();

app.use(authMiddleware.setUserInfo);

const dynamicCorsOptions = function (req, callback) {
  let corsOptions;
  if (req.path.startsWith('/auth/') || req.path.startsWith('/api/inside')) {
    corsOptions = {
      origin: authConfig.searchUrl,
      credentials: true
    };
  } else {
    corsOptions = { origin: '*' };
  }
  callback(null, corsOptions);
};

app.use(cors(dynamicCorsOptions));

// Auth
app.use('/auth', authRouter);

// Google CSE
if (configApi.enableCse) {
  app.use('/api/cse', cseRouter);
}

// People
if (configApi.enableLdap) {
  app.use('/api/ldap', peopleRouter);
  app.use('/ws', legacyPeopleRouter);
}

// Address
if (configApi.enableAddress) {
  app.use('/api/address', addressRouter);
}

// Unit
if (configApi.enableUnit) {
  app.use('/api/unit', unitRouter);
}

// EPFL Graph
if (configApi.enableGraphsearch) {
  app.use('/api/graphsearch', semanticRouter);
}

app.use('/api/inside', insideRouter);

// Robots.txt
app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

// Liveness probe
app.use('/healthz', function (req, res) {
  res.send('OK');
});

// 404
app.use(function (req, res, next) {
  res.status(404).render('404');
});

module.exports = app;
