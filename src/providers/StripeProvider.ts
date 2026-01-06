import Stripe from 'stripe';
import { ApiProvider, CostData, UsageData } from '../interfaces/Provider';

export class StripeProvider implements ApiProvider {
  name = 'stripe';
  private stripe: Stripe;
  private isMock: boolean = false;

  constructor(apiKey: string) {
    if (apiKey === 'mock_key') {
        this.isMock = true;
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-01-27.acacia' as any, // Bypass strict type check if needed or match exact version
    });
  }

  async fetchCosts(startDate: Date, endDate: Date): Promise<CostData[]> {
    if (this.isMock) {
        return [
            {
                provider: this.name,
                timestamp: new Date(),
                amount: 100.50,
                currency: 'usd',
                service: 'charge',
                metadata: { customer: 'cus_mock_123', status: 'succeeded' }
            },
            {
                provider: this.name,
                timestamp: new Date(Date.now() - 86400000),
                amount: 25.00,
                currency: 'usd',
                service: 'charge',
                metadata: { customer: 'cus_mock_456', status: 'succeeded' }
            }
        ];
    }

    const charges = await this.stripe.charges.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
      limit: 100,
    });

    return charges.data.map((charge) => ({
      provider: this.name,
      timestamp: new Date(charge.created * 1000),
      amount: charge.amount / 100,
      currency: charge.currency,
      service: 'charge',
      metadata: { customer: charge.customer as string, status: charge.status },
    }));
  }

  async fetchUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    // Stripe Usage API requires iterating over subscriptions and usage records
    // Simplified for this framework
    return [];
  }
}
