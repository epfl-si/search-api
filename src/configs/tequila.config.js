const TequilaStrategy = require('passport-tequila').Strategy;

// Use the TequilaStrategy within Passport.
const tequila = new TequilaStrategy({
  service: 'Search engine',
  request: ['displayname']
});

module.exports = tequila;
