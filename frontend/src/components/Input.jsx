import React from 'react';

const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-textPrimary">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-border rounded-lg bg-card text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export default Input;