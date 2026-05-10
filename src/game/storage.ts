const BEST_SCORE_KEY = "ios-2048.bestScore";
const SOUND_ENABLED_KEY = "ios-2048.soundEnabled";

export function readBestScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const value = window.localStorage.getItem(BEST_SCORE_KEY);
    const parsed = value === null ? 0 : Number.parseInt(value, 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function writeBestScore(score: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.max(0, score)));
  } catch {
    return;
  }
}

export function readSoundEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return window.localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
  } catch {
    return true;
  }
}

export function writeSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {
    return;
  }
}
