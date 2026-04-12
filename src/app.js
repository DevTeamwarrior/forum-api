/* eslint-disable no-irregular-whitespace */
import 'dotenv/config';
import { execSync } from 'child_process';
import createServer from './Infrastructures/http/createServer.js';
import container from './Infrastructures/container.js';
import config from './Commons/exceptions/config.js';
 
const start = async () => {
  // Jalankan migration otomatis hanya di production
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Running migration...');
      execSync('npm run migrate up', { stdio: 'inherit' });
      console.log('Migration finished.');
    } catch (err) {
      console.error('Migration failed:', err);
      process.exit(1);
    }
  }

  const app = await createServer(container);
  const { port } = config.app;

  app.listen(port, () => {
    console.log(`server start at port ${port}`);
  });
};

start();