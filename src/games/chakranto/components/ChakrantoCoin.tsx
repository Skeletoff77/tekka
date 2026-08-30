import React from 'react';

interface ChakrantoCoinProps {
  className?: string;
  size?: number | string;
}

export const ChakrantoCoin: React.FC<ChakrantoCoinProps> = ({
  className = '',
  size = 24,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: size, height: size }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="46" fill="url(#chakrantoCoinGrad)" stroke="#F59E0B" strokeWidth="4" />
      <circle cx="50" cy="50" r="38" stroke="#D97706" strokeWidth="2" strokeDasharray="4 2" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="#78350F"
        fontSize="28"
        fontWeight="900"
        fontFamily="sans-serif"
      >
        ৳
      </text>
      <defs>
        <radialGradient id="chakrantoCoinGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
    </svg>
  );
};
