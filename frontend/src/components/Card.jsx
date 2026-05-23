import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;