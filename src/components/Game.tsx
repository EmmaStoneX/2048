"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BOARD_CELLS, createInitialState, move, undo } from "@/src/game/engine";
import { readBestScore, writeBestScore } from "@/src/game/storage";
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
};

export function Game() {
  const [state, setState] = useState<GameState>(emptyState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<GameState>(emptyState);
  const animationLocked = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
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

  const handleMove = useCallback((direction: Direction) => {
    if (animationLocked.current) {
      return;
    }

    const current = stateRef.current;
    const next = move(current, direction);

    if (next === current) {
      return;
    }

    stateRef.current = next;

    if (next.animation) {
      animationLocked.current = true;
    }

    setState(next);
  }, []);

  const handleAnimatingChange = useCallback((animating: boolean) => {
    animationLocked.current = animating;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = keyMap[event.key];

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
    animationLocked.current = false;
    const next = createInitialState(stateRef.current.bestScore);
    stateRef.current = next;
    setState(next);
  }, []);

  const handleUndo = useCallback(() => {
    animationLocked.current = false;
    const next = undo(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

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
            <h1 className="text-3xl font-black leading-none tracking-tight min-[820px]:text-5xl">2048</h1>
            <p className="mt-1 text-xs font-medium text-[#6B6B6B] min-[820px]:text-sm">{subtitle}</p>
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
