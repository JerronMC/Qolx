document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id), code = $('code'), fr = $('frame'), err = $('err'), ex = $('ex');
  let t;
  const run = () => { try { fr.srcdoc = Qolx.compile(code.value); err.className = 'ok'; err.textContent = '● Compiled'; } catch (e) { err.className = 'bad'; err.textContent = '✖ ' + e.message; } };
  const load = k => { code.value = QOLX_EXAMPLES[k]; run(); };
  Object.keys(QOLX_EXAMPLES).forEach(k => ex.add(new Option(k, k)));
  ex.onchange = () => load(ex.value);
  code.oninput = () => { clearTimeout(t); t = setTimeout(run, 250); };
  code.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); code.setRangeText('  ', code.selectionStart, code.selectionEnd, 'end'); } };
  const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); };
  $('dlq').onclick = () => dl('main.qolx', code.value, 'text/plain');
  $('dlh').onclick = () => { try { dl('index.html', Qolx.compile(code.value), 'text/html'); } catch (e) { } };
  const f = new URLSearchParams(location.search).get('file');
  if (f) fetch(f).then(r => r.text()).then(s => { code.value = s; run(); }).catch(() => load('counter')); else load('counter');
});
