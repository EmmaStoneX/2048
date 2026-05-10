type GameActionsProps = {
  canUndo: boolean;
  onUndo: () => void;
  onNewGame: () => void;
};

const buttonBase =
  "flex min-h-14 min-[820px]:min-h-16 items-center justify-center gap-2 rounded-full px-4 text-base font-black text-[#1A1A1A] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] active:scale-[0.98]";

export function GameActions({ canUndo, onUndo, onNewGame }: GameActionsProps) {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="游戏操作">
      <button
        className={`${buttonBase} bg-[#E9DED2] disabled:cursor-not-allowed disabled:opacity-45`}
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="撤销一步"
        title="撤销一步"
      >
        <span className="text-xl leading-none" aria-hidden="true">
          ↶
        </span>
        <span>撤销</span>
      </button>
      <button
        className={`${buttonBase} bg-[#D4916E] shadow-[0_8px_18px_rgba(212,145,110,0.2)]`}
        type="button"
        onClick={onNewGame}
        aria-label="新游戏"
        title="新游戏"
      >
        <span className="text-xl leading-none" aria-hidden="true">
          ↻
        </span>
        <span>新游戏</span>
      </button>
    </section>
  );
}
