import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { Stack, Entrance, Label, WordReveal, Tick, useSpring } from "./fx";
import { Phone } from "./mockups";

/* ---------- content for the six fix films ---------- */
export type FixSpec = {
  n: number; title: string; kind: "site" | "feed" | "map" | "brand" | "chat" | "focus";
  you: string[]; them: string[]; punch: string; punchHi: string[]; fix: string; fixHi: string[];
};
export const FIXES: FixSpec[] = [
  { n: 1, title: "Your website", kind: "site",
    you: ["No website", "Slow on mobile", "No contact"], them: ["Fast", "1-tap order", "1-tap WhatsApp"],
    punch: "Customers reach him first.", punchHi: ["first."], fix: "Fast custom website. Visits become sales.", fixHi: ["sales."] },
  { n: 2, title: "Your content", kind: "feed",
    you: ["Stock photos", "Scrolled past", "23 likes"], them: ["Real reels", "Watched. Shared.", "Visits from Instagram"],
    punch: "They watched his story.", punchHi: ["his"], fix: "Content people stop for and act on.", fixHi: ["act"] },
  { n: 3, title: "Your search", kind: "map",
    you: ["Google: not found", "ChatGPT: not found", "Sale lost"], them: ["First on Maps", "AI recommends him", "1 tap to call"],
    punch: "You weren't the answer.", punchHi: ["weren't"], fix: "Found first on Google, Maps and AI.", fixHi: ["first"] },
  { n: 4, title: "Your brand", kind: "brand",
    you: ["Logo changes", "Colours change", "Forgotten"], them: ["One logo", "One colour", "Same everywhere"],
    punch: "They remember him.", punchHi: ["remember"], fix: "One brand. Recognised everywhere.", fixHi: ["Recognised"] },
  { n: 5, title: "Your replies", kind: "chat",
    you: ["Reply in 2 days", "Booking lost", "Needs you"], them: ["AI replies in seconds", "Order placed", "24/7"],
    punch: "Ordered from him in minutes.", punchHi: ["minutes."], fix: "An AI assistant that takes the order first.", fixHi: ["first."] },
  { n: 6, title: "Your focus", kind: "focus",
    you: ["Filmmaker", "Editor", "Marketer…"], them: ["A team runs it", "Monthly. Measured.", "He runs the business"],
    punch: "He's with customers. You're editing.", punchHi: ["editing."], fix: "A growth team every month. You run the business.", fixHi: ["You"] },
];

/* ---------- small screens: a bad and a good version per kind ---------- */
const Bar: React.FC<{ w: number | string; h?: number; c?: string; r?: number; mt?: number }> = ({ w, h = 10, c = "#cfc7bf", r = 6, mt = 0 }) => <div style={{ width: w, height: h, background: c, borderRadius: r, marginTop: mt }} />;
const Cross: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = "#8a827b" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
const Screen: React.FC<{ kind: FixSpec["kind"]; good: boolean }> = ({ kind, good }) => {
  const frame = useCurrentFrame();
  const ink = theme.colors.ink, dim = "#b9b0a7";
  const pad: React.CSSProperties = { position: "absolute", inset: 0, padding: "56px 18px 18px", fontFamily: theme.fonts.body, background: good ? "#fff" : "#ece7e1" };
  const spin = (frame * 9) % 360;
  if (kind === "site") return good ? (
    <div style={pad}><Bar w={70} h={12} c={ink} /><Bar w="90%" h={26} c={ink} mt={22} r={7} /><Bar w="60%" h={26} c={ink} mt={8} r={7} /><Bar w="85%" h={9} c={dim} mt={16} />
      <div style={{ marginTop: 18, height: 110, borderRadius: 14, background: "linear-gradient(135deg,#d8cfc6,#b8aea4)" }} />
      <div style={{ marginTop: 16, height: 42, borderRadius: 99, background: theme.colors.primary, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>Order now</div>
      <div style={{ marginTop: 10, height: 42, borderRadius: 99, background: "#25d366", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>WhatsApp</div></div>
  ) : (
    <div style={{ ...pad, display: "grid", placeItems: "center", color: "#8a827b" }}>
      <div style={{ textAlign: "center" }}><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#8a827b" strokeWidth="2.5" style={{ transform: `rotate(${spin}deg)` }}><path d="M12 3a9 9 0 1 1-6.4 2.6" strokeLinecap="round" /></svg><div style={{ marginTop: 12, fontFamily: theme.fonts.mono, fontSize: 15, letterSpacing: ".12em" }}>LOADING…</div></div></div>
  );
  if (kind === "feed") return (
    <div style={pad}>{[0, 1, 2].map(i => <div key={i} style={{ marginBottom: 14 }}>
      <div style={{ height: 118, borderRadius: 12, background: good ? `linear-gradient(135deg,hsl(${24 + i * 20},40%,45%),hsl(${24 + i * 20},40%,25%))` : "#d9d2ca", display: "grid", placeItems: "center" }}>{good && <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, fontWeight: 700, color: good ? ink : "#9a918a" }}><span>{good ? "♥ 2,4k" : "♥ 23"}</span><span>{good ? "↗ 318" : ""}</span></div></div>)}</div>
  );
  if (kind === "map") return (
    <div style={{ ...pad, background: "#efe9e2", padding: 0 }}>
      <div style={{ position: "absolute", top: 54, left: 14, right: 14, height: 40, borderRadius: 10, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.12)", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 15, fontWeight: 700, color: ink }}>near me</div>
      <svg width="100%" height="100%" viewBox="0 0 280 574" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>{[40, 110, 180, 250].map(x => <line key={x} x1={x} y1="0" x2={x + 40} y2="574" stroke="#dcd4cb" strokeWidth="6" />)}{[150, 260, 370, 480].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y + 30} stroke="#dcd4cb" strokeWidth="6" />)}</svg>
      {good ? <div style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%,-100%)", textAlign: "center" }}><svg width="54" height="66" viewBox="0 0 24 30"><path d="M12 29s-10-9.5-10-17a10 10 0 0 1 20 0c0 7.5-10 17-10 17z" fill={theme.colors.primary} /><circle cx="12" cy="12" r="4" fill="#fff" /></svg><div style={{ marginTop: 6, background: "#fff", borderRadius: 10, padding: "8px 10px", fontSize: 13, fontWeight: 700, color: ink, boxShadow: "0 6px 16px rgba(0,0,0,.12)" }}>★ 4.9 · Open · Call</div></div>
        : <div style={{ position: "absolute", left: 0, right: 0, top: "48%", textAlign: "center", fontFamily: theme.fonts.mono, fontSize: 14, color: "#8a827b", letterSpacing: ".1em" }}>NO RESULTS FOR YOU</div>}</div>
  );
  if (kind === "brand") return (
    <div style={{ ...pad, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "start" }}>{[0, 1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ height: 118, borderRadius: 14, background: good ? (i % 3 === 0 ? theme.colors.primary : i % 3 === 1 ? ink : "#f4efe9") : ["#5b8def", "#e34f8c", "#3ab27a", "#f2c94c", "#8e6bd8", "#444"][i], display: "grid", placeItems: "center", border: good && i % 3 === 2 ? "1px solid #ddd" : "none", fontFamily: good ? theme.fonts.display : ["serif", "cursive", "monospace", "sans-serif", "fantasy", "serif"][i], fontWeight: 800, fontSize: good ? 22 : 18, color: good ? (i % 3 === 2 ? ink : "#fff") : "#fff", letterSpacing: good ? "-.03em" : "0" }}>{good ? "Brand" : ["BRAND", "brand", "Brand!", "B R A N D", "brand co", "THE BRAND"][i]}</div>))}</div>
  );
  if (kind === "chat") return (
    <div style={pad}>{["Is it available?", "Do you deliver?", "Can I book 8pm?", "Price please", "Hello??"].map((m, i) => (
      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 0", borderBottom: "1px solid #eee" }}><Bar w={36} h={36} c="#cfc7bf" r={99} /><div style={{ flex: 1, fontSize: 14, color: ink, fontWeight: 600 }}>{m}</div>
        {good ? <span style={{ fontSize: 12, fontWeight: 800, color: "#25d366" }}>✓✓ replied</span> : <span style={{ minWidth: 24, height: 24, borderRadius: 99, background: "#e34f4f", color: "#fff", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center" }}>{[14, 9, 7, 6, 5][i]}</span>}</div>))}</div>
  );
  return ( // focus
    <div style={pad}><div style={{ fontFamily: theme.fonts.mono, fontSize: 13, letterSpacing: ".12em", color: "#8a827b", marginBottom: 12 }}>{good ? "MY WEEK" : "MY WEEK · ME"}</div>
      {(good ? ["Customers", "Product", "Team", "Growth call · ForgeHype"] : ["Film reels", "Edit video", "Write posts", "Fix website", "Run ads", "Reply to DMs", "Learn AI tools", "…and the business"]).map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: good ? "12px 0" : "7px 0", borderBottom: "1px solid #eee", fontSize: good ? 16 : 13, fontWeight: 700, color: good ? ink : (i === 7 ? "#e34f4f" : "#6b645e") }}>{good ? <Tick size={20} /> : <Cross size={18} color="#c9c0b7" />}{t}</div>))}</div>
  );
};

/* ---------- the film (4:5 portrait, 1080x1350) ---------- */
const Panel: React.FC<{ side: "you" | "them"; spec: FixSpec; delay: number; out: number; top: number }> = ({ side, spec, delay, out, top }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const good = side === "them";
  const p = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  const x = interpolate(p, [0, 1], [good ? 80 : -80, 0]) + interpolate(out, [0, 1], [0, good ? 900 : -900], { easing: theme.ease.in });
  return (
    <div style={{ position: "absolute", top, left: 36, width: 1008, height: 500, opacity: p * (1 - out), transform: `translateX(${x}px)`,
      borderRadius: 30, background: good ? theme.colors.panel2 : theme.colors.panel, border: `1px solid ${good ? theme.colors.primary + "66" : theme.colors.line}`, padding: "28px 36px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 64, letterSpacing: "-.02em", lineHeight: 1, color: good ? theme.colors.primary : theme.colors.text }}>
        <span style={{ width: 18, height: 18, borderRadius: 99, background: good ? theme.colors.primary : theme.colors.text }} />{good ? "Your competitor" : "You"}
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 14, alignItems: "center", height: 390 }}>
        <div style={{ flex: "0 0 200px", height: 390, overflow: "visible" }}><div style={{ transform: "scale(.68)", transformOrigin: "0 0" }}><Phone width={280}><Screen kind={spec.kind} good={good} /></Phone></div></div>
        <div style={{ flex: 1, display: "grid", gap: 26, marginLeft: 20 }}>
          {(good ? spec.them : spec.you).map((t, i) => {
            const q = spring({ frame: frame - delay - 24 - i * 18, fps, config: theme.spring.snappy });
            return <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", opacity: q, transform: `translateX(${(1 - q) * 30}px)` }}>
              <span style={{ flex: "0 0 auto" }}>{good ? <Tick size={60} color="#25d366" /> : <Cross size={60} color="#e34f4f" />}</span>
              <span style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 64, lineHeight: 1.04, letterSpacing: "-.02em", color: good ? theme.colors.text : theme.colors.textDim }}>{t}</span></div>;
          })}
        </div>
      </div>
    </div>
  );
};

export const FixFilm: React.FC<{ spec: FixSpec }> = ({ spec }) => {
  const frame = useCurrentFrame(); const { fps, durationInFrames } = useVideoConfig();
  const T_SPLIT = 16, T_PUNCH = 240, T_FIX = 10000;   // no fix segment: the film shows the gap, the card line gives the fix
  const out = interpolate(frame, [T_PUNCH - 14, T_PUNCH - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const punchOut = interpolate(frame, [T_FIX - 12, T_FIX - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const endFade = interpolate(frame, [durationInFrames - 14, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fixIn = spring({ frame: frame - T_FIX, fps, config: theme.spring.smooth });
  const walkers = 8;
  return (
    <Stack>
      <AbsoluteFill style={{ opacity: endFade }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: "-.04em", color: "rgba(255,255,255,.3)", opacity: (1 - out) * useSpring(2) }}>0{spec.n}</div>
        <Panel side="you" spec={spec} delay={T_SPLIT} out={out} top={200} />
        <div style={{ position: "absolute", left: "50%", top: 712, transform: "translateX(-50%)", opacity: useSpring(T_SPLIT + 30) * (1 - out) }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16M5 13l7 7 7-7" /></svg>
        </div>
        <Panel side="them" spec={spec} delay={T_SPLIT + 10} out={out} top={775} />
        {frame >= T_PUNCH - 10 && (
          <AbsoluteFill style={{ opacity: punchOut }}>
            <div style={{ position: "absolute", left: 36, top: 110, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 104, lineHeight: 1, letterSpacing: "-.03em", color: theme.colors.text }}>YOU</div>
            <div style={{ position: "absolute", left: 36, top: 560, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 104, lineHeight: 1, letterSpacing: "-.03em", color: theme.colors.primary }}>YOUR COMPETITOR</div>
            {Array.from({ length: walkers }).map((_, i) => {
              const t = interpolate(frame, [T_PUNCH + i * 5, T_PUNCH + 44 + i * 5], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const x = 60 + (i % 4) * 250 + Math.sin(t * 6 + i) * 6, y = interpolate(t, [0, 1], [250 + Math.floor(i / 4) * 80, 690 + Math.floor(i / 4) * 80]);
              return <div key={i} style={{ position: "absolute", left: x, top: y, width: 54, height: 54, borderRadius: 99, background: t > .5 ? theme.colors.primary : theme.colors.textDim, boxShadow: t > .5 ? `0 0 30px ${theme.colors.glow}` : "none" }} />;
            })}
            <div style={{ position: "absolute", left: 36, right: 36, top: 920, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 104, lineHeight: 1, letterSpacing: "-.03em", color: theme.colors.text, textTransform: "uppercase" }}>
              <WordReveal text={spec.punch} delay={T_PUNCH + 6} per={3} hi={spec.punchHi} />
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </Stack>
  );
};
