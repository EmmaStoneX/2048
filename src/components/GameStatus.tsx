import type { GameStatus as Status } from "@/src/game/types";

type GameStatusProps = {
  status: Status;
};

export function GameStatus({ status }: GameStatusProps) {
  if (status === "playing") {
    return null;
  }

  const copy = status === "won" ? "已合成 2048，继续刷新纪录" : "没有可移动方块，试试新游戏";

  return (
    <div className="rounded-full bg-[#1A1A1A] px-4 py-2 text-center text-sm font-bold text-white" role="status">
      {copy}
    </div>
  );
}
