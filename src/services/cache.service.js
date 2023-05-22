const NodeCache = require('node-cache');

const ttl = 60 * 15; // 15 minutes
const appCache = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.2 });

module.exports = appCache;
