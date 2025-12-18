import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
} from 'recharts';
import Layout from '../components/Layout';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import ErrorState from '../components/ErrorState';
import LoadingBlock from '../components/LoadingBlock';
import { useTheme } from '../hooks/useTheme';
import { useCostDashboard } from '../hooks/useCostDashboard';
import { toISODateString } from '../lib/date';
import { formatCompactDateLabel, formatCurrency } from '../lib/format';
import type { CostInterval } from '../types/costs';

const pieColors = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0EA5E9', '#DB2777'];

const sumCost = (items: { cost: number }[]) => items.reduce((acc, item) => acc + (Number.isFinite(item.cost) ? item.cost : 0), 0);

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const [range, setRange] = useState<DateRange>(() => {
    const today = new Date();
    const endDate = toISODateString(today);
    const start = new Date(today);
    start.setDate(today.getDate() - 6);

    return {
      startDate: toISODateString(start),
      endDate,
    };
  });

  const [interval, setInterval] = useState<CostInterval>('daily');
  const [hiddenProviders, setHiddenProviders] = useState<Record<string, boolean>>({});

  const { data, loading, error, refetch } = useCostDashboard({
    startDate: range.startDate,
    endDate: range.endDate,
    interval,
  });

  const providerData = useMemo(() => {
    return data.byProvider
      .filter((p) => !hiddenProviders[p.name])
      .sort((a, b) => b.cost - a.cost);
  }, [data.byProvider, hiddenProviders]);

  const allProvidersSorted = useMemo(() => {
    return [...data.byProvider].sort((a, b) => b.cost - a.cost);
  }, [data.byProvider]);

  const featureData = useMemo(() => {
    return [...data.byFeature].sort((a, b) => b.cost - a.cost).slice(0, 10);
  }, [data.byFeature]);

  const chartTheme = useMemo(
    () => ({
      text: isDark ? '#D1D5DB' : '#4B5563',
      grid: isDark ? '#374151' : '#E5E7EB',
      tooltipBg: isDark ? '#111827' : '#FFFFFF',
      tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    }),
    [isDark, theme]
  );

  const cardsLoading = loading && data.timeSeries.length === 0 && data.byProvider.length === 0 && data.byFeature.length === 0;

  const providerTotal = useMemo(() => sumCost(providerData), [providerData]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Explore spend over time and drill into providers and features.
            </p>
          </div>

          <div className="card p-4 w-full lg:w-[520px]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DateRangePicker value={range} onChange={setRange} defaultPreset="7d" />
              </div>
              <div className="w-44">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Granularity</label>
                <select
                  className="input"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as CostInterval)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>

                <button type="button" className="btn-secondary w-full mt-3" onClick={refetch}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {error ? <ErrorState message={error} onRetry={refetch} /> : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total (selected range)</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {cardsLoading ? '—' : formatCurrency(data.summary.total)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {range.startDate} → {range.endDate}
            </p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {cardsLoading ? '—' : formatCurrency(data.summary.monthToDate)}
            </p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {cardsLoading ? '—' : formatCurrency(data.summary.today)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost over time</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Hover for details. Use the brush to zoom.
                </p>
              </div>
            </div>

            <div className="mt-4">
              {loading && data.timeSeries.length === 0 ? (
                <LoadingBlock heightClassName="h-72" />
              ) : data.timeSeries.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  No cost data for the selected range.
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeSeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: chartTheme.text, fontSize: 12 }}
                        tickFormatter={(v) => formatCompactDateLabel(String(v))}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fill: chartTheme.text, fontSize: 12 }}
                        width={72}
                        tickFormatter={(v) => formatCurrency(Number(v)).replace(/\.00$/, '')}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBg,
                          border: `1px solid ${chartTheme.tooltipBorder}`,
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: chartTheme.text }}
                        formatter={(v: any) => formatCurrency(Number(v))}
                        labelFormatter={(label) => formatCompactDateLabel(String(label))}
                      />
                      <Legend wrapperStyle={{ color: chartTheme.text }} />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        name="Cost"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Brush dataKey="date" height={24} stroke="#2563EB" travellerWidth={12} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost by provider</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Click a provider to hide/show it.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Visible providers total</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(providerTotal)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-64">
                {loading && data.byProvider.length === 0 ? (
                  <LoadingBlock heightClassName="h-64" />
                ) : providerData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    No provider breakdown available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={providerData}
                        dataKey="cost"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        onClick={(d) => {
                          const name = (d as any)?.name;
                          if (!name) return;
                          setHiddenProviders((prev) => ({ ...prev, [name]: !prev[name] }));
                        }}
                      >
                        {providerData.map((entry, idx) => (
                          <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBg,
                          border: `1px solid ${chartTheme.tooltipBorder}`,
                          borderRadius: 8,
                        }}
                        formatter={(v: any) => formatCurrency(Number(v))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div>
                <div className="space-y-2">
                  {allProvidersSorted.map((p, idx) => {
                    const hidden = Boolean(hiddenProviders[p.name]);
                    const color = pieColors[idx % pieColors.length];

                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setHiddenProviders((prev) => ({ ...prev, [p.name]: !prev[p.name] }))}
                        className={
                          'w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors ' +
                          (hidden
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white')
                        }
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="truncate text-sm font-medium">{p.name}</span>
                        </div>
                        <span className="text-sm tabular-nums">{formatCurrency(p.cost)}</span>
                      </button>
                    );
                  })}
                </div>

                {allProvidersSorted.length > 0 ? (
                  <button
                    type="button"
                    className="btn-secondary w-full mt-3"
                    onClick={() => setHiddenProviders({})}
                  >
                    Reset providers
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost by feature / endpoint</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Top 10 features in the selected range.</p>
            </div>
          </div>

          <div className="mt-4">
            {loading && data.byFeature.length === 0 ? (
              <LoadingBlock heightClassName="h-96" />
            ) : featureData.length === 0 ? (
              <div className="h-96 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                No feature breakdown available.
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tick={{ fill: chartTheme.text, fontSize: 12 }}
                      tickFormatter={(v) => formatCurrency(Number(v)).replace(/\.00$/, '')}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={180}
                      tick={{ fill: chartTheme.text, fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltipBg,
                        border: `1px solid ${chartTheme.tooltipBorder}`,
                        borderRadius: 8,
                      }}
                      formatter={(v: any) => formatCurrency(Number(v))}
                    />
                    <Bar dataKey="cost" name="Cost" fill="#0EA5E9" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
