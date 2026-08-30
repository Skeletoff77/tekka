import React, { useState } from 'react';
import {
  ChakrantoActionType,
  ChakrantoCharacter,
  ChakrantoPlayerPublic,
  ChakrantoPublicState,
} from '../types';
import { CHAKRANTO_ACTIONS, CHAKRANTO_CHARACTERS } from '../assets/chakrantoAssets';
import { Shield, Swords, Check, AlertCircle, Sparkles } from 'lucide-react';

interface ChakrantoResponseModalProps {
  publicState: ChakrantoPublicState;
  currentUserId: string;
  onChallenge: () => Promise<void>;
  onBlock: (claimedCharacter: ChakrantoCharacter) => Promise<void>;
  onPass: () => Promise<void>;
  isSubmitting: boolean;
}

export const ChakrantoResponseModal: React.FC<ChakrantoResponseModalProps> = ({
  publicState,
  currentUserId,
  onChallenge,
  onBlock,
  onPass,
  isSubmitting,
}) => {
  const [selectedBlockChar, setSelectedBlockChar] = useState<ChakrantoCharacter | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const me = publicState.players.find((p) => p.id === currentUserId);
  if (!me || me.isEliminated) return null;

  const isActionPending = publicState.phase === 'ACTION_PENDING_RESPONSE';
  const isBlockPending = publicState.phase === 'BLOCK_PENDING_RESPONSE';

  if (!isActionPending && !isBlockPending) return null;

  const currentAction = publicState.currentAction;
  const currentBlock = publicState.currentBlock;

  // If I already passed, show a small waiting banner
  const hasPassed = publicState.passedPlayerIds.includes(currentUserId);
  if (hasPassed) {
    return (
      <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] text-center">
        <span className="text-xs font-mono-code text-zinc-400">
          ✓ You passed. Waiting for other players to respond...
        </span>
      </div>
    );
  }

  // 1. BLOCK PENDING RESPONSE (Active actor can challenge blocker, or pass to accept block)
  if (isBlockPending && currentBlock) {
    const blocker = publicState.players.find((p) => p.id === currentBlock.blockerPlayerId);
    const blockerName = blocker ? blocker.name : 'Opponent';
    const isActor = currentAction?.actorPlayerId === currentUserId;
    const blockCharMeta = CHAKRANTO_CHARACTERS[currentBlock.claimedCharacter];

    return (
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1C1010] to-[#0A0A0A] border-2 border-red-600 shadow-2xl space-y-4 animate-in fade-in">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="text-xs font-mono-code uppercase tracking-wider text-red-400 font-bold">
            BLOCK DECLARED!
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
          <p className="text-sm font-sans text-zinc-200">
            <strong>{blockerName}</strong> is attempting to block your{' '}
            <strong className="text-white">{currentBlock.targetAction.toUpperCase()}</strong> by
            claiming{' '}
            <strong className="text-amber-300">
              {blockCharMeta.name} ({blockCharMeta.bengaliName})
            </strong>
            .
          </p>
          <p className="text-xs font-sans text-zinc-400">
            Do you believe them, or do you want to call their BLUFF?
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-mono-code text-red-300">
            {errorMsg}
          </div>
        )}

        {isActor ? (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  setErrorMsg(null);
                  await onPass();
                } catch (e: any) {
                  setErrorMsg(e.message);
                }
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1F1F1F] hover:bg-zinc-800 text-xs font-mono-code text-zinc-300 hover:text-white cursor-pointer"
            >
              ACCEPT BLOCK (PASS)
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  setErrorMsg(null);
                  await onChallenge();
                } catch (e: any) {
                  setErrorMsg(e.message);
                }
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>CHALLENGE BLOCK (CALL BLUFF)</span>
            </button>
          </div>
        ) : (
          <p className="text-xs font-mono-code text-zinc-500 text-center">
            Waiting for the actor to accept or challenge the block...
          </p>
        )}
      </div>
    );
  }

  // 2. ACTION PENDING RESPONSE (Challenge / Block / Pass)
  if (isActionPending && currentAction) {
    const isActor = currentAction.actorPlayerId === currentUserId;
    if (isActor) {
      return (
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-1">
          <span className="text-xs font-mono-code text-zinc-300 font-bold block">
            Declaration in progress...
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500">
            Waiting for opponents to challenge, block, or pass.
          </span>
        </div>
      );
    }

    const actor = publicState.players.find((p) => p.id === currentAction.actorPlayerId);
    const actorName = actor ? actor.name : 'Opponent';
    const actionMeta = CHAKRANTO_ACTIONS[currentAction.action];
    const isTarget = currentAction.targetPlayerId === currentUserId;

    // Determine available blocks for current user:
    // - Roptani: Bir Bikrom (any living opponent)
    // - Dakati: Kalu Dakat OR Petukchondro (Target only)
    // - Ghar Motkano: Ginner Badsha (Target only)
    const canBlock =
      (currentAction.action === 'roptani') ||
      (currentAction.action === 'dakati' && isTarget) ||
      (currentAction.action === 'ghar_motkano' && isTarget);

    const availableBlockChars: ChakrantoCharacter[] = [];
    if (currentAction.action === 'roptani') {
      availableBlockChars.push('bir_bikrom');
    } else if (currentAction.action === 'dakati') {
      availableBlockChars.push('kalu_dakat', 'petukchondro');
    } else if (currentAction.action === 'ghar_motkano') {
      availableBlockChars.push('ginner_badsha');
    }

    const canChallenge = !!currentAction.claimedCharacter;

    return (
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1C0E0E] to-[#0A0A0A] border-2 border-[#E50914] shadow-2xl space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
            <span className="text-xs font-mono-code uppercase tracking-wider text-red-400 font-bold">
              OPPONENT ACTION DECLARED
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-800/60 text-[10px] font-mono-code font-bold text-red-300">
            {actionMeta.bengaliName}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <p className="text-sm font-sans text-zinc-200">
            <strong>{actorName}</strong> declared{' '}
            <strong className="text-[#FF4D4D]">{actionMeta.name}</strong>
            {currentAction.claimedCharacter && (
              <>
                {' '}
                claiming{' '}
                <strong className="text-amber-300">
                  {CHAKRANTO_CHARACTERS[currentAction.claimedCharacter].name}
                </strong>
              </>
            )}
            {isTarget && <strong className="text-red-400"> targeting YOU!</strong>}
          </p>
          <p className="text-xs font-sans text-zinc-400">{actionMeta.description}</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-mono-code text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Block Options if eligible */}
        {canBlock && availableBlockChars.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#140808] border border-red-900/40 space-y-2">
            <span className="text-[11px] font-mono-code uppercase text-zinc-400 font-bold block">
              DECLARE A BLOCK (BLUFF OR REAL):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableBlockChars.map((char) => {
                const charMeta = CHAKRANTO_CHARACTERS[char];
                return (
                  <button
                    key={char}
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      try {
                        setErrorMsg(null);
                        await onBlock(char);
                      } catch (e: any) {
                        setErrorMsg(e.message);
                      }
                    }}
                    className="p-3 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-800/50 flex items-center justify-between gap-2 text-left transition-all cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-mono-code text-zinc-400 block">
                        {charMeta.bengaliName}
                      </span>
                      <span className="text-xs font-display font-bold text-white">
                        Block as {charMeta.name}
                      </span>
                    </div>
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions: Pass & Challenge */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              try {
                setErrorMsg(null);
                await onPass();
              } catch (e: any) {
                setErrorMsg(e.message);
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1A1A1A] hover:bg-zinc-800 text-xs font-mono-code text-zinc-300 hover:text-white cursor-pointer"
          >
            PASS (ALLOW ACTION)
          </button>

          {canChallenge && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  setErrorMsg(null);
                  await onChallenge();
                } catch (e: any) {
                  setErrorMsg(e.message);
                }
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>CHALLENGE CLAIM (CALL BLUFF)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
