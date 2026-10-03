let ctx = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(ac, { type = "sine", from, to = from, start = 0, dur = 0.1, gain = 0.05 }) {
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(ac, { start = 0, dur = 0.3, gain = 0.06, filter = "bandpass", from = 800, to = 2400, q = 1 }) {
  const t0 = ac.currentTime + start;
  const len = Math.max(1, Math.ceil(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(ac.destination);
  src.start(t0);
}

export function playPress() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { type: "square", from: 190, to: 120, dur: 0.07, gain: 0.06 });
  noise(ac, { dur: 0.05, gain: 0.03, filter: "highpass", from: 3000, to: 1500 });
}

export function playGateOpen() {
  const ac = audio();
  if (!ac) return;
  noise(ac, { dur: 0.9, gain: 0.08, filter: "lowpass", from: 250, to: 4200 });
  noise(ac, { start: 0.55, dur: 0.5, gain: 0.04, filter: "highpass", from: 5000, to: 9000 });
  [1318, 1659, 2093, 2637].forEach((freq, i) => {
    tone(ac, { from: freq, dur: 0.4, gain: 0.045, start: 0.5 + i * 0.09 });
  });
}

export function playTick() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { type: "sine", from: 1400, to: 1100, dur: 0.045, gain: 0.035 });
}

export function playPop() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { type: "triangle", from: 420, to: 900, dur: 0.09, gain: 0.055 });
  tone(ac, { from: 1800, to: 2200, dur: 0.05, gain: 0.02, start: 0.02 });
}

export function playBack() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { from: 760, to: 360, dur: 0.1, gain: 0.045 });
}

export function playError() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { type: "square", from: 220, to: 160, dur: 0.14, gain: 0.035 });
}

export function playSpark() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { from: 420, to: 980, dur: 0.12, gain: 0.06 });
  tone(ac, { from: 1680, to: 2940, dur: 0.1, gain: 0.02, start: 0.02 });
}
