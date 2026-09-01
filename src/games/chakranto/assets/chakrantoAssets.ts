/**
 * Centralized Asset Registry & Character Lore for CHAKRANTO
 * 5 Characters (3 copies each = 15 cards total in deck)
 */

import { ChakrantoActionType, ChakrantoCharacter } from '../types';

/**
 * Expected file paths for CHAKRANTO PNG artwork assets in /public/assets/games/chakranto/
 */
export const CHAKRANTO_CARD_ASSETS: Record<ChakrantoCharacter | 'cardBack', string> = {
  brahmodoetto: '/assets/games/chakranto/brahmodoetto.png',
  kalu_dakat: '/assets/games/chakranto/kalu_dakat.png',
  petukchondro: '/assets/games/chakranto/petukchondro.png',
  bir_bikrom: '/assets/games/chakranto/bir_bikrom.png',
  ginner_badsha: '/assets/games/chakranto/ginner_badsha.png',
  cardBack: '/assets/games/chakranto/card_back.png',
};

export const CHAKRANTO_GAME_ASSETS = {
  banner: '/assets/games/chakranto/Banner.png',
  thumbnail: '/assets/games/chakranto/Banner.png',
  coverArt: '/assets/games/chakranto/Banner.png',
  cardBack: '/assets/games/chakranto/card_back.png',
  brahmodoetto: '/assets/games/chakranto/brahmodoetto.png',
  kaluDakat: '/assets/games/chakranto/kalu_dakat.png',
  petukchondro: '/assets/games/chakranto/petukchondro.png',
  birBikrom: '/assets/games/chakranto/bir_bikrom.png',
  ginnerBadsha: '/assets/games/chakranto/ginner_badsha.png',
};

export interface ChakrantoCharacterMeta {
  character: ChakrantoCharacter;
  name: string;
  bengaliName: string;
  roleSubtitle: string;
  themeColor: string;
  borderColor: string;
  badgeBg: string;
  glowColor: string;
  activeAbilityName: string;
  activeAbilityBengali: string;
  activeAbilityDescription: string;
  passiveAbilityName?: string;
  passiveAbilityBengali?: string;
  passiveAbilityDescription?: string;
  lore: string;
}

export const CHAKRANTO_CHARACTERS: Record<ChakrantoCharacter, ChakrantoCharacterMeta> = {
  brahmodoetto: {
    character: 'brahmodoetto',
    name: 'Bromhodoitto',
    bengaliName: 'ব্রহ্মদৈত্য',
    roleSubtitle: 'Ancient Spectral Scholar Ghost',
    themeColor: '#A855F7',
    borderColor: 'border-purple-500/60',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    activeAbilityName: 'Ghar Motkano',
    activeAbilityBengali: 'ঘাড় মটকানো',
    activeAbilityDescription: 'Pay 3 coins. Target any other player to sacrifice 1 of their cards. Blockable by Jiner Badsha.',
    lore: 'The vengeful Brahmin specter wandering ancient banyan groves. With immense supernatural strength, he executes Ghar Motkano on unwary victims unless shielded by Jiner Badsha.',
  },
  kalu_dakat: {
    character: 'kalu_dakat',
    name: 'Kalu Dakat',
    bengaliName: 'কালু ডাকাত',
    roleSubtitle: 'Fierce Bandit Chieftain',
    themeColor: '#EF4444',
    borderColor: 'border-red-500/60',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    activeAbilityName: 'Dakati',
    activeAbilityBengali: 'ডাকাতি',
    activeAbilityDescription: 'Raid an opponent holding 2 or more coins and plunder 2 coins into your purse. Blockable by Kalu Dakat or Petukchondro.',
    lore: 'Terror of the moonlit riverways and deep forests. Wielding a curved talwar and fiery torch, he plunders the wealth of merchants and rivals.',
  },
  petukchondro: {
    character: 'petukchondro',
    name: 'Petukchondro',
    bengaliName: 'পেটুকচন্দ্র',
    roleSubtitle: 'Jolly Royal Sweetmaker & Gourmand',
    themeColor: '#F59E0B',
    borderColor: 'border-amber-500/60',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    activeAbilityName: 'Shadbodol',
    activeAbilityBengali: 'স্বাদবদল',
    activeAbilityDescription: 'Draw 2 cards privately from the deck, select cards to keep, and return the rest to the deck. Cannot be blocked.',
    passiveAbilityName: 'Sweet Deception',
    passiveAbilityBengali: 'মিষ্টি চাল',
    passiveAbilityDescription: 'Can block Dakati by offering feasts and sweet distractions.',
    lore: 'A jovial court confectioner whose sweet treats and quick sleight-of-hand allow him to execute Shadbodol and distract greedy bandits.',
  },
  bir_bikrom: {
    character: 'bir_bikrom',
    name: 'Bir Bikrom',
    bengaliName: 'বীর বিক্রম',
    roleSubtitle: 'Decorated Commander of Valor',
    themeColor: '#3B82F6',
    borderColor: 'border-blue-500/60',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    activeAbilityName: 'Birotto Bhata',
    activeAbilityBengali: 'বীরত্ব ভাতা',
    activeAbilityDescription: 'Collect 3 coins from the treasury. Cannot be blocked.',
    passiveAbilityName: 'Roptani Blockade',
    passiveAbilityBengali: 'রপ্তানি প্রতিরোধ',
    passiveAbilityDescription: 'Enforce royal tariffs by blocking any player attempting Roptani (+2 coins).',
    lore: 'The unyielding fortress commander decorated with honor. His decree grants Birotto Bhata and blocks trade shipments.',
  },
  ginner_badsha: {
    character: 'ginner_badsha',
    name: 'Jiner Badsha',
    bengaliName: 'জিনের বাদশাহ',
    roleSubtitle: 'Sovereign Emperor of the Djinn',
    themeColor: '#10B981',
    borderColor: 'border-emerald-500/60',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    activeAbilityName: 'Mystic Sentinel',
    activeAbilityBengali: 'রহস্যময় রক্ষক',
    activeAbilityDescription: 'Holds supreme mystical command over spirits and shadows.',
    passiveAbilityName: 'Banish Specters',
    passiveAbilityBengali: 'দৈত্য দমন',
    passiveAbilityDescription: 'Shield yourself by completely blocking Bromhodoitto’s Ghar Motkano strike.',
    lore: 'The supreme genie overlord who commands ethereal lamps and ancient wards. His mystical presence repels Bromhodoitto and saves innocent lives.',
  },
};

export interface ChakrantoActionMeta {
  type: ChakrantoActionType;
  name: string;
  bengaliName: string;
  associatedCharacter?: ChakrantoCharacter;
  coinCost: number; // 0, 3, 7
  coinGain: number; // 0, 2, 3
  isChallengeable: boolean;
  isBlockable: boolean;
  blockedBy?: string;
  description: string;
}

export const CHAKRANTO_ACTIONS: Record<ChakrantoActionType, ChakrantoActionMeta> = {
  ayy: {
    type: 'ayy',
    name: 'Ayy',
    bengaliName: 'আয়',
    coinCost: 0,
    coinGain: 1,
    isChallengeable: false,
    isBlockable: false,
    description: 'Collect 1 coin from the treasury.',
  },
  roptani: {
    type: 'roptani',
    name: 'Roptani',
    bengaliName: 'রপ্তানি',
    coinCost: 0,
    coinGain: 2,
    isChallengeable: false,
    isBlockable: true,
    blockedBy: 'Bir Bikrom',
    description: 'Export trade goods to collect +2 coins from the treasury. Cannot be challenged, but any player claiming Bir Bikrom can block it.',
  },
  dakati: {
    type: 'dakati',
    name: 'Dakati',
    bengaliName: 'ডাকাতি',
    associatedCharacter: 'kalu_dakat',
    coinCost: 0,
    coinGain: 2,
    isChallengeable: true,
    isBlockable: true,
    blockedBy: 'Kalu Dakat or Petukchondro',
    description: 'Claim Kalu Dakat to raid an opponent with >= 2 coins and plunder 2 coins. Challengeable by anyone; target may block claiming Kalu Dakat or Petukchondro.',
  },
  shadhbodol: {
    type: 'shadhbodol',
    name: 'Shadbodol',
    bengaliName: 'স্বাদবদল',
    associatedCharacter: 'petukchondro',
    coinCost: 0,
    coinGain: 0,
    isChallengeable: true,
    isBlockable: false,
    description: 'Claim Petukchondro to draw 2 fresh cards from the deck, choose which to keep, and return the rest. Challengeable by anyone.',
  },
  birbikrom_bhata: {
    type: 'birbikrom_bhata',
    name: 'Birotto Bhata',
    bengaliName: 'বীরত্ব ভাতা',
    associatedCharacter: 'bir_bikrom',
    coinCost: 0,
    coinGain: 3,
    isChallengeable: true,
    isBlockable: false,
    description: 'Claim Bir Bikrom to collect +3 coins from the treasury. Challengeable by anyone.',
  },
  ghar_motkano: {
    type: 'ghar_motkano',
    name: 'Ghar Motkano',
    bengaliName: 'ঘাড় মটকানো',
    associatedCharacter: 'brahmodoetto',
    coinCost: 3,
    coinGain: 0,
    isChallengeable: true,
    isBlockable: true,
    blockedBy: 'Jiner Badsha',
    description: 'Pay 3 coins and claim Bromhodoitto to force a target player to sacrifice 1 card. Challengeable by anyone; target can block claiming Jiner Badsha.',
  },
  hottaya: {
    type: 'hottaya',
    name: 'Hottaya',
    bengaliName: 'হত্যা',
    coinCost: 7,
    coinGain: 0,
    isChallengeable: false,
    isBlockable: false,
    description: 'Pay 7 coins to strike any target player, forcing them to sacrifice 1 card. Mandatory when holding 10+ coins.',
  },
};
