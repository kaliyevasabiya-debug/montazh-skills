// Движок «Окна в комнате». Кадр 1920×1080. Ролик описывается в video.html, здесь трогать без нужды не надо.
// render(t) рисует графику на секунде t (прозрачный слой поверх спикера).
// Наружу: window.SFX [[сек, звук, громкость]], window.ZOOMS [[с, по, крат, x, y]], window.SPANS [[с, по]], window.measureClips().
(() => {
const clamp = x => Math.min(Math.max(x, 0), 1);
const ease = x => 1 - Math.pow(1 - clamp(x), 4);               // мягкий экспо-выход, как в оригинале
const inout = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const spring = x => { x = clamp(x); return 1 - Math.cos(x * 4.2) * Math.exp(-x * 5.5); };
const num = (v, d = 0) => v === undefined || v === '' ? d : +v;
const FADE = 0.25;   // появление/уход сцены поверх спикера
const FFADE = 0.18;  // появление/уход полноэкранной вставки

const SFX = [];
const sfx = (t, name, vol) => { if (name && name !== 'none') SFX.push([+t.toFixed(3), name, vol ?? 0.5]); };

// ПРИБЛИЖЕНИЯ: <i class="zoom" data-s="6" data-e="8.4" data-k="1.3" data-at="0.6,0.35"></i>
window.ZOOMS = [...document.querySelectorAll('.zoom')].map(z => {
  const [x, y] = (z.dataset.at || '0.5,0.4').split(',').map(Number);
  const r = [num(z.dataset.s), num(z.dataset.e), num(z.dataset.k, 1.3), x, y];
  if (z.dataset.sfx) sfx(r[0], z.dataset.sfx, num(z.dataset.vol, 0.35));
  z.remove(); return r;
});

const scenes = [...document.querySelectorAll('.scene')];
const CL = [];
scenes.forEach(sc => {
  sc.s = num(sc.dataset.s); sc.e = num(sc.dataset.e, sc.s + 3);
  sc.full = sc.dataset.kind === 'full';
  const cam = document.createElement('div'); cam.className = 'cam';
  [...sc.childNodes].forEach(n => cam.appendChild(n));
  sc.appendChild(cam); sc.cam = cam;
  if (sc.full) { const bg = document.createElement('div'); bg.className = 'bg ' + (sc.dataset.bg || 'dark'); sc.prepend(bg); }
  sfx(sc.s - 0.08, sc.dataset.sfx ?? (sc.full ? 'whoosh' : null), num(sc.dataset.vol, 0.45));

  // окно macOS: <div class="win" data-title="..."> содержимое </div>; data-clip="media/rec.mp4" — внутри играет запись экрана
  sc.querySelectorAll('.win').forEach(w => {
    const body = document.createElement('div'); body.className = 'body';
    [...w.childNodes].forEach(n => body.appendChild(n));
    const bar = document.createElement('div'); bar.className = 'bar';
    bar.innerHTML = `<i></i><i></i><i></i><span>${w.dataset.title || ''}</span>`;
    w.append(bar, body);
    if (w.dataset.clip) {
      w.classList.add('clip');
      const on = num(w.dataset.in) + num(w.dataset.dur, 0.6) + 0.04;
      const off = Math.min(w.dataset.out !== undefined ? num(w.dataset.out) : 1e9, sc.e - sc.s - FADE);
      CL.push({ sc, body, file: w.dataset.clip, from: num(w.dataset.cfrom), on: sc.s + on, off: sc.s + off, lon: on });
      sc.noPush = true;
    }
  });
  // плашка-глава: <div class="tag"><b>2</b>Железное правило</div>
  // звуки по умолчанию: окно — вжух, плашка — поп, хромовая цифра — удар
  sc.querySelectorAll('[data-in]').forEach(el => {
    const def = el.classList.contains('win') ? 'whoosh' : el.classList.contains('chrome') ? 'hit'
      : el.matches('.tag,.note,.pill,.label') ? 'pop' : null;
    const name = el.dataset.sfx ?? def;
    sfx(sc.s + num(el.dataset.in) - (name === 'whoosh' ? 0.06 : 0), name, num(el.dataset.vol, name === 'hit' ? 0.7 : 0.4));
  });
  sc.querySelectorAll('[data-count]').forEach(el => { if (el.dataset.sfx === undefined && !el.closest('[data-sfx]')) sfx(sc.s + num(el.dataset.cin, num(el.dataset.in)), 'tick', 0.25); });
  sc.querySelectorAll('[data-type]').forEach(el => {
    if (el.dataset.keys === 'none') return;
    const t0 = sc.s + num(el.dataset.tin), d = num(el.dataset.tdur, 1.2);
    for (let k = 0; k < d; k += 0.11) sfx(t0 + k, 'click', 0.18);
  });
});

window.SFX = SFX;
window.SPANS = scenes.map(s => [s.s, s.e]);
window.DUR = Math.max(0, ...scenes.map(s => s.e));

const fmt = (v, el) => {
  const dec = (el.dataset.count.split('.')[1] || '').length;
  let s = v.toFixed(dec);
  if (el.dataset.fmt !== 'plain') s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return s.replace('.', ',');
};

function render(t) {
  scenes.forEach(sc => {
    const lt = t - sc.s, vis = t >= sc.s && t < sc.e;
    sc.style.display = vis ? 'block' : 'none'; if (!vis) return;
    const F = sc.full ? FFADE : FADE;
    const pin = ease(lt / F), pout = ease((t - (sc.e - F)) / F);
    sc.style.opacity = (sc.dataset.cut === 'hard' ? 1 : pin) * (1 - pout);
    const blur = (1 - pin) * (sc.full ? 16 : 0) + pout * 12;
    const push = sc.full && !sc.noPush ? 1 + 0.03 * clamp(lt / (sc.e - sc.s)) : 1;
    const s0 = sc.full ? 1 + (1 - pin) * 0.05 : 1;
    sc.cam.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
    sc.cam.style.transform = `scale(${(push * s0).toFixed(4)})`;

    sc.querySelectorAll('[data-in],[data-float],[data-drift],[data-out]').forEach(el => {
      const d = el.dataset; let o = 1, tf = '', f = 0;
      if (d.in !== undefined) {
        const p = (lt - num(d.in)) / num(d.dur, 0.6);
        o = clamp(p * 2.5);
        const sp = d.pop !== undefined ? spring(p) : ease(p);
        const from = d.from || 'scale', dist = num(d.dist, 220);
        if (from === 'left') tf += `translateX(${(-(1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'right') tf += `translateX(${((1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'bottom') tf += `translateY(${((1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'top') tf += `translateY(${(-(1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'spin') tf += `perspective(1400px) rotateY(${((1 - sp) * 70).toFixed(2)}deg) `;
        tf += `scale(${(0.85 + 0.15 * sp).toFixed(4)}) `;
        f = (1 - ease(p)) * 18;
      }
      if (d.out !== undefined) { const q = ease((lt - num(d.out)) / 0.35); o *= 1 - q; f += q * 16; tf += `scale(${(1 - q * 0.06).toFixed(4)}) `; }
      if (d.float !== undefined) { const a = num(d.float, 8), ph = el.ph ??= Math.random() * 6; tf += `translateY(${(Math.sin(lt * 1.4 + ph) * a).toFixed(1)}px) `; }
      if (d.drift !== undefined) { const [dx, dy] = d.drift.split(',').map(Number); const k = clamp(lt / (sc.e - sc.s)); tf += `translate(${(dx * k).toFixed(1)}px,${(dy * k).toFixed(1)}px) `; }
      if (d.tilt !== undefined) tf += `perspective(1600px) rotateY(${d.tilt}deg) `;
      if (d.rot !== undefined) tf += `rotate(${d.rot}deg) `;
      el.style.opacity = o.toFixed(3); el.style.transform = tf;
      el.style.filter = f > 0.3 ? `blur(${f.toFixed(1)}px)` : '';
    });
    // счётчик «барабан»: data-count="600000" (+ data-cin, data-cdur)
    sc.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count, from = num(el.dataset.cfrom0, 0);
      const q = (lt - num(el.dataset.cin, num(el.dataset.in))) / num(el.dataset.cdur, 0.8);
      const p = inout(q);
      el.textContent = fmt(from + (target - from) * p, el);
      const speed = q > 0 && q < 1 ? Math.sin(Math.PI * clamp(q)) : 0;
      el.style.filter = speed > 0.05 ? `blur(${(speed * 7).toFixed(1)}px)` : '';
    });
    // печать текста: data-type="текст" (+ data-tin, data-tdur)
    sc.querySelectorAll('[data-type]').forEach(el => {
      const s = el.dataset.type, p = clamp((lt - num(el.dataset.tin)) / num(el.dataset.tdur, 1.2));
      el.textContent = s.slice(0, Math.round(s.length * p)) + (p < 1 && lt >= num(el.dataset.tin) ? '▍' : '');
    });
    // полоса прогресса: <div class="bar-fill" data-fill="0.8" data-in="1"></div>
    sc.querySelectorAll('[data-fill]').forEach(el => {
      el.style.width = (num(el.dataset.fill, 1) * 100 * inout((lt - num(el.dataset.in)) / num(el.dataset.fdur, 1))).toFixed(2) + '%';
    });
    CL.forEach(c => { if (c.sc === sc) c.body.style.background = lt >= c.lon && t < c.off ? 'transparent' : ''; });
  });
  if (window.onFrame) window.onFrame(t, { clamp, ease, inout, spring });  // свои анимации из video.html
}

// где и когда внутри окон показывать записи экрана (их подкладывает ffmpeg под графику)
window.measureClips = () => CL.map(c => {
  render(c.on + 0.001);
  const r = c.body.getBoundingClientRect();
  return { file: c.file, from: c.from, on: +c.on.toFixed(3), off: +c.off.toFixed(3),
    x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width / 2) * 2, h: Math.round(r.height / 2) * 2 };
});
window.render = render;
document.fonts.ready.then(() => render(0));
})();
