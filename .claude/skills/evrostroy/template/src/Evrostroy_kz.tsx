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
  ({ from, to, text, y = 1180, size = 80, rotate = -2 }) => {
    const f = useCurrentFrame();
    const { pout, visible } = useLife(from, to, 0.2, 0.15);
    if (!visible) return null;
    const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 13, stiffness: 260, mass: 0.5 } });
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${pout * 10}px)`,
        transform: `translateY(-50%) scale(${(0.7 + 0.3 * p) * (1 - pout * 0.1)}) rotate(${rotate}deg)` }}>
        <Fit maxW={860}><span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, textTransform: "uppercase", fontSize: size, color: "#fff", lineHeight: 1,
          padding: "18px 44px 10px", borderRadius: 26, background: GLASS, border: "none", letterSpacing: 2, WebkitTextStroke: "2px #fff", backdropFilter: "blur(14px)",
          boxShadow: BLUE_GLOW, textShadow: "0 0 18px rgba(120,170,255,0.8)", position: "relative", overflow: "hidden" }}>{text}
          <span style={{ position: "absolute", top: -20, bottom: -20, width: 90, left: `${interpolate(f / FPS, [from + 0.15, from + 0.85], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} /></span></Fit>
      </div>
    );
  };


// ---------- заголовок: жирный узкий капс, тёмно-синий на белой плашке (или белый на красной) ----------
const BTitle: React.FC<{ from: number; to: number; text: string; top?: number; size?: number; red?: boolean }> = ({ from, to, text, top = 410, size = 104, red = false }) => {
  const f = useCurrentFrame();
  const { pout, visible } = useLife(from, to, 0.25, 0.18);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 14, stiffness: 240, mass: 0.55 } });
  const bg = red ? "linear-gradient(135deg, rgba(200,20,30,0.9), rgba(110,6,14,0.9))" : GLASS;
  const glow = red ? "0 0 0 2px rgba(255,170,170,0.95), 0 0 24px rgba(255,40,50,0.8), 0 0 60px rgba(255,30,40,0.4), 0 18px 40px rgba(0,0,0,0.5)" : BLUE_GLOW;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${(1 - Math.min(1, p)) * 10 + pout * 12}px)`,
      transform: `scale(${(0.85 + 0.15 * p) * (1 + pout * 0.06)})` }}>
      <Fit maxW={860}><span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, textTransform: "uppercase", fontSize: size, lineHeight: 1, color: "#fff",
        WebkitTextStroke: "2.5px #fff", background: bg, padding: "16px 40px 6px", borderRadius: 24, letterSpacing: 1, backdropFilter: "blur(14px)",
        boxShadow: glow, textShadow: red ? "0 0 20px rgba(255,120,120,0.7)" : "0 0 20px rgba(140,185,255,0.9)" }}>{text}</span></Fit>
    </div>
  );
};
// ---------- вторая строка: жирный Montserrat, белый на тёмно-синей (или красной) плашке ----------
const BLine: React.FC<{ from: number; to: number; text: string; top?: number; size?: number; red?: boolean; rotate?: number }> = ({ from, to, text, top = 585, size = 72, red = false, rotate = 0 }) => {
  const f = useCurrentFrame();
  const { pout, visible } = useLife(from, to, 0.25, 0.18);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 13, stiffness: 260, mass: 0.5 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${pout * 10}px)`,
      transform: `translateY(${(1 - p) * 20}px) rotate(${rotate}deg)` }}>
      <Fit maxW={860}><span style={{ display: "inline-block", fontFamily: "Mont", fontWeight: 700, fontSize: size, color: "#fff", lineHeight: 1.15, padding: "4px 10px",
        textShadow: "0 2px 6px rgba(10,20,60,0.55), 0 6px 20px rgba(10,20,60,0.4)" }}>
        {text.split("|").map((part, i) => i % 2 === 0 ? <span key={i}>{part}</span> :
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


// ---------- цена «было»: белая, зачёркнута красной линией ----------
const OldPrice: React.FC<{ from: number; to: number; text: string; strike?: boolean; y?: number; pct?: number; pctAt?: number }> = ({ from, to, text, strike = true, y = 1270, pct, pctAt }) => {
  const f = useCurrentFrame(), t = f / FPS;
  const { pin, pout, visible } = useLife(from, to, 0.25, 0.18);
  if (!visible) return null;
  const k = interpolate(t, [from + 0.25, from + 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const q = pct && pctAt !== undefined ? spring({ frame: f - s(pctAt), fps: FPS, config: { damping: 10, stiffness: 240, mass: 0.5 } }) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: pin * (1 - pout),
      transform: `translateY(-50%) translateY(${(1 - pin) * 20}px)` }}>
      <span style={{ position: "relative", fontFamily: "Mont", fontWeight: 700, fontSize: 58, color: "#fff", whiteSpace: "nowrap", textShadow: "0 2px 6px rgba(10,20,60,0.55), 0 6px 20px rgba(10,20,60,0.4)" }}>
        {text}
        {strike && <span style={{ position: "absolute", left: -8, top: "54%", height: 4, borderRadius: 2, width: `calc(${k * 100}% + 16px)`, background: "#E8333C", opacity: 0.9, transform: "rotate(-4deg)" }} />}
      </span>
      {pct ? <span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, fontSize: 56, color: "#fff", lineHeight: 1, padding: "8px 18px 6px", borderRadius: 999,
        background: "radial-gradient(circle at 35% 30%, #F23A43, #B80F17 75%)", transform: `scale(${q}) rotate(${(1 - q) * 30 - 6}deg)`,
        boxShadow: "0 0 0 3px rgba(255,255,255,0.95), 0 0 18px rgba(255,60,70,0.7)" }}>−{pct}%</span> : null}
    </div>
  );
};
// ---------- бейдж скидки: красный неоновый кружок с процентом ----------
const Badge: React.FC<{ at: number; to: number; pct: number }> = ({ at, to, pct }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < at) return null;
  const p = spring({ frame: f - s(at), fps: FPS, config: { damping: 9, stiffness: 220, mass: 0.5 } });
  const q = interpolate(t, [to - 0.18, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", right: 104, top: 0, width: 144, height: 144, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 35% 30%, #F23A43, #B80F17 70%)", transform: `scale(${p}) rotate(${(1 - p) * 40 - 12}deg)`, opacity: q,
      boxShadow: "0 0 0 3px rgba(255,255,255,0.95), 0 0 22px rgba(255,60,70,0.75), 0 10px 24px rgba(60,0,10,0.3)" }}>
      <span style={{ fontFamily: "Head", fontWeight: 700, fontSize: 50, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>−{pct}%</span>
    </div>
  );
};
// ---------- цена «стало»: крупно, тёмно-красная со светлой каймой (как скидки) ----------
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const NewPrice: React.FC<{ from: number; to: number; text: string; y?: number; old?: number; pct?: number }> = ({ from, to, text, y = 1430, old, pct }) => {
  const f = useCurrentFrame();
  const tt = f / FPS;
  const target = Number(text.replace(/[^0-9]/g, ""));
  const cp = Math.min(1, Math.max(0, (tt - from) / 0.7));
  const shown = old && cp < 1 ? text.replace(/[0-9][0-9 ]*[0-9]/, fmt(old + (target - old) * Easing.out(Easing.cubic)(cp))) : text;
  const { pout, visible } = useLife(from, to, 0.2, 0.18);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 12, stiffness: 210, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity: Math.min(1, p * 2) * (1 - pout), filter: `blur(${pout * 10}px)` }}>
      <Fit maxW={860}><span style={{ display: "inline-block", transform: `translateY(-50%) scale(${interpolate(p, [0, 1], [1.4, 1])})`, fontFamily: "Head", fontWeight: 700,
        fontSize: 170, lineHeight: 1, padding: "8px 16px 0", ...gradText("linear-gradient(180deg, #E8333C 0%, #C4121B 50%, #8E0A10 100%)"),
        filter: "drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 18px rgba(255,220,225,0.85)) drop-shadow(0 0 40px rgba(255,190,200,0.5))" }}>{shown}</span></Fit>
      {pct ? <Badge at={from + 0.75} to={to} pct={pct} /> : null}
    </div>
  );
};

// ---------- «дорогая» камера: плавный наезд/отъезд на каждом кадре, смена крупности на склейках, акцент на новой цене ----------
const SHOTS = [0.0, 7.89, 14.05, 19.09, 23.66, 30.36, 41.86, 49.03, 54.39, 60.29, 65.96, 75.38];
const JUMPS = [23.64]; const JUMPS_OLD = [6.57, 11.15, 27.17, 28.64, 33.54, 38.47, 45.57, 52.49, 69.95, 71.49];
const PUNCH = [12.32, 17.26, 21.5, 28.49, 34.51, 39.47, 47.07, 52.29, 58.11, 64.31, 69.13];
const camZ = (t: number) => {
  let k = 0; while (k < SHOTS.length - 2 && t >= SHOTS[k + 1]) k++;
  const a = SHOTS[k], b = SHOTS[k + 1], p = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, (t - a) / (b - a))));
  const last = k === SHOTS.length - 2;
  let z = last ? 1 + 0.035 * p : (k % 2 === 0 ? 1 + 0.06 * p : 1.06 - 0.06 * p);
  const j = JUMPS.filter((x) => x > a && x <= t).length;
  if (j % 2 === 1) z *= 1.07;
  for (const at of PUNCH) {
    if (t < at || t > at + 1.3) continue;
    const q = t < at + 0.3 ? Easing.out(Easing.cubic)((t - at) / 0.3) : 1 - Easing.inOut(Easing.cubic)((t - at - 0.3) / 1.0);
    z *= 1 + 0.035 * q;
  }
  return z;
};
// отъезд камеры назад на крупных планах, чтобы над головой поместилась цена: [начало, конец, масштаб]
const PULL: [number, number, number][] = [];
const pullK = (t: number) => {
  for (const [a, b, k] of PULL) {
    if (t < a || t > b) continue;
    const i = Easing.inOut(Easing.cubic)(Math.min(1, (t - a) / 0.45));
    const o = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - (b - 0.35)) / 0.35)));
    return 1 - (1 - k) * i * (1 - o);
  }
  return 1;
};
const CamFX: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const z = camZ(t), k = pullK(t);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {k < 1 && <AbsoluteFill style={{ transform: "scale(1.25)", filter: "blur(28px) brightness(0.9)" }}><OffthreadVideo src={staticFile(SRC)} muted /></AbsoluteFill>}
      <AbsoluteFill style={{ transform: `scale(${(z * k).toFixed(4)})`, transformOrigin: k < 1 ? "540px 1920px" : "540px 900px",
        boxShadow: k < 1 ? "0 0 60px rgba(0,0,0,0.35)" : "none" }}><OffthreadVideo src={staticFile(SRC)} muted /></AbsoluteFill>
    </AbsoluteFill>
  );
};
// ведущий, вырезанный из кадра, — поверх огромной цены (эффект «цифры за человеком»)
const CUTW: [number, number][] = [[12.24,14.19],[17.19,19.12],[21.44,23.72],[47.02,49.14],[52.24,54.52],[58.07,60.47],[64.27,65.62]];
const CutLayer: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  if (!CUTW.some(([a, b]) => t >= a + 0.02 && t <= b - 0.02)) return null;
  return (
    <AbsoluteFill style={{ transform: `scale(${camZ(t).toFixed(4)})`, transformOrigin: "540px 900px" }}>
      <Img src={staticFile(`cut2/f${f}.webp`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
};
// огромная новая цена позади ведущего: прокрутка от старой цены, тёмно-красная со светлой каймой
const BigPrice: React.FC<{ from: number; to: number; text: string; old?: number; suffix?: string; y?: number }> = ({ from, to, text, suffix, y = 420 }) => {
  const f = useCurrentFrame(), t = f / FPS;
  const { pout, visible } = useLife(from, to, 0.05, 0.22);
  if (!visible) return null;
  const num = text.replace(/\s*₸.*/, "");
  const word = suffix ? "ТЕҢГЕДЕН" : "ТЕҢГЕ";
  const drop = (delay: number) => {           // падение сверху вниз с пружинкой и размытием движения
    const p = spring({ frame: f - s(from + delay), fps: FPS, config: { damping: 15, stiffness: 190, mass: 0.8 } });
    const v = Math.abs(1 - p);
    return { transform: `translateY(${(p - 1) * 520}px) scaleY(${1 + v * 0.25})`, filter: `blur(${v * 18}px)`, opacity: Math.min(1, p * 1.6) };
  };
  const out = { opacity: 1 - pout, filter: `blur(${pout * 12}px)` };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, ...out }}>
      <div style={drop(0)}><Fit maxW={880}><span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, fontSize: 330, lineHeight: 0.86, padding: "6px 10px 0",
        whiteSpace: "nowrap", letterSpacing: -4, ...gradText("linear-gradient(180deg, #E8333C 0%, #C4121B 50%, #8E0A10 100%)"),
        filter: "drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 18px rgba(255,220,225,0.8)) drop-shadow(0 10px 24px rgba(40,0,10,0.25))" }}>{num}</span></Fit></div>
      <div style={{ ...drop(0.12), marginTop: -6 }}><Fit maxW={880}><span style={{ display: "inline-block", fontFamily: "Head", fontWeight: 700, fontSize: 250, lineHeight: 0.86,
        color: "#fff", whiteSpace: "nowrap", letterSpacing: 2, WebkitTextStroke: "3px #fff",
        textShadow: "0 0 0 #0E1E4A, 0 4px 0 #0E1E4A, 0 0 14px rgba(14,30,74,0.7), 0 10px 30px rgba(14,30,74,0.45)" }}>{word}</span></Fit></div>
    </div>
  );
};

// ---------- ОБЪЁМНАЯ 3D-ЦЕНА: одна для всех товаров, одно место, один размер; влетает сверху вниз ----------
const Price3D: React.FC<{ from: number; to: number; text: string; old?: number; suffix?: string }> = ({ from, to, text, old }) => {
  const f = useCurrentFrame(), t = f / FPS;
  const { pout, visible } = useLife(from, to, 0.05, 0.2);
  if (!visible) return null;
  const p = spring({ frame: f - s(from), fps: FPS, config: { damping: 14, stiffness: 200, mass: 0.7 } });
  const v = Math.abs(1 - p);
  const target = Number(text.replace(/[^0-9]/g, ""));
  const cp = Math.min(1, Math.max(0, (t - from) / 0.6));
  const shown = old && cp < 1 ? fmt(old + (target - old) * Easing.out(Easing.cubic)(cp)) + " ₸" : text;
  const base: React.CSSProperties = { fontFamily: "Head", fontWeight: 700, fontSize: 180, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: 2 };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1405, opacity: Math.min(1, p * 1.6) * (1 - pout),
      filter: `blur(${v * 14 + pout * 10}px)`, transform: `translateY(-50%) translateY(${(p - 1) * 420}px) scaleY(${1 + v * 0.2})` }}>
      <div style={{ display: "flex", justifyContent: "center", transform: "perspective(900px) rotateX(14deg)" }}>
        <div style={{ position: "relative" }}>
          {/* объём: белая кайма + толщина из слоёв от красного к тёмному + мягкая тень */}
          <span style={{ ...base, color: "#C3141C", textShadow: "3.0px 0.0px 0 #fff, 2.8px 1.1px 0 #fff, 2.1px 2.1px 0 #fff, 1.1px 2.8px 0 #fff, 0.0px 3.0px 0 #fff, -1.1px 2.8px 0 #fff, -2.1px 2.1px 0 #fff, -2.8px 1.1px 0 #fff, -3.0px 0.0px 0 #fff, -2.8px -1.1px 0 #fff, -2.1px -2.1px 0 #fff, -1.1px -2.8px 0 #fff, -0.0px -3.0px 0 #fff, 1.1px -2.8px 0 #fff, 2.1px -2.1px 0 #fff, 2.8px -1.1px 0 #fff, 0.5px 1px 0 #C3141C, 1.0px 2px 0 #B5121A, 1.5px 3px 0 #A71018, 2.0px 4px 0 #990E16, 2.5px 5px 0 #8B0C13, 3.0px 6px 0 #7D0A11, 3.5px 7px 0 #70090F, 4.0px 8px 0 #63080D, 4.5px 9px 0 #57070B, 5.0px 10px 0 #4C060A, 5.5px 11px 0 #420509, 6.0px 12px 0 #390408, 6.5px 13px 0 #300407, 7.0px 14px 0 #280306, 7.5px 15px 0 #280306, 8.0px 16px 0 #280306, 8.5px 17px 0 #280306, 9.0px 18px 0 #280306, 0 30px 34px rgba(40,0,10,0.35)" }}>{shown}</span>
          {/* лицевая сторона с бликом сверху */}
          <span style={{ ...base, position: "absolute", left: 0, top: 0, ...gradText("linear-gradient(180deg, #FF8A8F 0%, #FF3B44 30%, #E3202A 55%, #B5121A 100%)") }}>{shown}</span>
        </div>
      </div>
    </div>
  );
};
const BadgeBR: React.FC<{ at: number; to: number; pct: number }> = ({ at, to, pct }) => (
  <div style={{ position: "absolute", left: 0, top: 1412, width: 1080, height: 0 }}><Badge at={at} to={to} pct={pct} /></div>
);

const BadgeAbs: React.FC<{ at: number; to: number; pct: number; y?: number; leftSide?: boolean }> = ({ at, to, pct, y = 1335, leftSide = false }) => (
  <div style={{ position: "absolute", left: leftSide ? -690 : 0, top: y, width: 1080, height: 0 }}><Badge at={at} to={to} pct={pct} /></div>
);

// ---------- бегущая неоновая лента сверху — только на общих планах, где над головой много места ----------
const TICK: [number, number][] = [[7.89, 14.03], [14.05, 19.07], [19.09, 23.64], [41.86, 49.01], [49.03, 54.37], [54.39, 60.27]];
const Ticker: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const w = TICK.find(([a, b]) => t >= a && t < b);
  if (!w) return null;
  const [a, b] = w;
  const k = Math.min(1, (t - a) / 0.35) * Math.min(1, (b - t) / 0.3);
  const item = "ҚАРА ЖҰМА  •  27 ҚАРАША  •  17:00 – 22:00  •  ЕВРОСТРОЙ  •  ";
  const x = -((t * 140) % 1600);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 408, height: 76, overflow: "hidden", opacity: k,
      transform: `translateY(${(1 - k) * -20}px)`, background: "linear-gradient(90deg, rgba(10,22,60,0.0), rgba(14,32,90,0.78) 12%, rgba(14,32,90,0.78) 88%, rgba(10,22,60,0.0))",
      borderTop: "2px solid rgba(140,185,255,0.9)", borderBottom: "2px solid rgba(140,185,255,0.9)", boxShadow: "0 0 18px rgba(60,130,255,0.6)" }}>
      <div style={{ position: "absolute", left: x, top: 4, whiteSpace: "nowrap", fontFamily: "Head", fontWeight: 700, fontSize: 44, lineHeight: 1.3, letterSpacing: 3, color: "#fff",
        textShadow: "0 0 12px rgba(140,185,255,0.8)" }}>
        {[0, 1, 2, 3].map((i) => <span key={i}>{item.split("•").map((p, j, arr) => <React.Fragment key={j}>{p}{j < arr.length - 1 ? <span style={{ color: "#FF3B44" }}>•</span> : null}</React.Fragment>)}</span>)}
      </div>
    </div>
  );
};

const W: [string, number][] = [ // субтитры только там, где сверху нет заголовка
  ["|Әдетте", 65.63], ["*Еврострой", 66.15], ["|кешкі", 66.55], ["*18:30-ға", 66.85], ["дейін", 67.35], ["|жұмыс", 67.51], ["істесе,", 67.74], ["|", 67.97],
];
const SFX: [number, string, number, number?][] = [
  [28.32, "wshort", 0.122, 0.69],
  [34.34, "wshort", 0.122, 0.69],
  [39.30, "wshort", 0.122, 0.69],
  [12.15, "wshort", 0.122, 0.69],
  [17.09, "wshort", 0.122, 0.69],
  [21.33, "wshort", 0.122, 0.69],
  [46.90, "wshort", 0.122, 0.69],
  [52.12, "wshort", 0.122, 0.69],
  [57.94, "wshort", 0.122, 0.69],
  [64.14, "wshort", 0.122, 0.69],
  [0.55, "pop4", 0.114, 0.55],
  [2.80, "success", 0.327, 1.59],
  [4.11, "uipop", 0.335, 1.36],
  [7.36, "fast", 0.275, 1.20],
  [7.85, "bubbly", 0.603, 0.20],
  [8.91, "glassy", 0.684, 0.18],
  [12.29, "ding", 0.327, 1.03],
  [13.82, "bubbly", 0.603, 0.20],
  [14.16, "glassy", 0.684, 0.18],
  [17.23, "ding", 0.327, 1.03],
  [19.05, "bubbly", 0.603, 0.20],
  [19.21, "glassy", 0.684, 0.18],
  [21.47, "ding", 0.327, 1.03],
  [23.62, "bubbly", 0.603, 0.20],
  [26.20, "glassy", 0.684, 0.18],
  [28.46, "ding", 0.327, 1.03],
  [29.93, "bubbly", 0.603, 0.20],
  [32.30, "glassy", 0.684, 0.18],
  [34.48, "ding", 0.327, 1.03],
  [35.45, "bubbly", 0.603, 0.20],
  [37.24, "glassy", 0.684, 0.18],
  [39.44, "ding", 0.327, 1.03],
  [41.82, "bubbly", 0.603, 0.20],
  [44.48, "glassy", 0.684, 0.18],
  [47.04, "ding", 0.327, 1.03],
  [48.99, "bubbly", 0.603, 0.20],
  [50.48, "glassy", 0.684, 0.18],
  [52.26, "ding", 0.327, 1.03],
  [54.35, "bubbly", 0.603, 0.20],
  [55.80, "glassy", 0.684, 0.18],
  [58.07, "tings", 1.000, 1.17],
  [60.25, "bubbly", 0.603, 0.20],
  [62.22, "glassy", 0.684, 0.18],
  [64.28, "ding", 0.327, 1.03],
  [67.95, "jug1", 0.117, 0.62],
  [69.82, "popclick", 0.127, 1.03],
  [71.29, "success", 0.327, 1.59],
  [72.86, "buy", 0.813, 1.56]
];
const cfg: ReelCfg = { src: SRC, words: W, speechEnd: 67.99, punch: [], zoomOrigin: "540px 900px" };

export const EvrostroyKz: React.FC = () => (
  <ReelBase cfg={cfg}>
    <CamFX />
    <TopVeil from={0.0} to={7.89} />
    <Veil from={7.89} to={65.84} />
    <TopVeil from={65.84} to={75.11} />
    {/* начало: у логотипа */}
    <BTitle from={0.0} to={2.88} text="Ақтөбе" red />
    <BLine from={0.58} to={1.60} text="жұма, |27 қараша" />
    <BLine from={1.64} to={2.88} text="|Еврострой| құрылыс маркеті" />
    <BTitle from={2.92} to={7.87} text="Жұма жеңілдіктері" red />
    <BLine from={4.18} to={7.87} text="кешкі |17:00 – 22:00" />
    <Tag from={7.89} to={14.03} text="Есіктер" />
    <OldPrice from={8.94} to={14.03} text="22 750 ₸" strike={true} pct={22} pctAt={9.54} />
    <Price3D from={12.32} to={14.03} text="17 745 ₸" old={22750} />
    <Tag from={14.05} to={19.07} text="Темір есіктер" />
    <OldPrice from={14.08} to={19.07} text="43 000 – 45 000 ₸" strike={true} pct={22} pctAt={14.68} />
    <Price3D from={17.26} to={19.07} text="33 540 ₸" old={43000} />
    <Tag from={19.09} to={23.64} text="Ламинат" />
    <OldPrice from={19.24} to={23.64} text="80 түрлі" strike={false} />
    <Price3D from={21.5} to={23.64} text="3 120 ₸" />
    <Tag from={23.66} to={30.34} text="Линолеум" />
    <OldPrice from={26.23} to={30.34} text="1 690 ₸" strike={true} pct={22} pctAt={26.83} />
    <Price3D from={28.49} to={30.34} text="1 320 ₸" old={1690} />
    <Tag from={30.36} to={35.47} text="Қол жуғыштар" />
    <OldPrice from={32.33} to={35.47} text="14 000 ₸" strike={true} pct={25} pctAt={32.93} />
    <Price3D from={34.51} to={35.47} text="10 500 ₸" old={14000} />
    <Tag from={35.49} to={41.84} text="Унитаздар" />
    <OldPrice from={37.27} to={41.84} text="33 000 ₸" strike={true} pct={25} pctAt={37.87} />
    <Price3D from={39.47} to={41.84} text="24 750 ₸" old={33000} />
    <Tag from={41.86} to={49.01} text="Душ кабинасы 90×90" />
    <OldPrice from={44.51} to={49.01} text="80 500 ₸" strike={true} pct={25} pctAt={45.11} />
    <Price3D from={47.07} to={49.01} text="60 375 ₸" old={80500} />
    <Tag from={49.03} to={54.37} text="Жиһаздар" />
    <OldPrice from={50.51} to={54.37} text="83 000 ₸" strike={true} pct={25} pctAt={51.11} />
    <Price3D from={52.29} to={54.37} text="62 250 ₸" old={83000} />
    <Tag from={54.39} to={60.27} text="Кілемдер 3×4" />
    <OldPrice from={55.83} to={60.27} text="89 000 ₸" strike={true} pct={60} pctAt={56.43} />
    <Price3D from={58.11} to={60.27} text="35 600 ₸" old={89000} />
    <Tag from={60.29} to={65.57} text="Кір жуғыш машиналар" />
    <OldPrice from={62.25} to={65.57} text="120 000 ₸" strike={true} pct={25} pctAt={62.85} />
    <Price3D from={64.31} to={65.57} text="90 000 ₸" old={120000} />
    {/* финал в кресле */}
    <BTitle from={67.99} to={71.37} text="27 қараша" top={400} />
    <BLine from={69.85} to={71.37} text="кешкі |22:00-ге дейін" top={538} />
    <BTitle from={71.41} to={75.11} text="Арнайы жеңілдіктер" red top={400} />
    <BLine from={73.11} to={75.11} text="|17:00 – 22:00" top={538} />
    {SFX.map(([at, name, vol, dur = 1.2], i) => (
      <Sequence key={i} from={Math.max(0, s(at))} durationInFrames={s(dur)}><Audio src={staticFile(`sfx2/${name}.mp3`)} volume={vol} /></Sequence>
    ))}
  </ReelBase>
);
