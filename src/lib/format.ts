export const formatCurrency = (value: number, currency: string = 'USD') => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(safe);
};

export const formatCompactDateLabel = (isoDate: string) => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
};
