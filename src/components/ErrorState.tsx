import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        {onRetry ? (
          <button type="button" className="btn-primary" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ErrorState;
