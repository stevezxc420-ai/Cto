import { api } from './api';
import { startOfMonthISO } from './date';
import type { CostBreakdownItem, CostInterval, CostSummary, CostTimeSeriesPoint } from '../types/costs';

const toNumber = (value: unknown) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : 0;
};

const pickFirstNumber = (obj: any, keys: string[]) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      const n = toNumber(obj[key]);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
};

const unwrapList = (resp: any) => {
  if (Array.isArray(resp)) return resp;
  if (!resp || typeof resp !== 'object') return [];

  const candidates = ['data', 'items', 'results', 'points', 'series'];
  for (const key of candidates) {
    if (Array.isArray(resp[key])) return resp[key];
  }

  return [];
};

export const getCostTimeSeries = async (params: {
  startDate: string;
  endDate: string;
  interval: CostInterval;
}): Promise<CostTimeSeriesPoint[]> => {
  const resp = await api.get<any>('/costs/timeseries', {
    params: {
      start: params.startDate,
      end: params.endDate,
      interval: params.interval,
    },
  });

  const raw = unwrapList(resp);

  return raw
    .map((p: any) => ({
      date: String(p.date ?? p.day ?? p.period ?? p.timestamp ?? p.time ?? ''),
      cost: toNumber(p.cost ?? p.amount ?? p.value ?? p.total ?? 0),
    }))
    .filter((p: CostTimeSeriesPoint) => Boolean(p.date));
};

export const getCostByProvider = async (params: {
  startDate: string;
  endDate: string;
}): Promise<CostBreakdownItem[]> => {
  const resp = await api.get<any>('/costs/by-provider', {
    params: {
      start: params.startDate,
      end: params.endDate,
    },
  });

  const raw = unwrapList(resp);

  return raw
    .map((p: any) => ({
      name: String(p.provider ?? p.name ?? p.id ?? 'Unknown'),
      cost: toNumber(p.cost ?? p.amount ?? p.value ?? p.total ?? 0),
    }))
    .filter((p: CostBreakdownItem) => Boolean(p.name));
};

export const getCostByFeature = async (params: {
  startDate: string;
  endDate: string;
}): Promise<CostBreakdownItem[]> => {
  const resp = await api.get<any>('/costs/by-feature', {
    params: {
      start: params.startDate,
      end: params.endDate,
    },
  });

  const raw = unwrapList(resp);

  return raw
    .map((p: any) => ({
      name: String(p.feature ?? p.endpoint ?? p.name ?? p.id ?? 'Unknown'),
      cost: toNumber(p.cost ?? p.amount ?? p.value ?? p.total ?? 0),
    }))
    .filter((p: CostBreakdownItem) => Boolean(p.name));
};

const fetchSummaryTotal = async (startDate: string, endDate: string) => {
  const resp = await api.get<any>('/costs/summary', {
    params: {
      start: startDate,
      end: endDate,
    },
  });

  if (typeof resp === 'number') return resp;

  const total = pickFirstNumber(resp, ['total', 'cost', 'amount', 'value', 'sum', 'totalCost']);
  if (total !== undefined) return total;

  return 0;
};

export const getCostSummary = async (params: {
  startDate: string;
  endDate: string;
}): Promise<CostSummary> => {
  const resp = await api.get<any>('/costs/summary', {
    params: {
      start: params.startDate,
      end: params.endDate,
    },
  });

  const total = pickFirstNumber(resp, ['total', 'rangeTotal', 'cost', 'amount', 'value', 'sum', 'totalCost']);
  const monthToDate = pickFirstNumber(resp, ['monthToDate', 'thisMonth', 'mtd', 'month_total']);
  const today = pickFirstNumber(resp, ['today', 'todayCost', 'daily', 'day']);

  if (total !== undefined && monthToDate !== undefined && today !== undefined) {
    return {
      total,
      monthToDate,
      today,
    };
  }

  const resolvedTotal = total ?? (await fetchSummaryTotal(params.startDate, params.endDate));

  const monthStart = startOfMonthISO(params.endDate);
  const resolvedMonth = monthToDate ?? (await fetchSummaryTotal(monthStart, params.endDate));

  const resolvedToday = today ?? (await fetchSummaryTotal(params.endDate, params.endDate));

  return {
    total: resolvedTotal,
    monthToDate: resolvedMonth,
    today: resolvedToday,
  };
};
