import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CostBreakdownItem, CostInterval, CostSummary, CostTimeSeriesPoint } from '../types/costs';
import { getCostByFeature, getCostByProvider, getCostSummary, getCostTimeSeries } from '../lib/costsApi';

interface CostDashboardData {
  summary: CostSummary;
  timeSeries: CostTimeSeriesPoint[];
  byProvider: CostBreakdownItem[];
  byFeature: CostBreakdownItem[];
}

const emptyData: CostDashboardData = {
  summary: {
    total: 0,
    monthToDate: 0,
    today: 0,
  },
  timeSeries: [],
  byProvider: [],
  byFeature: [],
};

export const useCostDashboard = (params: {
  startDate: string;
  endDate: string;
  interval: CostInterval;
}) => {
  const [data, setData] = useState<CostDashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const stableParams = useMemo(
    () => ({
      startDate: params.startDate,
      endDate: params.endDate,
      interval: params.interval,
    }),
    [params.startDate, params.endDate, params.interval]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summary, timeSeries, byProvider, byFeature] = await Promise.all([
          getCostSummary({ startDate: stableParams.startDate, endDate: stableParams.endDate }),
          getCostTimeSeries({
            startDate: stableParams.startDate,
            endDate: stableParams.endDate,
            interval: stableParams.interval,
          }),
          getCostByProvider({ startDate: stableParams.startDate, endDate: stableParams.endDate }),
          getCostByFeature({ startDate: stableParams.startDate, endDate: stableParams.endDate }),
        ]);

        if (cancelled) return;
        setData({ summary, timeSeries, byProvider, byFeature });
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load cost data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [stableParams, reloadKey]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
