import React from 'react';
import { CardRole } from '../types';

interface CardIllustrationProps {
  role: CardRole;
  className?: string;
}

/**
 * Babu (1200 Points)
 * Ornate Golden Baroque frame, Aristocrat in emerald green kurta, dhoti, royal blue shawl, holding gold cane,
 * arched palace courtyard background with peacocks, bottom ornate shield "1200".
 */
export const BabuCardIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 450 780" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="babuGoldBorder" x1="0" y1="0" x2="450" y2="780" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="30%" stopColor="#CA8A04" />
        <stop offset="50%" stopColor="#FEF08A" />
        <stop offset="70%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
      <radialGradient id="babuParchment" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="70%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
      <linearGradient id="babuKurta" x1="160" y1="360" x2="300" y2="520" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="60%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="babuShawl" x1="260" y1="380" x2="360" y2="600" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
      <filter id="babu3dGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#B45309" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Outer Rounded Ornate Border */}
    <rect x="8" y="8" width="434" height="764" rx="28" fill="#581C87" fillOpacity="0.05" />
    <rect x="10" y="10" width="430" height="760" rx="26" fill="url(#babuGoldBorder)" stroke="#78350F" strokeWidth="3" />
    <rect x="22" y="22" width="406" height="736" rx="18" fill="url(#babuParchment)" stroke="#CA8A04" strokeWidth="2" />

    {/* Background Palace Courtyard Sketch */}
    <g opacity="0.25" stroke="#78350F" strokeWidth="1.2" fill="none">
      <path d="M 60 300 C 60 220 120 180 225 180 C 330 180 390 220 390 300" />
      <path d="M 120 300 C 120 240 160 210 225 210 C 290 210 330 240 330 300" />
      <line x1="80" y1="180" x2="80" y2="340" />
      <line x1="370" y1="180" x2="370" y2="340" />
      <line x1="140" y1="210" x2="140" y2="340" />
      <line x1="310" y1="210" x2="310" y2="340" />
    </g>

    {/* Top 3D Title: Babu */}
    <g filter="url(#babu3dGlow)">
      {/* 3D Extrusion Shadow */}
      <text x="225" y="138" textAnchor="middle" fontFamily="Cinzel, serif, Georgia" fontSize="84" fontWeight="900" fill="#78350F" letterSpacing="4">
        Babu
      </text>
      <text x="223" y="135" textAnchor="middle" fontFamily="Cinzel, serif, Georgia" fontSize="84" fontWeight="900" fill="#9A3412" letterSpacing="4">
        Babu
      </text>
      {/* Main Gold Lettering */}
      <text x="225" y="130" textAnchor="middle" fontFamily="Cinzel, serif, Georgia" fontSize="84" fontWeight="900" fill="url(#babuGoldBorder)" stroke="#78350F" strokeWidth="3" letterSpacing="4">
        Babu
      </text>
    </g>

    {/* Aristocratic Throne Chair */}
    <path d="M 110 560 L 90 620 Q 80 650 110 650 L 140 650" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M 340 560 L 360 620 Q 370 650 340 650 L 310 650" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
    <rect x="120" y="320" width="210" height="230" rx="40" fill="#1E3A8A" stroke="#CA8A04" strokeWidth="8" />
    <rect x="135" y="335" width="180" height="200" rx="30" fill="#1E40AF" opacity="0.8" />

    {/* Babu Character Illustration */}
    {/* Body / Kurta */}
    <path d="M 150 400 Q 130 540 225 560 Q 320 540 300 400 Z" fill="url(#babuKurta)" stroke="#064E3B" strokeWidth="3" />
    {/* Golden Kurta Buttons */}
    <circle cx="225" cy="430" r="4" fill="#FDE047" stroke="#854D0E" />
    <circle cx="225" cy="455" r="4" fill="#FDE047" stroke="#854D0E" />
    <circle cx="225" cy="480" r="4" fill="#FDE047" stroke="#854D0E" />

    {/* Dhoti */}
    <path d="M 140 540 Q 110 630 220 630 Q 330 630 310 540 Z" fill="#FFFBEB" stroke="#CA8A04" strokeWidth="3" />
    <path d="M 220 540 L 220 630" stroke="#D97706" strokeWidth="2.5" />
    <path d="M 180 550 Q 185 600 170 620" stroke="#D97706" strokeWidth="2" fill="none" />
    <path d="M 260 550 Q 255 600 270 620" stroke="#D97706" strokeWidth="2" fill="none" />

    {/* Blue & Gold Shawl (Uttariya) */}
    <path d="M 160 380 Q 230 450 310 570 L 335 550 Q 250 420 185 365 Z" fill="url(#babuShawl)" stroke="#FDE047" strokeWidth="2.5" />

    {/* Head & Face */}
    <circle cx="225" cy="315" r="46" fill="#FED7AA" stroke="#78350F" strokeWidth="2.5" />
    {/* Hair & Aristocrat Styling */}
    <path d="M 175 305 C 175 250 275 250 275 305 C 275 320 260 275 225 275 C 190 275 175 320 175 305 Z" fill="#1C1917" />
    {/* Mustache */}
    <path d="M 185 330 Q 225 355 225 330 Q 225 355 265 330 Q 240 315 225 324 Q 210 315 185 330 Z" fill="#1C1917" />
    {/* Eyes & Smile */}
    <ellipse cx="205" cy="305" rx="5" ry="4" fill="#1C1917" />
    <ellipse cx="245" cy="305" rx="5" ry="4" fill="#1C1917" />
    <path d="M 215 335 Q 225 344 235 335" stroke="#78350F" strokeWidth="2" fill="none" />

    {/* Gold Walking Cane */}
    <path d="M 115 410 L 115 650" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
    <circle cx="115" cy="405" r="14" fill="url(#babuGoldBorder)" stroke="#78350F" strokeWidth="2" />
    <circle cx="115" cy="405" r="6" fill="#FDE047" />

    {/* Bottom Points Shield: 1200 */}
    <g transform="translate(105, 660)" filter="url(#babu3dGlow)">
      <path d="M 0 35 L 25 5 L 215 5 L 240 35 L 215 65 L 25 65 Z" fill="#FFFBEB" stroke="#78350F" strokeWidth="3" />
      <path d="M 5 35 L 28 9 L 212 9 L 235 35 L 212 61 L 28 61 Z" fill="url(#babuGoldBorder)" stroke="#B45309" strokeWidth="1.5" />
      <text x="120" y="47" textAnchor="middle" fontFamily="Impact, 'Arial Black', sans-serif" fontSize="42" fontWeight="900" fill="#78350F" letterSpacing="3">
        1200
      </text>
    </g>

    {/* Corner Filigrees */}
    <circle cx="42" cy="42" r="10" fill="none" stroke="#B45309" strokeWidth="2" />
    <circle cx="408" cy="42" r="10" fill="none" stroke="#B45309" strokeWidth="2" />
    <circle cx="42" cy="738" r="10" fill="none" stroke="#B45309" strokeWidth="2" />
    <circle cx="408" cy="738" r="10" fill="none" stroke="#B45309" strokeWidth="2" />
  </svg>
);

/**
 * Police (900 Points)
 * Ornate emerald filigree frame, Police Officer in khaki uniform, police cap, star badge,
 * mustache, radio tower backdrop, bottom plaque "900".
 */
export const PoliceCardIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 450 780" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="policeGreenBorder" x1="0" y1="0" x2="450" y2="780" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="30%" stopColor="#047857" />
        <stop offset="70%" stopColor="#064E3B" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>
      <radialGradient id="policeParchment" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="75%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </radialGradient>
      <linearGradient id="policeKhaki" x1="160" y1="360" x2="290" y2="600" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="policeSilverText" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
    </defs>

    {/* Outer Border */}
    <rect x="10" y="10" width="430" height="760" rx="26" fill="url(#policeGreenBorder)" stroke="#064E3B" strokeWidth="4" />
    <rect x="22" y="22" width="406" height="736" rx="18" fill="url(#policeParchment)" stroke="#059669" strokeWidth="2" />

    {/* Background Police Station Line Art */}
    <g opacity="0.2" stroke="#064E3B" strokeWidth="1.5" fill="none">
      {/* Radio Towers */}
      <path d="M 80 340 L 105 180 L 130 340" />
      <line x1="88" y1="230" x2="122" y2="230" />
      <line x1="95" y1="280" x2="115" y2="280" />
      <path d="M 320 340 L 345 180 L 370 340" />
      <line x1="328" y1="230" x2="362" y2="230" />
      <line x1="335" y1="280" x2="355" y2="280" />
      {/* Radio Wave Arcs */}
      <path d="M 95 170 A 15 15 0 0 1 115 170" />
      <path d="M 85 160 A 30 30 0 0 1 125 160" />
      <path d="M 335 170 A 15 15 0 0 1 355 170" />
      <path d="M 325 160 A 30 30 0 0 1 365 160" />
    </g>

    {/* Top 3D Title: POLICE */}
    <g>
      <text x="225" y="138" textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize="76" fontWeight="900" fill="#022C22" letterSpacing="4">
        POLICE
      </text>
      <text x="225" y="132" textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize="76" fontWeight="900" fill="url(#policeSilverText)" stroke="#064E3B" strokeWidth="3" letterSpacing="4">
        POLICE
      </text>
    </g>

    {/* Police Character Illustration */}
    {/* Uniform Torso */}
    <path d="M 150 410 Q 130 550 225 550 Q 320 550 300 410 Z" fill="url(#policeKhaki)" stroke="#78350F" strokeWidth="3" />
    
    {/* Chest Pockets */}
    <rect x="165" y="440" width="35" height="30" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
    <rect x="250" y="440" width="35" height="30" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />

    {/* Police Silver Shield Badge */}
    <path d="M 268 450 L 282 450 L 285 465 L 275 475 L 265 465 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />

    {/* Uniform Pants */}
    <path d="M 160 550 L 140 660 L 200 660 L 225 570 L 250 660 L 310 660 L 290 550 Z" fill="url(#policeKhaki)" stroke="#78350F" strokeWidth="3" />

    {/* Brown Police Belt */}
    <rect x="150" y="535" width="150" height="20" rx="3" fill="#451A03" stroke="#1C1917" strokeWidth="2" />
    <rect x="210" y="532" width="30" height="26" rx="4" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />

    {/* Police Boots */}
    <ellipse cx="170" cy="665" rx="30" ry="12" fill="#451A03" stroke="#1C1917" strokeWidth="2" />
    <ellipse cx="280" cy="665" rx="30" ry="12" fill="#451A03" stroke="#1C1917" strokeWidth="2" />

    {/* Head, Face & Cap */}
    <circle cx="225" cy="320" r="44" fill="#FED7AA" stroke="#78350F" strokeWidth="2.5" />
    
    {/* Grand Mustache */}
    <path d="M 180 338 Q 225 365 225 338 Q 225 365 270 338 Q 240 320 225 332 Q 210 320 180 338 Z" fill="#1C1917" />
    {/* Eyes & Friendly Smile */}
    <ellipse cx="205" cy="310" rx="5" ry="4" fill="#1C1917" />
    <ellipse cx="245" cy="310" rx="5" ry="4" fill="#1C1917" />
    <path d="M 215 348 Q 225 355 235 348" stroke="#78350F" strokeWidth="2" fill="none" />

    {/* Police Service Cap */}
    <ellipse cx="225" cy="275" rx="55" ry="20" fill="url(#policeKhaki)" stroke="#78350F" strokeWidth="3" />
    <path d="M 170 275 Q 225 240 280 275" fill="#D97706" />
    {/* Cap Visor */}
    <path d="M 180 285 Q 225 305 270 285" fill="#1C1917" stroke="#000000" strokeWidth="2" />
    {/* Cap Emblem */}
    <circle cx="225" cy="265" r="7" fill="#FDE047" stroke="#854D0E" />

    {/* Bottom Points Shield: 900 */}
    <g transform="translate(105, 660)">
      <path d="M 0 35 L 25 5 L 215 5 L 240 35 L 215 65 L 25 65 Z" fill="#ECFDF5" stroke="#064E3B" strokeWidth="3" />
      <path d="M 5 35 L 28 9 L 212 9 L 235 35 L 212 61 L 28 61 Z" fill="url(#policeGreenBorder)" stroke="#047857" strokeWidth="1.5" />
      <text x="120" y="47" textAnchor="middle" fontFamily="Impact, 'Arial Black', sans-serif" fontSize="42" fontWeight="900" fill="#ECFDF5" letterSpacing="3">
        900
      </text>
    </g>
  </svg>
);

/**
 * Dakat (600 Points)
 * Warm amber/crimson floral frame, Bandit sitting atop open treasure chest overflowing with pearls/gems,
 * wielding curved talwar sword, bottom plaque "600".
 */
export const DakatCardIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 450 780" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dakatRedBorder" x1="0" y1="0" x2="450" y2="780" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="30%" stopColor="#DC2626" />
        <stop offset="70%" stopColor="#991B1B" />
        <stop offset="100%" stopColor="#450A0A" />
      </linearGradient>
      <radialGradient id="dakatParchment" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="70%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
      <linearGradient id="dakatSteel" x1="260" y1="180" x2="380" y2="280" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
    </defs>

    {/* Outer Border */}
    <rect x="10" y="10" width="430" height="760" rx="26" fill="url(#dakatRedBorder)" stroke="#7F1D1D" strokeWidth="4" />
    <rect x="22" y="22" width="406" height="736" rx="18" fill="url(#dakatParchment)" stroke="#B45309" strokeWidth="2" />

    {/* Top 3D Title: Dakath */}
    <g>
      <text x="225" y="140" textAnchor="middle" fontFamily="Cinzel, serif, Georgia" fontSize="76" fontWeight="900" fill="#450A0A" letterSpacing="4">
        Dakath
      </text>
      <text x="225" y="134" textAnchor="middle" fontFamily="Cinzel, serif, Georgia" fontSize="76" fontWeight="900" fill="#DC2626" stroke="#450A0A" strokeWidth="3" letterSpacing="4">
        Dakath
      </text>
    </g>

    {/* Wooden Treasure Chest */}
    <g transform="translate(100, 520)">
      {/* Chest Base */}
      <rect x="0" y="40" width="250" height="110" rx="12" fill="#78350F" stroke="#451A03" strokeWidth="4" />
      {/* Wooden Planks */}
      <line x1="0" y1="75" x2="250" y2="75" stroke="#451A03" strokeWidth="2.5" />
      <line x1="0" y1="110" x2="250" y2="110" stroke="#451A03" strokeWidth="2.5" />
      {/* Gold Bands & Lock */}
      <rect x="30" y="40" width="20" height="110" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
      <rect x="200" y="40" width="20" height="110" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
      <circle cx="125" cy="90" r="14" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
      <circle cx="125" cy="90" r="4" fill="#1C1917" />
      {/* Chest Open Lid Top */}
      <path d="M 0 40 Q 125 0 250 40" fill="#92400E" stroke="#451A03" strokeWidth="4" />
      {/* Sparkling Gems & Pearls */}
      <circle cx="60" cy="35" r="7" fill="#60A5FA" stroke="#1E40AF" />
      <polygon points="120,20 130,35 110,35" fill="#EF4444" stroke="#991B1B" />
      <circle cx="180" cy="30" r="8" fill="#34D399" stroke="#065F46" />
      <circle cx="210" cy="40" r="6" fill="#FDE047" />
    </g>

    {/* Dakat Character Sitting on Chest */}
    {/* Blue Brocade Vest */}
    <path d="M 160 380 Q 140 500 225 510 Q 310 500 290 380 Z" fill="#0284C7" stroke="#075985" strokeWidth="3" />
    <path d="M 180 380 L 225 470 L 270 380" fill="#38BDF8" opacity="0.6" />

    {/* White Dhoti with Red Trim */}
    <path d="M 150 500 Q 110 580 180 580 Q 225 580 225 510 Q 225 580 270 580 Q 340 580 300 500 Z" fill="#FFFBEB" stroke="#DC2626" strokeWidth="3" />

    {/* Head, Furious Expression & Mustache */}
    <circle cx="225" cy="300" r="44" fill="#FED7AA" stroke="#78350F" strokeWidth="2.5" />
    {/* Fierce Eyebrows & Eyes */}
    <path d="M 195 285 L 215 295" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
    <path d="M 255 285 L 235 295" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="205" cy="298" rx="5" ry="4" fill="#1C1917" />
    <ellipse cx="245" cy="298" rx="5" ry="4" fill="#1C1917" />
    {/* Fierce Grinning Teeth */}
    <path d="M 205 330 Q 225 345 245 330 Z" fill="#FFFFFF" stroke="#78350F" strokeWidth="2" />
    {/* Huge Dacoit Mustache */}
    <path d="M 175 320 Q 225 350 225 320 Q 225 350 275 320 Q 240 305 225 315 Q 210 305 175 320 Z" fill="#1C1917" />

    {/* Raised Arm & Curved Talwar Sword */}
    {/* Arm */}
    <path d="M 285 390 Q 340 330 330 250" stroke="#FED7AA" strokeWidth="22" strokeLinecap="round" />
    {/* Curved Blade */}
    <path d="M 330 240 Q 350 140 395 100 Q 370 160 340 240 Z" fill="url(#dakatSteel)" stroke="#475569" strokeWidth="2.5" />
    {/* Gold Hilt */}
    <rect x="315" y="240" width="30" height="12" rx="3" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />

    {/* Bottom Points Shield: 600 */}
    <g transform="translate(105, 660)">
      <path d="M 0 35 L 25 5 L 215 5 L 240 35 L 215 65 L 25 65 Z" fill="#FFFBEB" stroke="#7F1D1D" strokeWidth="3" />
      <path d="M 5 35 L 28 9 L 212 9 L 235 35 L 212 61 L 28 61 Z" fill="url(#dakatRedBorder)" stroke="#991B1B" strokeWidth="1.5" />
      <text x="120" y="47" textAnchor="middle" fontFamily="Impact, 'Arial Black', sans-serif" fontSize="42" fontWeight="900" fill="#FFFBEB" letterSpacing="3">
        600
      </text>
    </g>
  </svg>
);

/**
 * Chor (400 Points)
 * Deep midnight blue/gold filigree frame, Barefoot sly thief carrying leaky sack of coins and jewels,
 * key and footprints, bottom plaque "400".
 */
export const ChorCardIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 450 780" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="chorBlueBorder" x1="0" y1="0" x2="450" y2="780" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="40%" stopColor="#1E3A8A" />
        <stop offset="80%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <radialGradient id="chorParchment" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="70%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
      <linearGradient id="chorSack" x1="220" y1="360" x2="380" y2="550" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="60%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
    </defs>

    {/* Outer Border */}
    <rect x="10" y="10" width="430" height="760" rx="26" fill="url(#chorBlueBorder)" stroke="#1E3A8A" strokeWidth="4" />
    <rect x="22" y="22" width="406" height="736" rx="18" fill="url(#chorParchment)" stroke="#1D4ED8" strokeWidth="2" />

    {/* Sneaky Footprints & Key Backdrop */}
    <g opacity="0.25" stroke="#78350F" strokeWidth="1.5" fill="none">
      {/* Footprints */}
      <ellipse cx="110" cy="560" rx="14" ry="24" transform="rotate(-20, 110, 560)" />
      <ellipse cx="80" cy="650" rx="14" ry="24" transform="rotate(-15, 80, 650)" />
      {/* Old Brass Key */}
      <g transform="translate(290, 240) rotate(-45)">
        <circle cx="20" cy="20" r="14" />
        <line x1="34" y1="20" x2="80" y2="20" strokeWidth="3" />
        <line x1="70" y1="20" x2="70" y2="32" strokeWidth="3" />
        <line x1="80" y1="20" x2="80" y2="32" strokeWidth="3" />
      </g>
    </g>

    {/* Top 3D Title: CHORE */}
    <g>
      <text x="225" y="140" textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize="76" fontWeight="900" fill="#020617" letterSpacing="4">
        CHORE
      </text>
      <text x="225" y="134" textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize="76" fontWeight="900" fill="#1E40AF" stroke="#020617" strokeWidth="3" letterSpacing="4">
        CHORE
      </text>
    </g>

    {/* Sneaky Thief Body & Sack */}
    {/* Stolen Treasure Sack */}
    <path d="M 220 380 C 200 340 340 350 360 440 C 370 500 320 540 250 500 Z" fill="url(#chorSack)" stroke="#475569" strokeWidth="3" />
    {/* Patched Sack Seam */}
    <path d="M 330 430 L 350 450 M 350 430 L 330 450" stroke="#334155" strokeWidth="2.5" />
    
    {/* Leaking Gold Coins & Diamond */}
    <circle cx="340" cy="510" r="6" fill="#F59E0B" stroke="#78350F" />
    <circle cx="360" cy="535" r="5" fill="#F59E0B" stroke="#78350F" />
    <polygon points="370,550 380,560 365,568 355,558" fill="#38BDF8" stroke="#0284C7" />

    {/* Thief Figure in Brown Kurta & Blue Checkered Lungi */}
    {/* Brown Kurta */}
    <path d="M 160 410 Q 140 540 220 530 Q 250 530 240 410 Z" fill="#92400E" stroke="#451A03" strokeWidth="3" />

    {/* Blue Plaid Lungi */}
    <path d="M 160 530 L 140 640 L 230 640 L 220 530 Z" fill="#0284C7" stroke="#075985" strokeWidth="3" />
    {/* Grid lines on Lungi */}
    <line x1="150" y1="565" x2="225" y2="565" stroke="#38BDF8" strokeWidth="2" />
    <line x1="145" y1="600" x2="228" y2="600" stroke="#38BDF8" strokeWidth="2" />
    <line x1="180" y1="530" x2="170" y2="640" stroke="#38BDF8" strokeWidth="2" />
    <line x1="205" y1="530" x2="200" y2="640" stroke="#38BDF8" strokeWidth="2" />

    {/* Sneaky Bare Feet */}
    <path d="M 140 640 Q 120 660 160 660 Z" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />
    <path d="M 230 640 Q 250 660 210 660 Z" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />

    {/* Head, Sly Smirk, Shifty Eyes & Topknot */}
    <circle cx="195" cy="320" r="42" fill="#FED7AA" stroke="#78350F" strokeWidth="2.5" />
    {/* Topknot Bun */}
    <circle cx="195" cy="270" r="16" fill="#1C1917" />
    {/* Sly Shifty Eyes looking back */}
    <ellipse cx="180" cy="315" rx="7" ry="5" fill="#FFFFFF" stroke="#1C1917" />
    <circle cx="183" cy="315" r="3" fill="#1C1917" />
    <ellipse cx="215" cy="315" rx="7" ry="5" fill="#FFFFFF" stroke="#1C1917" />
    <circle cx="218" cy="315" r="3" fill="#1C1917" />
    {/* Cheeky Sly Grin */}
    <path d="M 180 340 Q 205 360 225 335" stroke="#1C1917" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Bottom Points Shield: 400 */}
    <g transform="translate(105, 660)">
      <path d="M 0 35 L 25 5 L 215 5 L 240 35 L 215 65 L 25 65 Z" fill="#FFFBEB" stroke="#0F172A" strokeWidth="3" />
      <path d="M 5 35 L 28 9 L 212 9 L 235 35 L 212 61 L 28 61 Z" fill="url(#chorBlueBorder)" stroke="#1E40AF" strokeWidth="1.5" />
      <text x="120" y="47" textAnchor="middle" fontFamily="Impact, 'Arial Black', sans-serif" fontSize="42" fontWeight="900" fill="#FFFBEB" letterSpacing="3">
        400
      </text>
    </g>
  </svg>
);

/**
 * Neutral Ornate Card Back (Hidden representation)
 * Royal crimson & obsidian shield with gold Tekka emblem and intricate geometric patterns.
 */
export const CardBackIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 450 780" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="backGoldBorder" x1="0" y1="0" x2="450" y2="780" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="30%" stopColor="#DC2626" />
        <stop offset="70%" stopColor="#7F1D1D" />
        <stop offset="100%" stopColor="#18181B" />
      </linearGradient>
      <radialGradient id="backCenterGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#450A0A" />
        <stop offset="70%" stopColor="#18181B" />
        <stop offset="100%" stopColor="#09090B" />
      </radialGradient>
      <pattern id="backGrid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 15 0 L 30 15 L 15 30 L 0 15 Z" fill="none" stroke="#DC2626" strokeWidth="0.8" opacity="0.25" />
        <circle cx="15" cy="15" r="2" fill="#F59E0B" opacity="0.3" />
      </pattern>
    </defs>

    {/* Outer Double Frame */}
    <rect x="10" y="10" width="430" height="760" rx="26" fill="url(#backGoldBorder)" stroke="#450A0A" strokeWidth="4" />
    <rect x="22" y="22" width="406" height="736" rx="18" fill="url(#backCenterGlow)" stroke="#991B1B" strokeWidth="2" />
    <rect x="30" y="30" width="390" height="720" rx="14" fill="url(#backGrid)" />

    {/* Center Tekka Emblem */}
    <g transform="translate(225, 390)">
      {/* Outer Diamond */}
      <polygon points="0,-120 120,0 0,120 -120,0" fill="#27272A" stroke="#E50914" strokeWidth="4" />
      <polygon points="0,-105 105,0 0,105 -105,0" fill="#18181B" stroke="#F59E0B" strokeWidth="2" />
      
      {/* Ornate Red & Gold Center Rune */}
      <circle cx="0" cy="0" r="60" fill="#7F1D1D" stroke="#E50914" strokeWidth="3" />
      <path d="M -25 -25 L 25 25 M 25 -25 L -25 25" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
      <polygon points="0,-40 30,0 0,40 -30,0" fill="none" stroke="#FDE047" strokeWidth="3" />
      
      {/* TEKKA Branding Text */}
      <text x="0" y="160" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="900" fill="#E50914" letterSpacing="8">
        TEKKA
      </text>
      <text x="0" y="185" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="600" fill="#71717A" letterSpacing="4">
        SECRET CARD
      </text>
    </g>

    {/* Ornate Corners */}
    <circle cx="50" cy="50" r="14" fill="none" stroke="#E50914" strokeWidth="2" />
    <circle cx="400" cy="50" r="14" fill="none" stroke="#E50914" strokeWidth="2" />
    <circle cx="50" cy="730" r="14" fill="none" stroke="#E50914" strokeWidth="2" />
    <circle cx="400" cy="730" r="14" fill="none" stroke="#E50914" strokeWidth="2" />
  </svg>
);

export const RoleIllustration: React.FC<CardIllustrationProps> = ({ role, className }) => {
  switch (role) {
    case 'babu':
      return <BabuCardIllustration className={className} />;
    case 'police':
      return <PoliceCardIllustration className={className} />;
    case 'dakat':
      return <DakatCardIllustration className={className} />;
    case 'chor':
      return <ChorCardIllustration className={className} />;
    default:
      return <CardBackIllustration className={className} />;
  }
};
