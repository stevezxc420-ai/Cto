import { Client } from '@sendgrid/client';
import { ApiProvider, CostData, UsageData } from '../interfaces/Provider';

export class SendGridProvider implements ApiProvider {
  name = 'sendgrid';
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client();
    this.client.setApiKey(apiKey);
  }

  async fetchUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    const request = {
      method: 'GET',
      url: '/v3/stats',
      qs: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
    } as any; // Type assertion needed for request object compatibility

    try {
      const [response, body] = await this.client.request(request);
      const stats = body as any[];
      const usageData: UsageData[] = [];

      stats.forEach((dayStat: any) => {
        usageData.push({
          provider: this.name,
          timestamp: new Date(dayStat.date),
          metric: 'requests',
          value: dayStat.stats[0].metrics.requests,
          unit: 'count',
        });
        usageData.push({
          provider: this.name,
          timestamp: new Date(dayStat.date),
          metric: 'delivered',
          value: dayStat.stats[0].metrics.delivered,
          unit: 'count',
        });
      });

      return usageData;
    } catch (error) {
      console.error('SendGrid fetchUsage error', error);
      throw error;
    }
  }

  async fetchCosts(startDate: Date, endDate: Date): Promise<CostData[]> {
    return [];
  }
}
