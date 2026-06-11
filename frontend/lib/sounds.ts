// Lightweight Web Audio "sound font" for chess events. We synthesize the
// sounds in-browser so there are no audio assets to ship.

export type SoundEvent =
  | "move"
  | "capture"
  | "check"
  | "castle"
  | "promotion"
  | "checkmate"
  | "draw"
  | "start"
  | "click"
  | "illegal"

let ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.18,
  attack = 0.005,
  release = 0.06,
  startOffset = 0,
) {
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + startOffset
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + attack)
  gain.gain.linearRampToValueAtTime(0, t0 + duration + release)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + release + 0.02)
}

function noiseBurst(duration = 0.05, volume = 0.10) {
  const ac = getCtx()
  if (!ac) return
  const bufferSize = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    // Highpass-ish thump: noise tapering off
    const envelope = 1 - i / bufferSize
    data[i] = (Math.random() * 2 - 1) * envelope
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const gain = ac.createGain()
  gain.gain.value = volume
  const filter = ac.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 1200
  src.connect(filter).connect(gain).connect(ac.destination)
  src.start()
}

const PATTERNS: Record<SoundEvent, () => void> = {
  move: () => {
    tone(380, 0.04, "triangle", 0.12, 0.002, 0.05)
    tone(190, 0.06, "sine", 0.06, 0.002, 0.06, 0.005)
  },
  capture: () => {
    noiseBurst(0.07, 0.18)
    tone(160, 0.10, "sawtooth", 0.10, 0.002, 0.10)
  },
  castle: () => {
    tone(360, 0.05, "triangle", 0.10)
    tone(280, 0.06, "triangle", 0.10, 0.002, 0.05, 0.07)
  },
  promotion: () => {
    tone(523, 0.10, "triangle", 0.14)
    tone(659, 0.10, "triangle", 0.14, 0.002, 0.05, 0.08)
    tone(784, 0.12, "triangle", 0.14, 0.002, 0.05, 0.16)
  },
  check: () => {
    tone(880, 0.08, "square", 0.10)
    tone(1175, 0.10, "square", 0.10, 0.002, 0.05, 0.06)
  },
  checkmate: () => {
    tone(523, 0.14, "sawtooth", 0.16)
    tone(440, 0.14, "sawtooth", 0.14, 0.002, 0.05, 0.10)
    tone(330, 0.20, "sawtooth", 0.12, 0.002, 0.08, 0.22)
    tone(165, 0.30, "sine", 0.10, 0.002, 0.15, 0.40)
  },
  draw: () => {
    tone(440, 0.18, "sine", 0.10)
    tone(440, 0.18, "sine", 0.10, 0.002, 0.10, 0.22)
  },
  start: () => {
    tone(523, 0.08, "triangle", 0.10)
    tone(659, 0.08, "triangle", 0.10, 0.002, 0.05, 0.08)
    tone(784, 0.10, "triangle", 0.10, 0.002, 0.05, 0.16)
  },
  click: () => {
    tone(900, 0.02, "square", 0.05, 0.001, 0.02)
  },
  illegal: () => {
    tone(220, 0.06, "sawtooth", 0.10)
    tone(180, 0.10, "sawtooth", 0.10, 0.002, 0.05, 0.05)
  },
}

let enabled = true
export function setSoundEnabled(v: boolean) {
  enabled = v
}

export function playSound(event: SoundEvent) {
  if (!enabled) return
  if (typeof window === "undefined") return
  const ac = getCtx()
  if (!ac) return
  // Many browsers suspend audio until a user gesture; this is safe to call.
  if (ac.state === "suspended") {
    void ac.resume().catch(() => {})
  }
  try {
    PATTERNS[event]?.()
  } catch {
    // best effort
  }
}
