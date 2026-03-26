export interface UsageData {
  provider: string;
  resourceId?: string;
  timestamp: Date;
  metric: string;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}

export interface CostData {
  provider: string;
  timestamp: Date;
  amount: number;
  currency: string;
  service?: string;
  metadata?: Record<string, any>;
}

export interface ApiProvider {
  name: string;
  fetchUsage(startDate: Date, endDate: Date): Promise<UsageData[]>;
  fetchCosts(startDate: Date, endDate: Date): Promise<CostData[]>;
}
