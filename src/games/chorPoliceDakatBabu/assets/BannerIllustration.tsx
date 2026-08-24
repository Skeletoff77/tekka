import React from 'react';

interface BannerIllustrationProps {
  className?: string;
}

export const BannerIllustration: React.FC<BannerIllustrationProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 1920 1080"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#93C5FD" />
        <stop offset="100%" stopColor="#E0F2FE" />
      </linearGradient>
      <linearGradient id="groundGrad" x1="0" y1="600" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D97706" stopOpacity="0.4" />
        <stop offset="40%" stopColor="#B45309" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#78350F" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="bannerGoldText" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <filter id="bannerShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.8" />
      </filter>
    </defs>

    {/* Sky & Background */}
    <rect width="1920" height="650" fill="url(#skyGrad)" />
    
    {/* Distant Clouds */}
    <ellipse cx="400" cy="180" rx="180" ry="60" fill="#FFFFFF" opacity="0.85" />
    <ellipse cx="520" cy="160" rx="140" ry="50" fill="#FFFFFF" opacity="0.85" />
    <ellipse cx="1450" cy="200" rx="200" ry="70" fill="#FFFFFF" opacity="0.85" />
    <ellipse cx="1600" cy="170" rx="150" ry="55" fill="#FFFFFF" opacity="0.85" />

    {/* Village Buildings (Left & Right Perspective) */}
    {/* Left Stone Buildings */}
    <polygon points="0,200 350,280 350,750 0,850" fill="#78716C" stroke="#44403C" strokeWidth="4" />
    <polygon points="120,380 280,410 280,560 120,530" fill="#292524" stroke="#1C1917" strokeWidth="3" />
    <polygon points="0,320 280,380 350,680 0,680" fill="#A8A29E" opacity="0.3" />

    {/* Right Market Buildings */}
    <polygon points="1920,200 1570,280 1570,750 1920,850" fill="#78716C" stroke="#44403C" strokeWidth="4" />
    <polygon points="1800,380 1640,410 1640,560 1800,530" fill="#292524" stroke="#1C1917" strokeWidth="3" />

    {/* Market Stalls & Canopies */}
    <polygon points="100,450 480,520 440,560 60,490" fill="#DC2626" opacity="0.85" />
    <polygon points="1820,450 1440,520 1480,560 1860,490" fill="#2563EB" opacity="0.85" />

    {/* Ground & Dirt Road */}
    <rect y="600" width="1920" height="480" fill="#D4B996" />
    <polygon points="0,750 1920,750 1920,1080 0,1080" fill="url(#groundGrad)" />

    {/* Cobblestone Dirt Details */}
    <ellipse cx="600" cy="980" rx="35" ry="12" fill="#78350F" opacity="0.3" />
    <ellipse cx="1200" cy="950" rx="40" ry="15" fill="#78350F" opacity="0.3" />
    <ellipse cx="960" cy="1020" rx="50" ry="16" fill="#78350F" opacity="0.4" />

    {/* ============================================================ */}
    {/* 4 Characters in Village Square (Babu, Police, Chor, Dakat) */}
    {/* ============================================================ */}

    {/* 1. BABU (Left - Seated on Ornate Chair Pointing at Police) */}
    <g transform="translate(180, 420)">
      {/* Ornate Chair */}
      <rect x="50" y="220" width="220" height="300" rx="40" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="10" />
      <path d="M 40 500 L 20 620 L 70 620" stroke="#78350F" strokeWidth="12" fill="none" />
      <path d="M 280 500 L 300 620 L 250 620" stroke="#78350F" strokeWidth="12" fill="none" />
      
      {/* Seated Body in Green Kurta */}
      <path d="M 90 320 Q 70 500 180 520 Q 290 500 270 320 Z" fill="#059669" stroke="#064E3B" strokeWidth="4" />
      
      {/* White Dhoti & Gold Shawl */}
      <path d="M 80 500 Q 60 600 180 600 Q 300 600 280 500 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="4" />
      <path d="M 100 320 Q 180 400 270 520 L 290 490 Q 200 350 130 300 Z" fill="#2563EB" stroke="#FDE047" strokeWidth="3" />

      {/* Pointing Right Arm */}
      <path d="M 240 340 Q 340 320 400 280" stroke="#FED7AA" strokeWidth="26" strokeLinecap="round" />
      <circle cx="410" cy="275" r="14" fill="#FED7AA" />

      {/* Head, Mustache, Smile */}
      <circle cx="180" cy="220" r="55" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
      <path d="M 125 210 C 125 140 235 140 235 210 Z" fill="#1C1917" />
      <path d="M 135 235 Q 180 270 180 235 Q 180 270 225 235 Z" fill="#1C1917" />
      <ellipse cx="160" cy="210" rx="6" ry="5" fill="#1C1917" />
      <ellipse cx="200" cy="210" rx="6" ry="5" fill="#1C1917" />
    </g>

    {/* 2. POLICE (Center-Left - Standing Proud in Khaki) */}
    <g transform="translate(680, 380)">
      {/* Uniform Torso & Legs */}
      <path d="M 120 280 Q 90 460 210 460 Q 330 460 300 280 Z" fill="#D97706" stroke="#78350F" strokeWidth="4" />
      <path d="M 130 460 L 100 640 L 190 640 L 210 500 L 230 640 L 320 640 L 290 460 Z" fill="#D97706" stroke="#78350F" strokeWidth="4" />
      
      {/* Belt & Badge */}
      <rect x="115" y="445" width="190" height="25" fill="#451A03" stroke="#1C1917" strokeWidth="2" />
      <circle cx="210" cy="457" r="12" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
      <polygon points="260,330 280,330 285,350 270,365 255,350" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />

      {/* Hands on Hips */}
      <path d="M 120 300 Q 50 380 115 440" stroke="#FED7AA" strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d="M 300 300 Q 370 380 305 440" stroke="#FED7AA" strokeWidth="26" strokeLinecap="round" fill="none" />

      {/* Head, Cap & Big Mustache */}
      <circle cx="210" cy="180" r="55" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
      <path d="M 140 130 Q 210 80 280 130 L 290 160 Q 210 130 130 160 Z" fill="#B45309" stroke="#78350F" strokeWidth="3" />
      <path d="M 145 160 Q 210 185 275 160" fill="#1C1917" />
      <path d="M 155 195 Q 210 235 210 195 Q 210 235 265 195 Z" fill="#1C1917" />
      <ellipse cx="190" cy="170" rx="6" ry="5" fill="#1C1917" />
      <ellipse cx="230" cy="170" rx="6" ry="5" fill="#1C1917" />
    </g>

    {/* 3. CHOR (Center-Right - Sneaking Barefoot with Sack of Gems) */}
    <g transform="translate(1080, 440)">
      {/* Sack of Jewels */}
      <path d="M 150 220 C 130 160 300 180 320 300 C 330 380 260 420 180 380 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="4" />
      <circle cx="290" cy="400" r="8" fill="#F59E0B" />
      <circle cx="315" cy="430" r="7" fill="#F59E0B" />
      <polygon points="325,450 340,465 320,475" fill="#38BDF8" />

      {/* Sneaking Body in Brown Kurta */}
      <path d="M 70 260 Q 50 400 140 400 Q 180 400 160 260 Z" fill="#92400E" stroke="#451A03" strokeWidth="4" />

      {/* Blue Plaid Lungi */}
      <path d="M 70 400 L 40 530 L 150 530 L 140 400 Z" fill="#0284C7" stroke="#075985" strokeWidth="4" />
      
      {/* Bare Feet Running */}
      <ellipse cx="45" cy="545" rx="25" ry="10" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />
      <ellipse cx="145" cy="545" rx="25" ry="10" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />

      {/* Head, Topknot, Grin */}
      <circle cx="115" cy="175" r="50" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
      <circle cx="115" cy="115" r="20" fill="#1C1917" />
      <ellipse cx="95" cy="165" rx="8" ry="6" fill="#FFFFFF" />
      <circle cx="98" cy="165" r="4" fill="#1C1917" />
      <ellipse cx="135" cy="165" rx="8" ry="6" fill="#FFFFFF" />
      <circle cx="138" cy="165" r="4" fill="#1C1917" />
      <path d="M 95 195 Q 125 220 145 190 Z" fill="#FFFFFF" stroke="#1C1917" strokeWidth="3" />
    </g>

    {/* 4. DAKAT (Right - Sitting on Chest Waving Curved Sword) */}
    <g transform="translate(1450, 400)">
      {/* Open Treasure Chest Overflowing with Gold & Gems */}
      <rect x="0" y="320" width="300" height="150" rx="16" fill="#78350F" stroke="#451A03" strokeWidth="6" />
      <path d="M 0 320 Q 150 250 300 320" fill="#92400E" stroke="#451A03" strokeWidth="6" />
      <rect x="40" y="320" width="25" height="150" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
      <rect x="235" y="320" width="25" height="150" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
      <circle cx="80" cy="310" r="10" fill="#60A5FA" />
      <circle cx="150" cy="305" r="12" fill="#F59E0B" />
      <circle cx="210" cy="308" r="10" fill="#34D399" />

      {/* Dakat Character */}
      <path d="M 80 200 Q 60 340 160 350 Q 240 340 220 200 Z" fill="#0284C7" stroke="#075985" strokeWidth="4" />
      <path d="M 70 340 Q 30 420 110 420 Q 160 420 160 350 Q 160 420 210 420 Q 280 420 240 340 Z" fill="#FFFBEB" stroke="#DC2626" strokeWidth="4" />

      {/* Raised Arm & Talwar */}
      <path d="M 220 210 Q 290 140 280 40" stroke="#FED7AA" strokeWidth="28" strokeLinecap="round" />
      <path d="M 280 30 Q 310 -90 370 -140 Q 335 -40 295 40 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />

      {/* Head, Furious Eyebrows & Huge Mustache */}
      <circle cx="150" cy="110" r="55" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
      <path d="M 115 90 L 140 105" stroke="#1C1917" strokeWidth="5" strokeLinecap="round" />
      <path d="M 185 90 L 160 105" stroke="#1C1917" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="128" cy="108" rx="7" ry="5" fill="#1C1917" />
      <ellipse cx="172" cy="108" rx="7" ry="5" fill="#1C1917" />
      <path d="M 95 130 Q 150 170 150 130 Q 150 170 205 130 Z" fill="#1C1917" />
    </g>

    {/* ============================================================ */}
    {/* Top 3D Title: CHORE • POLICE • DAKATH • BABU */}
    {/* ============================================================ */}
    <g transform="translate(960, 140)" filter="url(#bannerShadow)">
      {/* 3D Dark Underlay */}
      <text
        x="0"
        y="12"
        textAnchor="middle"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="88"
        fontWeight="900"
        fill="#1C1917"
        letterSpacing="8"
      >
        CHORE • POLICE • DAKATH • BABU
      </text>
      {/* 3D Stroke Shadow */}
      <text
        x="0"
        y="6"
        textAnchor="middle"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="88"
        fontWeight="900"
        fill="#78350F"
        letterSpacing="8"
      >
        CHORE • POLICE • DAKATH • BABU
      </text>
      {/* Main Golden Title */}
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="88"
        fontWeight="900"
        fill="url(#bannerGoldText)"
        stroke="#451A03"
        strokeWidth="4"
        letterSpacing="8"
      >
        CHORE • POLICE • DAKATH • BABU
      </text>
    </g>
  </svg>
);
