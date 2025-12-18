import { Twilio } from 'twilio';
import { ApiProvider, CostData, UsageData } from '../interfaces/Provider';

export class TwilioProvider implements ApiProvider {
  name = 'twilio';
  private client!: Twilio; // Use definite assignment assertion, but be careful
  private isMock: boolean = false;

  constructor(accountSid: string, authToken: string) {
    if (accountSid === 'mock_sid' || accountSid.includes('mock')) {
        this.isMock = true;
    } else {
        this.client = new Twilio(accountSid, authToken);
    }
  }

  async fetchUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    if (this.isMock) {
        return [
            {
                provider: this.name,
                timestamp: new Date(),
                metric: 'sms-outbound',
                value: 50,
                unit: 'messages'
            }
        ];
    }
    const records = await this.client.usage.records.list({
      startDate: startDate,
      endDate: endDate,
    });

    return records.map((record) => ({
      provider: this.name,
      timestamp: record.startDate,
      metric: record.category,
      value: typeof record.usage === 'string' ? parseFloat(record.usage) : record.usage,
      unit: record.usageUnit,
    }));
  }

  async fetchCosts(startDate: Date, endDate: Date): Promise<CostData[]> {
    if (this.isMock) {
        return [
            {
                provider: this.name,
                timestamp: new Date(),
                amount: 1.50,
                currency: 'USD',
                service: 'sms-outbound'
            }
        ];
    }
    const records = await this.client.usage.records.list({
      startDate: startDate,
      endDate: endDate,
    });

    return records.map((record) => ({
      provider: this.name,
      timestamp: record.startDate,
      amount: typeof record.price === 'string' ? parseFloat(record.price) : record.price,
      currency: record.priceUnit.toUpperCase(),
      service: record.category,
    }));
  }
}
