import type { Tile } from "@/src/game/types";

const tileStyles: Record<number, { background: string; color: string }> = {
  2: { background: "#EEE4DA", color: "#1A1A1A" },
  4: { background: "#EDE0C8", color: "#1A1A1A" },
  8: { background: "#F2B179", color: "#FFFFFF" },
  16: { background: "#F3B27A", color: "#FFFFFF" },
  32: { background: "#F69664", color: "#FFFFFF" },
  64: { background: "#F77C5F", color: "#FFFFFF" },
  128: { background: "#E9C16F", color: "#FFFFFF" },
  256: { background: "#E8B653", color: "#FFFFFF" },
  512: { background: "#E5AA4F", color: "#FFFFFF" },
  1024: { background: "#E0A35D", color: "#FFFFFF" },
  2048: { background: "#D4916E", color: "#FFFFFF" },
};

type GameTileProps = {
  tile: Tile | null;
};

export function GameTile({ tile }: GameTileProps) {
  const style = tile
    ? (tileStyles[tile.value] ?? { background: "#1A1A1A", color: "#FFFFFF" })
    : { background: "rgba(204, 192, 179, 0.55)", color: "transparent" };
  const digits = tile ? String(tile.value).length : 1;
  const sizeClass = digits >= 4 ? "text-[clamp(1.15rem,6vw,1.55rem)]" : digits >= 3 ? "text-[clamp(1.35rem,7vw,1.8rem)]" : "text-[clamp(1.75rem,9vw,2.35rem)]";

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-2xl font-mono font-black leading-none shadow-[inset_0_-2px_0_rgba(0,0,0,0.04)] ${sizeClass} ${tile?.fresh ? "tile-fresh" : ""} ${tile?.merged ? "tile-merged" : ""}`}
      style={{ backgroundColor: style.background, color: style.color }}
      aria-label={tile ? `数字 ${tile.value}` : "空格"}
    >
      {tile?.value}
    </div>
  );
}
