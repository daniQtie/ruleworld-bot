// Rule World Telegram bot on Cloudflare Workers (free plan, 2026-11-26). Replaces pipeline/controller.py on a server.
// Telegram sends every message/tap here (webhook). Quick things are answered here; heavy work starts a GitHub Actions
// workflow (make / upload / reconnect / stats) in env.REPO. Owner-only: every other chat is ignored.
// Bindings: KV (paused flag, the "waiting for notes" state). Secrets: BOT_TOKEN, OWNER_ID, GH_TOKEN, WEBHOOK_SECRET.
// Cron (wrangler.toml): 03:00, 13:00 UTC = 11:00, 21:00 PHT -> one new video each, unless paused.

const KB = { keyboard: [['🎬 New video', '📋 Status'], ['📊 Stats', '⏸ Pause', '▶️ Resume'], ['🔑 Reconnect YouTube', '❓ Help']],
  resize_keyboard: true, is_persistent: true };
const FORMAT_KB = { inline_keyboard: [
  [{ text: '🌍 Rule world', callback_data: 'new:rule' }, { text: '🔢 Choice', callback_data: 'new:choice' }],
  [{ text: '💪 Underdog', callback_data: 'new:underdog' }, { text: '🏫 School twist', callback_data: 'new:school' }],
  [{ text: '🎲 Any', callback_data: 'new:any' }]] };
const LABELS = { approve: '✅ Approve', revise: '✏️ Revise', reject: '❌ Reject' };
const MAX_WAITING = 4;
const HELP = `🎬 New video: make one now (you pick the format).
📋 Status: what is being made, what waits for you, the latest uploads.
📊 Stats: views and likes of the last 10 Shorts.
⏸ Pause / ▶️ Resume: stop or restart the automatic videos (11 AM, 9 PM). Approved videos still upload.
🔑 Reconnect YouTube: I send a code; open google.com/device on your phone and type it.

Under each video: ✅ uploads it to the next free slot (3 AM / 8 AM PHT), ✏️ + your notes (typed or voice) makes a new version, ❌ drops it.
A video takes about 30-60 min to make.`;

const phtNow = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 19) + '+08:00';

async function tg(env, method, params) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
  return r.json();
}
const say = (env, text, kb = KB) => tg(env, 'sendMessage', { chat_id: env.OWNER_ID, text, reply_markup: kb, disable_web_page_preview: true });

async function gh(env, path, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${env.REPO}${path}`, { ...opts, headers: {
    Authorization: `Bearer ${env.GH_TOKEN}`, Accept: opts.accept || 'application/vnd.github+json',
    'User-Agent': 'ruleworld-bot', 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
  if (!r.ok) throw new Error(`GitHub ${r.status} on ${path}: ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : (opts.accept ? r.text() : r.json());
}
const dispatch = (env, wf, inputs = {}) => gh(env, `/actions/workflows/${wf}/dispatches`, { method: 'POST', body: JSON.stringify({ ref: 'main', inputs }) });
const runCount = async (env, wf, status) => (await gh(env, `/actions/workflows/${wf}/runs?status=${status}&per_page=1`)).total_count;
// a run held back by the workflow's concurrency group is "pending", not "queued"
const inLine = async (env, wf) => (await runCount(env, wf, 'queued')) + (await runCount(env, wf, 'pending'));

async function episodes(env) {   // [{rel, info}] newest first; info = the JSON body written by pipeline/cloudjobs.py
  const out = [];
  for (const rel of await gh(env, '/releases?per_page=100')) {
    if (!rel.tag_name.startsWith('ep-')) continue;
    try { out.push({ rel, info: JSON.parse(rel.body || '{}') }); } catch { /* not ours */ }
  }
  return out;
}
const findEp = async (env, ep) => (await episodes(env)).find(e => e.info.ep === ep);
const saveEp = (env, { rel, info }) => gh(env, `/releases/${rel.id}`, { method: 'PATCH', body: JSON.stringify({
  name: `${info.status} · ${info.ep} · ${info.title || ''}`.slice(0, 120), body: JSON.stringify(info) }) });

// ---------- actions ----------
async function newVideo(env, fmt, auto = false) {
  if (await inLine(env, 'make.yml') > 0)
    return auto ? null : say(env, '⏳ One video is already waiting in line. Tap 🎬 again after it starts (see 📋 Status).');
  await dispatch(env, 'make.yml', { mode: 'new', format: fmt || 'any' });
  return say(env, `🎬 ${auto ? 'Auto video' : 'Making a new video'} (${fmt || 'any format'})… about 30-60 min. I'll send it here.`);
}

async function decide(env, action, ep, sha8, who) {
  const e = await findEp(env, ep);
  if (!e) return say(env, `⚠️ I can't find ${ep} in the cloud (it was made on the laptop). It can't be uploaded from here.`);
  if ((e.info.sha256 || '').slice(0, 8) !== sha8)
    return say(env, '⚠️ That button belongs to an OLDER version of this video. Use the buttons on the newest message.');
  if (e.info.status !== 'WAITING') return say(env, `ℹ️ ${ep} is already ${e.info.status}.`);
  if (action === 'approve') {
    e.info.status = 'APPROVED';
    e.info.decisions.push({ decision: 'approve', who, at: phtNow(), sha8 });
    await saveEp(env, e);
    await dispatch(env, 'upload.yml');
    return say(env, `✅ Approved ${ep}\nsha256 ${e.info.sha256.slice(0, 12)}… recorded. Uploading to the next free slot (about 3 min)…`);
  }
  await env.KV.put('awaiting', JSON.stringify({ ep, action, who, sha8 }), { expirationTtl: 86400 });
  return say(env, `${LABELS[action]}: ${ep}\nReply with your notes (what should change?). Typing or a voice message both work.`);
}

async function gotNotes(env, a, notes, voice) {
  await env.KV.delete('awaiting');
  const e = await findEp(env, a.ep);
  if (!e || e.info.status !== 'WAITING' || (e.info.sha256 || '').slice(0, 8) !== a.sha8)
    return say(env, `⚠️ ${a.ep} changed in the meantime; use the buttons on its newest message.`);
  e.info.status = a.action === 'revise' ? 'REVISE' : 'REJECTED';
  e.info.decisions.push({ decision: a.action, who: a.who, at: phtNow(), sha8: a.sha8, ...(notes ? { notes } : { voice }) });
  await saveEp(env, e);
  if (a.action === 'reject') {
    await dispatch(env, 'upload.yml');   // only logs the decision
    return say(env, `❌ Rejected ${a.ep}. Your notes are saved.`);
  }
  if (await inLine(env, 'make.yml') === 0) await dispatch(env, 'make.yml', { mode: 'revise', format: 'any' });
  return say(env, `✏️ Got your notes for ${a.ep}${voice ? ' (voice, I\'ll transcribe it)' : ''}. Making a new version… about 30-60 min.`);
}

async function status(env) {
  const paused = (await env.KV.get('paused')) === '1';
  const [busy, queued, pending, eps] = await Promise.all([gh(env, '/actions/runs?status=in_progress&per_page=10'),
    gh(env, '/actions/runs?status=queued&per_page=10'), gh(env, '/actions/runs?status=pending&per_page=10'), episodes(env)]);
  const runs = (...rs) => rs.flatMap(r => r.workflow_runs.map(x => x.name)).join(', ') || 'nothing';
  const waiting = eps.filter(e => e.info.status === 'WAITING').map(e => `• ${e.info.ep} ${e.info.title || ''}`.slice(0, 70));
  const other = eps.filter(e => ['APPROVED', 'REVISE', 'REVISING', 'FAILED', 'MISMATCH'].includes(e.info.status))
    .map(e => `• ${e.info.status} ${e.info.ep}`);
  let ups = 'none';
  try {
    const rows = parseCsv(await gh(env, '/contents/logs/uploads.csv', { accept: 'application/vnd.github.raw' }));
    const latest = new Map();
    rows.forEach((r, i) => latest.set(r.post_id || `row${i}`, r));
    ups = [...latest.values()].filter(r => r.platform === 'youtube' && r.post_id).slice(-6)
      .map(r => `• ${(r.scheduled_at_pht || '').slice(5, 16)} ${(r.title || r.video_id).slice(0, 45)}`).join('\n') || 'none';
  } catch { /* no uploads yet */ }
  return say(env, `${paused ? '⏸ PAUSED' : '▶️ Auto mode ON'} (makes videos at 11:00, 21:00 PHT)\n` +
    `Working now: ${runs(busy)}\nIn line: ${runs(queued, pending)}\n\n⏳ Waiting for your decision:\n${waiting.join('\n') || 'none'}` +
    (other.length ? `\n\n🔧 In progress:\n${other.join('\n')}` : '') + `\n\n📺 Latest uploads:\n${ups}`);
}

function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.length > 1);
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
}

async function onText(env, t) {
  t = (t || '').trim();
  if (['/start', '/help', '❓ Help'].includes(t)) await say(env, HELP);
  else if (['🎬 New video', '/new'].includes(t)) await say(env, 'Which format?', FORMAT_KB);
  else if (['📋 Status', '/status'].includes(t)) await status(env);
  else if (['📊 Stats', '/stats'].includes(t)) { await dispatch(env, 'stats.yml'); await say(env, '📊 Getting the numbers… about 1 min.'); }
  else if (['⏸ Pause', '/pause'].includes(t)) { await env.KV.put('paused', '1'); await say(env, '⏸ Auto mode paused. Approved videos still upload.'); }
  else if (['▶️ Resume', '/resume'].includes(t)) { await env.KV.put('paused', '0'); await say(env, '▶️ Auto mode on again.'); }
  else if (['🔑 Reconnect YouTube', '/reconnect'].includes(t)) await reconnect(env);
  else return false;
  return true;
}

async function reconnect(env) {
  await dispatch(env, 'reconnect.yml');
  await say(env, '🔑 Starting the YouTube sign-in… the code arrives here in about 1 min.');
}

async function handle(env, u) {
  const cb = u.callback_query, msg = u.message;
  const chat = cb ? cb.message?.chat?.id : msg?.chat?.id;
  if (String(chat) !== String(env.OWNER_ID)) return;
  if (cb) {
    await tg(env, 'answerCallbackQuery', { callback_query_id: cb.id });
    const data = cb.data || '';
    if (data.startsWith('new:')) return newVideo(env, data.slice(4));
    if (data === 'yt:reconnect') return reconnect(env);
    const [action, ...rest] = data.split(':');
    const sha8 = rest.pop(), ep = rest.join(':');
    if (LABELS[action] && ep) return decide(env, action, ep, sha8, cb.from.username || String(cb.from.id));
    return say(env, 'Unknown button.');
  }
  if (!msg) return;
  if (await onText(env, msg.text)) return;
  const a = JSON.parse((await env.KV.get('awaiting')) || 'null');
  if (a) {
    const voice = (msg.voice || msg.audio)?.file_id;
    const notes = (msg.text || '').trim();
    if (!notes && !voice) return say(env, "I couldn't read that. Please type your notes, or send a voice message.");
    return gotNotes(env, a, notes, voice);
  }
  return say(env, 'Use the buttons below. ❓ Help explains them.');
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') === env.WEBHOOK_SECRET && req.method === 'POST' && url.pathname === '/tg') {
      const u = await req.json();
      try { await handle(env, u); } catch (err) { await say(env, `⚠️ Bot error: ${String(err.message || err).slice(0, 300)}`); }
      return new Response('ok');   // always 200, or Telegram re-sends the same update
    }
    if (url.pathname === '/hello' && req.headers.get('X-Setup') === env.WEBHOOK_SECRET) {
      await say(env, '🤖 Rule World bot is online (Cloudflare + GitHub). ❓ Help shows what each button does.');
      return new Response('ok');
    }
    return new Response('Rule World bot', { status: 404 });
  },
  async scheduled(event, env) {
    try {
      if ((await env.KV.get('paused')) === '1') return;
      const waiting = (await episodes(env)).filter(e => e.info.status === 'WAITING').length;
      if (waiting >= MAX_WAITING) return say(env, `⏭ Skipped this auto video: ${waiting} videos still wait for your ✅/❌.`);
      await newVideo(env, 'any', true);
    } catch (err) { await say(env, `⚠️ Auto video failed to start: ${String(err.message || err).slice(0, 300)}`); }
  },
};
