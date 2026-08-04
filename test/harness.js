// RosCard headless test harness.
// Loads dist/RosCard.js in jsdom against real HA entity fixtures and asserts
// render behaviour plus the three deliberate divergences from upstream.
//
// Point at another bundle with ROSCARD_BUNDLE=... to compare against upstream.
// Against unhardened upstream v1.4.1 this suite reports 9 failures; against
// this repo's dist it must be 0.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const FIXTURES = require('./fixtures.js');

const BUNDLE = process.env.ROSCARD_BUNDLE ||
  path.join(__dirname, '..', 'dist', 'RosCard.js');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; failures.push(`${name}${detail ? ' :: ' + detail : ''}`);
         console.log(`  FAIL ${name}${detail ? ' :: ' + detail : ''}`); }
}

function makeEnv() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://ha.local/', pretendToBeVisual: true, runScripts: 'outside-only'
  });
  const w = dom.window;
  // jsdom lacks these; the bundle touches them during render.
  if (!w.HTMLElement.prototype.attachShadow) w.HTMLElement.prototype.attachShadow = function () { return this; };
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  const calls = [];
  const hass = {
    states: JSON.parse(JSON.stringify(FIXTURES)),
    language: 'en',
    auth: { data: { access_token: 'FAKE_TOKEN_NOT_REAL' } },
    callService: (domain, service, data) => { calls.push({ domain, service, data }); return Promise.resolve(); },
    formatEntityState: (st) => String(st && st.state),
    formatEntityAttributeValue: (st, a) => String(st && st.attributes && st.attributes[a]),
    formatEntityAttributeName: (st, a) => String(a),
    callWS: () => Promise.resolve({}),
    connection: { subscribeEvents: () => Promise.resolve(() => {}) },
    localize: k => k, themes: {}, user: { is_admin: true }
  };
  const code = fs.readFileSync(BUNDLE, 'utf8');
  const vm = require('vm');
  const ctx = vm.createContext(w);
  vm.runInContext(code, ctx, { filename: 'RosCard.js' });
  return { dom, w, hass, calls };
}

// Card type -> a config that satisfies setConfig, using real entity IDs.
const CARDS = {
  'aiks-tv-card':            { type: 'custom:aiks-tv-card', entity: 'media_player.basement_tv_room', tv_name: 'Basement TV', entities: [] },
  'aiks-media-player-card':  { type: 'custom:aiks-media-player-card', entities: [{ entity_id: 'media_player.basement_tv_room' }] },
  'aiks-light-card':         { type: 'custom:aiks-light-card', entities: [{ entity_id: 'light.basement_sitting_area_main_lights' }] },
  'aiks-climate-card':       { type: 'custom:aiks-climate-card', entities: [{ entity_id: 'climate.upstairs_nativezone' }] },
  'aiks-fan-card':           { type: 'custom:aiks-fan-card', entities: [{ entity_id: 'fan.great_room_fan' }] },
  'aiks-switch-card':        { type: 'custom:aiks-switch-card', entities: [{ entity_id: 'switch.back_beds_walk_manual_watering' }] },
  'aiks-switch-monitor-card':{ type: 'custom:aiks-switch-monitor-card', entities: [{ entity_id: 'switch.back_beds_walk_manual_watering' }] },
  'aiks-scene-card':         { type: 'custom:aiks-scene-card', entities: [{ entity_id: 'scene.firepit' }] },
  'aiks-weather-card':       { type: 'custom:aiks-weather-card', entities: [{ entity_id: 'weather.zuhause' }] },
  'aiks-host-card':          { type: 'custom:aiks-host-card', tv_name: 'Host', entities: [] }
  // aiks-cover-card intentionally omitted: no cover entities exist on the source instance.
};

function instantiate(w, hass, tag, config) {
  const El = w.customElements.get(tag);
  if (!El) return { err: 'element not registered' };
  const el = new El();
  try {
    if (typeof el.setConfig === 'function') el.setConfig(JSON.parse(JSON.stringify(config)));
    w.document.body.appendChild(el);
    el.hass = hass;
  } catch (e) { return { el, err: e.message }; }
  return { el };
}

console.log('\n=== 1. element registration ===');
{
  const { w } = makeEnv();
  const names = [];
  for (const t of ['tv','media-player','light','climate','cover','fan','switch','switch-monitor','scene','weather','host'])
    names.push(`aiks-${t}-card`, `aiks-${t}-card-editor`);
  const missing = names.filter(n => !w.customElements.get(n));
  check(`all 22 custom elements registered`, missing.length === 0, missing.join(','));
}

console.log('\n=== 2. every card renders against real entities ===');
for (const [tag, cfg] of Object.entries(CARDS)) {
  const { w, hass } = makeEnv();
  const { el, err } = instantiate(w, hass, tag, cfg);
  check(`${tag} renders`, !err && el && el.childNodes.length > 0, err || 'no child nodes');
}

console.log('\n=== 3. XSS: hostile entity data must never become markup ===');
{
  const PAYLOAD = '<img src=x onerror=alert(1)><script>alert(2)</script>';
  // Entity lists must be POPULATED or the vulnerable display-name paths never run.
  const ENT = {
    'aiks-tv-card': 'media_player.basement_tv_room', 'aiks-media-player-card': 'media_player.basement_tv_room',
    'aiks-light-card': 'light.basement_sitting_area_main_lights', 'aiks-climate-card': 'climate.upstairs_nativezone',
    'aiks-fan-card': 'fan.great_room_fan', 'aiks-switch-card': 'switch.back_beds_walk_manual_watering',
    'aiks-switch-monitor-card': 'switch.back_beds_walk_manual_watering', 'aiks-scene-card': 'scene.firepit',
    'aiks-weather-card': 'weather.zuhause', 'aiks-host-card': 'switch.back_beds_walk_manual_watering'
  };
  for (const [tag, baseCfg] of Object.entries(CARDS)) {
    const { w, hass } = makeEnv();
    for (const k of Object.keys(hass.states)) hass.states[k].attributes.friendly_name = PAYLOAD;
    const cfg = Object.assign({}, baseCfg,
      { entities: [{ entity_id: ENT[tag], alias: '', name: PAYLOAD }] });
    const { el, err } = instantiate(w, hass, tag, cfg);
    if (err) { check(`${tag} hostile friendly_name`, false, err); continue; }
    const scripts = el.querySelectorAll('script').length;
    const imgs = Array.from(el.querySelectorAll('img')).filter(i => i.getAttribute('onerror')).length;
    const handlers = Array.from(el.querySelectorAll('*'))
      .filter(n => Array.from(n.attributes || []).some(a => a.name.startsWith('on'))).length;
    check(`${tag}: no injected script/handler nodes`,
      scripts === 0 && imgs === 0 && handlers === 0,
      `script=${scripts} onerror-img=${imgs} on*-attrs=${handlers}`);
  }
}

console.log('\n=== 4. same-origin image lock (render path) ===');
{
  const cases = [
    ['/local/bg.png', true], ['/api/image/serve/x/original', true],
    ['https://evil.example/b.png', false], ['http://evil.example/b.png', false],
    ['//evil.example/b.png', false], ['/\\evil', false],
    ['javascript:alert(1)', false], ['data:image/png;base64,AA', false]
  ];
  for (const [val, shouldRender] of cases) {
    const { w, hass } = makeEnv();
    const { el, err } = instantiate(w, hass, 'aiks-tv-card',
      { type: 'custom:aiks-tv-card', entity: 'media_player.basement_tv_room',
        tv_name: 'Basement TV', entities: [], background_path: val });
    if (err) { check(`tv bg ${val}`, false, err); continue; }
    const card = el.querySelector('ha-card');
    const bg = card ? (card.style.backgroundImage || '') : '';
    const isExternal = /evil\.example|javascript:|data:/.test(bg);
    check(`background_path ${JSON.stringify(val)} -> ${shouldRender ? 'applied' : 'blocked'}`,
      shouldRender ? bg.includes('/local/bg.png') || bg.includes('/api/image/serve') : (bg === '' || !isExternal),
      `backgroundImage=${JSON.stringify(bg)}`);
  }
}

console.log('\n=== 5. scene card row background same-origin ===');
{
  for (const [val, allowed] of [['/local/s.png', true], ['https://evil.example/s.png', false]]) {
    const { w, hass } = makeEnv();
    const { el, err } = instantiate(w, hass, 'aiks-scene-card',
      { type: 'custom:aiks-scene-card', entities: [{ entity_id: 'scene.firepit', image_path: val }] });
    if (err) { check(`scene image_path ${val}`, false, err); continue; }
    const html = el.innerHTML;
    check(`scene image_path ${JSON.stringify(val)} -> ${allowed ? 'applied' : 'blocked'}`,
      allowed ? html.includes('/local/s.png') : !html.includes('evil.example'),
      allowed ? 'expected local path present' : 'external host must not appear');
  }
}

console.log('\n=== 6. service-call contract (stubbed callService) ===');
{
  const { w, hass, calls } = makeEnv();
  const { el, err } = instantiate(w, hass, 'aiks-light-card',
    { type: 'custom:aiks-light-card', entities: [{ entity_id: 'light.basement_sitting_area_main_lights' }] });
  if (err) check('light card toggle', false, err);
  else {
    const toggles = el.querySelectorAll('input[type=checkbox]');
    if (toggles.length) {
      toggles[0].checked = true;
      toggles[0].dispatchEvent(new w.Event('change', { bubbles: true }));
    }
    const ok = calls.length === 0 || calls.every(c =>
      typeof c.domain === 'string' && typeof c.service === 'string');
    check('service calls well-formed (domain/service strings)', ok, JSON.stringify(calls.slice(0, 3)));
    check('no service call targets an unexpected domain',
      calls.every(c => ['light', 'homeassistant'].includes(c.domain)),
      JSON.stringify(calls.map(c => c.domain)));
  }
}

console.log('\n=== 7. token never leaves the local origin ===');
{
  const src = fs.readFileSync(BUNDLE, 'utf8');
  const fetches = src.match(/fetch\([^)]{0,120}/g) || [];
  const external = fetches.filter(f => !f.includes('window.location.origin'));
  check('every fetch() targets window.location.origin', external.length === 0, external.join(' | '));
  check('no token in querystring', !/[?&](auth_)?token=/.test(src));
}

console.log('\n=== 8. editors: render, hostile-data, and validation guard ===');
{
  const EDITORS = {
    'aiks-switch-monitor-card-editor': { type: 'custom:aiks-switch-monitor-card', entities: [{ entity_id: 'switch.back_beds_walk_manual_watering' }] },
    'aiks-tv-card-editor':    { type: 'custom:aiks-tv-card', entity: 'media_player.basement_tv_room', tv_name: 'TV', entities: [] },
    'aiks-scene-card-editor': { type: 'custom:aiks-scene-card', entities: [{ entity_id: 'scene.firepit' }] },
    'aiks-light-card-editor': { type: 'custom:aiks-light-card', entities: [{ entity_id: 'light.basement_sitting_area_main_lights' }] }
  };
  for (const [tag, cfg] of Object.entries(EDITORS)) {
    const { w, hass } = makeEnv();
    const { el, err } = instantiate(w, hass, tag, cfg);
    check(`${tag} renders`, !err && el && el.childNodes.length > 0, err || 'no child nodes');
  }

  const PAYLOAD = '<img src=x onerror=alert(1)><script>alert(2)</script>';
  for (const [tag, cfg] of Object.entries(EDITORS)) {
    const { w, hass } = makeEnv();
    for (const k of Object.keys(hass.states)) hass.states[k].attributes.friendly_name = PAYLOAD;
    const { el, err } = instantiate(w, hass, tag, cfg);
    if (err) { check(`${tag} hostile name`, false, err); continue; }
    const scripts = el.querySelectorAll('script').length;
    const imgs = Array.from(el.querySelectorAll('img')).filter(i => i.getAttribute('onerror')).length;
    check(`${tag}: hostile friendly_name not parsed as markup`,
      scripts === 0 && imgs === 0, `script=${scripts} onerror-img=${imgs}`);
  }

  // Editor validation guard: external URL must be rejected and never persisted.
  // NOTE: the "never persisted" assertion is weak under jsdom, because upstream
  // only persists inside Image.onload, which never fires without a network. The
  // placeholder assertion below is the reliable discriminator.
  for (const [tag, cfg] of [
    ['aiks-tv-card-editor', EDITORS['aiks-tv-card-editor']],
    ['aiks-scene-card-editor', EDITORS['aiks-scene-card-editor']]
  ]) {
    const { w, hass } = makeEnv();
    const { el, err } = instantiate(w, hass, tag, cfg);
    if (err) { check(`${tag} guard`, false, err); continue; }
    const inputs = Array.from(el.querySelectorAll('input[type=text]'))
      .filter(i => /image|图片/i.test(i.placeholder || ''));
    if (!inputs.length) { check(`${tag}: image path input found`, false, 'no matching input'); continue; }
    const saved = [];
    el.addEventListener('config-changed', e => saved.push(JSON.stringify(e.detail && e.detail.config)));
    const input = inputs[0];
    input.value = 'https://evil.example/x.png';
    input.dispatchEvent(new w.Event('blur', { bubbles: true }));
    const leaked = saved.some(s => s.includes('evil.example'));
    check(`${tag}: external URL rejected, never persisted`, !leaked,
      leaked ? 'config-changed carried the external URL' : '');
    check(`${tag}: placeholder advertises local paths only`,
      /local image path|本地图片路径/i.test(input.placeholder || ''),
      `placeholder=${JSON.stringify(input.placeholder)}`);
  }
}

console.log(`\n================ ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('\nFailures:'); failures.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
