import React from 'react';

type AlertVariant = 'info' | 'error';

interface InlineAlertProps {
  variant: AlertVariant;
  title: string;
  description?: string;
}

const InlineAlert: React.FC<InlineAlertProps> = ({ variant, title, description }) => {
  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-100'
      : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-100';

  return (
    <div className={`rounded-lg border p-4 ${styles}`} role={variant === 'error' ? 'alert' : undefined}>
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
    </div>
  );
};

export default InlineAlert;
