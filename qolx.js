/* Qolx compiler v0.1 - turns .qolx source into a self-contained, reactive HTML app */
(function (g) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const unq = s => s.replace(/\\(.)/g, '$1');
  const BASE = ':root{--bg:#0b0b12;--fg:#ecebff;--card:#161625;--bd:#2a2a40;--ac:ACC}[data-theme=light]{--bg:#f6f5ff;--fg:#14132a;--card:#fff;--bd:#dedcf2}*{box-sizing:border-box;margin:0}body{background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}.q-page{max-width:760px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:16px}.q-col,.q-card{display:flex;flex-direction:column;gap:12px}.q-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}.q-grid{display:grid;gap:12px}.q-card{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:20px}.q-title{font-size:28px;line-height:1.2}.q-h{font-size:20px}.q-btn{background:var(--ac);color:#fff;border:0;border-radius:10px;padding:10px 18px;font:600 15px system-ui;cursor:pointer}.q-btn:active{transform:scale(.97)}.q-in{background:transparent;color:inherit;border:1px solid var(--bd);border-radius:10px;padding:10px 12px;font:inherit;width:100%}.q-check{display:flex;gap:8px;align-items:center}.q-img{max-width:100%;border-radius:12px}.q-hr{border:0;border-top:1px solid var(--bd);width:100%}a{color:var(--ac)}.q-canvas{display:block;margin:0 auto;max-width:100%;height:auto;border-radius:12px;touch-action:none;user-select:none}';
  const META = ['app', 'theme', 'accent', 'state', 'fn', 'style', 'loop', 'key'];

  function splitAct(s) {
    let q = false;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '"' && s[i - 1] !== '\\') q = !q;
      if (!q && s.substr(i, 4) === ' -> ') return [s.slice(0, i), s.slice(i + 4).trim()];
    }
    return [s, ''];
  }
  function tok(s) {
    const o = { a: [], p: {} }, re = /"((?:[^"\\]|\\.)*)"|([a-z]+)=("(?:[^"\\]|\\.)*"|\S+)|(\S+)/g; let m;
    while ((m = re.exec(s))) {
      if (m[1] !== undefined) o.a.push({ s: unq(m[1]) });
      else if (m[2]) { const v = m[3]; o.p[m[2]] = v[0] === '"' ? unq(v.slice(1, -1)) : v; }
      else o.a.push({ w: m[4] });
    }
    return o;
  }
  function parse(src) {
    const root = { kw: 'root', ch: [], ind: -1 }, st = [root]; let cn = null;
    src.replace(/\r/g, '').split('\n').forEach((raw, i) => {
      const l = raw.replace(/\t/g, '  ');
      if (!l.trim() || l.trim().startsWith('//')) return;
      const ind = l.match(/^ */)[0].length;
      if (cn && ind > cn.ind) { cn.code.push(l.trim()); return; }
      cn = null; const [text, act] = splitAct(l.trim());
      const m = text.match(/^(\w+)\s*(.*)$/);
      if (!m) throw new Error('Line ' + (i + 1) + ': cannot read "' + l.trim() + '"');
      const n = { kw: m[1], rest: m[2], act, ch: [], ind, line: i + 1 };
      while (st[st.length - 1].ind >= ind) st.pop();
      st[st.length - 1].ch.push(n); st.push(n);
      if ((n.kw === 'loop' && !n.rest.trim()) || (n.kw === 'fn' && /^\w+\s*(\(.*?\))?\s*$/.test(n.rest))) { n.block = true; n.code = []; cn = n; }
    });
    return root;
  }

  function compile(src, o) {
    const root = parse(src);
    const c = { title: 'Qolx App', theme: 'dark', accent: '#7c5cff', css: '', state: [], T: [], A: [], I: [], loop: '', keys: [] };
    const expr = s => s.split(/\{([^}]+)\}/).map((p, i) => i % 2 ? '(' + p + ')' : JSON.stringify(p)).filter(x => x !== '""').join('+') || '""';
    const SM = { gap: 'gap', pad: 'padding', width: 'max-width', color: 'color', bg: 'background', size: 'font-size', radius: 'border-radius', align: 'text-align' };
    const style = (p, extra) => {
      let s = extra || '';
      for (const k in SM) if (p[k]) s += SM[k] + ':' + (/^\d+$/.test(p[k]) && k !== 'align' ? p[k] + 'px' : p[k]) + ';';
      return s ? ' style="' + esc(s) + '"' : '';
    };
    const text = (tag, cls, s, st, extra) => {
      if (/\{[^}]+\}/.test(s)) { c.T.push(expr(s)); return '<' + tag + ' class="' + cls + '" data-qt="' + (c.T.length - 1) + '"' + st + (extra || '') + '></' + tag + '>'; }
      return '<' + tag + ' class="' + cls + '"' + st + (extra || '') + '>' + esc(s) + '</' + tag + '>';
    };
    function el(n) {
      if (META.includes(n.kw)) return '';
      const t = tok(n.rest), p = t.a.length && t.a[0].s !== undefined ? t.a[0].s : '', st = style(t.p), kids = () => n.ch.map(el).join('');
      const strArg = t.a.find(x => x.s !== undefined), wordArg = t.a.find(x => x.w);
      switch (n.kw) {
        case 'page': return '<main class="q-page">' + kids() + '</main>';
        case 'column': return '<div class="q-col"' + st + '>' + kids() + '</div>';
        case 'row': return '<div class="q-row"' + st + '>' + kids() + '</div>';
        case 'card': return '<div class="q-card"' + st + '>' + kids() + '</div>';
        case 'grid': return '<div class="q-grid"' + style(t.p, 'grid-template-columns:repeat(' + (t.p.cols || 2) + ',1fr);') + '>' + kids() + '</div>';
        case 'title': return text('h1', 'q-title', p, st);
        case 'heading': return text('h2', 'q-h', p, st);
        case 'text': return text('p', 'q-text', p, st);
        case 'button': {
          if (!n.act) throw new Error('Line ' + n.line + ': button needs an action, e.g. button "Go" -> count += 1');
          c.A.push(n.act); return text('button', 'q-btn', p, st, ' data-qa="' + (c.A.length - 1) + '"');
        }
        case 'input': if (!wordArg) throw new Error('Line ' + n.line + ': input needs a state name'); return '<input class="q-in" data-qm="' + wordArg.w + '" placeholder="' + esc(t.p.hint || '') + '" type="' + esc(t.p.type || 'text') + '"' + st + '>';
        case 'checkbox': if (!wordArg) throw new Error('Line ' + n.line + ': checkbox needs a state name'); return '<label class="q-check"><input type="checkbox" data-qm="' + wordArg.w + '"><span>' + esc(strArg ? strArg.s : '') + '</span></label>';
        case 'image': return '<img class="q-img" src="' + esc(p) + '" alt="' + esc(t.p.alt || '') + '"' + st + '>';
        case 'link': return '<a href="' + esc(t.p.to || '#') + '"' + st + '>' + esc(p) + '</a>';
        case 'canvas': { if (n.act) c.A.push(n.act); return '<canvas class="q-canvas" width="' + (t.p.w || 360) + '" height="' + (t.p.h || 560) + '"' + (n.act ? ' data-qa="' + (c.A.length - 1) + '"' : '') + '></canvas>'; }
        case 'divider': return '<hr class="q-hr">';
        case 'space': return '<div style="height:' + ((wordArg && parseInt(wordArg.w)) || 16) + 'px"></div>';
        case 'if': c.I.push(n.rest); return '<div data-qi="' + (c.I.length - 1) + '">' + kids() + '</div>';
        default: throw new Error('Line ' + n.line + ': unknown word "' + n.kw + '"');
      }
    }
    root.ch.forEach(n => {
      const r = n.rest.trim();
      if (n.kw === 'app') { const a = tok(r).a[0]; if (a) c.title = a.s || a.w; }
      else if (n.kw === 'theme') c.theme = r === 'light' ? 'light' : 'dark';
      else if (n.kw === 'accent') c.accent = r;
      else if (n.kw === 'style') c.css += r;
      else if (n.kw === 'state') {
        const m = r.match(/^(\w+)\s*=\s*(.+)$/); if (!m) throw new Error('Line ' + n.line + ': use  state name = value');
        c.state.push('t.' + m[1] + '=' + m[2] + ';');
      } else if (n.kw === 'fn' && n.block) {
        const m = n.rest.match(/^(\w+)\s*(\(.*?\))?/);
        c.state.push('t.' + m[1] + '=function' + (m[2] || '()') + '{with(S){' + n.code.join('\n') + '\n}};');
      } else if (n.kw === 'loop') { c.loop = n.code.join('\n');
      } else if (n.kw === 'key') { c.keys.push([r, n.act]);
      } else if (n.kw === 'fn') {
        const m = r.match(/^(\w+)\s*(\(.*?\))?\s*=\s*(.+)$/); if (!m) throw new Error('Line ' + n.line + ': use  fn name = code');
        c.state.push('t.' + m[1] + '=function' + (m[2] || '()') + '{with(S){' + m[3] + '}};');
      }
    });
    let body = root.ch.filter(n => !META.includes(n.kw)).map(el).join('');
    if (!root.ch.some(n => n.kw === 'page')) body = '<main class="q-page">' + body + '</main>';
    const extra = 'var cv=document.querySelector("canvas");if(cv){t.ctx=cv.getContext("2d");t.W=cv.width;t.H=cv.height;t.keys={};addEventListener("keydown",function(e){if(/^(Space|Arrow)/.test(e.code))e.preventDefault();t.keys[e.code]=1});addEventListener("keyup",function(e){t.keys[e.code]=0});addEventListener("blur",function(){t.keys={}});var pm={};cv.addEventListener("pointerdown",function(e){var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,k=x<.33?"ArrowLeft":x>.67?"ArrowRight":"Space";pm[e.pointerId]=k;t.keys[k]=1});var pu=function(e){var k=pm[e.pointerId];if(k){t.keys[k]=0;delete pm[e.pointerId]}};cv.addEventListener("pointerup",pu);cv.addEventListener("pointercancel",pu);cv.addEventListener("pointerleave",pu)}' +
      (c.keys.length ? 'var K={' + c.keys.map(k => JSON.stringify(k[0]) + ':function(){with(S){' + k[1] + '}}').join(',') + '};addEventListener("keydown",function(e){if(K[e.code]){e.preventDefault();K[e.code]()}});' : '') +
      (c.loop ? 'var L=function(dt){with(S){' + c.loop + '\n}},lt=0;function tk(ts){var dt=Math.min((ts-lt)/1000,.05);lt=ts;requestAnimationFrame(tk);L(dt)}requestAnimationFrame(function(ts){lt=ts;tk(ts)});' : '');
    const rt = '(function(){var t={};var S=new Proxy(t,{has:function(o,k){return k in o},set:function(o,k,v){o[k]=v;q();return true}});' + c.state.join('') +
      'var T=[' + c.T.map(e => 'function(){with(S){return ' + e + '}}').join(',') + '],A=[' + c.A.map(e => 'function(){with(S){' + e + '}}').join(',') + '],I=[' + c.I.map(e => 'function(){with(S){return !!(' + e + ')}}').join(',') + '];' +
      'var f=0;function q(){if(!f){f=1;requestAnimationFrame(function(){f=0;r()})}}' +
      'function r(){document.querySelectorAll("[data-qt]").forEach(function(e){var v=String(T[e.dataset.qt]());if(e.textContent!==v)e.textContent=v});document.querySelectorAll("[data-qi]").forEach(function(e){e.style.display=I[e.dataset.qi]()?"":"none"});document.querySelectorAll("[data-qm]").forEach(function(e){var v=t[e.dataset.qm];if(e.type=="checkbox")e.checked=!!v;else{v=v==null?"":String(v);if(e.value!==v&&document.activeElement!==e)e.value=v}})}' +
      'document.querySelectorAll("[data-qa]").forEach(function(e){e[e.tagName=="CANVAS"?"onpointerdown":"onclick"]=function(ev){if(ev&&ev.preventDefault)ev.preventDefault();A[e.dataset.qa]()}});' +
      'document.querySelectorAll("[data-qm]").forEach(function(e){e.oninput=e.onchange=function(){S[e.dataset.qm]=e.type=="checkbox"?e.checked:(e.type=="number"?+e.value:e.value)}});' + extra + 'r()})();';
    return '<!doctype html><html lang="en" data-theme="' + c.theme + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(c.title) + '</title><style>' + BASE.replace('ACC', c.accent) + c.css + '</style></head><body>' + body + '<script>' + rt.replace(/<\//g, '<\\/') + '</script></body></html>';
  }
  const Qolx = { version: '0.1.0', compile };
  if (typeof module !== 'undefined') module.exports = Qolx; else g.Qolx = Qolx;
})(typeof window !== 'undefined' ? window : globalThis);
