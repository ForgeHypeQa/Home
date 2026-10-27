import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "./theme";
import { Entrance, Exit, Headline, Label, Caption, Ruler, Counter, Tick, WordReveal, useSpring } from "./fx";
import { Laptop, Phone, Tablet, SiteScreen, FeedScreen, MapScreen, RecallScreen, ChatScreen } from "./mockups";

const PROBLEMS = ["WEBSITE", "CONTENT", "SEARCH", "BRAND", "REPLIES", "FOCUS"];

/* shared frame for the six problem scenes: label, big number, mockup stage, headline, ruler */
const ProblemScene: React.FC<{ n: number; lines: string[]; hi: string[]; caption: string; dur: number; children: React.ReactNode; size?: number }> = ({ n, lines, hi, caption, dur, children, size = 96 }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 26) * 4;
  const num = useSpring(6, theme.spring.bouncy);
  return (
    <Exit dur={dur}>
      <Label text={`problem 0${n}`} delay={2} />
      <div style={{ position: "absolute", right: 96, top: 48, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.08)", opacity: num, transform: `translateY(${(1 - num) * 30}px)` }}>0{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, height: 560, display: "flex", justifyContent: "center", alignItems: "flex-start", transform: `translateY(${breathe}px)` }}>{children}</div>
      <Caption text={caption} delay={16} y={742} />
      <Headline lines={lines} hi={hi} delay={22} y={790} size={size} width={1700} />
      <Ruler labels={PROBLEMS} active={n - 1} delay={30} y={1008} />
    </Exit>
  );
};

/* ---------- 0. intro ---------- */
export const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <Exit dur={dur}>
      <Label text="the six problems" delay={2} />
      <div style={{ position: "absolute", left: 96, top: 300, display: "flex", gap: 22 }}>
        {PROBLEMS.map((p, i) => { const s = spring({ frame: frame - 8 - i * 5, fps, config: theme.spring.bouncy }); return <div key={i} style={{ width: 26, height: 26, borderRadius: 99, background: i === 0 ? theme.colors.primary : theme.colors.text, opacity: s, transform: `scale(${s})` }} />; })}
      </div>
      <div style={{ position: "absolute", left: 90, top: 350, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 290, lineHeight: 1, letterSpacing: "-0.05em", color: theme.colors.text, textTransform: "uppercase" }}>
        <WordReveal text="Most" delay={10} />
      </div>
      <Headline lines={["of what holds a business back online", "comes down to six things."]} hi={["SIX", "THINGS"]} delay={30} y={720} size={74} width={1760} />
    </Exit>
  );
};

/* ---------- 1. website: visits up, enquiries stuck ---------- */
export const Website: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shake = frame > 120 && frame < 132 ? Math.sin(frame * 3) * 3 : 0;
  return (
    <ProblemScene n={1} lines={["My website gets visits.", "Nobody enquires."]} hi={["NOBODY", "ENQUIRES"]} caption="laptop · 1440 · the shop window" dur={dur}>
      <div style={{ position: "relative", width: 1200, height: 560 }}>
        <div style={{ position: "absolute", left: 40, top: 20 }}><Entrance delay={6}><Laptop width={860}><SiteScreen /></Laptop></Entrance></div>
        <div style={{ position: "absolute", right: 60, top: 90 }}><Entrance delay={14}><Phone width={230}><SiteScreen compact /></Phone></Entrance></div>
        <Entrance delay={30}>
          <div style={{ position: "absolute", left: 0, top: -10, display: "flex", gap: 14 }}>
            <div style={{ background: theme.colors.panel, border: `1px solid ${theme.colors.line}`, borderRadius: 14, padding: "14px 20px", fontFamily: theme.fonts.mono, fontSize: 18, letterSpacing: ".12em", color: theme.colors.textDim }}>VISITORS <span style={{ color: theme.colors.text, fontSize: 30, marginLeft: 10, fontFamily: theme.fonts.display, fontWeight: 700 }}><Counter to={1248} delay={34} damping={40} stiffness={40} /></span></div>
            <div style={{ background: theme.colors.panel, border: `1px solid ${theme.colors.line}`, borderRadius: 14, padding: "14px 20px", fontFamily: theme.fonts.mono, fontSize: 18, letterSpacing: ".12em", color: theme.colors.textDim, transform: `translateX(${shake}px)` }}>ENQUIRIES <span style={{ color: theme.colors.text, fontSize: 30, marginLeft: 10, fontFamily: theme.fonts.display, fontWeight: 700 }}>0</span></div>
          </div>
        </Entrance>
      </div>
    </ProblemScene>
  );
};

/* ---------- 2. content: feed scrolls past ---------- */
export const Content: React.FC<{ dur: number }> = ({ dur }) => (
  <ProblemScene n={2} lines={["I post every week.", "Nobody engages."]} hi={["NOBODY", "ENGAGES"]} caption="phone · the feed · 23 likes" dur={dur}>
    <div style={{ position: "relative", width: 900, height: 560, display: "flex", justifyContent: "center", gap: 60 }}>
      <Entrance delay={6}><Phone width={290} style={{ marginTop: 0 }}><FeedScreen /></Phone></Entrance>
      <Entrance delay={16}>
        <div style={{ marginTop: 150, width: 300 }}>
          {[["POSTS THIS MONTH", "12"], ["AVG. LIKES", "23"], ["ENQUIRIES", "0"]].map(([k, v], i) => (
            <Entrance key={i} delay={24 + i * 6}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: `1px solid ${theme.colors.line}`, fontFamily: theme.fonts.mono, fontSize: 17, letterSpacing: ".12em", color: theme.colors.textDim }}>{k}<span style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 36 }}>{v}</span></div></Entrance>
          ))}
        </div>
      </Entrance>
    </div>
  </ProblemScene>
);

/* ---------- 3. search: near me, your pin last ---------- */
export const Search: React.FC<{ dur: number }> = ({ dur }) => (
  <ProblemScene n={3} lines={["Customers can't find me", "on Google or Maps."]} hi={["GOOGLE", "MAPS"]} caption="phone · 'near me' · who gets the call" dur={dur}>
    <div style={{ position: "relative", width: 900, height: 560, display: "flex", justifyContent: "center", gap: 70 }}>
      <Entrance delay={6}><Phone width={290}><MapScreen /></Phone></Entrance>
      <div style={{ marginTop: 140, width: 320 }}>
        {["Competitor A", "Competitor B", "Competitor C"].map((n, i) => (
          <Entrance key={i} delay={40 + i * 12}><div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${theme.colors.line}` }}><span style={{ fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.textDim, width: 30 }}>0{i + 1}</span><span style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 24, color: theme.colors.text }}>{n}</span></div></Entrance>
        ))}
        <Entrance delay={100}><div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", opacity: .45 }}><span style={{ fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.textDim, width: 30 }}>14</span><span style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 24, color: theme.colors.text }}>You</span></div></Entrance>
      </div>
    </div>
  </ProblemScene>
);

/* ---------- 4. brand: the ad, then recall drops ---------- */
export const Brand: React.FC<{ dur: number }> = ({ dur }) => (
  <ProblemScene n={4} lines={["People see my ads,", "then forget my name."]} hi={["FORGET"]} caption="tablet · the ad · seven days later" dur={dur}>
    <div style={{ position: "relative", width: 900, height: 560, display: "flex", justifyContent: "center" }}>
      <Entrance delay={6}><Tablet width={430}><RecallScreen /></Tablet></Entrance>
    </div>
  </ProblemScene>
);

/* ---------- 5. replies: 23:47, badges piling up ---------- */
export const Replies: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <ProblemScene n={5} lines={["If I stop replying,", "everything stops."]} hi={["EVERYTHING", "STOPS"]} caption="phone · 23:47 · still answering" dur={dur}>
      <div style={{ position: "relative", width: 900, height: 560, display: "flex", justifyContent: "center", gap: 70 }}>
        <Entrance delay={6}><Phone width={290}><ChatScreen /></Phone></Entrance>
        <div style={{ marginTop: 130, width: 340 }}>
          <Entrance delay={30}><div style={{ fontFamily: theme.fonts.mono, fontSize: 17, letterSpacing: ".14em", color: theme.colors.textDim }}>UNANSWERED</div></Entrance>
          <Entrance delay={36}><div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: "-.04em", color: theme.colors.text, marginTop: 6 }}><Counter to={41} delay={40} damping={30} stiffness={30} /></div></Entrance>
          <Entrance delay={70}><div style={{ fontFamily: theme.fonts.body, fontSize: 24, color: theme.colors.textDim, marginTop: 10, lineHeight: 1.4 }}>Every one of them is a customer waiting for <span style={{ color: theme.colors.text, fontWeight: 700 }}>you</span>.</div></Entrance>
        </div>
      </div>
    </ProblemScene>
  );
};

/* ---------- 6. focus: everything crowds the core, then clears ---------- */
export const Focus: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const tags = ["Filmmaker", "Video editor", "Sound engineer", "Social media manager", "Copywriter", "Ads manager", "E-commerce expert", "Web designer", "SEO analyst", "AI expert"];
  const clear = interpolate(frame, [96, 126], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const core = useSpring(8);
  const tick = spring({ frame: frame - 130, fps, config: theme.spring.bouncy });
  return (
    <ProblemScene n={6} lines={["Ten jobs I never applied for.", "None of them is my business."]} hi={["MY", "BUSINESS"]} caption="the owner · filmmaker · editor · marketer · ai expert" dur={dur} size={86}>
      <div style={{ position: "relative", width: 1000, height: 560 }}>
        <div style={{ position: "absolute", left: "50%", top: 250, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * core})`, opacity: core, textAlign: "center" }}>
          <div style={{ fontFamily: theme.fonts.mono, fontSize: 18, letterSpacing: ".16em", color: theme.colors.textDim, marginBottom: 12 }}>WHAT I DO BEST</div>
          <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 110, lineHeight: 1, letterSpacing: "-.04em", color: theme.colors.text, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
            My business <span style={{ opacity: tick, transform: `scale(${tick})`, display: "inline-flex" }}><Tick size={70} /></span>
          </div>
        </div>
        {tags.map((t, i) => {
          const a = (i / tags.length) * Math.PI * 2 + 0.4;
          const r0 = 560, r1 = 110 + (i % 3) * 40;
          const p = spring({ frame: frame - 14 - i * 4, fps, config: theme.spring.smooth });
          const rad = interpolate(p, [0, 1], [r0, r1]) + clear * 700;
          const x = Math.cos(a) * rad * 1.5, y = Math.sin(a) * rad * 0.55;
          return (
            <div key={i} style={{ position: "absolute", left: "50%", top: 250, transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${(i % 2 ? -1 : 1) * (4 + i)}deg)`, opacity: Math.min(p, 1 - clear),
              background: theme.colors.panel2, border: `1px solid ${theme.colors.line}`, borderRadius: 99, padding: "10px 22px", fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 23, color: theme.colors.text, boxShadow: "0 20px 40px -20px rgba(0,0,0,.8)" }}>{t}</div>
          );
        })}
      </div>
    </ProblemScene>
  );
};

/* ---------- 7. outro ---------- */
export const Outro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const arrow = Math.sin(frame / 9) * 8;
  return (
    <Exit dur={dur}>
      <Label text="the good news" delay={2} />
      <div style={{ position: "absolute", left: 96, top: 330, display: "flex", gap: 26 }}>
        {PROBLEMS.map((p, i) => { const s = spring({ frame: frame - 6 - i * 5, fps, config: theme.spring.bouncy }); return <div key={i} style={{ width: 92, height: 92, borderRadius: 20, border: `2px solid ${theme.colors.line}`, background: theme.colors.panel, display: "grid", placeItems: "center", opacity: s, transform: `scale(${s})` }}><Tick size={46} color={theme.colors.text} /></div>; })}
      </div>
      <Headline lines={["Each one has a fix.", "Keep going."]} hi={["FIX"]} delay={36} y={560} size={120} width={1600} />
      <div style={{ position: "absolute", left: 96, top: 880, display: "flex", alignItems: "center", gap: 18, fontFamily: theme.fonts.mono, fontSize: 22, letterSpacing: ".16em", color: theme.colors.textDim, opacity: useSpring(60) }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `translateY(${arrow}px)` }}><path d="M12 4v16M5 13l7 7 7-7" /></svg>
        SIX FIXES BELOW
      </div>
    </Exit>
  );
};
