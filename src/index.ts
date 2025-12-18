import { createApp } from './app';
import { initDb } from './config/db';
import { env } from './config/env';

async function main() {
  await initDb();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
