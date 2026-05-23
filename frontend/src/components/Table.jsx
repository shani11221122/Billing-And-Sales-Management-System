import React from 'react';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full bg-card border border-border rounded-lg overflow-hidden ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-background border-b border-border ${className}`} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', hover = true, ...props }) => {
  return (
    <tr
      className={`border-b border-border last:border-b-0 ${hover ? 'hover:bg-primary/5 transition-colors' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td
      className={`px-4 py-3 text-sm text-textPrimary ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };