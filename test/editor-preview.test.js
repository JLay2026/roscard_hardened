// Editor preview sinks must never load or persist an off-origin image.
//
// Covers CodeQL js/xss-through-dom at the editor preview setters. The guard now
// lives inside the setters rather than depending on the blur validator running
// first, so a legacy config (or hand-edited YAML) carrying an external URL is
// rejected at render time too — and says why.
//   ROSCARD_BUNDLE=/path/to/RosCard.js node test/editor-preview.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const BUNDLE = process.env.ROSCARD_BUNDLE || path.join(__dirname, '..', 'dist', 'RosCard.js');
if (!fs.existsSync(BUNDLE)) {
  console.error(`bundle not found: ${BUNDLE}`);
  process.exit(2); // a missing input must never look like a pass
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' :: ' + detail : ''}`); }
}

function editor(tag, config) {
  const dom = new JSDOM('<!doctype html><body>', {
    url: 'https://ha.local/', pretendToBeVisual: true, runScripts: 'outside-only'
  });
  const w = dom.window;
  w.requestAnimationFrame = cb => setTimeout(() => cb(1), 0);
  vm.runInContext(fs.readFileSync(BUNDLE, 'utf8'), vm.createContext(w), { filename: 'RosCard.js' });
  const saved = [];
  const hass = {
    states: {
      'media_player.great_room': { entity_id: 'media_player.great_room', state: 'idle',
        attributes: { friendly_name: 'Great Room' } },
      'scene.firepit': { entity_id: 'scene.firepit', state: 'unknown',
        attributes: { friendly_name: 'Firepit' } }
    },
    language: 'en', auth: { data: { access_token: 'FAKE' } },
    callService: () => Promise.resolve(), formatEntityState: s => String(s && s.state),
    connection: { subscribeEvents: () => Promise.resolve(() => {}) },
    localize: k => k, themes: {}, user: { is_admin: true }
  };
  const El = w.customElements.get(tag);
  if (!El) return { err: `${tag} not registered` };
  const el = new El();
  try {
    el.setConfig(config);
    el.addEventListener('config-changed', e => saved.push(JSON.stringify(e.detail && e.detail.config)));
    w.document.body.appendChild(el);
    el.hass = hass;
  } catch (e) { return { err: e.message }; }
  return { el, w, saved };
}

const EXT = 'https://evil.example/legacy.png';
const REJECTED = /Local paths only|仅支持本地路径/;
const imgSrcs = el => [...el.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(Boolean);

// Substring matching is not an origin check: 'https://ha.local.evil.com/x.png'
// and '//evil.example/x.png' both survive a startsWith('https://ha.local')
// test, so the suite would have reported "no off-origin images" for a bundle
// loading from an attacker-controlled host. Parse and compare origins.
const ORIGIN = 'https://ha.local';
const offOrigin = el => imgSrcs(el).filter(s => {
  try { return new URL(s, ORIGIN).origin !== ORIGIN; }
  catch { return true; }
});

console.log('\n=== editor previews reject off-origin images ===');

// POSITIVE CASES FIRST. A suite of only negative assertions cannot tell an
// effective guard from one that broke previews outright — both look green.
{
  const { el, err } = editor('aiks-tv-card-editor', {
    type: 'custom:aiks-tv-card', entity: 'media_player.great_room',
    tv_name: 'TV', entities: [], background_path: '/local/bg.png'
  });
  const srcs = el ? imgSrcs(el) : [];
  check('tv editor still previews a local path',
    !err && srcs.includes('https://ha.local/local/bg.png'), err || JSON.stringify(srcs));
}
{
  const { el, err } = editor('aiks-scene-card-editor', {
    type: 'custom:aiks-scene-card',
    entities: [{ entity_id: 'scene.firepit', image_path: '/local/s.png' }]
  });
  const srcs = el ? imgSrcs(el) : [];
  check('scene editor still previews a local path',
    !err && srcs.includes('https://ha.local/local/s.png'), err || JSON.stringify(srcs));
}

// legacy TV/host config already carrying an external background
{
  const { el, err } = editor('aiks-tv-card-editor', {
    type: 'custom:aiks-tv-card', entity: 'media_player.great_room',
    tv_name: 'TV', entities: [], background_path: EXT
  });
  check('tv editor renders with legacy external config', !err && !!el, err);
  const bad = el ? offOrigin(el) : ['<no element>'];
  check('tv editor preview does not load the external image', bad.length === 0, bad.join(','));
}

// legacy scene config already carrying an external image_path
{
  const { el, err } = editor('aiks-scene-card-editor', {
    type: 'custom:aiks-scene-card',
    entities: [{ entity_id: 'scene.firepit', image_path: EXT }]
  });
  check('scene editor renders with legacy external config', !err && !!el, err);
  const bad = el ? offOrigin(el) : ['<no element>'];
  check('scene editor preview does not load the external image', bad.length === 0, bad.join(','));
}

// typing an external URL must neither preview nor persist
{
  const { el, w, saved, err } = editor('aiks-tv-card-editor', {
    type: 'custom:aiks-tv-card', entity: 'media_player.great_room',
    tv_name: 'TV', entities: []
  });
  if (err) {
    check('typed external URL rejected', false, err);
    check('typed external URL never persisted', false, err);
  } else {
    const input = [...el.querySelectorAll('input[type=text]')]
      .filter(i => /image|图片/i.test(i.placeholder || ''))[0];
    if (!input) {
      check('typed external URL rejected', false, 'image path input not found');
      check('typed external URL never persisted', false, 'image path input not found');
    } else {
      input.value = EXT;
      input.dispatchEvent(new w.Event('blur', { bubbles: true }));
      check('typed external URL rejected', offOrigin(el).length === 0, offOrigin(el).join(','));
      check('typed external URL never persisted',
        !saved.some(s => s.includes('evil.example')), saved.join(' | '));
    }
  }
}

// A blank preview with no explanation is the same failure mode as the old
// "Valid Link" bug, inverted: the editor showing the user something that does
// not match reality. A legacy external value must say why it was rejected —
// and must do so on render, not only after the user expands the section.
{
  const { el, err } = editor('aiks-tv-card-editor', {
    type: 'custom:aiks-tv-card', entity: 'media_player.great_room',
    tv_name: 'TV', entities: [], background_path: EXT
  });
  check('tv editor explains why a legacy external path was rejected',
    !err && REJECTED.test(el ? el.textContent || '' : ''), err || 'no rejection notice rendered');
}
{
  const { el, err } = editor('aiks-scene-card-editor', {
    type: 'custom:aiks-scene-card',
    entities: [{ entity_id: 'scene.firepit', image_path: EXT }]
  });
  check('scene editor explains why a legacy external path was rejected',
    !err && REJECTED.test(el ? el.textContent || '' : ''), err || 'no rejection notice rendered');
}

// ...and a valid local path must NOT be labelled as rejected.
{
  const { el } = editor('aiks-tv-card-editor', {
    type: 'custom:aiks-tv-card', entity: 'media_player.great_room',
    tv_name: 'TV', entities: [], background_path: '/local/bg.png'
  });
  check('local path shows no rejection notice',
    !REJECTED.test(el ? el.textContent || '' : ''), 'local path wrongly flagged as rejected');
}

// The render path has always encoded its URLs; the editor previews did not.
// A local path containing a space produced a raw, unencoded src. Same origin
// either way, but the inconsistency is the kind that hides bugs.
{
  const { el, err } = editor('aiks-tv-card-editor', {
    type: 'custom:aiks-tv-card', entity: 'media_player.great_room',
    tv_name: 'TV', entities: [], background_path: '/local/my photo.png'
  });
  const srcs = el ? imgSrcs(el) : [];
  check('tv editor percent-encodes a local path',
    !err && srcs.includes('https://ha.local/local/my%20photo.png'), err || JSON.stringify(srcs));
}
{
  const { el, err } = editor('aiks-scene-card-editor', {
    type: 'custom:aiks-scene-card',
    entities: [{ entity_id: 'scene.firepit', image_path: '/local/my photo.png' }]
  });
  const srcs = el ? imgSrcs(el) : [];
  check('scene editor percent-encodes a local path',
    !err && srcs.includes('https://ha.local/local/my%20photo.png'), err || JSON.stringify(srcs));
}

console.log(`\n================ ${pass} passed, ${fail} failed ================`);
process.exit(fail ? 1 : 0);
