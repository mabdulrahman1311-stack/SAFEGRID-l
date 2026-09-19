import React from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface LoadingButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  success?: boolean;
  error?: string;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success' | 'secondary';
  className?: string;
  fullWidth?: boolean;
}

/**
 * Button with built-in loading, success, and error states.
 * Prevents double-submit automatically.
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  type = 'button',
  loading = false,
  success = false,
  error,
  disabled = false,
  children,
  variant = 'primary',
  className = '',
  fullWidth = true,
}) => {
  const baseClasses = 'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
  };

  const successClasses = 'bg-emerald-600 text-white';

  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-flex'}`}>
      <button
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        className={`${baseClasses} ${success ? successClasses : variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : success ? (
          <>
            <Check className="w-4 h-4" />
            <span>Done!</span>
          </>
        ) : (
          children
        )}
      </button>

      {error && (
        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
