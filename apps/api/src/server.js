const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { knex } = require('./models/db');

async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true, credentials: false });

  // Health
  app.get('/v1/health', async () => ({ ok: true }));

  // Auth routes
  app.register(async function (r) {
    r.post('/v1/auth/register', async (req, reply) => {
      const { first_name, last_name, email, phone, password } = req.body || {};
      if (!first_name || !last_name || !email || !phone || !password) {
        return reply.code(400).send({ error: 'Missing fields' });
      }
      // Kyrgyz phone: +996XXXXXXXXX
      if (!/^\+996\d{9}$/.test(phone)) {
        return reply.code(400).send({ error: 'Неверный формат телефона (+996XXXXXXXXX)' });
      }
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);

      // check existing
      const existing = await knex('users').where({ email }).first();
      if (existing) return reply.code(409).send({ error: 'Email уже зарегистрирован' });

      const [user] = await knex('users')
        .insert({
          id: knex.raw('gen_random_uuid()'),
          email,
          first_name,
          last_name,
          phone,
          password_hash: hash,
          created_at: knex.fn.now()
        })
        .returning(['id','email','first_name','last_name']);

      return reply.send({ message: 'Успешная регистрация', user });
    });

    r.post('/v1/auth/login', async (req, reply) => {
      const { email, password } = req.body || {};
      if (!email || !password) return reply.code(400).send({ error: 'Missing fields' });
      const bcrypt = require('bcryptjs');
      const user = await knex('users').where({ email }).first();
      if (!user) return reply.code(401).send({ error: 'Неверный логин или пароль' });
      const ok = await bcrypt.compare(password, user.password_hash || '');
      if (!ok) return reply.code(401).send({ error: 'Неверный логин или пароль' });
      return reply.send({ message: 'Успешный вход' });
    });
  });

  return app;
}

module.exports = { buildServer };
