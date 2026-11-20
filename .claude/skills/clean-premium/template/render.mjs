// node render.mjs stills 1 4.5 10   -> frames/still_1.jpg ... (проверить кадры)
// node render.mjs full               -> out/video.mp4 (готовый ролик с голосом и звуками)
// node render.mjs full 12            -> только первые 12 секунд (быстрая проверка)
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const [mode = 'stills', ...args] = process.argv.slice(2);
const FPS = 30, PAGES = 3;
fs.mkdirSync('frames', { recursive: true }); fs.mkdirSync('out', { recursive: true });
// Рисуем кадры в Google Chrome, который стоит на компьютере
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find(f => fs.existsSync(f));
if (!CHROME) { console.error('Не нашёл Google Chrome. Установи его с google.com/chrome и запусти снова.'); process.exit(1); }
// В облаке (Linux) есть безэкранный Chrome — обычный там зависает на нескольких вкладках сразу
const SHELL = '/opt/pw-browsers/chromium_headless_shell';
const browser = fs.existsSync(SHELL)
  ? await puppeteer.launch({ headless: 'shell', executablePath: SHELL, args: ['--no-sandbox', '--allow-file-access-from-files'] })
  : await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const open = async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 1080, height: 1920 });
  p.on('pageerror', e => console.error('Ошибка на странице:', e.message));
  await p.goto('file://' + path.resolve('video.html'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  return p;
};
const shot = (p, t, file) => p.evaluate(t => render(t), t).then(() => p.screenshot({ path: file, type: 'jpeg', quality: 90 }));

const page = await open();
const { DUR, SFX } = await page.evaluate(() => ({ DUR: window.DUR, SFX: window.SFX }));

if (mode === 'stills') {
  for (const t of args.map(Number)) await shot(page, t, `frames/still_${t}.jpg`);
  console.log('Кадры в папке frames/');
} else {
  const dur = args[0] ? +args[0] : DUR, n = Math.round(dur * FPS);
  fs.readdirSync('frames').filter(f => f.startsWith('f')).forEach(f => fs.rmSync('frames/' + f));
  const pages = [page, ...await Promise.all(Array.from({ length: PAGES - 1 }, open))];
  let done = 0;
  await Promise.all(pages.map(async (p, k) => {
    for (let i = k; i < n; i += PAGES) {
      await shot(p, i / FPS, `frames/f${String(i).padStart(5, '0')}.jpg`);
      if (++done % 30 === 0) process.stdout.write(`\rкадры: ${Math.round(done / n * 100)}%`);
    }
  }));
  console.log('\nсклеиваю видео и звук…');
  const inA = [], flt = [], mix = [];
  let k = 1;
  if (fs.existsSync('media/voice.mp3')) { inA.push('-i', 'media/voice.mp3'); mix.push(`[${k++}:a]`); }
  if (fs.existsSync('media/music.mp3')) {
    inA.push('-stream_loop', '-1', '-i', 'media/music.mp3');
    flt.push(`[${k}:a]volume=0.065,afade=t=out:st=${(dur - 1.5).toFixed(2)}:d=1.5[mu]`); mix.push('[mu]'); k++;
  }
  SFX.filter(([t, name]) => t >= 0 && t < dur && fs.existsSync(`a/sfx/${name}.wav`)).forEach(([t, name, vol]) => {
    inA.push('-i', `a/sfx/${name}.wav`);
    flt.push(`[${k}:a]adelay=${Math.round(t * 1000)}:all=1,volume=${vol}[s${k}]`); mix.push(`[s${k}]`); k++;
  });
  const a = ['-y', '-framerate', String(FPS), '-i', 'frames/f%05d.jpg', ...inA];
  if (mix.length) {
    flt.push(`${mix.join('')}amix=inputs=${mix.length}:normalize=0:duration=longest,atrim=0:${dur},loudnorm=I=-14:TP=-1.5[aout]`);
    a.push('-filter_complex', flt.join(';'), '-map', '0:v', '-map', '[aout]', '-c:a', 'aac', '-b:a', '192k');
  }
  a.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-t', String(dur), '-movflags', '+faststart', 'out/video.mp4');
  execFileSync('ffmpeg', a, { stdio: ['ignore', 'ignore', 'inherit'] });
  console.log('Готово: out/video.mp4');
}
await browser.close();
