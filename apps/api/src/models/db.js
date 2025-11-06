const Knex = require('knex');

const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/git_kit',
  pool: { min: 0, max: 10 },
  // debug: true,
});

module.exports = { knex };
