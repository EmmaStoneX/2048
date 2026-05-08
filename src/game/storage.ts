const BEST_SCORE_KEY = "ios-2048.bestScore";

export function readBestScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = value === null ? 0 : Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function writeBestScore(score: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BEST_SCORE_KEY, String(Math.max(0, score)));
}
