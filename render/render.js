// Render a three.js scene page frame-by-frame in headless Edge and pipe the frames to ffmpeg.
// usage: node render.js <page.html[?query]> <out.mp4> <seconds> [fps]   (query string is passed through to the page)
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const [page, out, secs, fps = '30'] = process.argv.slice(2);
// Windows laptop: Edge + GPU. Linux server (Oracle, 2026-11-24): Chromium with SwiftShader (CPU WebGL). BROWSER env overrides.
const LINUX = process.platform === 'linux';
const EDGE = process.env.BROWSER || (LINUX ? ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/google-chrome'].find(f => fs.existsSync(f)) : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
const GPU_ARGS = LINUX ? ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.glb': 'model/gltf-binary' };

const root = __dirname, outRoot = path.join(__dirname, '..', 'output');
// serves render/ at /, and the episode folders (shotspec.json) read-only at /output/
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const base = u.startsWith('/output/') ? outRoot : root;
  const f = path.join(base, base === outRoot ? u.slice('/output/'.length) : u);
  if (!f.startsWith(base + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0, '127.0.0.1');

(async () => {
  await new Promise(r => server.listening ? r() : server.once('listening', r));
  const port = server.address().port;
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new',
    args: [...GPU_ARGS, `--window-size=${process.env.VW||1080},${process.env.VH||1920}`] });
  const tab = await browser.newPage();
  tab.on('pageerror', e => console.error('page error:', e.message));
  await tab.setViewport({ width: +(process.env.VW||1080), height: +(process.env.VH||1920) });
  await tab.goto(`http://127.0.0.1:${port}/${page}`);
  await tab.waitForFunction('window.ready === true', { timeout: 60000 });
  if (out.endsWith('.png')) {   // stills mode: <secs> = comma-separated times -> one side-by-side contact strip (half size)
    const ts = secs.split(',').map(Number);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-i', '-', '-vf', ts.length > 1 ? `scale=540:960,tile=${ts.length}x1` : `scale=${process.env.VW||1080}:${process.env.VH||1920}`, '-frames:v', '1', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (const t of ts) ff.stdin.write(Buffer.from((await tab.evaluate(t => window.renderFrame(t), t)).split(',')[1], 'base64'));
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('stills ->', out);
    await browser.close(); server.close(); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(+secs * +fps), t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const url = await tab.evaluate(t => window.renderFrame(t), i / +fps);
    ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(`rendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${out}`);
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
