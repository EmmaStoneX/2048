import { calculateBestProgress } from "@/src/game/engine";

type BestProgressProps = {
  score: number;
  bestScore: number;
};

export function BestProgress({ score, bestScore }: BestProgressProps) {
  const progress = calculateBestProgress(score, bestScore);
  const remaining = Math.max(bestScore - score, 0);

  return (
    <section className="rounded-[20px] bg-[#E9DED2] px-4 py-2.5 min-[820px]:py-3" aria-label="最佳纪录进度">
      <div className="flex items-center justify-between gap-4 text-xs font-bold text-[#6B6B6B]">
        <span>距离最佳纪录</span>
        <span className="font-mono text-[#1A1A1A]">{remaining.toLocaleString()} 分</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#FFF8EF]">
        <div className="h-full rounded-full bg-[#D4916E] transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
