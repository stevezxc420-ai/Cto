import { ApiProvider } from '../interfaces/Provider';
import { StripeProvider } from '../providers/StripeProvider';
import { TwilioProvider } from '../providers/TwilioProvider';
import { SendGridProvider } from '../providers/SendGridProvider';
import { AWSProvider } from '../providers/AWSProvider';
import { Usage } from '../models/Usage';
import { Cost } from '../models/Cost';
import { withRetry } from '../utils/retry';

export class IntegrationService {
  private providers: ApiProvider[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.providers.push(new StripeProvider(process.env.STRIPE_SECRET_KEY));
    }
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.providers.push(new TwilioProvider(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN));
    }
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push(new SendGridProvider(process.env.SENDGRID_API_KEY));
    }
    if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.providers.push(new AWSProvider(process.env.AWS_REGION, process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY));
    }
  }

  public async syncAll(startDate: Date, endDate: Date) {
    for (const provider of this.providers) {
      console.log(`Syncing ${provider.name}...`);
      try {
        await this.syncProvider(provider, startDate, endDate);
        console.log(`Synced ${provider.name} successfully.`);
      } catch (error) {
        console.error(`Failed to sync ${provider.name}:`, error);
      }
    }
  }

  private async syncProvider(provider: ApiProvider, startDate: Date, endDate: Date) {
    // Fetch Costs
    try {
        const costs = await withRetry(() => provider.fetchCosts(startDate, endDate));
        for (const costData of costs) {
          await Cost.create({
            provider: costData.provider,
            timestamp: costData.timestamp,
            amount: costData.amount,
            currency: costData.currency,
            service: costData.service,
            metadata: JSON.stringify(costData.metadata || {}),
          });
        }
    } catch (e) {
        console.error(`Error fetching costs for ${provider.name}`, e);
        throw e;
    }

    // Fetch Usage
    try {
        const usages = await withRetry(() => provider.fetchUsage(startDate, endDate));
        for (const usageData of usages) {
          await Usage.create({
            provider: usageData.provider,
            resourceId: usageData.resourceId,
            timestamp: usageData.timestamp,
            metric: usageData.metric,
            value: usageData.value,
            unit: usageData.unit,
            metadata: JSON.stringify(usageData.metadata || {}),
          });
        }
    } catch (e) {
        console.error(`Error fetching usage for ${provider.name}`, e);
        throw e;
    }
  }

  public getProviders(): ApiProvider[] {
      return this.providers;
  }
}
