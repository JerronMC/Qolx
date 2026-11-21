window.QOLX_EXAMPLES = {
  counter: `app "Counter"
theme dark
accent #7c5cff
state count = 0
fn reset = count = 0

page
  card pad=24
    title "Qolx Counter"
    text "You clicked {count} times"
    row
      button "+1" -> count += 1
      button "-1" -> count -= 1
      button "Reset" -> reset()
    if count >= 10
      text "🔥 Double digits!"
`,
  greeter: `app "Greeter"
theme light
accent #0ea5e9
state name = ""

page
  card
    title "Hello, {name || 'friend'}!"
    input name hint="Type your name"
    if name
      text "Nice to meet you 👋"
`,
  tip: `app "Tip Calculator"
accent #10b981
state bill = 50
state pct = 15

page
  card
    title "Tip calculator"
    input bill hint="Bill" type=number
    input pct hint="Tip %" type=number
    divider
    text "Tip: \${(bill * pct / 100).toFixed(2)}"
    text "Total: \${(bill * (1 + pct / 100)).toFixed(2)}"
`
};

window.QOLX_EXAMPLES.flappy="app \"Flappy Qolx\"\ntheme dark\naccent #f59e0b\n\nstate y = 250\nstate vy = 0\nstate score = 0\nstate best = (function(){ try { return +localStorage.getItem(\"qolx-flappy\") || 0 } catch (e) { return 0 } })()\nstate mode = \"ready\"\nstate pipes = []\nstate spawn = 0\nstate gx = 0\nstate deadAt = 0\n\nfn reset()\n  y = 250; vy = 0; score = 0; pipes = []; spawn = 0; mode = \"ready\";\n\nfn flap()\n  if (mode == \"over\") { if (Date.now() - deadAt > 450) reset(); return; }\n  if (mode == \"ready\") { mode = \"play\"; spawn = 0; }\n  vy = -310;\n\nfn die()\n  if (mode != \"play\") return;\n  mode = \"over\"; deadAt = Date.now();\n  if (score > best) { best = score; try { localStorage.setItem(\"qolx-flappy\", best) } catch (e) {} }\n\nfn say(s, size, yy)\n  ctx.font = \"bold \" + size + \"px system-ui\";\n  ctx.strokeText(s, W / 2, yy); ctx.fillText(s, W / 2, yy);\n\nloop\n  const gh = 70, bx = 90, br = 14, pw = 56, gap = 150;\n  if (mode == \"ready\") y = 250 + Math.sin(Date.now() / 250) * 8;\n  if (mode == \"play\") {\n    vy += 950 * dt; y += vy * dt; gx = (gx + 150 * dt) % 24; spawn -= dt;\n    if (spawn <= 0) { spawn = 1.45; pipes.push({ x: W + 10, top: 70 + Math.random() * (H - gh - gap - 140), done: false }); }\n    for (const p of pipes) {\n      p.x -= 150 * dt;\n      if (!p.done && p.x + pw < bx) { p.done = true; score += 1; }\n      if (bx + br > p.x && bx - br < p.x + pw && (y - br < p.top || y + br > p.top + gap)) die();\n    }\n    pipes = pipes.filter(p => p.x > -pw - 10);\n    if (y + br > H - gh || y - br < 0) die();\n  }\n  const g = ctx.createLinearGradient(0, 0, 0, H);\n  g.addColorStop(0, \"#4ec0ca\"); g.addColorStop(1, \"#c8f0f4\");\n  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);\n  ctx.fillStyle = \"rgba(255,255,255,.65)\";\n  for (let i = 0; i < 3; i++) { const cx = (i * 170 + 400 - Date.now() / 60) % (W + 120) - 60; ctx.beginPath(); ctx.ellipse(cx, 120 + i * 70, 44, 16, 0, 0, 7); ctx.fill(); }\n  for (const p of pipes) {\n    ctx.fillStyle = \"#5ec43a\"; ctx.fillRect(p.x, 0, pw, p.top); ctx.fillRect(p.x, p.top + gap, pw, H);\n    ctx.fillStyle = \"#3d9a22\"; ctx.fillRect(p.x - 4, p.top - 22, pw + 8, 22); ctx.fillRect(p.x - 4, p.top + gap, pw + 8, 22);\n  }\n  ctx.fillStyle = \"#ded895\"; ctx.fillRect(0, H - gh, W, gh);\n  ctx.fillStyle = \"#73bf2e\"; ctx.fillRect(0, H - gh, W, 12);\n  ctx.fillStyle = \"#c9c27a\"; for (let x = -gx; x < W; x += 24) ctx.fillRect(x, H - gh + 12, 12, 6);\n  ctx.save(); ctx.translate(bx, y); ctx.rotate(Math.max(-0.4, Math.min(1.2, vy / 500)));\n  ctx.fillStyle = \"#fbbf24\"; ctx.beginPath(); ctx.arc(0, 0, br, 0, 7); ctx.fill();\n  ctx.fillStyle = \"#fff\"; ctx.beginPath(); ctx.arc(6, -4, 5, 0, 7); ctx.fill();\n  ctx.fillStyle = \"#111\"; ctx.beginPath(); ctx.arc(8, -4, 2, 0, 7); ctx.fill();\n  ctx.fillStyle = \"#f97316\"; ctx.fillRect(10, 2, 11, 5);\n  ctx.fillStyle = \"#f59e0b\"; ctx.beginPath(); ctx.ellipse(-4, 4, 7, 4, 0, 0, 7); ctx.fill();\n  ctx.restore();\n  ctx.textAlign = \"center\"; ctx.fillStyle = \"#fff\"; ctx.strokeStyle = \"#1a1a1a\"; ctx.lineWidth = 5; ctx.lineJoin = \"round\";\n  say(score, 44, 80);\n  if (mode == \"ready\") say(\"Tap or press Space\", 22, H / 2 + 60);\n  if (mode == \"over\") { say(\"Game Over\", 40, H / 2 - 10); say(\"Tap to retry\", 22, H / 2 + 30); }\n\nkey Space -> flap()\nkey ArrowUp -> flap()\n\npage\n  column\n    title \"Flappy Qolx\" align=center\n    canvas w=360 h=560 -> flap()\n    text \"Best: {best}\" align=center\n";
