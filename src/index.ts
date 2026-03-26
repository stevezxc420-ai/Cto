import { createApp } from './app';
import { initDb } from './config/db';
import { env } from './config/env';
import { sequelize } from './config/database';
import { IntegrationService } from './services/IntegrationService';
import { SchedulerService } from './services/SchedulerService';

async function main() {
  // Init PG/Prisma
  await initDb();

  // Init Sequelize
  try {
    await sequelize.sync();
    console.log('Sequelize database synced.');
  } catch (error) {
    console.error('Sequelize sync failed:', error);
  }

  // Start background services
  const integrationService = new IntegrationService();
  const schedulerService = new SchedulerService(integrationService);
  schedulerService.start();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
