import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  
  // Variant styles mapped to studio-grade design tokens
  const variantStyles = {
    primary: `
      bg-[oklch(15%_0.02_320)] 
      text-[oklch(80%_0.14_20)] 
      hover:opacity-95 
      shadow-none
    `,
    secondary: `
      bg-[var(--color-input)] 
      text-gray-900 
      hover:bg-gray-200 
      border border-[oklch(90%_0.02_320)]
    `,
    danger: `
      bg-red-50 
      text-red-700 
      hover:bg-red-100 
      border border-red-200
    `,
    outline: `
      bg-transparent 
      text-gray-900 
      border border-[oklch(90%_0.02_320)] 
      hover:bg-[var(--color-input)]
    `,
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide
        transition-all duration-150 flex items-center justify-center gap-2
        cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-[0.99] font-sans
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}