// S-51 checks: download, upload as downloaded, file name, photo path, key handling. Stubbed fetch, dummy key.
// Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { uploadPhoto } = require('../upload-photo');

const KEY = 'dummy-key-123';
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([1, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
const reply = (body, { status = 200, type } = {}) => ({
  ok: status < 400, status, headers: { get: () => type || null },
  arrayBuffer: async () => { const b = Buffer.from(body); return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); },
  text: async () => (Buffer.isBuffer(body) ? body.toString() : String(body)),
});
function stub(photo, { up = reply('{}'), patch = reply('[{"id":7}]') } = {}) {
  const calls = [];
  const fn = async (url, opts = {}) => {
    calls.push({ url, opts });
    if (url.startsWith('https://src.example')) return photo;
    if (url.includes('/storage/v1/')) return up;
    return patch;
  };
  return { fn, calls };
}
const args = { name: 'French Toast', photoUrl: 'https://src.example/p', recipeId: 7 };

test('S-51.1/2/3/4/6 downloads, uploads the same bytes as .jpg, sets photo path, uses the key', async () => {
  const s = stub(reply(JPEG, { type: 'image/jpeg' }));
  const out = await uploadPhoto(args, KEY, s.fn);
  assert.deepStrictEqual(out, { ok: true, file: 'French Toast.jpg' });
  assert.strictEqual(s.calls[0].url, 'https://src.example/p');
  const up = s.calls[1];
  assert.ok(up.url.endsWith('/storage/v1/object/recipe-photos/French%20Toast.jpg'));
  assert.ok(Buffer.from(up.opts.body).equals(JPEG));
  assert.strictEqual(up.opts.headers.Authorization, 'Bearer ' + KEY);
  assert.strictEqual(up.opts.headers['Content-Type'], 'image/jpeg');
  const p = s.calls[2];
  assert.ok(p.url.endsWith('/rest/v1/recipe?id=eq.7'));
  assert.deepStrictEqual(JSON.parse(p.opts.body), { photo_path: 'French Toast.jpg' });
});

test('S-51.3 extension follows the downloaded type, even when the address says otherwise', async () => {
  const s = stub(reply(WEBP, { type: 'image/jpeg' }));
  const out = await uploadPhoto({ ...args, photoUrl: 'https://src.example/p.jpg' }, KEY, s.fn);
  assert.strictEqual(out.file, 'French Toast.webp');
});

test('S-51.5 no source address is sent to the database', async () => {
  const s = stub(reply(JPEG, { type: 'image/jpeg' }));
  await uploadPhoto(args, KEY, s.fn);
  assert.ok(!s.calls[2].opts.body.includes('src.example'));
});

test('download failure or non-image uploads nothing', async () => {
  for (const photo of [reply('no', { status: 404 }), reply('<html>', { type: 'text/html' })]) {
    const s = stub(photo);
    const out = await uploadPhoto(args, KEY, s.fn);
    assert.strictEqual(out.ok, false);
    assert.strictEqual(s.calls.length, 1);
  }
});

test('upload failure leaves the photo path alone and the key out of the message', async () => {
  const s = stub(reply(JPEG, { type: 'image/jpeg' }), { up: reply('bad ' + KEY, { status: 403 }) });
  const out = await uploadPhoto(args, KEY, s.fn);
  assert.strictEqual(out.ok, false);
  assert.ok(!out.why.includes(KEY));
  assert.strictEqual(s.calls.length, 2);
});

test('S-51.6 no key means no calls', async () => {
  const s = stub(reply(JPEG, { type: 'image/jpeg' }));
  const out = await uploadPhoto(args, undefined, s.fn);
  assert.strictEqual(out.ok, false);
  assert.strictEqual(s.calls.length, 0);
});

test('S-51.7/8 script never prints the key and writes no file', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'upload-photo.js'), 'utf8');
  assert.ok(!/writeFile|createWriteStream/.test(src));
  assert.ok(!/console\.log\([^)]*key/.test(src));
});

test('skill names the script in the Photo section', () => {
  const s = fs.readFileSync(path.join(__dirname, '..', '..', '.claude/skills/recipe-extract/SKILL.md'), 'utf8');
  assert.ok(s.includes('node supabase/upload-photo.js'));
});

// ---- extra coverage: key never leaks; no file saved; script run end to end with a stubbed fetch ----
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const SCRIPT = path.join(__dirname, '..', 'upload-photo.js');
const ROOT = path.join(__dirname, '..', '..');

function runScript(mode, argv = ['French Toast', 'https://src.example/p', '7']) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's51-'));
  const pre = path.join(dir, 'pre.js');
  fs.writeFileSync(pre, `
    const jpeg = Buffer.from([0xff,0xd8,0xff,0xe0,1,2,3]);
    const mode = ${JSON.stringify(mode)};
    const key = process.env.SUPABASE_SERVICE_KEY;
    globalThis.fetch = async (url, o = {}) => {
      const r = (body, status = 200, type) => ({ ok: status < 400, status, headers: { get: () => type || null },
        arrayBuffer: async () => { const b = Buffer.from(body); return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); },
        text: async () => String(body) });
      if (url.startsWith('https://src.example')) { if (mode === 'dl-throw') throw new Error('network down ' + key); return r(jpeg, 200, 'image/jpeg'); }
      if (url.includes('/storage/')) { if (mode === 'up-403') return r('denied ' + key, 403); if (mode === 'up-throw') throw new Error('boom ' + key); return r('{}'); }
      if (mode === 'patch-500') return r('server ' + key, 500);
      return r('[{"id":7}]');
    };`);
  const res = spawnSync(process.execPath, ['-r', pre, SCRIPT, ...argv], {
    cwd: ROOT, encoding: 'utf8', env: { ...process.env, SUPABASE_SERVICE_KEY: KEY },
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return res;
}

test('S-51.7 dummy key never appears in printed output on success or any failure', () => {
  for (const mode of ['ok', 'dl-throw', 'up-403', 'up-throw', 'patch-500']) {
    const r = runScript(mode);
    assert.ok(!r.stdout.includes(KEY), mode + ' stdout');
    assert.ok(!r.stderr.includes(KEY), mode + ' stderr');
    assert.strictEqual(r.status, mode === 'ok' ? 0 : 1, mode + ' exit');
  }
  const ok = runScript('ok');
  assert.strictEqual(ok.stdout.trim(), 'PHOTO UPLOADED French Toast.jpg');
});

test('S-51.7 dummy key is removed from errors returned by uploadPhoto (download, upload, patch)', async () => {
  const boom = () => { throw new Error('x ' + KEY); };
  const jpeg = reply(JPEG, { type: 'image/jpeg' });
  const cases = [
    async () => boom(),
    async (u) => (u.startsWith('https://src.example') ? jpeg : boom()),
    async (u) => (u.startsWith('https://src.example') ? jpeg : u.includes('/storage/') ? reply('{}') : reply('bad ' + KEY, { status: 500 })),
  ];
  for (const fn of cases) {
    const out = await uploadPhoto(args, KEY, fn);
    assert.strictEqual(out.ok, false);
    assert.ok(!out.why.includes(KEY));
  }
});

test('S-51.7 script and skill take the key from the environment only, never in an argument or file', () => {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  assert.ok(/process\.env\.SUPABASE_SERVICE_KEY/.test(src));
  assert.ok(!/readFile|\.env\b/.test(src.replace(/process\.env/g, '')), 'no file read of a key');
  assert.ok(!/eyJ[A-Za-z0-9_-]{20,}|sb_secret_/.test(src), 'no key written in the script');
  const r = runScript('ok');
  assert.ok(!/SUPABASE_SERVICE_KEY/.test(r.stdout + r.stderr));
});

test('S-51.8 a run saves nothing in images/ or anywhere in the repo', () => {
  const snap = () => spawnSync('git', ['status', '--porcelain', '--untracked-files=all', 'images'], { cwd: ROOT, encoding: 'utf8' }).stdout;
  const listing = () => fs.readdirSync(path.join(ROOT, 'images')).sort().join('|');
  const before = [snap(), listing()];
  runScript('ok');
  assert.deepStrictEqual([snap(), listing()], before);
});

test('S-51.5 database call sends only photo_path (no address field), after upload', async () => {
  const s = stub(reply(JPEG, { type: 'image/jpeg' }));
  await uploadPhoto(args, KEY, s.fn);
  assert.deepStrictEqual(Object.keys(JSON.parse(s.calls[2].opts.body)), ['photo_path']);
  assert.ok(s.calls[1].url.includes('/storage/') && s.calls[2].url.includes('/rest/v1/recipe'));
});

test('S-51.3 other types and a slash in the name', async () => {
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
  const s = stub(reply(PNG, { type: 'image/png' }));
  const out = await uploadPhoto({ ...args, name: 'Mac/Cheese' }, KEY, s.fn);
  assert.strictEqual(out.file, 'Mac-Cheese.png');
});
