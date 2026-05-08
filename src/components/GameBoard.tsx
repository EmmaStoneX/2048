import { useSwipe } from "@/src/hooks/useSwipe";
import type { Board, Direction } from "@/src/game/types";
import { GameTile } from "./GameTile";

type GameBoardProps = {
  board: Board;
  onMove: (direction: Direction) => void;
};

export function GameBoard({ board, onMove }: GameBoardProps) {
  const swipeHandlers = useSwipe(onMove);

  return (
    <section
      className="mx-auto grid aspect-square w-full touch-none select-none grid-cols-4 gap-2 rounded-[24px] bg-[#B8AA9D] p-2 min-[820px]:gap-2.5 min-[820px]:rounded-[28px] min-[820px]:p-2.5"
      aria-label="2048 棋盘"
      {...swipeHandlers}
    >
      {board.map((tile, index) => (
        <GameTile key={tile?.id ?? `empty-${index}`} tile={tile} />
      ))}
    </section>
  );
}
