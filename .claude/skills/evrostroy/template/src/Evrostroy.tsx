// ПРИМЕР-ЭТАЛОН: ролик «Еврострой — Black Friday» (2026-11-22), принятый заказчиком.
// Новый ролик Еврострой: скопируй этот файл, поменяй SRC, слова (W), тайминги и SFX.
import React from "react";
import { AbsoluteFill, OffthreadVideo, Audio, Img, Sequence, staticFile, useCurrentFrame, interpolate, spring, Easing } from "remotion";
import { ReelBase, ReelCfg, Title, Script, Pill, Flash, Chevrons, Fit, FPS, s, useLife } from "./core";

const SRC = "media/v1.mp4";
const NAVY = "#0E2A6E", RED = "#E31E24";
const GLASS = "linear-gradient(135deg, rgba(22,44,110,0.82), rgba(6,14,40,0.86))";
const BLUE_GLOW = "0 0 0 2px rgba(140,185,255,0.95), 0 0 22px rgba(60,130,255,0.85), 0 0 60px rgba(40,100,255,0.45), 0 18px 40px rgba(0,0,0,0.5)";
const TXT = "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #B9D2FF 100%)";
const HOT = "linear-gradient(180deg, #FFB3B3 0%, #FF4D4D 35%, #E31E24 65%, #9C0A10 100%)";
const gradText = (g: string): React.CSSProperties => ({ background: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" });

// ---------- тёмная капсула с оранжевой рамкой: название товара ----------
const Tag: React.FC<{ from: number; to: number; text: string; y?: number; size?: number; rotate?: number }> =
  ({ from, to, text, y = 660, size = 110, rotate = -3 }) => {
    const f = useCurrentFrame();
    const { pout, visible } = useLife(from, to, 0.2, 0.15);
    if (!visible) return null;
    const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 13, stiffness: 260, mass: 0.5 } });
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${pout * 10}px)`,
        transform: `translateY(-50%) scale(${(0.7 + 0.3 * p) * (1 - pout * 0.1)}) rotate(${rotate}deg)` }}>
        <Fit maxW={860}><span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, fontSize: size, color: "#fff", lineHeight: 1,
          padding: "18px 44px 10px", borderRadius: 26, background: GLASS, border: "none", letterSpacing: 2, WebkitTextStroke: "2px #fff", backdropFilter: "blur(14px)",
          boxShadow: BLUE_GLOW, textShadow: "0 0 18px rgba(120,170,255,0.8)" }}>{text}</span></Fit>
      </div>
    );
  };


// ---------- заголовок: жирный узкий капс, тёмно-синий на белой плашке (или белый на красной) ----------
const BTitle: React.FC<{ from: number; to: number; text: string; top?: number; size?: number; red?: boolean }> = ({ from, to, text, top = 410, size = 120, red = false }) => {
  const f = useCurrentFrame();
  const { pout, visible } = useLife(from, to, 0.25, 0.18);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 14, stiffness: 240, mass: 0.55 } });
  const bg = red ? "linear-gradient(135deg, rgba(200,20,30,0.9), rgba(110,6,14,0.9))" : GLASS;
  const glow = red ? "0 0 0 2px rgba(255,170,170,0.95), 0 0 24px rgba(255,40,50,0.8), 0 0 60px rgba(255,30,40,0.4), 0 18px 40px rgba(0,0,0,0.5)" : BLUE_GLOW;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${(1 - Math.min(1, p)) * 10 + pout * 12}px)`,
      transform: `scale(${(0.85 + 0.15 * p) * (1 + pout * 0.06)})` }}>
      <Fit maxW={860}><span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, fontSize: size, lineHeight: 1, color: "#fff",
        WebkitTextStroke: "2.5px #fff", background: bg, padding: "16px 40px 6px", borderRadius: 24, letterSpacing: 1, backdropFilter: "blur(14px)",
        boxShadow: glow, textShadow: red ? "0 0 20px rgba(255,120,120,0.7)" : "0 0 20px rgba(140,185,255,0.9)" }}>{text}</span></Fit>
    </div>
  );
};
// ---------- вторая строка: жирный Montserrat, белый на тёмно-синей (или красной) плашке ----------
const BLine: React.FC<{ from: number; to: number; text: string; top?: number; size?: number; red?: boolean; rotate?: number }> = ({ from, to, text, top = 590, size = 62, red = false, rotate = -2 }) => {
  const f = useCurrentFrame();
  const { pout, visible } = useLife(from, to, 0.25, 0.18);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 13, stiffness: 260, mass: 0.5 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${pout * 10}px)`,
      transform: `translateY(${(1 - p) * 20}px) rotate(${rotate}deg)` }}>
      <Fit maxW={860}><span style={{ display: "inline-block", fontFamily: "Mont", fontWeight: 700, fontSize: size, color: "#fff", lineHeight: 1.15, padding: "4px 10px",
        textShadow: "0 2px 6px rgba(10,20,60,0.55), 0 6px 20px rgba(10,20,60,0.4)" }}>
        {text.split("|").map((part, i) => i === 0 ? <span key={i}>{part}</span> :
          <span key={i} style={{ color: "#D3141C", textShadow: "0 0 2px #fff, 0 0 3px #fff, 0 0 4px #fff, 0 0 16px rgba(255,220,225,0.9)" }}>{part}</span>)}
      </span></Fit>
    </div>
  );
};
// ---------- маленькая плашка про цену: белый текст на красном ----------
const PricePill: React.FC<{ from: number; to: number; text: string; x: number; y: number; rotate?: number }> = ({ from, to, text, x, y, rotate = 0 }) => {
  const f = useCurrentFrame();
  const { pout, visible } = useLife(from, to, 0.2, 0.15);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 11, stiffness: 220, mass: 0.5 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, p * 2) * (1 - pout),
      transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${p})` }}>
      <span style={{ display: "inline-block", whiteSpace: "nowrap", fontFamily: "Head", fontWeight: 700, fontSize: 92, color: "#fff", WebkitTextStroke: "2px #fff",
        background: "linear-gradient(135deg, rgba(220,25,35,0.92), rgba(120,6,14,0.92))", padding: "12px 34px 4px", borderRadius: 999, backdropFilter: "blur(10px)",
        boxShadow: "0 0 0 2px rgba(255,170,170,0.95), 0 0 24px rgba(255,40,50,0.8), 0 14px 30px rgba(0,0,0,0.45)" }}>{text}</span>
    </div>
  );
};

// ---------- скидка: красный ценник (A) или круглый стикер (B), без неона и без тёмного пятна ----------
let DISC: string = "E";
export const setDisc = (d: string) => { DISC = d; };
const Fire: React.FC<{ from: number; to: number; text: string; y?: number; size?: number }> = ({ from, to, text, y = 1120 }) => {
  const f = useCurrentFrame();
  const { pout, visible } = useLife(from, to, 0.2, 0.18);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 12, stiffness: 210, mass: 0.6 } });
  const wrap: React.CSSProperties = { position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center",
    opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${pout * 10}px)` };
  if (DISC === "E" || DISC === "F") {
    // E: тёмно-красная цифра + светлое мягкое свечение; F: светлая (красно-розовая) цифра + тёмно-красная мягкая тень
    const E = DISC === "E";
    const grad = E ? "linear-gradient(180deg, #E8333C 0%, #C4121B 50%, #8E0A10 100%)" : "linear-gradient(180deg, #FFE3E3 0%, #FF8A8F 35%, #FF4048 75%, #F0222B 100%)";
    const sh = E ? "drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 18px rgba(255,220,225,0.85)) drop-shadow(0 0 40px rgba(255,190,200,0.5))"
                 : "drop-shadow(0 0 2px rgba(255,255,255,0.9)) drop-shadow(0 3px 4px rgba(120,0,10,0.55)) drop-shadow(0 0 22px rgba(200,10,25,0.55))";
    return (
      <div style={wrap}>
        <span style={{ display: "inline-block", transform: `translateY(-50%) scale(${interpolate(p, [0, 1], [1.5, 1])})`, fontFamily: "Head", fontWeight: 700,
          fontSize: 380, lineHeight: 0.9, padding: "10px 20px 0", ...gradText(grad), filter: sh }}>{text}</span>
      </div>
    );
  }
  if (DISC === "D") return (
    <div style={wrap}>
      <div style={{ transform: `translateY(-50%) scale(${interpolate(p, [0, 1], [0.85, 1])})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontFamily: "Head", fontWeight: 700, fontSize: 300, lineHeight: 1, color: "#fff", WebkitTextStroke: "2px #fff",
          textShadow: "0 2px 4px rgba(15,30,80,0.45), 0 6px 18px rgba(15,30,80,0.45), 0 14px 50px rgba(15,30,80,0.35)" }}>{text}</span>
        <div style={{ width: 220 * Math.min(1, p), height: 12, borderRadius: 6, background: "#E3202A", marginTop: 6, boxShadow: "0 4px 12px rgba(15,30,80,0.25)" }} />
      </div>
    </div>
  );
  if (DISC === "C") return (
    <div style={wrap}>
      <span style={{ display: "inline-block", transform: `translateY(-50%) rotate(${-3 * p}deg) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
        fontFamily: "Head", fontWeight: 700, fontSize: 340, lineHeight: 1, color: "#E3202A",
        textShadow: "8.0px 0.0px 0 #fff, 7.7px 2.1px 0 #fff, 6.9px 4.0px 0 #fff, 5.7px 5.7px 0 #fff, 4.0px 6.9px 0 #fff, 2.1px 7.7px 0 #fff, 0.0px 8.0px 0 #fff, -2.1px 7.7px 0 #fff, -4.0px 6.9px 0 #fff, -5.7px 5.7px 0 #fff, -6.9px 4.0px 0 #fff, -7.7px 2.1px 0 #fff, -8.0px 0.0px 0 #fff, -7.7px -2.1px 0 #fff, -6.9px -4.0px 0 #fff, -5.7px -5.7px 0 #fff, -4.0px -6.9px 0 #fff, -2.1px -7.7px 0 #fff, -0.0px -8.0px 0 #fff, 2.1px -7.7px 0 #fff, 4.0px -6.9px 0 #fff, 5.7px -5.7px 0 #fff, 6.9px -4.0px 0 #fff, 7.7px -2.1px 0 #fff, 19.0px 13.0px 0 #13307A, 18.4px 16.1px 0 #13307A, 16.7px 18.7px 0 #13307A, 14.1px 20.4px 0 #13307A, 11.0px 21.0px 0 #13307A, 7.9px 20.4px 0 #13307A, 5.3px 18.7px 0 #13307A, 3.6px 16.1px 0 #13307A, 3.0px 13.0px 0 #13307A, 3.6px 9.9px 0 #13307A, 5.3px 7.3px 0 #13307A, 7.9px 5.6px 0 #13307A, 11.0px 5.0px 0 #13307A, 14.1px 5.6px 0 #13307A, 16.7px 7.3px 0 #13307A, 18.4px 9.9px 0 #13307A, 0 18px 30px rgba(10,20,60,0.25)" }}>{text}</span>
    </div>
  );
  if (DISC === "A") return (
    <div style={wrap}>
      <div style={{ transform: `translateY(-50%) rotate(${-4 * p}deg) scale(${interpolate(p, [0, 1], [0.6, 1])})`, background: "linear-gradient(160deg, #F0333B, #D3141C)",
        borderRadius: 34, border: "6px solid #fff", padding: "18px 56px 0", boxShadow: "0 18px 36px rgba(120,10,20,0.28)" }}>
        <span style={{ fontFamily: "Head", fontWeight: 700, fontSize: 270, lineHeight: 1, color: "#fff", WebkitTextStroke: "3px #fff", display: "block" }}>{text}</span>
      </div>
    </div>
  );
  return (
    <div style={wrap}>
      <div style={{ width: 470, height: 470, borderRadius: "50%", background: "linear-gradient(160deg, #F0333B, #D3141C)", boxShadow: "0 18px 36px rgba(120,10,20,0.28)",
        transform: `translateY(-50%) rotate(${-8 * p}deg) scale(${interpolate(p, [0, 1], [0.5, 1])})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        outline: "6px solid #fff", outlineOffset: -24 }}>
        <span style={{ fontFamily: "Mont", fontWeight: 700, fontSize: 40, color: "#fff", letterSpacing: "0.12em", marginBottom: -6 }}>СКИДКА</span>
        <span style={{ fontFamily: "Head", fontWeight: 700, fontSize: 210, lineHeight: 1, color: "#fff", WebkitTextStroke: "2px #fff" }}>{text}</span>
      </div>
    </div>
  );
};

// ---------- затемнение сверху и снизу, чтобы текст читался на светлом магазине ----------
const Veil: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const { pin, pout, visible } = useLife(from, to, 0.25, 0.25);
  if (!visible) return null;
  return <AbsoluteFill style={{ opacity: pin * (1 - pout),
    background: "linear-gradient(180deg, rgba(4,10,32,0.1) 0%, rgba(4,10,32,0) 25%, rgba(4,10,32,0) 75%, rgba(4,10,32,0.08) 100%)" }} />;
};

const TopVeil: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const { pin, pout, visible } = useLife(from, to, 0.25, 0.25);
  if (!visible) return null;
  return <AbsoluteFill style={{ opacity: pin * (1 - pout),
    background: "linear-gradient(180deg, rgba(4,10,32,0.14) 0%, rgba(4,10,32,0.05) 20%, rgba(4,10,32,0) 36%, rgba(4,10,32,0) 80%, rgba(4,10,32,0.06) 100%)" }} />;
};

const Seq: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => {
  const t = useCurrentFrame() / FPS;
  return t >= from ? <>{children}</> : null;
};

// ---------- «дорогой» вид: виньетка по краям и холодная глубина ----------
const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,6,22,0.18) 100%)", mixBlendMode: "multiply" }} />
);

// ---------- наложение 1: вы на фоне толпы — вырезаем вас, толпу растягиваем на весь кадр и затемняем ----------
const SeatFX: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < from || t >= to) return null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: "contrast(1.08) saturate(1.1)" }}><OffthreadVideo src={staticFile(SRC)} muted /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,16,40,0) 0%, rgba(8,16,40,0) 44%, rgba(30,60,150,0.45) 60%, rgba(24,50,130,0.6) 100%)" }} />
      <Img src={staticFile(`cut1/f${f}.webp`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 20%)" }} />
    </AbsoluteFill>
  );
};

// ---------- наложение 2: двери — две картинки в рамках поверх размытого фона вместо красной сетки ----------
const Panel: React.FC<{ x: number; y: number; w: number; h: number; t0: number; rot: number; fromX: number }> = ({ x, y, w, h, t0, rot, fromX }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - s(t0), fps: FPS, config: { damping: 15, stiffness: 160, mass: 0.7 } });
  return (
    <div style={{ position: "absolute", left: x + (1 - p) * fromX, top: y, width: w, height: h, overflow: "hidden", borderRadius: 30,
      border: "3px solid rgba(160,200,255,0.95)", boxShadow: "0 0 26px rgba(60,130,255,0.8), 0 30px 70px rgba(0,0,0,0.6)",
      transform: `rotate(${rot * p}deg) scale(${0.92 + 0.08 * p})`, opacity: Math.min(1, p * 1.6) }}>
      <div style={{ position: "absolute", left: -x, top: -y, width: 1080, height: 1920 }}><OffthreadVideo src={staticFile(SRC)} muted /></div>
    </div>
  );
};
const DoorsFX: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const t = useCurrentFrame() / FPS;
  if (t < from || t >= to) return null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: "scale(2.1)", transformOrigin: "268px 840px", filter: "blur(22px) brightness(0.8) saturate(1.15)" }}>
        <OffthreadVideo src={staticFile(SRC)} muted />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(80% 50% at 50% 50%, rgba(40,90,255,0.12), rgba(2,6,20,0.15) 80%)" }} />
      <Panel x={6} y={364} w={530} h={950} t0={from} rot={-3} fromX={-500} />
      <Panel x={548} y={690} w={526} h={946} t0={from + 0.08} rot={3} fromX={500} />
    </AbsoluteFill>
  );
};

// ---------- слова и время (из распознавания). Блок с товарами 19.7–36.3 без субтитров: там ценники ----------
const W: [string, number][] = [ // субтитры только там, где сверху нет заголовка (слова не дублируются)
  ["|Сначала", 11.68], ["*поднимают", 12.06], ["цены,", 12.66], ["|а", 13.0], ["потом", 13.18], ["*скидывают", 13.34], ["их", 13.82], ["обратно.", 14.0], ["|", 14.42],
];

const SFX: [number, string, number, number?][] = [ // перечисление — один звук, скидки — один звук, −60% — касса; начало тише
  [10.71, "sparkle", 0.248, 1.34],
  [12.03, "popclick", 0.127, 1.03],
  [12.88, "sword3", 0.174, 1.28],
  [13.88, "fast", 0.275, 1.20],
  [14.62, "jug1", 0.117, 0.62],
  [15.31, "uipop", 0.335, 1.36],
  [16.52, "success", 0.327, 1.59],
  [17.49, "glassy", 0.684, 0.18],
  [19.29, "bubbly", 0.603, 0.20],
  [20.24, "bubbly", 0.603, 0.20],
  [20.86, "bubbly", 0.603, 0.20],
  [21.75, "ding", 0.327, 1.03],
  [22.86, "bubbly", 0.603, 0.20],
  [23.91, "bubbly", 0.603, 0.20],
  [24.69, "ding", 0.327, 1.03],
  [25.91, "bubbly", 0.603, 0.20],
  [26.74, "bubbly", 0.603, 0.20],
  [27.51, "bubbly", 0.603, 0.20],
  [28.71, "bubbly", 0.603, 0.20],
  [29.99, "bubbly", 0.603, 0.20],
  [30.91, "ding", 0.327, 1.03],
  [32.33, "bubbly", 0.603, 0.20],
  [33.01, "ding", 0.327, 1.03],
  [34.03, "bubbly", 0.603, 0.20],
  [34.02, "cash", 0.638, 2.60],
  [35.11, "vzh3", 0.162, 2.55],
  [36.35, "pop4", 0.114, 0.55],
  [37.78, "tings", 1.000, 1.17],
  [38.94, "jug1", 0.117, 0.62],
  [41.13, "buy", 0.813, 1.56],
];

const cfg: ReelCfg = {
  src: SRC, words: W, speechEnd: 42.5, subTop: 1330, zoomOrigin: "540px 900px",
  punch: [0.2, 4.7, 9.8, 12.6, 16.6, 36.4, 39.0],
};

export const Evrostroy: React.FC = () => (
  <ReelBase cfg={cfg}>
    <SeatFX from={9.78} to={14.43} />
    <DoorsFX from={22.9} to={23.95} />
    <Veil from={19.33} to={36.38} />
    <TopVeil from={14.43} to={19.33} />
    <TopVeil from={36.36} to={42.6} />
    {/* вы в кресле */}
    <BTitle from={9.9} to={11.6} text="Как делают" />
    <BLine from={10.88} to={11.6} text="|чёрную пятницу?" />
    {/* проход по магазину */}
    <Flash at={14.43} dur={0.25} />
    <BTitle from={14.66} to={16.55} text="В Еврострое" />
    <BLine from={15.38} to={16.55} text="цены |не поднимали" />
    <BTitle from={16.64} to={19.3} text="Скидки реальные" red />
    <BLine from={17.52} to={19.3} text="таких ещё |не было" />
    {/* товары и скидки */}
    <Tag from={19.33} to={20.26} text="Ламинат" />
    <Tag from={20.28} to={20.88} text="Линолеум" rotate={3} />
    <Tag from={20.90} to={22.88} text="Обои" />
    <Fire from={21.78} to={22.88} text="−20%" />
    <Tag from={22.90} to={23.93} text="Двери" rotate={3} />
    <Tag from={23.95} to={25.93} text="Керамогранит" />
    <Fire from={24.72} to={25.93} text="−22%" />
    <Tag from={25.95} to={26.76} text="Мебель" rotate={3} />
    <Tag from={26.78} to={27.53} text="Сантехника" />
    <Tag from={27.55} to={28.73} text="Бытовая техника" rotate={3} />
    <Tag from={28.75} to={30.01} text="Бамбуковые панели" />
    <Tag from={30.03} to={32.35} text="Гибкий мрамор" rotate={3} />
    <Fire from={30.94} to={32.35} text="−25%" />
    <Tag from={32.37} to={34.05} text="Люстры" />
    <Fire from={33.04} to={34.05} text="−50%" />
    <Tag from={34.07} to={36.33} text="Ковры" rotate={3} />
    <Fire from={35.02} to={36.33} text="−60%" />
    {/* финал */}
    <Flash at={36.36} dur={0.3} color="#3C7BFF" />
    <BTitle from={36.38} to={37.78} text="Только одна ночь" />
    <BTitle from={37.82} to={38.95} text="27 ноября" />
    <BTitle from={38.98} to={41.3} text="17:00 — 22:00" />
    <BTitle from={41.38} to={42.55} text="Успейте!" red />
    {SFX.map(([at, name, vol, dur = 1.2], i) => (
      <Sequence key={i} from={Math.max(0, s(at))} durationInFrames={s(dur)}><Audio src={staticFile(`sfx2/${name}.mp3`)} volume={vol} /></Sequence>
    ))}
  </ReelBase>
);
