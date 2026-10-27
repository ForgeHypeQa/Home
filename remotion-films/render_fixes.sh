#!/bin/bash
BR=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
rm -f out/render_all.log
for i in 1 2 3 4 5 6; do
  npx remotion render src/index.ts Fix$i out/fix$i.mp4 --codec h264 --crf 20 --concurrency 2 --overwrite --browser-executable="$BR" > out/render_fix$i.log 2>&1
  ffmpeg -y -loglevel error -i out/fix$i.mp4 -vf scale=864:1080 -an -c:v libx264 -preset veryfast -crf 25 -pix_fmt yuv420p -movflags +faststart out/fix$i-web.mp4
  ffmpeg -y -loglevel error -ss 4 -i out/fix$i.mp4 -vframes 1 -vf scale=864:1080 -q:v 4 out/fix$i-poster.jpg
  echo "done $i" >> out/render_all.log
done
