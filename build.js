document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  $('code').value = QOLX_EXAMPLES.counter;
  $('go').onclick = async () => {
    const st = $('status'); st.className = '';
    const name = $('name').value.trim() || 'My Qolx App', slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qolx-app';
    const id = $('appid').value.trim() || 'com.example.' + slug.replace(/-/g, ''), ver = $('ver').value.trim() || '1.0.0';
    const T = [...document.querySelectorAll('input[name=t]:checked')].map(x => x.value);
    let html; try { html = Qolx.compile($('code').value); } catch (e) { st.className = 'bad'; st.textContent = '✖ ' + e.message; return; }
    let logo = ''; try { logo = await (await fetch('logo.svg')).text(); } catch (e) { }
    const F = [], add = (n, d) => F.push({ n: slug + '/' + n, d }), J = o => JSON.stringify(o, null, 2);
    const mob = T.includes('android') || T.includes('ios'), desk = T.some(x => ['windows', 'mac', 'linux'].includes(x));
    add('qolx.json', J({ name, id, version: ver, entry: 'src/main.qolx', targets: T }));
    add('src/main.qolx', $('code').value);
    add('README.md', '# ' + name + '\n\nBuilt with Qolx. Source: `src/main.qolx`.\n\n- `web/` - deploy to any static host or GitHub Pages (installable PWA)\n- `mobile/` - Android / iOS (Capacitor), see mobile/README.md\n- `desktop/` - Windows / macOS / Linux (Electron), see desktop/README.md\n\nAfter editing main.qolx, recompile it in the Qolx playground and replace each index.html.\n');
    if (T.includes('web')) {
      const pwa = html.replace('</head>', '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"></head>').replace('</body>', '<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js")</script></body>');
      add('web/index.html', pwa); add('web/icon.svg', logo);
      add('web/manifest.webmanifest', J({ name, short_name: name.slice(0, 12), start_url: '.', display: 'standalone', background_color: '#0b0b12', theme_color: '#7c5cff', icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }] }));
      add('web/sw.js', 'const C="' + slug + '-' + ver + '";self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","icon.svg"]))));self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));');
    }
    if (mob) {
      const deps = { '@capacitor/core': '^6.0.0' }; if (T.includes('android')) deps['@capacitor/android'] = '^6.0.0'; if (T.includes('ios')) deps['@capacitor/ios'] = '^6.0.0';
      add('mobile/www/index.html', html);
      add('mobile/capacitor.config.json', J({ appId: id, appName: name, webDir: 'www' }));
      add('mobile/package.json', J({ name: slug, version: ver, private: true, dependencies: deps, devDependencies: { '@capacitor/cli': '^6.0.0' } }));
      add('mobile/README.md', '# Mobile build\n\nNeeds Node.js. Android needs Android Studio; iOS needs a Mac with Xcode.\n\n```\nnpm install\n' + (T.includes('android') ? 'npx cap add android\nnpx cap sync\ncd android && ./gradlew assembleDebug   # APK in android/app/build/outputs/apk/debug/\n' : '') + (T.includes('ios') ? 'npx cap add ios\nnpx cap sync\nnpx cap open ios                         # archive in Xcode\n' : '') + '```\n');
    }
    if (desk) {
      const b = { appId: id, productName: name, files: ['main.js', 'app/**'] };
      if (T.includes('windows')) b.win = { target: 'nsis' }; if (T.includes('mac')) b.mac = { target: 'dmg' }; if (T.includes('linux')) b.linux = { target: 'AppImage' };
      add('desktop/app/index.html', html);
      add('desktop/main.js', "const {app,BrowserWindow}=require('electron');\napp.whenReady().then(()=>{const w=new BrowserWindow({width:1000,height:720,title:" + JSON.stringify(name) + "});w.setMenuBarVisibility(false);w.loadFile('app/index.html')});\napp.on('window-all-closed',()=>app.quit());\n");
      add('desktop/package.json', J({ name: slug, version: ver, main: 'main.js', description: name, author: 'You', scripts: { start: 'electron .', dist: 'electron-builder' }, devDependencies: { electron: '^31.0.0', 'electron-builder': '^24.13.3' }, build: b }));
      add('desktop/README.md', '# Desktop build\n\n```\nnpm install\nnpm start        # run\nnpm run dist     # installers in dist/\n```\nBuild each OS on that OS (.exe on Windows, .dmg on macOS, AppImage on Linux).\n');
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(Zip.make(F)); a.download = slug + '.zip'; a.click();
    st.className = 'ok'; st.textContent = '✔ Generated ' + F.length + ' files → ' + slug + '.zip';
  };
});
