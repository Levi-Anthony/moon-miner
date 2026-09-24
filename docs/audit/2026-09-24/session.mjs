// Audit session driver (2026-09-24, DEV-54). Run from the repo root:
//   node docs/audit/2026-09-24/session.mjs <output-dir>
// Starts Vite on :5199, drives desktop (keys) and phone (drag stick) for ~12 s
// each through window.__mm3d, prints state traces and console warnings as JSON,
// and writes screenshots. The Chromium path is this container's; edit to suit.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { setTimeout as delay } from 'node:timers/promises';
const OUT = process.argv[2];
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js','--port','5199','--strictPort'], { stdio:'ignore' });
await delay(3000);
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless:true, args:['--enable-unsafe-swiftshader','--disable-dev-shm-usage','--mute-audio'] });
const report = {};
try {
  for (const [name, vp, mobile] of [['desktop',{width:1280,height:800},false],['phone',{width:390,height:844},true]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: '+e.message));
    page.on('console', m => { if (m.type()==='error' || m.type()==='warning') errors.push(m.type()+': '+m.text()); });
    await page.goto('http://127.0.0.1:5199/');
    await page.waitForFunction(() => !!window.__mm3d, null, { timeout: 30000 });
    await delay(1500);
    await page.screenshot({ path: `${OUT}/${name}-01-boot.png` });
    const snap = () => page.evaluate(() => { const s = window.__mm3d.getState(); return { phase: s.phase, ore: s.rover?.ore, nanobots: s.nanobots, solar: s.solarSeconds, elapsed: s.elapsedSeconds, drone: s.drone?.status, pos: s.rover && { x: +s.rover.x?.toFixed?.(1), y: +s.rover.y?.toFixed?.(1) }, hud: document.body.innerText.slice(0,400) }; });
    const t0 = await snap();
    const trace = [t0];
    if (!mobile) {
      await page.keyboard.down('w');
      for (let i=0;i<24;i++) {
        const k = i%6<2 ? 'a' : i%6<3 ? 'd' : null;
        if (k) await page.keyboard.down(k);
        await delay(500);
        if (k) await page.keyboard.up(k);
        if (i===8) await page.keyboard.press(' ');
        if (i%6===5) trace.push(await snap());
        if (i===12) await page.screenshot({ path: `${OUT}/${name}-02-driving.png` });
      }
      await page.keyboard.up('w');
    } else {
      // virtual stick: drag upward from lower-centre
      const cx = vp.width/2, cy = vp.height*0.75;
      await page.mouse.move(cx, cy); await page.mouse.down();
      for (let i=0;i<20;i++) { await page.mouse.move(cx + (i%5-2)*15, cy - 60); await delay(400); }
      await page.screenshot({ path: `${OUT}/${name}-02-driving.png` });
      await page.mouse.up();
      trace.push(await snap());
    }
    await delay(500);
    trace.push(await snap());
    await page.screenshot({ path: `${OUT}/${name}-03-after.png` });
    report[name] = { errors: [...new Set(errors)].slice(0,20), trace };
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }
console.log(JSON.stringify(report, null, 1));
