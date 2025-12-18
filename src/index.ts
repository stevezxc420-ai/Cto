import 'dotenv/config';
import { sequelize } from './config/database';
import { IntegrationService } from './services/IntegrationService';
import { SchedulerService } from './services/SchedulerService';

async function main() {
  try {
    await sequelize.sync(); // Create tables
    console.log('Database synced.');

    const integrationService = new IntegrationService();
    const schedulerService = new SchedulerService(integrationService);

    schedulerService.start();
    
    // For demonstration, if env vars are present, trigger a sync immediately
    if (process.argv.includes('--sync-now')) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Sync last 30 days
        await integrationService.syncAll(startDate, endDate);
    }
    
    // Keep process alive if not just syncing
    if (!process.argv.includes('--sync-now')) {
        process.stdin.resume();
    }

  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

main();
