# Writer lessons (the script writer reads this before every script)

The owner asked on 2026-11-24 that the writer "learn from its mistakes" so scripts never repeat the same problems. `pipeline/writer.py` puts every line under **Lessons** into the Gemini prompt.

New lessons are added by themselves from:
- every ✏️ Revise note the owner sends in Telegram;
- every check the validator failed more than once.

Keep each lesson to one short line. Newest at the bottom.

## Lessons
- The first spoken line IS the title hook. Never open with greetings or "Hey guys".
- Never start a line with a surprised tag. It made a noise burst ("crash") at 7 s.
- Use simple, common names that speech recognition hears right (no odd spellings like "Kade"). Write numbers as words.
- Emotion must be audible and fit the line: sad lines soft and slower, shock lines louder, happy lines brighter. Never a happy tag on a sad line.
- Every line must show something new on screen. Never two lines that only repeat the same idea.
- The ending loops back to the first line. Choice videos end with the subscribe-and-comment line instead.
- 25–40 s unless the owner asks for a longer story; when longer, still cut every line that does not move the story.
- Nothing may be copied word-for-word from a competitor. Keep the premise and change names, details, wording and the object of the joke.
- Pauses only where needed (a reveal, a realisation, a change of speaker), short (0.15–0.3 s).
- Show the stimulus first, then the reaction (what the character sees comes before their face).
- 2026-11-25: Owner rejected stories 18-20 as pointless with no hook: never ship a soft "Before you…" or "Nobody tells you…" opener or a moral-lesson ending; line 1 must shock or promise something concrete, and the twist must be surprising AND make sense.
- 2026-11-25: Owner: endings felt cut and the plot unclear. State the twist in plain words ("he was my dad"), explain the backstory, add a 3-5 line resolution; 60-90 s (up to 2 min) is fine; tail_hold >= 2.5 s.
