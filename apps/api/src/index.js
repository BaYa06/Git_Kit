require('dotenv').config();
const { buildServer } = require('./server');
const PORT = process.env.PORT_API || 3001;

buildServer().then(app => {
  app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`API listening at ${address}`);
  });
}).catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
