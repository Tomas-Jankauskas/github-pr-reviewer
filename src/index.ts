import { App } from './app';
import { config } from './config';

async function main() {
  const app = new App(config);
  await app.start();
}

main().catch(console.error);
