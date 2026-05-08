type ScorePanelProps = {
  score: number;
  bestScore: number;
};

export function ScorePanel({ score, bestScore }: ScorePanelProps) {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="分数面板">
      <div className="flex min-h-16 min-[820px]:min-h-[5.5rem] flex-col items-center justify-center rounded-[22px] bg-[#FFF8EF] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-xs font-semibold text-[#6B6B6B]">当前分数</p>
        <p className="mt-0.5 font-mono text-2xl font-black tracking-tight text-[#1A1A1A]">{score.toLocaleString()}</p>
      </div>
      <div className="flex min-h-16 min-[820px]:min-h-[5.5rem] flex-col items-center justify-center rounded-[22px] bg-[#1A1A1A] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-xs font-semibold text-[#E9DED2]">最佳纪录</p>
        <p className="mt-0.5 font-mono text-2xl font-black tracking-tight text-white">{bestScore.toLocaleString()}</p>
      </div>
    </section>
  );
}
