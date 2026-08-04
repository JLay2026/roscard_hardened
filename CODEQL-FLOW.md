# CodeQL dataflow — security results

## [1] js/xss-through-dom
message: [DOM text](1) is reinterpreted as HTML without escaping meta-characters.
sink:   src/RosCard.js:774:110  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa
related (DOM text): src/RosCard.js:777:41  var e = c.value.trim();
related (): src/RosCard.js:777:41  var e = c.value.trim();
  flow:
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value]
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value.trim()]
    - src/RosCard.js:777:37  var e = c.value.trim();   [e]
    - src/RosCard.js:779:48  if ("" !== e) {   [e]
    - src/RosCard.js:783:47  g(e), b.textContent = n ? "✅ 链接有效" : "✅ Valid Link", b.style.color = "#4caf50", setTimeout(function() {   [e]
    - src/RosCard.js:771:42  var g = function(e) {   [e]
    - src/RosCard.js:774:164  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   [e]
    - src/RosCard.js:774:110  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   [e.start ... ncat(e)]
  flow:
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value]
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value.trim()]
    - src/RosCard.js:777:37  var e = c.value.trim();   [e]
    - src/RosCard.js:778:37  if (e !== r)   [e]
    - src/RosCard.js:779:48  if ("" !== e) {   [e]
    - src/RosCard.js:791:25  c.onblur = _, c.onkeydown = function(e) {   [c [value]]
    - src/RosCard.js:791:39  c.onblur = _, c.onkeydown = function(e) {   [c [value]]
    - src/RosCard.js:792:50  "Enter" === e.key && _()   [_ [c, value]]
    - src/RosCard.js:777:41  var e = c.value.trim();   [c [value]]
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value]
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value.trim()]
    - src/RosCard.js:777:37  var e = c.value.trim();   [e]
    - src/RosCard.js:779:48  if ("" !== e) {   [e]
    - src/RosCard.js:783:47  g(e), b.textContent = n ? "✅ 链接有效" : "✅ Valid Link", b.style.color = "#4caf50", setTimeout(function() {   [e]
    - src/RosCard.js:771:42  var g = function(e) {   [e]
    - src/RosCard.js:774:209  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   [e]
    - src/RosCard.js:774:168  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   ["".conc ... ncat(e) [ArrayElement]]
    - src/RosCard.js:774:110  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   [e.start ... ncat(e)]
  flow:
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value]
    - src/RosCard.js:777:41  var e = c.value.trim();   [c.value.trim()]
    - src/RosCard.js:777:37  var e = c.value.trim();   [e]
    - src/RosCard.js:779:48  if ("" !== e) {   [e]
    - src/RosCard.js:783:47  g(e), b.textContent = n ? "✅ 链接有效" : "✅ Valid Link", b.style.color = "#4caf50", setTimeout(function() {   [e]
    - src/RosCard.js:771:42  var g = function(e) {   [e]
    - src/RosCard.js:774:209  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   [e]
    - src/RosCard.js:774:168  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   ["".conc ... ncat(e)]
    - src/RosCard.js:774:110  }), t._dispatchConfigChanged(), c.value = e, v.textContent = e, e ? (h.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), u.style.display = "none", d.style.displa   [e.start ... ncat(e)]

## [2] js/xss-through-dom
message: [DOM text](1) is reinterpreted as HTML without escaping meta-characters.
sink:   src/RosCard.js:4186:114  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa
related (DOM text): src/RosCard.js:4189:45  var t = a.value.trim();
related (): src/RosCard.js:4189:45  var t = a.value.trim();
  flow:
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value]
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value.trim()]
    - src/RosCard.js:4189:41  var t = a.value.trim();   [t]
    - src/RosCard.js:4191:52  if ("" !== t) {   [t]
    - src/RosCard.js:4195:51  b(t, ""), m.textContent = r ? "✅ 链接有效" : "✅ Valid Link", m.style.color = "#4caf50", setTimeout(function() {   [t]
    - src/RosCard.js:4178:46  var b = function(e) {   [e]
    - src/RosCard.js:4186:168  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   [e]
    - src/RosCard.js:4186:114  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   [e.start ... ncat(e)]
  flow:
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value]
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value.trim()]
    - src/RosCard.js:4189:41  var t = a.value.trim();   [t]
    - src/RosCard.js:4190:41  if (t !== (e.image_path || ""))   [t]
    - src/RosCard.js:4191:52  if ("" !== t) {   [t]
    - src/RosCard.js:4203:36  return a.onblur = g, a.onkeydown = function(e) {   [a [value]]
    - src/RosCard.js:4203:50  return a.onblur = g, a.onkeydown = function(e) {   [a [value]]
    - src/RosCard.js:4204:54  "Enter" === e.key && g()   [g [a, value]]
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a [value]]
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value]
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value.trim()]
    - src/RosCard.js:4189:41  var t = a.value.trim();   [t]
    - src/RosCard.js:4191:52  if ("" !== t) {   [t]
    - src/RosCard.js:4195:51  b(t, ""), m.textContent = r ? "✅ 链接有效" : "✅ Valid Link", m.style.color = "#4caf50", setTimeout(function() {   [t]
    - src/RosCard.js:4178:46  var b = function(e) {   [e]
    - src/RosCard.js:4186:213  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   [e]
    - src/RosCard.js:4186:172  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   ["".conc ... ncat(e) [ArrayElement]]
    - src/RosCard.js:4186:114  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   [e.start ... ncat(e)]
  flow:
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value]
    - src/RosCard.js:4189:45  var t = a.value.trim();   [a.value.trim()]
    - src/RosCard.js:4189:41  var t = a.value.trim();   [t]
    - src/RosCard.js:4191:52  if ("" !== t) {   [t]
    - src/RosCard.js:4195:51  b(t, ""), m.textContent = r ? "✅ 链接有效" : "✅ Valid Link", m.style.color = "#4caf50", setTimeout(function() {   [t]
    - src/RosCard.js:4178:46  var b = function(e) {   [e]
    - src/RosCard.js:4186:213  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   [e]
    - src/RosCard.js:4186:172  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   ["".conc ... ncat(e)]
    - src/RosCard.js:4186:114  }), n._dispatchConfigChanged(), a.value = e, h.textContent = e, e ? (y.src = e.startsWith("http://") || e.startsWith("https://") ? e : "".concat(window.location.origin).concat(e), l.style.display = "none", p.style.displa   [e.start ... ncat(e)]
