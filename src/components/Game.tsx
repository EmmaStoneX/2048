"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BOARD_CELLS, createInitialState, move, undo } from "@/src/game/engine";
import { playLoseSound, playMergeSound, playMoveSound, playWinSound, setSoundEnabled, unlockAudio } from "@/src/game/audio";
import { readBestScore, readSoundEnabled, writeBestScore, writeSoundEnabled } from "@/src/game/storage";
import type { Direction, GameState } from "@/src/game/types";
import { BestProgress } from "./BestProgress";
import { GameActions } from "./GameActions";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";
import { ScorePanel } from "./ScorePanel";

const emptyState: GameState = {
  board: Array.from({ length: BOARD_CELLS }, () => null),
  score: 0,
  bestScore: 0,
  previous: null,
  status: "playing",
  animation: null,
};

const keyMap: Record<string, Direction | undefined> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

function vibrate(pattern: VibratePattern) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function Game() {
  const [state, setState] = useState<GameState>(emptyState);
  const [ready, setReady] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const stateRef = useRef<GameState>(emptyState);
  const animationLocked = useRef(false);
  const queuedDirection = useRef<Direction | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const enabled = readSoundEnabled();
      setSoundEnabledState(enabled);
      setSoundEnabled(enabled);
      setState(createInitialState(readBestScore()));
      setReady(true);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (ready) {
      writeBestScore(state.bestScore);
    }
  }, [ready, state.bestScore]);

  const runMove = useCallback((direction: Direction) => {
    const current = stateRef.current;
    const next = move(current, direction);

    if (next === current) {
      return;
    }

    const mergeCount = next.animation?.moves.filter((tileMove) => tileMove.kind === "merge").length ?? 0;

    if (mergeCount > 0) {
      playMergeSound(mergeCount);
      vibrate(18);
    } else {
      playMoveSound();
      vibrate(8);
    }

    if (current.status !== "won" && next.status === "won") {
      playWinSound();
      vibrate([20, 30, 20]);
    }

    if (current.status !== "lost" && next.status === "lost") {
      playLoseSound();
      vibrate([30, 40, 30]);
    }

    stateRef.current = next;

    if (next.animation) {
      animationLocked.current = true;
    }

    setState(next);
  }, []);

  const handleMove = useCallback(
    (direction: Direction) => {
      unlockAudio();

      if (animationLocked.current) {
        queuedDirection.current = direction;
        return;
      }

      runMove(direction);
    },
    [runMove],
  );

  const handleAnimatingChange = useCallback(
    (animating: boolean) => {
      animationLocked.current = animating;

      if (animating) {
        return;
      }

      const direction = queuedDirection.current;
      queuedDirection.current = null;

      if (direction) {
        window.requestAnimationFrame(() => {
          if (!animationLocked.current) {
            runMove(direction);
          }
        });
      }
    },
    [runMove],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = keyMap[event.key] ?? keyMap[event.key.toLowerCase()];

      if (!direction) {
        return;
      }

      event.preventDefault();
      handleMove(direction);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  const handleNewGame = useCallback(() => {
    unlockAudio();
    animationLocked.current = false;
    queuedDirection.current = null;
    const next = createInitialState(stateRef.current.bestScore);
    stateRef.current = next;
    setState(next);
  }, []);

  const handleUndo = useCallback(() => {
    unlockAudio();
    animationLocked.current = false;
    queuedDirection.current = null;
    const next = undo(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  const handleToggleSound = useCallback(() => {
    unlockAudio();
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
    writeSoundEnabled(next);
  }, [soundEnabled]);

  const subtitle = useMemo(() => {
    if (!ready) {
      return "准备棋盘中";
    }

    return state.status === "lost" ? "本局结束，重新开一局" : "轻扫合并数字，冲击新的最佳纪录";
  }, [ready, state.status]);

  return (
    <main className="flex h-dvh overflow-hidden bg-[#E6DDD3] text-[#1A1A1A] sm:items-center sm:justify-center sm:p-4">
      <section className="mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[#F3EBE2] px-3 py-3 shadow-[0_20px_60px_rgba(26,26,26,0.16)] min-[820px]:px-5 min-[820px]:py-5 sm:max-h-[932px] sm:rounded-[40px]">
        <div className="flex flex-1 flex-col justify-between gap-2.5">
          <header>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black leading-none tracking-tight min-[820px]:text-5xl">2048</h1>
                <p className="mt-1 text-xs font-medium text-[#6B6B6B] min-[820px]:text-sm">{subtitle}</p>
              </div>
              <button
                className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 text-[11px] font-bold text-[#6B6B6B] transition active:scale-[0.99]"
                type="button"
                onClick={handleToggleSound}
                aria-label={`音效已${soundEnabled ? "开启" : "关闭"}`}
                aria-pressed={soundEnabled}
              >
                <span>音效</span>
                <span className={`flex h-[18px] w-8 items-center rounded-full p-0.5 transition ${soundEnabled ? "bg-[#D4916E]" : "bg-[#D8CEC4]"}`} aria-hidden="true">
                  <span className={`h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(26,26,26,0.18)] transition ${soundEnabled ? "translate-x-3.5" : "translate-x-0"}`} />
                </span>
              </button>
            </div>
          </header>

          <ScorePanel score={state.score} bestScore={state.bestScore} />
          <GameStatus status={state.status} />
          <GameBoard board={state.board} animation={state.animation} onMove={handleMove} onAnimatingChange={handleAnimatingChange} />
          <GameActions canUndo={state.previous !== null} onUndo={handleUndo} onNewGame={handleNewGame} />
          <BestProgress score={state.score} bestScore={state.bestScore} />
        </div>
      </section>
    </main>
  );
}
