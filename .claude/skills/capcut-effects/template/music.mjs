// node music.mjs 27 [настроение] -> work/music.wav: своя фоновая музыка, сочиняется кодом (никаких прав и лицензий)
// настроение: warm (по умолчанию, спокойный лоу-фай), bright (бодрее), soft (только аккорды, без барабанов)
// Своя музыка вместо этой: положи файл в media/music.mp3 — render.mjs возьмёт его.
import fs from 'fs';

const dur = +(process.argv[2] || 30), mood = process.argv[3] || 'warm', SR = 44100;
const bpm = mood === 'bright' ? 100 : 84, beat = 60 / bpm, n = Math.ceil((dur + 1) * SR);
const L = new Float32Array(n), R = new Float32Array(n);
const hz = m => 440 * 2 ** ((m - 69) / 12);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// аккорды (MIDI): Fmaj9 – Em7 – Dm9 – Cmaj7, по такту (4 доли)
const CH = [[53, 57, 60, 64, 67], [52, 55, 59, 62, 67], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62]];
const BASS = [41, 40, 38, 36];

function tone(t0, len, f, vol, pan = 0, bright = .25) {           // мягкий «электропиано»: синус + обертоны, атака и затухание
  const a = Math.floor(t0 * SR), m = Math.floor(len * SR);
  for (let i = 0; i < m && a + i < n; i++) {
    const t = i / SR, env = Math.min(1, t / .02) * Math.exp(-t * 1.6) * Math.min(1, (m - i) / (SR * .08));
    const w = Math.sin(2 * Math.PI * f * t) + bright * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 4) + .08 * Math.sin(6 * Math.PI * f * t);
    const v = w * env * vol, wob = 1 + .003 * Math.sin(2 * Math.PI * 4.5 * t);
    L[a + i] += v * (1 - pan) * wob; R[a + i] += v * (1 + pan) / wob;
  }
}
function kick(t0, vol) {
  const a = Math.floor(t0 * SR);
  for (let i = 0; i < SR * .35 && a + i < n; i++) { const t = i / SR, f = 50 + 70 * Math.exp(-t * 30), v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * vol; L[a + i] += v; R[a + i] += v; }
}
function hat(t0, vol) {
  const a = Math.floor(t0 * SR); let p = 0;
  for (let i = 0; i < SR * .05 && a + i < n; i++) { const x = rnd() * 2 - 1, h = x - p; p = x; const v = h * Math.exp(-i / SR * 70) * vol; L[a + i] += v * .8; R[a + i] += v; }
}

const bars = Math.ceil(dur / (beat * 4)) + 1;
for (let b = 0; b < bars; b++) {
  const t = b * 4 * beat, c = CH[b % 4];
  c.forEach((m, k) => tone(t + k * .012, beat * 4, hz(m), .055, (k - 2) * .15));         // аккорд, чуть «раскатанный»
  tone(t, beat * 2, hz(BASS[b % 4]), .12, 0, .1); tone(t + beat * 2.5, beat * 1.5, hz(BASS[b % 4]), .09, 0, .1);
  if (mood !== 'soft') {
    [0, 2.5].forEach(x => kick(t + x * beat, .32));
    for (let k = 0; k < 8; k++) hat(t + k * beat / 2 + (k % 2 ? .03 : 0), k % 2 ? .05 : .08);
  }
  const mel = [72, 74, 76, 79, 76, 74];                                                   // простая мелодия «колокольчиком» раз в два такта
  if (b % 2 === 1) [0, 1, 1.5, 2.5].forEach((x, k) => tone(t + x * beat, beat, hz(mel[(b + k) % mel.length]), .03, .3, .6));
}

// плавное начало/конец, нормализация, запись WAV
const fade = SR * 1.5, out = Buffer.alloc(44 + n * 4);
let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = .8 / (peak || 1);
for (let i = 0; i < n; i++) {
  const f = Math.min(1, i / fade, (dur * SR - i) / fade); const k = Math.max(0, f) * g;
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k)) * 32767), 46 + i * 4);
}
out.write('RIFF', 0); out.writeUInt32LE(36 + n * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(n * 4, 40);
fs.mkdirSync('work', { recursive: true }); fs.writeFileSync('work/music.wav', out);
console.log(`Музыка: work/music.wav (${dur} с, ${bpm} уд/мин, ${mood})`);
