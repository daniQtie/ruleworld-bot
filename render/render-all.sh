#!/bin/bash
# usage: bash render/render-all.sh <ep> [shots...]  -> output/<ep>/clips/sNN.mp4 at each shot's dur
cd "$(dirname "$0")"; EP=$1; shift; mkdir -p "../output/$EP/clips"
SHOTS=${@:-$(node -e "console.log(require('../output/$EP/shotspec.json').shots.map(s=>s.line).join(' '))")}
for n in $SHOTS; do
  d=$(node -e "console.log(require('../output/$EP/shotspec.json').shots.find(s=>s.line==$n).dur)")
  node render.js "story.html?ep=$EP&shot=$n" "../output/$EP/clips/s$(printf %02d $n).mp4" "$d" 30 || echo "FAILED $n"
done
