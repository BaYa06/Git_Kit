require('dotenv').config();
const get = (k, d) => process.env[k] ?? d ?? null;
module.exports = { get };
