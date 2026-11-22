// node render.mjs stills 2 7.5 12   -> work/still_*.jpg (кадр спикера + приближение + окна + графика)
// node render.mjs part 40 70        -> out/кусок.mp4 (проверить отрезок целиком, со звуком)
// node render.mjs full              -> out/готово.mp4
// Нужно: media/cut.mp4 (нарезка 1920×1080). Музыка (по желанию): media/music.mp3 или work/music.wav (node music.mjs <сек>).
// Громкость музыки: MUSIC=0.06 node render.mjs full. Скорость: PAGES=6 (больше вкладок Chrome = быстрее, если хватает памяти).
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const [mode = 'stills', ...args] = process.argv.slice(2);
const FPS = +(process.env.FPS || 30), PAGES = +(process.env.PAGES || 4), SRC = 'media/cut.mp4', W = 1920, H = 1080, SR = 48000;
if (!fs.existsSync(SRC)) { console.error('Нет media/cut.mp4 — сначала нарезка (scripts/cut_wide.py).'); process.exit(1); }
fs.mkdirSync('work', { recursive: true }); fs.mkdirSync('out', { recursive: true });
const SRCDUR = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SRC]).toString().trim();

const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find(f => f && fs.existsSync(f));
if (!CHROME) { console.error('Не нашёл Google Chrome. Установи его с google.com/chrome и запусти снова.'); process.exit(1); }
// у каждого потока свой Chrome: фоновые вкладки одного браузера «засыпают» и зависают на скриншотах
const browsers = [];
const open = async () => {
  const br = await puppeteer.launch({ headless: true, executablePath: CHROME, protocolTimeout: 600000,
    args: ['--allow-file-access-from-files', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
  browsers.push(br);
  const p = (await br.pages())[0] || await br.newPage();
  await p.setViewport({ width: W, height: H });
  p.on('pageerror', e => console.error('Ошибка на странице:', e.message));
  await p.goto('file://' + path.resolve('video.html'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  return p;
};
const page = await open();
const { SFX, ZOOMS, SPANS, CLIPS } = await page.evaluate(() => ({ SFX: window.SFX, ZOOMS: window.ZOOMS, SPANS: window.SPANS, CLIPS: window.measureClips() }));
CLIPS.filter(c => !fs.existsSync(c.file)).forEach(c => console.warn(`Нет файла ${c.file} — окно останется пустым.`));
CLIPS.splice(0, CLIPS.length, ...CLIPS.filter(c => fs.existsSync(c.file)));
const shot = async (p, t, file) => { await p.evaluate(t => render(t), t); await p.screenshot({ path: file, omitBackground: true, optimizeForSpeed: true }); };
const active = t => SPANS.some(([s, e]) => t >= s && t < e);
const zoomAt = t => ZOOMS.find(([s, e]) => t >= s && t < e);

// приближение как выражение ffmpeg (жёсткий «панч-ин» на время [s, e))
const zoomFilter = off => {
  const zs = ZOOMS.map(([s, e, k, x, y]) => [s - off, e - off, k, x, y]).filter(z => z[1] > 0);
  if (!zs.length) return `scale=${W}:${H},setsar=1`;
  const on = zs.map(([s, e]) => `gte(it,${s.toFixed(3)})*lt(it,${e.toFixed(3)})`);
  const Z = '1+' + zs.map(([, , k], i) => `${(k - 1).toFixed(3)}*${on[i]}`).join('+');
  const sum = j => zs.map((z, i) => `${z[j]}*${on[i]}`).join('+'), any = on.join('+');
  return `scale=${W}:${H},setsar=1,zoompan=z='${Z}':x='(iw-iw/zoom)*(${sum(3)}+0.5*(1-(${any})))':y='(ih-ih/zoom)*(${sum(4)}+0.4*(1-(${any})))':d=1:s=${W}x${H}:fps=${FPS},setpts=N/${FPS}/TB`;  // zoompan сбивает время кадров — выравниваем
};

if (mode === 'stills') {
  for (const t of args.map(Number)) {
    await shot(page, t, 'work/_ov.png');
    const z = zoomAt(t), ins = ['-ss', String(t), '-i', SRC, '-i', 'work/_ov.png'];
    let flt = z ? `[0:v]scale=${W}:${H},crop=iw/${z[2]}:ih/${z[2]}:(iw-iw/${z[2]})*${z[3]}:(ih-ih/${z[2]})*${z[4]},scale=${W}:${H},setsar=1[b0]` : `[0:v]scale=${W}:${H},setsar=1[b0]`;
    let last = 'b0', k = 2;
    CLIPS.filter(c => t >= c.on && t < c.off).forEach(c => {
      ins.push('-ss', String(c.from + t - c.on), '-i', c.file);
      flt += `;[${k}:v]scale=${c.w}:${c.h}[c${k}];[${last}][c${k}]overlay=${c.x}:${c.y}[b${k}]`; last = `b${k}`; k++;
    });
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', `${flt};[${last}][1:v]overlay`, '-frames:v', '1', `work/still_${t}.jpg`]);
  }
  console.log('Кадры: work/still_*.jpg');
} else {
  const [a, b] = mode === 'part' ? args.map(Number) : [0, SRCDUR];
  const DUR = Math.min(b, SRCDUR) - a, n = Math.round(DUR * FPS), OUT = mode === 'part' ? 'out/кусок.mp4' : 'out/готово.mp4';
  // 1) графика: кадры только там, где есть сцены; остальное — ссылка на пустой кадр (быстро и не занимает место)
  fs.rmSync('work/ov', { recursive: true, force: true }); fs.mkdirSync('work/ov', { recursive: true });
  await page.evaluate(() => render(-1)); await page.screenshot({ path: 'work/_blank.png', omitBackground: true });
  const todo = [];
  for (let i = 0; i < n; i++) {
    const t = a + i / FPS, f = `work/ov/o${String(i).padStart(6, '0')}.png`;
    if (active(t)) todo.push([t, f]); else { try { fs.linkSync('work/_blank.png', f); } catch { fs.copyFileSync('work/_blank.png', f); } }
  }
  const pages = [page, ...await Promise.all(Array.from({ length: PAGES - 1 }, open))];
  let done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async (p, k) => {
    for (let i = k; i < todo.length; i += PAGES) {
      await shot(p, ...todo[i]);
      if (++done % 60 === 0) { const sp = done / ((Date.now() - t0) / 1000); process.stdout.write(`\rграфика: ${Math.round(done / todo.length * 100)}% (~${Math.ceil((todo.length - done) / sp / 60)} мин осталось)   `); }
    }
  }));
  // 2) звуки: сводим все «вжухи/попы/удары» в одну дорожку
  const mix = new Float32Array(Math.ceil((DUR + 1) * SR)), cache = {};
  SFX.filter(([t, name]) => t >= a && t < a + DUR && fs.existsSync(`a/sfx/${name}.wav`)).forEach(([t, name, vol]) => {
    const buf = cache[name] ??= new Float32Array(new Uint8Array(execFileSync('ffmpeg', ['-v', 'error', '-i', `a/sfx/${name}.wav`, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1e8 })).buffer);
    const o = Math.round((t - a) * SR);
    for (let j = 0; j < buf.length && o + j < mix.length; j++) if (o + j >= 0) mix[o + j] += buf[j] * vol;
  });
  fs.writeFileSync('work/_sfx.f32', Buffer.from(mix.buffer));
  // 3) склейка: видео с приближениями -> записи экрана в окнах -> графика; голос + музыка (приглушается под голос) + звуки
  console.log('\nсклеиваю…');
  const ins = ['-ss', String(a), '-t', String(DUR), '-i', SRC, '-reinit_filter', '0', '-framerate', String(FPS), '-i', 'work/ov/o%06d.png', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', 'work/_sfx.f32'];
  const flt = [`[0:v]${zoomFilter(a)}[b0]`];
  let last = 'b0', k = 3;
  CLIPS.filter(c => c.off > a && c.on < a + DUR).forEach(c => {
    const on = Math.max(c.on, a) - a, off = c.off - a, from = c.from + Math.max(0, a - c.on);
    ins.push('-ss', String(from), '-t', String(off - on + 0.2), '-i', c.file);
    flt.push(`[${k}:v]fps=${FPS},scale=${c.w}:${c.h},setsar=1,setpts=PTS-STARTPTS+${on.toFixed(3)}/TB[c${k}]`,
      `[${last}][c${k}]overlay=${c.x}:${c.y}:enable='between(t,${on.toFixed(3)},${off.toFixed(3)})':eof_action=pass[b${k}]`);
    last = `b${k}`; k++;
  });
  // непрозрачные кадры Chrome пишет без альфы — приводим всё к rgba, иначе ffmpeg перезапускает граф и сбивает время
  flt.push(`[1:v]format=rgba[ovl]`, `[${last}][ovl]overlay=format=auto[v]`);
  const am = ['[vo]', '[2:a]'];
  flt.push('[0:a]asplit=2[vo][vk]');
  const music = ['media/music.mp3', 'media/music.wav', 'work/music.wav'].find(f => fs.existsSync(f));
  if (music) {
    ins.push('-stream_loop', '-1', '-i', music);
    flt.push(`[${k}:a]atrim=${a}:${a + DUR},asetpts=PTS-STARTPTS,volume=${process.env.MUSIC || 0.09},afade=t=in:d=1,afade=t=out:st=${(DUR - 2).toFixed(2)}:d=2[mu0]`,
      `[mu0][vk]sidechaincompress=threshold=0.02:ratio=5:attack=20:release=500[mu]`);
    am.push('[mu]');
  } else flt.push('[vk]anullsink');
  flt.push(`${am.join('')}amix=inputs=${am.length}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5[a]`);
  fs.writeFileSync('work/_graph.txt', flt.join(';\n'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-/filter_complex', 'work/_graph.txt', '-map', '[v]', '-map', '[a]', '-t', String(DUR),
    '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', OUT],
    { stdio: ['ignore', 'ignore', 'inherit'] });
  fs.rmSync('work/ov', { recursive: true, force: true }); fs.rmSync('work/_sfx.f32', { force: true });
  console.log('Готово: ' + OUT);
}
await Promise.all(browsers.map(b => b.close()));
