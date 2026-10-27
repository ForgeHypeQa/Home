import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#000000",
    bgAlt: "#0d0c0b",
    primary: "#e8702a", // ForgeHype orange (video-safe, a touch brighter than the site's #d9682e)
    text: "#f4efe9",
    textDim: "#a8a099",
    line: "rgba(255,255,255,0.12)",
    panel: "#141210",
    panel2: "#1d1a17",
    screen: "#f6f2ec",
    ink: "#14110f",
    glow: "rgba(232,112,42,0.35)",
  },
  fonts: {
    display: "Bricolage",
    body: "Manrope",
    mono: "GeistMono",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
} as const;
