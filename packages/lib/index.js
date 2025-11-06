const pino = require('pino');
const logger = pino({ name: 'git-kit' });
module.exports = { logger };
