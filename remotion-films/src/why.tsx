import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { theme } from "./theme";
import { Stack, Entrance, WordReveal, Tick, useSpring } from "./fx";

/* Why ForgeHype: value for money, flexibility, easy to communicate. 4:5, 18 s. */
const CH = 180;   // frames per chapter (6 s)

const Num: React.FC<{ n: number; out: number }> = ({ n, out }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: "-.04em", color: "rgba(255,255,255,.3)", opacity: (1 - out) * useSpring(2) }}>0{n}</div>
);
const Panel: React.FC<{ children: React.ReactNode; top: number; h: number; delay?: number; out: number }> = ({ children, top, h, delay = 10, out }) => {
  const p = useSpring(delay);
  return <div style={{ position: "absolute", top, left: 36, width: 1008, height: h, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 40}px)`, borderRadius: 30, background: theme.colors.panel, border: `1px solid ${theme.colors.line}`, overflow: "hidden" }}>{children}</div>;
};
const Line: React.FC<{ text: string; hi?: string[]; delay: number; out: number }> = ({ text, hi = [], delay, out }) => (
  <div style={{ position: "absolute", left: 36, right: 36, top: 1010, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 92, lineHeight: 1, letterSpacing: "-.03em", color: theme.colors.text, textTransform: "uppercase", opacity: 1 - out }}>
    <WordReveal text={text} delay={delay} per={3} hi={hi} />
  </div>
);
const useOut = () => { const f = useCurrentFrame(); return interpolate(f, [CH - 14, CH - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); };

/* ---------- 01 value for money: one big block vs small steps with rising results ---------- */
const Value: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const out = useOut();
  const big = spring({ frame: frame - 30, fps, config: theme.spring.smooth });
  const steps = 6;
  const pts: [number, number][] = [];
  for (let i = 0; i < steps; i++) { const k = spring({ frame: frame - 60 - i * 14, fps, config: theme.spring.snappy }); pts.push([i, k]); }
  const res = interpolate(frame, [70, 165], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const W = 1008, baseY = 480, colW = 400, L = 70, R = 540;
  return (
    <>
      <Num n={1} out={out} />
      <Panel top={200} h={560} out={out}>
        <div style={{ position: "absolute", left: L, top: 36, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 40, color: theme.colors.textDim }}>Typical agency</div>
        <div style={{ position: "absolute", left: R, top: 36, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 40, color: theme.colors.primary }}>ForgeHype</div>
        {/* typical: one tall block */}
        <div style={{ position: "absolute", left: L + 60, width: 260, bottom: 560 - baseY, height: 330 * big, background: "#3a3330", borderRadius: 14, transformOrigin: "bottom" }} />
        <div style={{ position: "absolute", left: L + 20, width: 340, top: baseY - 330 * big - 44, textAlign: "center", fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: ".16em", color: theme.colors.textDim, opacity: big, whiteSpace: "nowrap" }}>SETUP · ALL AT ONCE</div>
        {/* forgehype: small steps */}
        {pts.map(([i, k]) => <div key={i} style={{ position: "absolute", left: R + 40 + i * 62, width: 50, bottom: 560 - baseY, height: (38 + i * 10) * k, background: theme.colors.primary, borderRadius: 8, opacity: k }} />)}
        <div style={{ position: "absolute", left: R + 40, top: baseY + 14, fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: ".16em", color: theme.colors.textDim }}>MONTH BY MONTH</div>
        <svg style={{ position: "absolute", left: R + 40, top: 90 }} width="400" height="400" viewBox="0 0 400 400">
          <path d="M20 360 C 120 340, 200 250, 300 150 S 380 60, 390 40" fill="none" stroke="#2ecc71" strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - res} />
          <circle cx="390" cy="40" r="12" fill="#2ecc71" opacity={res > .98 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", left: R + 300, top: 60, fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: ".16em", color: "#2ecc71", opacity: res > .9 ? 1 : 0 }}>RESULTS</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: theme.colors.line, top: baseY }} />
      </Panel>
      <div style={{ position: "absolute", left: 36, top: 800, fontFamily: theme.fonts.mono, fontSize: 30, letterSpacing: ".22em", color: theme.colors.primary, opacity: useSpring(20) * (1 - out) }}>VALUE FOR MONEY</div>
      <Line text="Pay as you grow. Results monthly." hi={["grow."]} delay={30} out={out} />
    </>
  );
};

/* ---------- 02 flexibility: pick the services you need, the plan resizes ---------- */
const Flex: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const out = useOut();
  const tiles = ["Website", "Reels", "Maps", "Brand", "AI", "Team"];
  const picked = [0, 2, 4];
  const plan = spring({ frame: frame - 100, fps, config: theme.spring.smooth });
  const grow = spring({ frame: frame - 140, fps, config: theme.spring.bouncy });
  return (
    <>
      <Num n={2} out={out} />
      <Panel top={200} h={560} out={out}>
        <div style={{ position: "absolute", left: 40, top: 36, fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: ".16em", color: theme.colors.textDim }}>SIX SERVICES</div>
        {tiles.map((t, i) => {
          const isP = picked.includes(i), order = picked.indexOf(i);
          const k = spring({ frame: frame - 14 - i * 5, fps, config: theme.spring.snappy });
          const mv = isP ? spring({ frame: frame - 60 - order * 12, fps, config: theme.spring.smooth }) : 0;
          const x0 = 40 + (i % 3) * 320, y0 = 90 + Math.floor(i / 3) * 110;
          const x1 = 80 + order * 300, y1 = 380;
          const x = x0 + (x1 - x0) * mv, y = y0 + (y1 - y0) * mv;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 290, height: 86, borderRadius: 18, display: "grid", placeItems: "center", opacity: k * (isP ? 1 : 1 - mv * 0 - (frame > 60 ? .55 : 0)), transform: `scale(${k})`,
            background: isP && mv > .5 ? theme.colors.primary : theme.colors.panel2, border: `1px solid ${isP && mv > .5 ? theme.colors.primary : theme.colors.line}`, color: isP && mv > .5 ? "#fff" : theme.colors.text, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 38, zIndex: isP ? 2 : 1 }}>{t}</div>;
        })}
        <div style={{ position: "absolute", left: 40, top: 330, width: 928 * (1 - .22 * (1 - grow)) + 0, height: 180, borderRadius: 24, border: `3px dashed ${theme.colors.primary}`, opacity: plan, transform: `scale(${.9 + .1 * plan})` }} />
        <div style={{ position: "absolute", left: 60, top: 300, fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: ".16em", color: theme.colors.primary, opacity: plan }}>YOUR PLAN · ADD MORE WHEN READY</div>
      </Panel>
      <div style={{ position: "absolute", left: 36, top: 800, fontFamily: theme.fonts.mono, fontSize: 30, letterSpacing: ".22em", color: theme.colors.primary, opacity: useSpring(20) * (1 - out) }}>FLEXIBILITY</div>
      <Line text="Start small. Scale when ready." hi={["Scale"]} delay={30} out={out} />
    </>
  );
};

/* ---------- 03 easy to communicate: one chat, plain language ---------- */
const Talk: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const out = useOut();
  const Bubble: React.FC<{ me?: boolean; delay: number; children: React.ReactNode }> = ({ me, delay, children }) => {
    const k = spring({ frame: frame - delay, fps, config: theme.spring.snappy });
    return <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", opacity: k, transform: `translateY(${(1 - k) * 20}px) scale(${.92 + .08 * k})`, transformOrigin: me ? "right" : "left" }}>
      <div style={{ maxWidth: 640, padding: "22px 30px", borderRadius: 26, background: me ? "#1f5b3e" : theme.colors.panel2, color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 36, lineHeight: 1.25, border: `1px solid ${me ? "#2ecc7155" : theme.colors.line}` }}>{children}</div></div>;
  };
  const dots = Math.floor(frame / 8) % 3, typing = frame > 50 && frame < 86;
  const flip = spring({ frame: frame - 130, fps, config: theme.spring.smooth });
  return (
    <>
      <Num n={3} out={out} />
      <Panel top={200} h={560} out={out}>
        <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 16, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 36, color: theme.colors.text }}>
          <span style={{ width: 46, height: 46, borderRadius: 99, background: "#25d366", display: "grid", placeItems: "center" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12z" /></svg></span>
          ForgeHype <span style={{ fontFamily: theme.fonts.mono, fontSize: 22, fontWeight: 500, color: "#2ecc71", letterSpacing: ".12em", marginLeft: 8 }}>ONLINE</span>
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 110, display: "grid", gap: 20 }}>
          <Bubble me delay={16}>Can we add a booking page?</Bubble>
          {typing && <div style={{ display: "flex", gap: 10, padding: "0 30px" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 14, height: 14, borderRadius: 99, background: theme.colors.textDim, opacity: dots === i ? 1 : .35 }} />)}</div>}
          <Bubble delay={86}>Yes. We'll add it to this month's plan and send you a link to test. <span style={{ color: "#2ecc71" }}>✓✓</span></Bubble>
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 34, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: "18px 24px", borderRadius: 16, background: "rgba(255,255,255,.04)", border: `1px solid ${theme.colors.line}`, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 30, color: theme.colors.textDim, textDecoration: flip > .5 ? "line-through" : "none", opacity: 1 - .5 * flip }}>✕ Tech talk</div>
          <div style={{ padding: "18px 24px", borderRadius: 16, background: theme.colors.primary, color: "#fff", fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 30, opacity: flip, transform: `scale(${.9 + .1 * flip})` }}>✓ Plain business language</div>
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 36, top: 800, fontFamily: theme.fonts.mono, fontSize: 30, letterSpacing: ".22em", color: theme.colors.primary, opacity: useSpring(20) * (1 - out) }}>EASY TO COMMUNICATE</div>
      <Line text="One team. One chat. Plain language." hi={["Plain", "language."]} delay={30} out={out} />
    </>
  );
};

/* ---------- close ---------- */
const Close: React.FC = () => {
  const frame = useCurrentFrame(); const { fps, durationInFrames } = useVideoConfig();
  const items = ["Value", "Flexible", "Simple"];
  const end = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mark = spring({ frame: frame - 40, fps, config: theme.spring.smooth });
  return (
    <AbsoluteFill style={{ opacity: end, display: "grid", alignContent: "center", justifyItems: "center", gap: 60 }}>
      <div style={{ display: "flex", gap: 28 }}>
        {items.map((t, i) => { const k = spring({ frame: frame - 6 - i * 8, fps, config: theme.spring.bouncy }); return <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 30px", borderRadius: 99, background: theme.colors.panel2, border: `1px solid ${theme.colors.primary}66`, opacity: k, transform: `scale(${k})`, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 44, color: theme.colors.text }}><Tick size={44} color="#2ecc71" />{t}</div>; })}
      </div>
      <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 120, letterSpacing: "-.04em", opacity: mark, transform: `translateY(${(1 - mark) * 30}px)` }}><span style={{ color: theme.colors.primary }}>Forge</span><span style={{ color: theme.colors.text }}>Hype</span></div>
    </AbsoluteFill>
  );
};

export const WhyFilm: React.FC = () => (
  <Stack>
    <Sequence from={0} durationInFrames={CH}><Value /></Sequence>
    <Sequence from={CH} durationInFrames={CH}><Flex /></Sequence>
    <Sequence from={CH * 2} durationInFrames={CH}><Talk /></Sequence>
    <Sequence from={CH * 3} durationInFrames={90}><Close /></Sequence>
  </Stack>
);
export const WHY_DUR = CH * 3 + 90;
