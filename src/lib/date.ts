export const toISODateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const startOfMonthISO = (referenceISODate: string) => {
  const reference = new Date(referenceISODate);
  if (Number.isNaN(reference.getTime())) {
    const now = new Date();
    return toISODateString(new Date(now.getFullYear(), now.getMonth(), 1));
  }
  return toISODateString(new Date(reference.getFullYear(), reference.getMonth(), 1));
};
