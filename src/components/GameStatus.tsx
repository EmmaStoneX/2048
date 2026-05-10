import type { GameStatus as Status } from "@/src/game/types";

type GameStatusProps = {
  status: Status;
  onNewGame: () => void;
};

export function GameStatus({ status, onNewGame }: GameStatusProps) {
  if (status === "playing") {
    return null;
  }

  const copy = status === "won" ? "已合成 2048，继续刷新纪录" : "没有可移动方块";

  return (
    <div className="flex items-center justify-between gap-3 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-white" role="status">
      <span>{copy}</span>
      <button
        className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#1A1A1A] transition active:scale-[0.98]"
        type="button"
        onClick={onNewGame}
      >
        新游戏
      </button>
    </div>
  );
}
