const NodeCache = require('node-cache');

// Initialize a shared cache instance (Default TTL: 60 seconds)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
