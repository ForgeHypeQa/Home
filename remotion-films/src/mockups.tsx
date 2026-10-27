import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "./theme";

/* ---------- device frames (drawn in code, no images) ---------- */
export const Laptop: React.FC<{ width?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width = 1100, children, style }) => {
  const h = width * 0.6;
  return (
    <div style={{ position: "relative", width, ...style }}>
      <div style={{ width, height: h, borderRadius: 22, background: "#0b0a09", border: "2px solid #2a2622", padding: 14, boxShadow: "0 50px 120px -30px rgba(0,0,0,.8)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 10, overflow: "hidden", background: theme.colors.screen, position: "relative" }}>{children}</div>
      </div>
      <div style={{ width: width * 1.16, height: 16, margin: `0 ${-width * 0.08}px`, borderRadius: "0 0 18px 18px", background: "linear-gradient(#2a2622,#141210)" }} />
    </div>
  );
};
export const Phone: React.FC<{ width?: number; children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ width = 300, children, style, dark }) => {
  const h = width * 2.05;
  return (
    <div style={{ position: "relative", width, height: h, borderRadius: width * 0.16, background: "#0b0a09", border: "2px solid #2a2622", padding: 10, boxShadow: "0 40px 100px -30px rgba(0,0,0,.8)", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: width * 0.13, overflow: "hidden", background: dark ? "#111" : theme.colors.screen, position: "relative" }}>
        {children}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: width * 0.32, height: width * 0.085, borderRadius: 99, background: "#0b0a09" }} />
      </div>
    </div>
  );
};
export const Tablet: React.FC<{ width?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width = 640, children, style }) => {
  const h = width * 1.36;
  return (
    <div style={{ position: "relative", width, height: h, borderRadius: 34, background: "#0b0a09", border: "2px solid #2a2622", padding: 16, boxShadow: "0 40px 100px -30px rgba(0,0,0,.8)", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 20, overflow: "hidden", background: theme.colors.screen, position: "relative" }}>{children}</div>
    </div>
  );
};

/* ---------- generic screen contents (wireframe style: no real brand, no real client) ---------- */
const Bar: React.FC<{ w: number | string; h?: number; c?: string; r?: number; style?: React.CSSProperties }> = ({ w, h = 10, c = "#d9d2ca", r = 6, style }) => (
  <div style={{ width: w, height: h, background: c, borderRadius: r, ...style }} />
);
export const SiteScreen: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [40, 170], [0, compact ? 140 : 90], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = compact ? 0.62 : 1;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: theme.fonts.body }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${14 * s}px ${22 * s}px`, borderBottom: "1px solid #e5ddd4", background: "#fff", position: "relative", zIndex: 2 }}>
        <Bar w={90 * s} h={14 * s} c={theme.colors.ink} />
        {!compact && <div style={{ display: "flex", gap: 18 }}>{[64, 48, 56, 40].map((w, i) => <Bar key={i} w={w} h={10} c="#b9b0a7" />)}</div>}
        <Bar w={compact ? 22 * s : 110} h={compact ? 14 : 30} c={theme.colors.ink} r={99} />
      </div>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        <div style={{ padding: `${48 * s}px ${28 * s}px`, display: "grid", gridTemplateColumns: compact ? "1fr" : "1.1fr 1fr", gap: 28 * s, alignItems: "center" }}>
          <div>
            <Bar w={"78%"} h={34 * s} c={theme.colors.ink} r={8} />
            <Bar w={"58%"} h={34 * s} c={theme.colors.ink} r={8} style={{ marginTop: 10 * s }} />
            <Bar w={"88%"} h={12 * s} c="#a39a91" style={{ marginTop: 22 * s }} />
            <Bar w={"70%"} h={12 * s} c="#a39a91" style={{ marginTop: 8 * s }} />
            <div style={{ display: "flex", gap: 10, marginTop: 26 * s }}><Bar w={120 * s} h={36 * s} c={theme.colors.ink} r={99} /><Bar w={100 * s} h={36 * s} c="#d9d2ca" r={99} /></div>
          </div>
          <div style={{ height: compact ? 150 : 230, borderRadius: 16, background: "linear-gradient(135deg,#d8cfc6,#b8aea4)" }} />
        </div>
        <div style={{ padding: `0 ${28 * s}px`, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 * s }}>
          {[0, 1, 2].map(i => <div key={i} style={{ height: compact ? 90 : 150, borderRadius: 14, background: i === 1 ? "#e3dbd2" : "#eee8e1" }} />)}
        </div>
      </div>
    </div>
  );
};
export const FeedScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [20, 160], [0, 1500], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const posts = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: theme.fonts.body, background: "#fff" }}>
      <div style={{ padding: "48px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", position: "relative", zIndex: 2, background: "#fff" }}>
        <Bar w={70} h={14} c={theme.colors.ink} /><Bar w={22} h={22} c={theme.colors.ink} r={99} />
      </div>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        {posts.map(i => (
          <div key={i} style={{ padding: "12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px 10px" }}><Bar w={28} h={28} c={i === 2 ? theme.colors.ink : "#cfc7bf"} r={99} /><Bar w={90} h={10} c="#9a918a" /></div>
            <div style={{ height: 250, background: i === 2 ? "linear-gradient(135deg,#2a2622,#4a423b)" : `linear-gradient(135deg,hsl(${28 + i * 30},18%,78%),hsl(${28 + i * 30},18%,62%))` }} />
            <div style={{ display: "flex", gap: 14, padding: "12px 16px 4px", alignItems: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.ink} strokeWidth="2"><path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.4-7 10-7 10z" /></svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.ink} strokeWidth="2"><path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12z" /></svg>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#777", fontWeight: 600 }}>{i === 2 ? "23 likes" : `${(1800 + i * 913) % 5000} likes`}</span>
            </div>
            <div style={{ padding: "0 16px 10px" }}><Bar w={"70%"} h={9} c="#cfc7bf" /></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export const MapScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const pins = [[60, 42, 40], [34, 58, 52], [70, 70, 64]]; // x%, y%, drop frame
  const you = interpolate(frame, [96, 118], [0, 1], { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#efe9e2", fontFamily: theme.fonts.body, overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 280 574" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        {[40, 110, 180, 250].map(x => <line key={x} x1={x} y1="0" x2={x + 40} y2="574" stroke="#dcd4cb" strokeWidth="6" />)}
        {[120, 230, 340, 450].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y + 30} stroke="#dcd4cb" strokeWidth="6" />)}
        <path d="M0 300 Q140 260 280 330 L280 574 L0 574 Z" fill="#dfe6e2" />
      </svg>
      <div style={{ position: "absolute", top: 54, left: 14, right: 14, height: 44, borderRadius: 12, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.12)", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontSize: 15, color: theme.colors.ink, fontWeight: 600 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.colors.ink} strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <span>near me</span>
      </div>
      {pins.map(([x, y, d], i) => {
        const p = interpolate(frame, [d, d + 14], [0, 1], { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-100%) translateY(${(1 - p) * -40}px) scale(${0.6 + 0.4 * p})`, opacity: p, textAlign: "center" }}>
            <svg width="38" height="46" viewBox="0 0 24 30"><path d="M12 29s-10-9.5-10-17a10 10 0 0 1 20 0c0 7.5-10 17-10 17z" fill={theme.colors.ink} /><circle cx="12" cy="12" r="4" fill="#fff" /></svg>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: "50%", top: "94%", transform: `translate(-50%,-100%)`, opacity: you * 0.45, textAlign: "center" }}>
        <svg width="34" height="42" viewBox="0 0 24 30"><path d="M12 29s-10-9.5-10-17a10 10 0 0 1 20 0c0 7.5-10 17-10 17z" fill="#8a827b" /><circle cx="12" cy="12" r="4" fill="#fff" /></svg>
        <div style={{ fontFamily: theme.fonts.mono, fontSize: 11, color: "#6b645e", letterSpacing: ".1em" }}>YOU</div>
      </div>
    </div>
  );
};
export const RecallScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const adIn = interpolate(frame, [10, 30], [0, 1], { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const adOut = interpolate(frame, [62, 76], [1, 0], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const draw = interpolate(frame, [78, 160], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pts = [[0, 20], [60, 70], [150, 150], [260, 215], [380, 250], [500, 262]];
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: theme.fonts.body }}>
      <div style={{ position: "absolute", inset: "70px 40px auto", opacity: adIn * adOut, transform: `scale(${0.92 + 0.08 * adIn})`, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,.35)" }}>
        <div style={{ height: 300, background: "linear-gradient(135deg,#2a2622,#5a4e44)", display: "grid", placeItems: "center" }}>
          <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 54, color: "#f4efe9", letterSpacing: "-.03em", textAlign: "center", lineHeight: 1 }}>YOUR<br />AD</div>
        </div>
        <div style={{ padding: 18, background: "#fff" }}><Bar w={"60%"} h={14} c={theme.colors.ink} /><Bar w={"85%"} h={10} c="#b9b0a7" style={{ marginTop: 10 }} /></div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 80, bottom: 90, opacity: draw > 0 ? 1 : 0 }}>
        <div style={{ fontFamily: theme.fonts.mono, fontSize: 15, letterSpacing: ".14em", color: "#6b645e", marginBottom: 14 }}>BRAND RECALL · 7 DAYS</div>
        <svg width="100%" height="300" viewBox="0 0 520 300" style={{ overflow: "visible" }}>
          {[0, 1, 2, 3].map(i => <line key={i} x1="0" x2="520" y1={20 + i * 80} y2={20 + i * 80} stroke="#eee" />)}
          <path d={path} fill="none" stroke={theme.colors.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="7" fill={theme.colors.ink} opacity={draw >= i / (pts.length - 1) ? 1 : 0} />)}
          <text x="0" y="296" fontFamily={theme.fonts.mono} fontSize="14" fill="#8a827b">DAY 1</text>
          <text x="470" y="296" fontFamily={theme.fonts.mono} fontSize="14" fill="#8a827b">DAY 7</text>
        </svg>
      </div>
    </div>
  );
};
export const ChatScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [["Customer", "Is this still available?", 14], ["New enquiry", "Do you deliver to Lusail?", 27], ["Order", "Can I change my booking?", 41], ["Supplier", "Invoice attached", 0], ["Customer", "Hello?? Anyone there", 9]];
  const total = Math.round(interpolate(frame, [10, 150], [6, 41], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const dots = Math.floor(frame / 8) % 3;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: theme.fonts.body }}>
      <div style={{ padding: "48px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #eee" }}>
        <span style={{ fontWeight: 800, fontSize: 22, color: theme.colors.ink }}>Chats</span>
        <span style={{ fontFamily: theme.fonts.mono, fontSize: 13, color: "#8a827b", letterSpacing: ".1em" }}>23:47</span>
      </div>
      {rows.map(([n, m, b], i) => {
        const p = interpolate(frame, [12 + i * 9, 26 + i * 9], [0, 1], { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const badge = Math.min(Number(b), Math.max(0, total - i * 7));
        return (
          <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f1ece6", opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
            <Bar w={44} h={44} c={i % 2 ? "#cfc7bf" : "#b9b0a7"} r={99} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 15, color: theme.colors.ink }}>{n}</span><span style={{ fontSize: 12, color: "#9a918a" }}>23:4{(7 - i + 10) % 10}</span></div>
              <div style={{ fontSize: 13, color: "#6b645e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i === 4 ? "typing" + ".".repeat(dots + 1) : m}</div>
            </div>
            {badge > 0 && <div style={{ alignSelf: "center", minWidth: 26, height: 26, borderRadius: 99, background: "#25d366", color: "#fff", fontSize: 13, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 6px" }}>{badge}</div>}
          </div>
        );
      })}
    </div>
  );
};
