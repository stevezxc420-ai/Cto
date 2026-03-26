import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import { ApiProvider, CostData, UsageData } from '../interfaces/Provider';

export class AWSProvider implements ApiProvider {
  name = 'aws';
  private client: CostExplorerClient;

  constructor(region: string, accessKeyId: string, secretAccessKey: string) {
    this.client = new CostExplorerClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async fetchCosts(startDate: Date, endDate: Date): Promise<CostData[]> {
    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0],
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
    });

    try {
      const response = await this.client.send(command);
      
      return (response.ResultsByTime || []).map(result => ({
          provider: this.name,
          timestamp: new Date(result.TimePeriod?.Start || ''),
          amount: parseFloat(result.Total?.UnblendedCost?.Amount || '0'),
          currency: result.Total?.UnblendedCost?.Unit || 'USD',
          service: 'AWS Total',
      }));
    } catch (error) {
      console.error('AWS fetchCosts error', error);
      throw error;
    }
  }

  async fetchUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
      return [];
  }
}
