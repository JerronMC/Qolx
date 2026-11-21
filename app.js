document.addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('burger'), l = document.getElementById('links');
  if (b) b.onclick = () => l.classList.toggle('open');
  if (l) l.querySelectorAll('a').forEach(a => a.onclick = () => l.classList.remove('open'));
  const hf = document.getElementById('heroFrame');
  if (hf) hf.srcdoc = Qolx.compile(QOLX_EXAMPLES.counter);
  document.querySelectorAll('[data-copy]').forEach(btn => btn.onclick = () => {
    navigator.clipboard.writeText(document.querySelector(btn.dataset.copy).textContent);
    const o = btn.innerHTML; btn.textContent = 'Copied!'; setTimeout(() => { btn.innerHTML = o; qIcons(btn); }, 1200);
  });
});
