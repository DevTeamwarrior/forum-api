/* eslint-disable no-irregular-whitespace */
import 'dotenv/config';
import createServer from './Infrastructures/http/createServer.js';
import container from './Infrastructures/container.js';
import config from './Commons/exceptions/config.js';
 
const start = async () => {
  const app = await createServer(container);
  const { port } = config.app;

  app.listen(port, () => {
    console.log(`server start at port ${port}`);
  });
};
 
start();