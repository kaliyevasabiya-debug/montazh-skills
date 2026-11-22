// node render_pieces.mjs "<папка вывода>"  -> <папка>/NN_имя.mov (ProRes 4444 с прозрачностью) + sfx.wav (все звуки на всю длину) + pieces.json
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const OUT = process.argv[2], FPS = 30, PAGES = 4, W = 1920, H = 1080, SR = 48000;
const DUR = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'media/cut.mp4']).toString().trim();
fs.mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(f => fs.existsSync(f));
const browsers = [];
const open = async () => {
  const br = await puppeteer.launch({ headless: true, executablePath: CHROME, protocolTimeout: 600000,
    args: ['--allow-file-access-from-files', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  browsers.push(br);
  const p = (await br.pages())[0];
  await p.setViewport({ width: W, height: H });
  p.on('pageerror', e => console.error('Ошибка на странице:', e.message));
  await p.goto('file://' + path.resolve('video.html'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  return p;
};
const pages = await Promise.all(Array.from({ length: PAGES }, open));
const { SFX, PIECES } = await pages[0].evaluate(() => {
  const m = {};
  document.querySelectorAll('.scene[data-piece]').forEach(s => {
    const k = s.dataset.piece, a = +s.dataset.s, b = +s.dataset.e;
    m[k] = m[k] ? [Math.min(m[k][0], a), Math.max(m[k][1], b)] : [a, b];
  });
  return { SFX: window.SFX, PIECES: Object.entries(m).map(([name, [s, e]]) => ({ name, s, e })) };
});

for (const pc of PIECES) {
  const done0 = path.join(OUT, `${pc.name}.mov`);
  const only = process.env.ONLY;  // ONLY=03_montage SUFFIX=_v2 — перерисовать один кусок в новый файл
  if (only ? pc.name !== only : (fs.existsSync(done0) && !process.env.FORCE)) { pc.file = done0; console.log(`${pc.name}: пропускаю`); continue; }
  const dir = 'work/pc'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round((Math.min(pc.e, DUR) - pc.s) * FPS);
  let done = 0;
  await Promise.all(pages.map(async (p, k) => {
    for (let i = k; i < n; i += PAGES) {
      await p.evaluate(t => render(t), pc.s + i / FPS);
      await p.screenshot({ path: `${dir}/o${String(i).padStart(5, '0')}.png`, omitBackground: true, optimizeForSpeed: true });
      if (++done % 30 === 0) process.stdout.write(`\r${pc.name}: ${Math.round(done / n * 100)}%   `);
    }
  }));
  const file = path.join(OUT, `${pc.name}${process.env.SUFFIX || ''}.mov`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-reinit_filter', '0', '-framerate', String(FPS), '-i', `${dir}/o%05d.png`, '-vf', 'format=rgba',
    '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', file]);
  pc.file = file; pc.frames = n;
  console.log(`\r${pc.name}: готово (${(n / FPS).toFixed(2)} с, старт ${pc.s} с)`);
}
fs.rmSync('work/pc', { recursive: true, force: true });
if (process.env.ONLY) { console.log('Готово (только', process.env.ONLY + ')'); await Promise.all(browsers.map(b => b.close())); process.exit(0); }

// звуки — одна дорожка на всю длину ролика, ставится с 0:00
const mix = new Float32Array(Math.ceil((DUR + 1) * SR)), cache = {};
SFX.filter(([t, name]) => t < DUR && fs.existsSync(`a/sfx/${name}.wav`)).forEach(([t, name, vol]) => {
  const buf = cache[name] ??= new Float32Array(new Uint8Array(execFileSync('ffmpeg', ['-v', 'error', '-i', `a/sfx/${name}.wav`, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1e8 })).buffer);
  const o = Math.max(0, Math.round(t * SR));
  for (let j = 0; j < buf.length && o + j < mix.length; j++) mix[o + j] += buf[j] * vol;
});
fs.writeFileSync('work/_sfx.f32', Buffer.from(mix.buffer));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', 'work/_sfx.f32', '-t', String(DUR), '-af', 'alimiter=limit=0.9', '-ac', '2', path.join(OUT, 'sfx.wav')]);
fs.rmSync('work/_sfx.f32');
fs.writeFileSync(path.join(OUT, 'pieces.json'), JSON.stringify({ fps: FPS, duration: DUR, pieces: PIECES, sfx: path.join(OUT, 'sfx.wav') }, null, 1));
console.log('Готово:', OUT);
await Promise.all(browsers.map(b => b.close()));
