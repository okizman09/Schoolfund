import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    success: 'bg-[#EAF5F2] text-accent border border-[#C5E5DC]',
    warning: 'bg-[#FEF9E7] text-warning border border-[#F5E6B8]',
    danger: 'bg-[#FDF2F2] text-danger border border-[#F6C6C6]',
    primary: 'bg-[#EBF1F0] text-primary border border-[#CAD9D6]',
    neutral: 'bg-[#F1F4F3] text-text-muted border border-border',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};
