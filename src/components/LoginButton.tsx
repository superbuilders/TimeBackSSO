'use client';

import Image from 'next/image';

interface LoginButtonProps {
  onClick: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

// Alternative styled version with blue background
export function LoginButtonPrimary({ 
  onClick, 
  className = '', 
  loading = false,
  disabled = false 
}: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative flex items-center justify-center gap-3 
        px-6 py-3 
        bg-blue-600 hover:bg-blue-700 
        border-2 border-blue-600 hover:border-blue-700
        rounded-lg 
        font-medium text-white
        transition-all duration-200 
        shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-blue-600 disabled:hover:shadow-md
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Signing in...</span>
        </div>
      ) : (
        <>
          <span className="text-base">Continue with</span>
          <div className="relative w-32 h-8 brightness-0 invert">
            <Image
              src="/images/timeback_logo.svg"
              alt="TimeBack"
              fill
              className="object-contain"
              priority
            />
          </div>
        </>
      )}
    </button>
  );
}