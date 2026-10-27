import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

/* ---------- layer stack: mesh (bottom) → grade → grain → vignette (top) ---------- */
export const BgMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 50, d2 = Math.cos(frame / 70) * 40;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <div style={{ position: "absolute", width: 1400, height: 900, borderRadius: "50%", top: -600, left: 260 + d1, filter: "blur(60px)",
        background: `radial-gradient(ellipse, ${theme.colors.primary}2e, transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 700, borderRadius: "50%", bottom: -500, right: -300 - d2, filter: "blur(70px)",
        background: `radial-gradient(ellipse, ${theme.colors.primary}14, transparent 65%)` }} />
    </AbsoluteFill>
  );
};
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.primary, mixBlendMode: "soft-light", opacity: 0.14 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12), transparent 28%, transparent 72%, rgba(0,0,0,0.25))" }} />
  </AbsoluteFill>
);
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: noise, backgroundSize: "220px",
    backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`, opacity: 0.06, mixBlendMode: "overlay" }} />;
};
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.3) 100%)" }} />
);
export const Stack: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <BgMesh />
    <AbsoluteFill>{children}</AbsoluteFill>
    <Grade />
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

/* ---------- motion helpers ---------- */
export const useSpring = (delay = 0, config = theme.spring.smooth) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};
export const Entrance: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties; from?: number }> = ({ delay = 0, children, style, from = 40 }) => {
  const p = useSpring(delay);
  return <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [from, 0])}px) scale(${interpolate(p, [0, 1], [0.96, 1])})`, ...style }}>{children}</div>;
};
/* scene-level exit: everything lifts and fades in the last 12 frames */
export const Exit: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 12, dur - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [dur - 12, dur - 2], [0, -40], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;
};
export const WordReveal: React.FC<{ text: string; delay?: number; per?: number; style?: React.CSSProperties; hi?: string[] }> = ({ text, delay = 0, per = 3, style, hi = [] }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.24em", rowGap: 0, ...style }}>
      {text.split(" ").map((w, i) => {
        const p = spring({ frame: frame - delay - i * per, fps, config: theme.spring.snappy });
        const norm = (x: string) => x.replace(/[.,!?']/g, "").toUpperCase(); const on = hi.some(h => norm(w) === norm(h));
        return <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [34, 0])}px)`,
          color: on ? theme.colors.primary : undefined }}>{w}</span>;
      })}
    </div>
  );
};

/* ---------- typographic parts in the house style ---------- */
export const Label: React.FC<{ text: string; delay?: number; x?: number; y?: number }> = ({ text, delay = 0, x = 96, y = 72 }) => {
  const p = useSpring(delay, theme.spring.snappy);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [-14, 0])}px)`,
      fontFamily: theme.fonts.mono, fontSize: 22, letterSpacing: "0.18em", color: theme.colors.primary, border: `2px solid ${theme.colors.primary}`,
      padding: "8px 16px", textTransform: "uppercase" }}>[ {text} ]</div>
  );
};
export const Headline: React.FC<{ lines: string[]; hi?: string[]; delay?: number; x?: number; y?: number; size?: number; width?: number }> = ({ lines, hi = [], delay = 0, x = 96, y = 760, size = 108, width = 1400 }) => (
  <div style={{ position: "absolute", left: x, top: y, width, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: size, lineHeight: 0.98,
    letterSpacing: "-0.03em", textTransform: "uppercase", color: theme.colors.text }}>
    {lines.map((l, i) => <WordReveal key={i} text={l} delay={delay + i * 7} hi={hi} />)}
  </div>
);
export const Caption: React.FC<{ text: string; delay?: number; x?: number; y?: number }> = ({ text, delay = 0, x = 96, y = 700 }) => {
  const p = useSpring(delay, theme.spring.snappy);
  return <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`,
    fontFamily: theme.fonts.mono, fontSize: 22, letterSpacing: "0.16em", color: theme.colors.textDim, textTransform: "uppercase" }}>{text}</div>;
};
/* thin progress line with ticks (like the breakpoint ruler in the reference) */
export const Ruler: React.FC<{ delay?: number; labels: string[]; active: number; y?: number }> = ({ delay = 0, labels, active, y = 1000 }) => {
  const p = useSpring(delay);
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top: y, opacity: p }}>
      <div style={{ height: 2, background: theme.colors.line, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 2, width: `${(active / (labels.length - 1)) * 100}%`, background: theme.colors.textDim }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: theme.fonts.mono, fontSize: 18, letterSpacing: "0.12em", color: theme.colors.textDim }}>
        {labels.map((l, i) => <span key={i} style={{ color: i === active ? theme.colors.text : undefined }}>{l}</span>)}
      </div>
    </div>
  );
};
export const Counter: React.FC<{ to: number; delay?: number; suffix?: string; style?: React.CSSProperties; damping?: number; stiffness?: number }> = ({ to, delay = 0, suffix = "", style, damping = 30, stiffness = 60 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const v = interpolate(spring({ frame: frame - delay, fps, config: { damping, stiffness } }), [0, 1], [0, to]);
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{Math.round(v).toLocaleString()}{suffix}</span>;
};
export const Tick: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = theme.colors.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
