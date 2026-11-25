#!/bin/bash
# usage: bash render/stills.sh <ep> <shot...>   -> output/<ep>/stills/sNN.png (3 frames: 15%, 55%, 95% of the shot)
cd "$(dirname "$0")"; EP=$1; shift
for n in "$@"; do
  ts=$(node -e "const s=require('../output/$EP/shotspec.json').shots.find(s=>s.line==$n);console.log([.15,.55,.95].map(f=>(f*s.dur).toFixed(2)).join(','))")
  node render.js "story.html?ep=$EP&shot=$n" "../output/$EP/stills/s$(printf %02d $n).png" "$ts" 2>&1 | grep -v '^stills'
done
