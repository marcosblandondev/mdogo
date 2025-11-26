import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-sm',
    secondary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 shadow-sm',
    outline: 'border-2 border-amber-600 text-amber-700 hover:bg-amber-50 focus:ring-amber-500 bg-white',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-8 py-3.5 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  // Add inline styles for critical colors to ensure they always show
  const getInlineStyle = () => {
    if (disabled) return {};
    
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#D97706', color: '#FFFFFF' };
      case 'secondary':
        return { backgroundColor: '#EA580C', color: '#FFFFFF' };
      case 'outline':
        return { backgroundColor: '#FFFFFF', borderColor: '#D97706', color: '#B45309' };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle}`}
      style={getInlineStyle()}
    >
      {children}
    </button>
  );
}