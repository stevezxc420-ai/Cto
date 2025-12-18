import React, { useEffect, useMemo, useState } from 'react';
import { startOfMonthISO, toISODateString } from '../lib/date';

export type DateRangePreset = '7d' | '30d' | 'month' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (next: DateRange) => void;
  defaultPreset?: DateRangePreset;
}

const computePresetRange = (preset: DateRangePreset): DateRange => {
  const today = new Date();
  const endDate = toISODateString(today);

  if (preset === 'month') {
    return { startDate: startOfMonthISO(endDate), endDate };
  }

  if (preset === '30d') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    return { startDate: toISODateString(start), endDate };
  }

  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return { startDate: toISODateString(start), endDate };
};

const presetLabel: Record<DateRangePreset, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  month: 'This month',
  custom: 'Custom',
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  defaultPreset = '7d',
}) => {
  const initialPreset = useMemo(() => defaultPreset, [defaultPreset]);
  const [preset, setPreset] = useState<DateRangePreset>(initialPreset);

  useEffect(() => {
    if (preset === 'custom') return;
    onChange(computePresetRange(preset));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const setRange = (next: DateRange) => {
    const start = new Date(next.startDate);
    const end = new Date(next.endDate);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start > end) {
      onChange({ startDate: next.endDate, endDate: next.startDate });
      return;
    }

    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(presetLabel) as DateRangePreset[]).map((p) => {
          const active = preset === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={active ? 'btn-primary' : 'btn-secondary'}
            >
              {presetLabel[p]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From</label>
          <input
            type="date"
            className="input"
            value={value.startDate}
            onChange={(e) => {
              setPreset('custom');
              setRange({ startDate: e.target.value, endDate: value.endDate });
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To</label>
          <input
            type="date"
            className="input"
            value={value.endDate}
            onChange={(e) => {
              setPreset('custom');
              setRange({ startDate: value.startDate, endDate: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
