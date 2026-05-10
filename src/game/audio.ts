let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = true;

type WindowWithAudioContext = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

function getAudioContextConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as WindowWithAudioContext;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function getAudioContext() {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextConstructor = getAudioContextConstructor();

  if (!AudioContextConstructor) {
    return null;
  }

  audioContext = new AudioContextConstructor();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.42;
  masterGain.connect(audioContext.destination);

  return audioContext;
}

function outputNode(context: AudioContext) {
  return masterGain ?? context.destination;
}

function runWhenReady(play: (context: AudioContext) => void) {
  const context = getAudioContext();

  if (!context || !soundEnabled) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume().then(() => play(context)).catch(() => undefined);
    return;
  }

  play(context);
}

function scheduleGain(gain: AudioParam, start: number, peak: number, duration: number) {
  gain.cancelScheduledValues(start);
  gain.setValueAtTime(0.0001, start);
  gain.exponentialRampToValueAtTime(peak, start + 0.006);
  gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

function playTone(frequency: number, duration: number, gainValue: number, type: OscillatorType = "triangle", delay = 0) {
  runWhenReady((context) => {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime((Math.random() - 0.5) * 8, start);
    scheduleGain(gain.gain, start, gainValue, duration);

    oscillator.connect(gain);
    gain.connect(outputNode(context));
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  });
}

function playSweep(from: number, to: number, duration: number, gainValue: number, delay = 0) {
  runWhenReady((context) => {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    scheduleGain(gain.gain, start, gainValue, duration);

    oscillator.connect(gain);
    gain.connect(outputNode(context));
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  });
}

function playFilteredNoise(duration: number, gainValue: number, frequency: number, delay = 0) {
  runWhenReady((context) => {
    const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < sampleCount; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
    }

    const start = context.currentTime + delay;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.setValueAtTime(0.8, start);
    scheduleGain(gain.gain, start, gainValue, duration);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(outputNode(context));
    source.start(start);
    source.stop(start + duration + 0.02);
  });
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function unlockAudio() {
  try {
    const context = getAudioContext();

    if (context?.state === "suspended") {
      void context.resume();
    }
  } catch {
    return;
  }
}

export function playMoveSound() {
  try {
    playFilteredNoise(0.045, 0.05, 1150);
    playTone(470, 0.055, 0.035, "triangle", 0.004);
  } catch {
    return;
  }
}

export function playMergeSound(mergeCount: number) {
  try {
    const weight = Math.min(mergeCount, 4);
    playTone(245 + weight * 12, 0.085, 0.075, "sine");
    playTone(490 + weight * 18, 0.065, 0.038, "triangle", 0.006);
    playFilteredNoise(0.034, 0.032, 1500, 0.002);
  } catch {
    return;
  }
}

export function playWinSound() {
  try {
    playTone(392, 0.08, 0.045, "triangle");
    playTone(494, 0.08, 0.045, "triangle", 0.09);
    playTone(587, 0.11, 0.052, "sine", 0.18);
  } catch {
    return;
  }
}

export function playLoseSound() {
  try {
    playSweep(220, 155, 0.14, 0.052);
    playFilteredNoise(0.04, 0.025, 700, 0.02);
  } catch {
    return;
  }
}
