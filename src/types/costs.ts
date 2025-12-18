export type CostInterval = 'daily' | 'weekly' | 'monthly';

export interface CostTimeSeriesPoint {
  date: string;
  cost: number;
}

export interface CostBreakdownItem {
  name: string;
  cost: number;
}

export interface CostSummary {
  total: number;
  monthToDate: number;
  today: number;
}
