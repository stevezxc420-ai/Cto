import { sequelize } from './config/database';
import { IntegrationService } from './services/IntegrationService';
import { Usage } from './models/Usage';
import { Cost } from './models/Cost';

async function main() {
  // Set mock env vars
  process.env.STRIPE_SECRET_KEY = 'mock_key';
  process.env.TWILIO_ACCOUNT_SID = 'mock_sid';
  process.env.TWILIO_AUTH_TOKEN = 'mock_token';

  await sequelize.sync({ force: true });
  
  const service = new IntegrationService();
  
  console.log('Providers:', service.getProviders().map(p => p.name));
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  
  await service.syncAll(startDate, endDate);
  
  const costs = await Cost.findAll();
  console.log('Costs found:', costs.length);
  costs.forEach(c => console.log(`Cost: ${c.provider} ${c.amount} ${c.currency}`));
  
  const usages = await Usage.findAll();
  console.log('Usages found:', usages.length);
  usages.forEach(u => console.log(`Usage: ${u.provider} ${u.value} ${u.unit}`));

  if (costs.length > 0 && usages.length > 0) {
      console.log('SUCCESS: Fetched data from mock providers');
      process.exit(0);
  } else {
      console.error('FAILURE: No data fetched');
      process.exit(1);
  }
}

main();
