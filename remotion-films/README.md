# Six problems film (Remotion)

Source of `forgehype-qa/assets/video/six-problems.mp4` (16:9, 30 fps, 43 s, silent).

```bash
npm install
npx remotion render src/index.ts Problems out/problems.mp4 --codec h264 --crf 20
ffmpeg -i out/problems.mp4 -vf scale=1280:720 -an -c:v libx264 -preset veryfast -crf 25 -pix_fmt yuv420p -movflags +faststart ../forgehype-qa/assets/video/six-problems.mp4
```

Timing: 4 s intro, 6 s per problem, 3 s outro. The chapter row on the page (`main.js`) follows this timing.
Edit the words in `src/scenes.tsx`; colours and fonts in `src/theme.ts`.
