/* eslint-disable no-irregular-whitespace */
import express from 'express';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';


import users from '../../Interfaces/http/api/users/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';
import likes from '../../Interfaces/http/api/likes/index.js';
 
const createServer = async (container) => {
  // Tangani error parsing JSON agar status 400 dan status 'fail' (untuk semua endpoint)


  const app = express();

  app.use(express.json());

  app.use('/users', users(container));
  app.use('/threads', threads(container));
  // Mount likes di /threads agar endpoint sesuai Postman
  app.use('/threads', likes.routes(container));

  // Only register authentications route if container has getInstance (for test isolation)
  if (container && typeof container.getInstance === 'function') {
    const authentications = (await import('../../Interfaces/http/api/authentications/index.js')).default;
    app.use('/authentications', authentications(container));
  }

  // Hello world endpoint
  app.get('/', (req, res) => {
    res.status(200).json({ data: 'Hello world!' });
  });

  // Handler 404
 
  app.use((req, res) => {
    console.error(`[404] Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      status: 'fail',
      message: 'resource not found',
    });
  });

  // Handler SyntaxError (body-parser)
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        status: 'fail',
        message: 'payload tidak valid',
      });
    }
    next(err);
  });
 
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const translatedError = DomainErrorTranslator.translate(err);
    if (translatedError instanceof ClientError) {
      res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });
 
  return app;
};
 
export default createServer;