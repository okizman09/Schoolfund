import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverStyles = hoverable
    ? 'hover:border-[#CBD4D1] hover:shadow-card transition-all cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg p-5 shadow-subtle ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};
