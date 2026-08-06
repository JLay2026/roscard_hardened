// Sonos zone-grouping tests for aiks-media-player-card (feature added in 1.1.0).
// Standalone so it can be pointed at any bundle:
//   ROSCARD_BUNDLE=/path/to/RosCard.js node test/zones.test.js
// Against any bundle without the feature this MUST fail — see the negative
// control in .github/workflows/card-tests.yml.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const BUNDLE = process.env.ROSCARD_BUNDLE || path.join(__dirname, '..', 'dist', 'RosCard.js');
if (!fs.existsSync(BUNDLE)) {
  console.error(`bundle not found: ${BUNDLE}`);
  process.exit(2); // never let a missing input look like a pass
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' :: ' + detail : ''}`); }
}

const mk = (id, name, members) => ({
  entity_id: id, state: 'idle',
  attributes: { friendly_name: name, group_members: members || [id], supported_features: 8321599 }
});

function build(states, zones) {
  const dom = new JSDOM('<!doctype html><body>', {
    url: 'https://ha.local/', pretendToBeVisual: true, runScripts: 'outside-only'
  });
  const w = dom.window;
  w.requestAnimationFrame = cb => setTimeout(() => cb(1), 0);
  vm.runInContext(fs.readFileSync(BUNDLE, 'utf8'), vm.createContext(w), { filename: 'RosCard.js' });
  const calls = [];
  const hass = {
    states, language: 'en', auth: { data: { access_token: 'FAKE' } },
    callService: (domain, service, data) => { calls.push({ domain, service, data }); return Promise.resolve(); },
    formatEntityState: s => String(s && s.state),
    connection: { subscribeEvents: () => Promise.resolve(() => {}) },
    localize: k => k, themes: {}, user: { is_admin: true }
  };
  const El = w.customElements.get('aiks-media-player-card');
  if (!El) return { err: 'aiks-media-player-card not registered' };
  const el = new El();
  try {
    el.setConfig({ type: 'custom:aiks-media-player-card',
                   entities: [{ entity_id: 'media_player.great_room', zones }] });
    w.document.body.appendChild(el);
    el.hass = hass;
  } catch (e) { return { err: e.message }; }
  return { el, calls };
}

console.log('\n=== Sonos zone grouping ===');

// ungrouped -> click JOINs the zone to the primary
{
  const st = { 'media_player.great_room': mk('media_player.great_room', 'Great Room'),
               'media_player.kitchen': mk('media_player.kitchen', 'Kitchen') };
  const { el, calls, err } = build(st, ['media_player.kitchen']);
  const btns = el ? [...el.querySelectorAll('button[data-zone]')] : [];
  check('zone chip rendered', !err && btns.length === 1, err || `got ${btns.length}`);
  check('chip labelled with friendly_name', !!btns[0] && btns[0].textContent === 'Kitchen',
    btns[0] && btns[0].textContent);
  check('chip starts unpressed', !!btns[0] && btns[0].getAttribute('aria-pressed') === 'false');
  if (btns[0]) {
    btns[0].click();
    const c = calls[0] || {};
    check('click issues media_player.join',
      c.domain === 'media_player' && c.service === 'join', JSON.stringify(c));
    check('join targets primary and carries the member',
      !!c.data && c.data.entity_id === 'media_player.great_room' &&
      Array.isArray(c.data.group_members) && c.data.group_members[0] === 'media_player.kitchen',
      JSON.stringify(c.data));
  } else {
    check('click issues media_player.join', false, 'no zone chip to click');
    check('join targets primary and carries the member', false, 'no zone chip to click');
  }
}

// already grouped -> click UNJOINs the member itself, not the primary
{
  const g = ['media_player.great_room', 'media_player.kitchen'];
  const st = { 'media_player.great_room': mk('media_player.great_room', 'Great Room', g),
               'media_player.kitchen': mk('media_player.kitchen', 'Kitchen', g) };
  const { el, calls } = build(st, ['media_player.kitchen']);
  const b = el && el.querySelector('button[data-zone]');
  check('joined chip shows pressed', !!b && b.getAttribute('aria-pressed') === 'true');
  if (b) {
    b.click();
    const c = calls[0] || {};
    check('click issues media_player.unjoin',
      c.domain === 'media_player' && c.service === 'unjoin', JSON.stringify(c));
    check('unjoin targets the member, not the primary',
      !!c.data && c.data.entity_id === 'media_player.kitchen', JSON.stringify(c.data));
  } else {
    check('click issues media_player.unjoin', false, 'no zone chip');
    check('unjoin targets the member, not the primary', false, 'no zone chip');
  }
}

// unknown zone entities skipped; primary never shown joined to itself
{
  const st = { 'media_player.great_room': mk('media_player.great_room', 'Great Room') };
  const { el } = build(st, ['media_player.great_room', 'media_player.ghost']);
  const btns = el ? [...el.querySelectorAll('button[data-zone]')] : [];
  check('unknown zone entity skipped',
    !btns.some(b => b.getAttribute('data-zone') === 'media_player.ghost'));
  check('primary never marked joined to itself',
    btns.every(b => b.getAttribute('aria-pressed') === 'false'));
}

// hostile zone name must not become markup
{
  const P = '<img src=x onerror=alert(1)><script>alert(2)</script>';
  const st = { 'media_player.great_room': mk('media_player.great_room', 'Great Room'),
               'media_player.kitchen': mk('media_player.kitchen', P) };
  const { el } = build(st, ['media_player.kitchen']);
  check('hostile zone name stays inert',
    !!el && el.querySelectorAll('img[onerror]').length === 0 && el.querySelectorAll('script').length === 0);
}

// no zones configured -> no chips, behaviour unchanged
{
  const st = { 'media_player.great_room': mk('media_player.great_room', 'Great Room') };
  const { el } = build(st, undefined);
  check('no zones configured renders no chips',
    !!el && el.querySelectorAll('button[data-zone]').length === 0);
}

console.log(`\n================ ${pass} passed, ${fail} failed ================`);
process.exit(fail ? 1 : 0);
