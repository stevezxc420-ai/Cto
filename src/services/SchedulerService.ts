import schedule from 'node-schedule';
import { IntegrationService } from './IntegrationService';

export class SchedulerService {
  private integrationService: IntegrationService;

  constructor(integrationService: IntegrationService) {
    this.integrationService = integrationService;
  }

  start() {
    // Run every hour
    schedule.scheduleJob('0 * * * *', async () => {
      console.log('Running scheduled sync...');
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1); // Sync last 24 hours

      await this.integrationService.syncAll(startDate, endDate);
    });
    console.log('Scheduler started.');
  }
}
