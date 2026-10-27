import React from "react";
import { Composition, Sequence, AbsoluteFill, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Stack } from "./fx";
import { Intro, Website, Content, Search, Brand, Replies, Focus, Outro } from "./scenes";
import { FixFilm, FIXES } from "./fixes";
import { WhyFilm, WHY_DUR } from "./why";

loadFont({ family: "Bricolage", url: staticFile("fonts/bricolage.woff2"), weight: "200 800" });
loadFont({ family: "Manrope", url: staticFile("fonts/manrope.woff2"), weight: "500" });
loadFont({ family: "GeistMono", url: staticFile("fonts/geistmono.woff2"), weight: "500" });

const FPS = 30, INTRO = 120, SCENE = 180, OUTRO = 90;
const scenes = [Website, Content, Search, Brand, Replies, Focus];
export const TOTAL = INTRO + SCENE * scenes.length + OUTRO;

const Problems: React.FC = () => (
  <Stack>
    <AbsoluteFill style={{ fontFamily: "Manrope" }}>
      <Sequence from={0} durationInFrames={INTRO}><Intro dur={INTRO} /></Sequence>
      {scenes.map((S, i) => <Sequence key={i} from={INTRO + i * SCENE} durationInFrames={SCENE}><S dur={SCENE} /></Sequence>)}
      <Sequence from={INTRO + SCENE * scenes.length} durationInFrames={OUTRO}><Outro dur={OUTRO} /></Sequence>
    </AbsoluteFill>
  </Stack>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Problems" component={Problems} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    {FIXES.map(f => <Composition key={f.n} id={"Fix" + f.n} component={FixFilm} durationInFrames={390} fps={FPS} width={1080} height={1350} defaultProps={{ spec: f }} />)}
    <Composition id="Why" component={WhyFilm} durationInFrames={WHY_DUR} fps={FPS} width={1080} height={1350} />
  </>
);
