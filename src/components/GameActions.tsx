type GameActionsProps = {
  canUndo: boolean;
  onUndo: () => void;
  onNewGame: () => void;
};

export function GameActions({ canUndo, onUndo, onNewGame }: GameActionsProps) {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="游戏操作">
      <button
        className="min-h-14 min-[820px]:min-h-16 rounded-full bg-[#E9DED2] px-5 text-base font-black text-[#1A1A1A] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
      >
        撤销一步
      </button>
      <button
        className="min-h-14 min-[820px]:min-h-16 rounded-full bg-[#D4916E] px-5 text-base font-black text-[#1A1A1A] shadow-[0_8px_18px_rgba(212,145,110,0.2)] transition active:scale-[0.98]"
        type="button"
        onClick={onNewGame}
      >
        新游戏
      </button>
    </section>
  );
}
