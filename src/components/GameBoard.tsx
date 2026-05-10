import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { BOARD_CELLS, BOARD_SIZE } from "@/src/game/engine";
import { useSwipe } from "@/src/hooks/useSwipe";
import type { Board, Direction, MoveAnimation, Tile } from "@/src/game/types";
import { GameTile } from "./GameTile";

type GameBoardProps = {
  board: Board;
  animation: MoveAnimation | null;
  onMove: (direction: Direction) => void;
  onAnimatingChange: (animating: boolean) => void;
};

type BoardMetrics = {
  cellSize: number;
  gap: number;
  padding: number;
};

const emptyMetrics: BoardMetrics = {
  cellSize: 0,
  gap: 0,
  padding: 0,
};

function tilePosition(index: number, metrics: BoardMetrics, durationMs = 0, zIndex = 1): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    transitionProperty: "transform, opacity",
    transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    transitionDuration: `${durationMs}ms`,
    zIndex,
  };

  if (metrics.cellSize === 0) {
    return { ...base, opacity: 0 };
  }

  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;
  const step = metrics.cellSize + metrics.gap;

  return {
    ...base,
    width: metrics.cellSize,
    height: metrics.cellSize,
    transform: `translate3d(${metrics.padding + column * step}px, ${metrics.padding + row * step}px, 0)`,
  };
}

export function GameBoard({ board, animation, onMove, onAnimatingChange }: GameBoardProps) {
  const boardRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<BoardMetrics>(emptyMetrics);
  const [animationPhase, setAnimationPhase] = useState<{ animationId: number; value: "to" | "settled" } | null>(null);
  const swipeDistance = metrics.cellSize > 0 ? Math.max(24, Math.min(44, metrics.cellSize * 0.18)) : 28;
  const swipeHandlers = useSwipe(onMove, { minDistance: swipeDistance });

  useEffect(() => {
    const element = boardRef.current;

    if (!element) {
      return;
    }

    const updateMetrics = () => {
      const boardStyles = window.getComputedStyle(element);
      const gridStyles = gridRef.current ? window.getComputedStyle(gridRef.current) : boardStyles;
      const gap = Number.parseFloat(gridStyles.columnGap) || 8;
      const padding = Number.parseFloat(boardStyles.paddingLeft) || 8;
      const cellSize = (element.clientWidth - padding * 2 - gap * (BOARD_SIZE - 1)) / BOARD_SIZE;

      setMetrics({ cellSize, gap, padding });
    };

    const initialFrame = window.requestAnimationFrame(updateMetrics);

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(element);
    window.addEventListener("resize", updateMetrics);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      observer.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  useEffect(() => {
    let moveFrame = 0;
    let settleTimeout = 0;

    if (!animation) {
      onAnimatingChange(false);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onAnimatingChange(false);
      moveFrame = window.requestAnimationFrame(() => {
        setAnimationPhase({ animationId: animation.id, value: "settled" });
      });

      return () => {
        window.cancelAnimationFrame(moveFrame);
      };
    }

    onAnimatingChange(true);

    moveFrame = window.requestAnimationFrame(() => {
      setAnimationPhase({ animationId: animation.id, value: "to" });
    });
    settleTimeout = window.setTimeout(() => {
      setAnimationPhase({ animationId: animation.id, value: "settled" });
      onAnimatingChange(false);
    }, animation.durationMs);

    return () => {
      window.cancelAnimationFrame(moveFrame);
      window.clearTimeout(settleTimeout);
    };
  }, [animation, onAnimatingChange]);

  const currentAnimationPhase = animationPhase && animationPhase.animationId === animation?.id ? animationPhase.value : "from";
  const showMovingTiles = animation !== null && currentAnimationPhase !== "settled";
  const hiddenTargets = showMovingTiles
    ? new Set([...animation.moves.map((move) => move.to), ...animation.spawns.map((spawn) => spawn.at)])
    : null;

  return (
    <section
      ref={boardRef}
      className="relative mx-auto aspect-square w-full touch-none select-none overflow-hidden rounded-[24px] bg-[#B8AA9D] p-2 min-[820px]:rounded-[28px] min-[820px]:p-2.5"
      aria-label="2048 棋盘"
      {...swipeHandlers}
    >
      <div ref={gridRef} className="grid h-full w-full grid-cols-4 gap-2 min-[820px]:gap-2.5" aria-hidden="true">
        {Array.from({ length: BOARD_CELLS }, (_, index) => (
          <div className="rounded-2xl" style={{ backgroundColor: "rgba(204, 192, 179, 0.55)" }} key={index} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0">
        {board.map((tile, index) =>
          tile && !hiddenTargets?.has(index) ? <GameTile key={tile.id} tile={tile} style={tilePosition(index, metrics)} /> : null,
        )}
        {showMovingTiles &&
          animation.moves.map((move) => {
            const tile: Tile = { id: move.tileId, value: move.value };
            const index = currentAnimationPhase === "to" ? move.to : move.from;

            return <GameTile key={`moving-${animation.id}-${move.tileId}`} tile={tile} style={tilePosition(index, metrics, animation.durationMs, 2)} />;
          })}
      </div>
    </section>
  );
}
