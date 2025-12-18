import React from 'react';

interface LoadingBlockProps {
  heightClassName?: string;
}

const LoadingBlock: React.FC<LoadingBlockProps> = ({ heightClassName = 'h-64' }) => {
  return (
    <div className={`w-full ${heightClassName} animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700`} />
  );
};

export default LoadingBlock;
