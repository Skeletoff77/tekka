/**
 * Centralized Asset Registry for Chor Police Dakat Babu
 * Single source of truth for the uploaded game image assets.
 */

import { CardRole } from '../types';

export const CARD_ASSETS: Record<CardRole | 'back', string> = {
  babu: '/assets/games/chor-police-dakat-babu/Babu.png',
  police: '/assets/games/chor-police-dakat-babu/Police.png',
  dakat: '/assets/games/chor-police-dakat-babu/Dakath f.png',
  chor: '/assets/games/chor-police-dakat-babu/chore.png',
  back: '/assets/games/chor-police-dakat-babu/card_back.png',
};

export const GAME_ASSETS = {
  banner: '/assets/games/chor-police-dakat-babu/Banner.png',
  cardBack: '/assets/games/chor-police-dakat-babu/card_back.png',
};

export interface RoleMeta {
  role: CardRole;
  title: string;
  bengaliTitle: string;
  points: number;
  badgeColor: string;
  accentBorder: string;
  glowColor: string;
  description: string;
  actionText?: string;
}

export const ROLE_METADATA: Record<CardRole, RoleMeta> = {
  babu: {
    role: 'babu',
    title: 'Babu',
    bengaliTitle: 'বাবু',
    points: 1200,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentBorder: 'border-amber-500/50',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    description: 'The wealthy aristocratic landlord. Commands the police to investigate either the Chor (Thief) or the Dakat (Robber). Always collects 1200 points.',
    actionText: 'CHOOSES TARGET INVESTIGATION',
  },
  police: {
    role: 'police',
    title: 'Police',
    bengaliTitle: 'পুলিশ',
    points: 900,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentBorder: 'border-emerald-500/50',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    description: 'The sharp officer of the law. Must interrogate and deduce which hidden player holds the target role commanded by Babu. Wins 900 points if correct, 0 if wrong.',
    actionText: 'IDENTIFIES THE TARGET SUSPECT',
  },
  dakat: {
    role: 'dakat',
    title: 'Dakat',
    bengaliTitle: 'ডাকাত',
    points: 600,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accentBorder: 'border-rose-500/50',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    description: 'The fierce bandit king guarding his treasure chest with a curved sword. Guaranteed 600 points.',
    actionText: 'HIDDEN ROLE',
  },
  chor: {
    role: 'chor',
    title: 'Chor',
    bengaliTitle: 'চোর',
    points: 400,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentBorder: 'border-blue-500/50',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    description: 'The sly barefoot thief carrying away stolen jewels. Escapes with 400 points if Police makes a wrong guess, receives 0 if caught.',
    actionText: 'HIDDEN ROLE',
  },
};
