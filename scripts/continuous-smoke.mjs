import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
const GAME_URL_PATH = '/';
const SNAPSHOT_SCRIPT_ID = 'moon-miner-continuous-debug-state';
const ARENA_ID = 'first-run-readable';
const DESKTOP_VIEWPORT = { width: 1040, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const LOCAL_STORAGE_KEYS = [
  'moon-miner-continuous-tuning-v3',
  'moon-miner-continuous-tuning-v4',
  'moon-miner-continuous-arena-v1',
  'moon-miner-camera-lab-v1',
  'moon-miner-drone-rail-lab-v1'
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const appPort = await getOpenPort();
  const vite = startVite(appPort);
  let browser;

  try {
    const appUrl = `http://127.0.0.1:${appPort}${GAME_URL_PATH}`;
    await waitForHttp(appUrl, 'Vite dev server');

    browser = await chromium.launch({
      executablePath: findChrome(),
      headless: true,
      args: [
        '--disable-background-networking',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--enable-unsafe-swiftshader',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run'
      ]
    });

    const { page } = await newHarnessPage(browser, appUrl, {
      viewport: DESKTOP_VIEWPORT,
      deviceScaleFactor: 1
    });
    await waitForSnapshot(page, 'continuous debug snapshot');
    const presentation = await verifyPresentation(page, appUrl);

    const desktopIdle = await verifyDesktopIdle(page);
    const steering = await verifySteering(page);
    const throttleBrake = await verifyThrottleAndBrake(page);
    const reclaimPreview = await verifyReclaimPreview(page);
    const drone = await verifyDroneLaunch(page);
    const droneReadability = await verifyDroneReadability(page);
    const { page: mobilePage } = await newHarnessPage(browser, `${appUrl}?mobile=1`, {
      viewport: MOBILE_VIEWPORT,
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true
    });
    const mobile = await verifyMobilePortrait(mobilePage);
    const { page: mobileDebugPage } = await newHarnessPage(browser, `${appUrl}?mobile=1&debug=1`, {
      viewport: DESKTOP_VIEWPORT,
      deviceScaleFactor: 1
    });
    const mobileDebug = await verifyMobileDebugWorkbench(mobileDebugPage);

    console.log('Continuous scene smoke passed.');
    console.log(
      [
        `A steer delta: ${steering.leftDelta.toFixed(3)} rad`,
        `D steer delta: ${steering.rightDelta.toFixed(3)} rad`,
        `desktop idle speed: ${desktopIdle.idleSpeed.toFixed(1)}, fields: ${desktopIdle.fieldCount}`,
        `idle/throttle/brake speeds: ${throttleBrake.idleSpeed.toFixed(1)} / ${throttleBrake.throttleSpeed.toFixed(1)} / ${throttleBrake.brakeSpeed.toFixed(1)}`,
        `reclaim preview payload/eta: +${reclaimPreview.payload.toFixed(1)} / ${reclaimPreview.etaSeconds.toFixed(1)}s`,
        `Space drone status: ${drone.status}, launches: ${drone.launches}`,
        `drone cues urgent/reserved/return/delivery: ${droneReadability.urgentNanobots.toFixed(1)}nb / ${droneReadability.reservedCount} fields / +${droneReadability.returnPayload.toFixed(1)} / +${droneReadability.deliveryAmount.toFixed(1)}`,
        `view modes default/chase: ${presentation.defaultViewMode} / ${presentation.chaseViewMode}`,
        `camera lab preset/hybrid: ${presentation.defaultCameraPreset} / ${presentation.hybridCameraPreset}`,
        `drone rail blocked/tuned: ${presentation.defaultBlockedReason} / ${presentation.tunedCandidateCount} candidates`,
        `dev overlay default/toggle/query: ${presentation.defaultHidden ? 'hidden' : 'visible'} / ${presentation.toggleVisible ? 'visible' : 'hidden'} / ${presentation.queryVisible ? 'visible' : 'hidden'}`,
        `HUD text bounds checked: ${presentation.textBoundsChecked}`,
        `mobile idle speed: ${mobile.idleSpeed.toFixed(1)}, deadzone speed: ${mobile.deadzoneSpeed.toFixed(1)}`,
        `mobile portrait drive delta: ${mobile.driveDelta.toFixed(3)} rad, speed ${mobile.driveSpeed.toFixed(1)}`,
        `mobile drone status: ${mobile.droneStatus}, launches: ${mobile.droneLaunches}`,
        `mobile tap target min: ${mobile.minTouchTarget.toFixed(1)}px, tap-to-nav: ${mobile.tapToNavigateDisabled ? 'disabled' : 'active'}`,
        `mobile debug workbench: ${mobileDebug.panelOutsideGame ? 'outside game' : 'overlapping'}`
      ].join('\n')
    );
  } finally {
    await browser?.close();
    stopProcess(vite);
  }
}

async function newHarnessPage(browser, url, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    deviceScaleFactor: options.deviceScaleFactor,
    hasTouch: Boolean(options.hasTouch),
    isMobile: Boolean(options.isMobile)
  });
  await context.addInitScript((keys) => {
    try {
      for (const key of keys) localStorage.removeItem(key);
    } catch {
      // Ignore hardened browser contexts; the harness still resets the scene via the debug hook.
    }
  }, LOCAL_STORAGE_KEYS);

  const page = await context.newPage();
  await page.goto(url);
  return { context, page };
}

async function verifyPresentation(page, appUrl) {
  const defaultSnapshot = await waitForSnapshot(page, 'clean default playtest view');
  const defaultTextBoundsChecked = assertUiLayout(defaultSnapshot, 'desktop', 'tactical');

  const defaultOverlay = await waitForOverlay(page, false, 'default hidden tuning panel');

  await page.keyboard.press('Backquote');
  const toggledOverlay = await waitForOverlay(page, true, 'backquote debug overlay toggle');

  await page.goto(`${appUrl}?view=chase`);
  const chaseSnapshot = await waitForSnapshot(page, 'chase view query snapshot', (snapshot) => {
    return snapshot.ui?.viewMode === 'chase' ? snapshot : undefined;
  });
  const chaseTextBoundsChecked = assertUiLayout(chaseSnapshot, 'desktop', 'chase');
  await waitForOverlay(page, false, 'chase query clean tuning panel');

  await page.goto(`${appUrl}?debug=1`);
  const debugSnapshot = await waitForSnapshot(page, 'debug query snapshot');
  const debugTextBoundsChecked = assertUiLayout(debugSnapshot, 'desktop', 'tactical');
  const queryOverlay = await waitForOverlay(page, true, 'debug query tuning panel');
  await page.evaluate(() => {
    window.__moonMinerContinuous?.setCameraPreset('hybridAuto');
  });
  const hybridCameraSnapshot = await waitForSnapshot(page, 'hybrid camera preset snapshot', (snapshot) => {
    return snapshot.ui?.cameraLab?.preset === 'hybridAuto' && snapshot.ui?.viewMode === 'hybrid' ? snapshot : undefined;
  });
  await page.evaluate(() => {
    window.__moonMinerContinuous?.setCameraPreset('tacticalMap');
  });
  await waitForSnapshot(page, 'camera lab reset snapshot', (snapshot) => {
    return snapshot.ui?.cameraLab?.preset === 'tacticalMap' && snapshot.ui?.viewMode === 'tactical' ? snapshot : undefined;
  });
  await page.evaluate(() => {
    window.__moonMinerContinuous?.setDynamicsTuning({
      reclaimMinFieldAgeSeconds: 0,
      reclaimMinDistanceFromRover: 0,
      allowCloseReclaim: true
    });
  });
  const tunedDynamicsSnapshot = await waitForSnapshot(page, 'tuned drone rail lab snapshot', (snapshot) => {
    return snapshot.ui?.droneRailLab?.tuning?.reclaimMinFieldAgeSeconds === 0 ? snapshot : undefined;
  });

  await page.goto(appUrl);
  const cleanSnapshot = await waitForSnapshot(page, 'clean snapshot after debug query');
  const cleanTextBoundsChecked = assertUiLayout(cleanSnapshot, 'desktop', 'tactical');
  await waitForOverlay(page, false, 'clean view after debug query');

  return {
    defaultHidden: !defaultOverlay.visible,
    toggleVisible: toggledOverlay.visible,
    queryVisible: queryOverlay.visible,
    defaultViewMode: defaultSnapshot.ui.viewMode,
    chaseViewMode: chaseSnapshot.ui.viewMode,
    defaultCameraPreset: defaultSnapshot.ui.cameraLab.preset,
    hybridCameraPreset: hybridCameraSnapshot.ui.cameraLab.preset,
    defaultBlockedReason: defaultSnapshot.ui.droneRailLab.blockedReason ?? 'available',
    tunedCandidateCount: tunedDynamicsSnapshot.ui.droneRailLab.candidateReclaimCount,
    textBoundsChecked: defaultTextBoundsChecked + chaseTextBoundsChecked + debugTextBoundsChecked + cleanTextBoundsChecked
  };
}

async function verifySteering(page) {
  const start = await resetContinuousScene(page);
  const startHeading = start.state.rover.heading;

  await page.keyboard.down('w');
  let left;
  try {
    left = await holdKeyUntil(page, 'a', 'W+A steering left', (snapshot) => {
      const delta = signedAngleDelta(startHeading, snapshot.state.rover.heading);
      return delta < -0.06 ? { snapshot, delta } : undefined;
    });
  } finally {
    await page.keyboard.up('w');
  }

  const beforeRight = await readSnapshot(page);
  await page.keyboard.down('w');
  let right;
  try {
    right = await holdKeyUntil(page, 'd', 'W+D steering right', (snapshot) => {
      const delta = signedAngleDelta(beforeRight.state.rover.heading, snapshot.state.rover.heading);
      return delta > 0.06 ? { snapshot, delta } : undefined;
    });
  } finally {
    await page.keyboard.up('w');
  }

  return {
    leftDelta: left.delta,
    rightDelta: right.delta
  };
}

async function verifyDesktopIdle(page) {
  const reset = await resetContinuousScene(page);
  const idle = await waitForSnapshot(page, 'desktop idle after reset', (snapshot) => {
    if (snapshot.state.elapsedSeconds <= reset.state.elapsedSeconds + 0.2) return undefined;
    if (snapshot.state.rover.speed !== 0) {
      throw new Error(`Desktop should idle at zero speed after reset, got ${snapshot.state.rover.speed}.`);
    }
    if (snapshot.state.fields.length !== reset.state.fields.length) {
      throw new Error('Desktop idle should not print field patches.');
    }
    return snapshot;
  });

  return {
    idleSpeed: idle.state.rover.speed,
    fieldCount: idle.state.fields.length
  };
}

async function verifyThrottleAndBrake(page) {
  const reset = await resetContinuousScene(page);
  const idle = await waitForSnapshot(page, 'desktop idle before throttle', (snapshot) => {
    if (snapshot.state.elapsedSeconds <= reset.state.elapsedSeconds + 0.16) return undefined;
    return snapshot.state.rover.speed === 0 ? snapshot : undefined;
  });
  const idleSpeed = idle.state.rover.speed;

  const throttle = await holdKeyUntil(page, 'w', 'W full throttle', (snapshot) => {
    return snapshot.state.rover.speed > 40 ? snapshot : undefined;
  });
  const throttleSpeed = throttle.state.rover.speed;

  const idleAgain = await waitForSnapshot(page, 'return to desktop idle', (snapshot) => {
    return snapshot.state.elapsedSeconds > throttle.state.elapsedSeconds + 0.05 && snapshot.state.rover.speed === 0
  });

  const brake = await holdKeyUntil(page, 's', 'S deliberate crawl', (snapshot) => {
    return snapshot.state.rover.speed > 0 && snapshot.state.rover.speed < throttleSpeed * 0.55 ? snapshot : undefined;
  });

  return {
    idleSpeed,
    throttleSpeed,
    brakeSpeed: brake.state.rover.speed
  };
}

async function verifyReclaimPreview(page) {
  const snapshot = await prepareReclaimableTrail(page);
  const preview = snapshot.ui?.droneCue?.previewTarget;
  if (!preview) throw new Error('Expected reclaim preview target after driving a raw-start trail.');
  if (!(snapshot.ui.droneCue.previewPayload > 0)) {
    throw new Error(`Expected positive reclaim preview payload, got ${snapshot.ui.droneCue.previewPayload}.`);
  }
  if (!(snapshot.ui.droneCue.previewEtaSeconds > 0)) {
    throw new Error(`Expected positive reclaim preview ETA, got ${snapshot.ui.droneCue.previewEtaSeconds}.`);
  }
  assertRectWithin(preview, snapshot.gameSize);

  return {
    payload: snapshot.ui.droneCue.previewPayload,
    etaSeconds: snapshot.ui.droneCue.previewEtaSeconds
  };
}

async function verifyDroneLaunch(page) {
  const ready = await prepareReclaimableTrail(page);
  if (ready.state.drone.status !== 'ready') {
    throw new Error(`Expected ready drone after preparing reclaimable trail, got ${ready.state.drone.status}.`);
  }
  if (!ready.ui?.droneCue?.previewTarget) throw new Error('Expected a reclaim target before launching the drone.');

  await page.keyboard.down('Space');
  try {
    const launched = await waitForSnapshot(page, 'Space drone launch', (snapshot) => {
      return snapshot.state.drone.status !== 'ready' && snapshot.loopSummary.droneLaunches === 1;
    });
    return {
      status: launched.state.drone.status,
      launches: launched.loopSummary.droneLaunches
    };
  } finally {
    await page.keyboard.up('Space');
  }
}

async function prepareReclaimableTrail(page) {
  await resetContinuousScene(page);
  return holdKeyUntil(
    page,
    'w',
    'raw-start trail with reclaim preview',
    (snapshot) => {
      const preview = snapshot.ui?.droneCue?.previewTarget;
      if (!preview) return undefined;
      if (!(snapshot.ui.droneCue.previewPayload > 0)) return undefined;
      if (!(snapshot.ui.droneCue.previewEtaSeconds > 0)) return undefined;
      return snapshot;
    },
    18000
  );
}

async function verifyDroneReadability(page) {
  await resetContinuousScene(page);
  await page.evaluate(() => {
    window.__moonMinerContinuous?.startSelfPlay();
  });

  const urgent = await waitForSnapshot(
    page,
    'low-buffer drone urgency cue',
    (snapshot) => {
      if (snapshot.state.drone.status !== 'ready') return undefined;
      if (snapshot.state.nanobots / snapshot.state.maxNanobots >= 0.32) return undefined;
      if (!snapshot.ui?.droneCue?.launchUrgent) {
        throw new Error(`Expected launch urgency cue at ${snapshot.state.nanobots.toFixed(1)} nanobots.`);
      }
      return snapshot;
    },
    30000
  );

  const reserved = await waitForSnapshot(
    page,
    'outbound reserved target cue',
    (snapshot) => {
      const reservedCount = snapshot.state.fields.filter((field) => field.reservedByDrone).length;
      const reserving = snapshot.state.drone.status === 'outbound' || snapshot.state.drone.status === 'reclaiming';
      if (!reserving || reservedCount <= 0) return undefined;
      if (!snapshot.ui?.droneCue?.reservedTarget) {
        throw new Error(`Expected reserved target snapshot for ${reservedCount} reserved fields.`);
      }
      return { snapshot, reservedCount };
    },
    50000
  );

  const returning = await waitForSnapshot(
    page,
    'return payload cue',
    (snapshot) => {
      if (snapshot.state.drone.status !== 'returning' || snapshot.state.drone.payload <= 0) return undefined;
      if (!snapshot.ui?.droneCue?.returnPayloadVisible) {
        throw new Error(`Expected return payload cue for +${snapshot.state.drone.payload.toFixed(1)}.`);
      }
      return snapshot;
    },
    12000
  );

  const delivery = await waitForSnapshot(
    page,
    'delivery burst readout cue',
    (snapshot) => {
      if (!snapshot.ui?.droneCue?.deliveryReadoutVisible) return undefined;
      if (!(snapshot.ui.droneCue.deliveryAmount > 0)) {
        throw new Error('Expected positive delivery amount in the delivery readout cue.');
      }
      return snapshot;
    },
    12000
  );

  return {
    urgentNanobots: urgent.state.nanobots,
    reservedCount: reserved.reservedCount,
    returnPayload: returning.state.drone.payload,
    deliveryAmount: delivery.ui.droneCue.deliveryAmount
  };
}

async function verifyMobilePortrait(page) {
  const first = await waitForSnapshot(page, 'portrait mobile snapshot', (snapshot) => {
    return snapshot.ui?.mode === 'mobilePortrait' ? snapshot : undefined;
  });
  const textBoundsChecked = assertUiLayout(first, 'mobilePortrait', 'tactical');
  await waitForOverlay(page, false, 'mobile default hidden tuning panel');
  const idle = await verifyMobileIdle(page);

  const tapReset = await resetContinuousScene(page);
  await clickScenePoint(page, tapReset, tapReset.gameSize.x * 0.5, tapReset.ui.hudHeight + 96);
  await page.waitForTimeout(120);
  const afterTap = await readSnapshot(page);
  if (afterTap.pointerTarget) {
    throw new Error(`Portrait mobile tap-to-navigate should be disabled, got ${JSON.stringify(afterTap.pointerTarget)}.`);
  }

  const drive = await verifyMobileDrive(page);
  const drone = await verifyMobileDroneLaunch(page);
  const minTouchTarget = await assertMobileTouchTargets(page, first);

  return {
    textBoundsChecked,
    idleSpeed: idle.idleSpeed,
    deadzoneSpeed: idle.deadzoneSpeed,
    driveDelta: drive.delta,
    driveSpeed: drive.speed,
    droneStatus: drone.status,
    droneLaunches: drone.launches,
    minTouchTarget,
    tapToNavigateDisabled: true
  };
}

async function verifyMobileDebugWorkbench(page) {
  const snapshot = await waitForSnapshot(page, 'mobile debug workbench snapshot', (candidate) => {
    return candidate.ui?.mode === 'mobilePortrait' && candidate.ui?.viewMode === 'tactical' && candidate.ui?.debugOverlayVisible
      ? candidate
      : undefined;
  });
  assertUiLayout(snapshot, 'mobilePortrait', 'tactical');
  await waitForOverlay(page, true, 'mobile debug tuning panel');

  const geometry = await page.evaluate(() => {
    const panel = document.getElementById('moon-miner-tuning-panel');
    const cameraPanel = document.getElementById('moon-miner-camera-lab');
    const droneRailPanel = document.getElementById('moon-miner-drone-rail-lab');
    const game = document.getElementById('game');
    const canvas = document.querySelector('canvas');
    const rect = (element) => {
      const bounds = element?.getBoundingClientRect();
      return bounds
        ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
        : undefined;
    };
    return {
      panel: rect(panel),
      cameraPanel: rect(cameraPanel),
      droneRailPanel: rect(droneRailPanel),
      game: rect(game),
      canvas: rect(canvas)
    };
  });
  if (!geometry.panel || !geometry.cameraPanel || !geometry.droneRailPanel || !geometry.game || !geometry.canvas) {
    throw new Error('Mobile debug workbench is missing panel, game, or canvas geometry.');
  }
  if (
    rectsOverlap(geometry.panel, geometry.game) ||
    rectsOverlap(geometry.panel, geometry.canvas) ||
    rectsOverlap(geometry.cameraPanel, geometry.game) ||
    rectsOverlap(geometry.cameraPanel, geometry.canvas) ||
    rectsOverlap(geometry.droneRailPanel, geometry.game) ||
    rectsOverlap(geometry.droneRailPanel, geometry.canvas)
  ) {
    throw new Error(`Mobile debug panel overlaps the portrait game: ${JSON.stringify(geometry)}.`);
  }

  return {
    panelOutsideGame: true
  };
}

async function verifyMobileIdle(page) {
  const reset = await resetContinuousScene(page);
  const idle = await waitForSnapshot(page, 'portrait mobile idle after release', (snapshot) => {
    if (snapshot.state.elapsedSeconds <= reset.state.elapsedSeconds + 0.2) return undefined;
    if (snapshot.state.rover.speed !== 0) {
      throw new Error(`Portrait mobile should idle at zero speed after release, got ${snapshot.state.rover.speed}.`);
    }
    if (snapshot.state.fields.length !== reset.state.fields.length) {
      throw new Error('Portrait mobile idle should not print field patches.');
    }
    if (snapshot.state.rover.ore !== reset.state.rover.ore) {
      throw new Error('Portrait mobile idle should not mine ore.');
    }
    return snapshot;
  });

  const drive = idle.ui.controls?.drive;
  if (!drive) throw new Error('Portrait mobile snapshot is missing drive control geometry.');
  const start = {
    x: drive.x + drive.width * 0.5,
    y: drive.y + drive.height * 0.52
  };
  const end = {
    x: start.x + drive.width * 0.025,
    y: start.y - drive.height * 0.025
  };

  const deadzone = await dragScenePointUntil(page, idle, start, end, 'portrait mobile drive deadzone', (snapshot) => {
    if (snapshot.state.elapsedSeconds <= idle.state.elapsedSeconds + 0.12) return undefined;
    if (snapshot.state.rover.speed !== 0) {
      throw new Error(`Portrait mobile deadzone should idle at zero speed, got ${snapshot.state.rover.speed}.`);
    }
    return snapshot;
  });

  return {
    idleSpeed: idle.state.rover.speed,
    deadzoneSpeed: deadzone.state.rover.speed
  };
}

async function verifyMobileDrive(page) {
  const reset = await resetContinuousScene(page);
  const drive = reset.ui.controls?.drive;
  if (!drive) throw new Error('Portrait mobile snapshot is missing drive control geometry.');

  const startHeading = reset.state.rover.heading;
  const start = {
    x: drive.x + drive.width * 0.5,
    y: drive.y + drive.height * 0.52
  };
  const end = {
    x: start.x + drive.width * 0.34,
    y: start.y - drive.height * 0.2
  };

  const driven = await dragScenePointUntil(page, reset, start, end, 'portrait mobile thumb drive', (snapshot) => {
    const delta = signedAngleDelta(startHeading, snapshot.state.rover.heading);
    return delta > 0.045 && snapshot.state.rover.speed > 0 ? { snapshot, delta } : undefined;
  });

  return {
    delta: driven.delta,
    speed: driven.snapshot.state.rover.speed
  };
}

async function verifyMobileDroneLaunch(page) {
  const ready = await prepareMobileReclaimableTrail(page);
  const launch = ready.ui.buttons.launch;
  await clickScenePoint(page, ready, launch.x + launch.width * 0.5, launch.y + launch.height * 0.5);
  const launched = await waitForSnapshot(page, 'portrait mobile drone launch', (snapshot) => {
    return snapshot.state.drone.status !== 'ready' && snapshot.loopSummary.droneLaunches === 1 ? snapshot : undefined;
  });

  return {
    status: launched.state.drone.status,
    launches: launched.loopSummary.droneLaunches
  };
}

async function prepareMobileReclaimableTrail(page) {
  const reset = await resetContinuousScene(page);
  const drive = reset.ui.controls?.drive;
  if (!drive) throw new Error('Portrait mobile snapshot is missing drive control geometry.');

  const start = {
    x: drive.x + drive.width * 0.5,
    y: drive.y + drive.height * 0.52
  };
  const end = {
    x: start.x + drive.width * 0.08,
    y: start.y - drive.height * 0.34
  };

  return dragScenePointUntil(
    page,
    reset,
    start,
    end,
    'portrait mobile reclaimable trail',
    (snapshot) => {
      const preview = snapshot.ui?.droneCue?.previewTarget;
      if (!preview) return undefined;
      if (!(snapshot.ui.droneCue.previewPayload > 0)) return undefined;
      return snapshot;
    },
    18000
  );
}

async function assertMobileTouchTargets(page, snapshot) {
  const scale = await getSceneToViewportScale(page, snapshot);
  const launch = snapshot.ui.buttons.launch;
  const drive = snapshot.ui.controls?.drive;
  if (!drive) throw new Error('Portrait mobile snapshot is missing drive target geometry.');

  const sizes = [
    Math.min(launch.width * scale.x, launch.height * scale.y),
    Math.min(drive.width * scale.x, drive.height * scale.y)
  ];
  const min = Math.min(...sizes);
  if (min < 48) {
    throw new Error(`Portrait mobile touch target is too small: ${min.toFixed(1)} CSS px.`);
  }
  return min;
}

async function resetContinuousScene(page) {
  await page.evaluate((arenaId) => {
    window.__moonMinerContinuous?.setArena(arenaId);
    return true;
  }, ARENA_ID);

  return waitForSnapshot(page, 'fresh continuous scene reset', (snapshot) => {
    return (
      snapshot.arenaId === ARENA_ID &&
      snapshot.state.arenaId === ARENA_ID &&
      snapshot.state.elapsedSeconds < 0.5 &&
      snapshot.state.phase === 'playing' &&
      snapshot.state.drone.status === 'ready'
    );
  });
}

async function clickScenePoint(page, snapshot, x, y) {
  const point = await sceneToViewportPoint(page, snapshot, x, y);
  await page.mouse.click(point.x, point.y);
}

async function dragScenePointUntil(page, snapshot, start, end, label, predicate, timeoutMs = 8000) {
  const startPoint = await sceneToViewportPoint(page, snapshot, start.x, start.y);
  const endPoint = await sceneToViewportPoint(page, snapshot, end.x, end.y);
  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y, { steps: 8 });
  try {
    return await waitForSnapshot(page, label, predicate, timeoutMs);
  } finally {
    await page.mouse.up();
  }
}

async function sceneToViewportPoint(page, snapshot, x, y) {
  const scale = await getSceneToViewportScale(page, snapshot);
  return {
    x: scale.rect.x + x * scale.x,
    y: scale.rect.y + y * scale.y
  };
}

async function getSceneToViewportScale(page, snapshot) {
  const rect = await page.locator('canvas').boundingBox();
  if (!rect) throw new Error('Could not read canvas bounds.');
  return {
    rect,
    x: rect.width / snapshot.gameSize.x,
    y: rect.height / snapshot.gameSize.y
  };
}

async function holdKeyUntil(page, key, label, predicate, timeoutMs = 8000) {
  await page.keyboard.down(key);
  try {
    return await waitForSnapshot(page, label, predicate, timeoutMs);
  } finally {
    await page.keyboard.up(key);
  }
}

async function waitForOverlay(page, expectedVisible, label) {
  return waitFor(label, async () => {
    const overlay = await readOverlayState(page);
    return overlay.visible === expectedVisible ? overlay : undefined;
  });
}

async function readOverlayState(page) {
  return page.evaluate(() => {
    const panel = document.getElementById('moon-miner-tuning-panel');
    if (!panel) return { exists: false, visible: false };
    const styles = window.getComputedStyle(panel);
    const rect = panel.getBoundingClientRect();
    return {
      exists: true,
      hidden: panel.hidden,
      display: styles.display,
      visible: !panel.hidden && styles.display !== 'none' && rect.width > 0 && rect.height > 0,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    };
  });
}

async function waitForSnapshot(page, label, predicate = () => true, timeoutMs = 8000, intervalMs = 50) {
  return waitFor(label, async () => {
    const snapshot = await readSnapshot(page);
    if (!snapshot) return undefined;
    const result = predicate(snapshot);
    return result === true ? snapshot : result;
  }, timeoutMs, intervalMs);
}

function assertUiLayout(snapshot, expectedMode, expectedViewMode = 'tactical') {
  const ui = snapshot.ui;
  if (!ui) throw new Error('Debug snapshot is missing UI layout metadata.');
  if (ui.mode !== expectedMode) throw new Error(`Expected ${expectedMode} layout, got ${ui.mode}.`);
  if (ui.viewMode !== expectedViewMode) throw new Error(`Expected ${expectedViewMode} view mode, got ${ui.viewMode}.`);
  if (!ui.cameraLab) throw new Error('Debug snapshot is missing Camera Lab metadata.');
  if (ui.cameraLab.viewMode !== ui.viewMode) {
    throw new Error(`Camera Lab view mode ${ui.cameraLab.viewMode} does not match UI view mode ${ui.viewMode}.`);
  }
  if (!ui.cameraLab.preset || !ui.cameraLab.projectionMode) {
    throw new Error(`Camera Lab snapshot is missing preset/projection metadata: ${JSON.stringify(ui.cameraLab)}.`);
  }
  if (!ui.droneRailLab) throw new Error('Debug snapshot is missing Drone / Rail Lab metadata.');
  if (typeof ui.droneRailLab.candidateReclaimCount !== 'number') {
    throw new Error(`Drone / Rail Lab snapshot is missing candidate count: ${JSON.stringify(ui.droneRailLab)}.`);
  }
  if (!ui.droneRailLab.tuning || typeof ui.droneRailLab.tuning.reclaimMinFieldAgeSeconds !== 'number') {
    throw new Error(`Drone / Rail Lab snapshot is missing dynamics tuning: ${JSON.stringify(ui.droneRailLab)}.`);
  }
  if (ui.droneRailLab.bestTargetRefillEta !== undefined && !(ui.droneRailLab.bestTargetRefillEta > 0)) {
    throw new Error(`Drone / Rail Lab best target ETA should be positive: ${JSON.stringify(ui.droneRailLab)}.`);
  }
  if (ui.hudHeight < 80) throw new Error(`HUD height is too small for the readable layout: ${ui.hudHeight}.`);

  const controls =
    ui.mode === 'mobilePortrait'
      ? [...ui.vitals, ui.stateChip, ui.buttons.reset, ui.buttons.launch, ui.controls?.drive].filter(Boolean)
      : [...ui.vitals, ui.stateChip, ui.buttons.launch, ui.buttons.reset];
  for (const rect of controls) {
    assertRectWithin(rect, snapshot.gameSize);
    if (ui.mode === 'desktop' && rect.y + rect.height > ui.hudHeight) {
      throw new Error(`HUD control escapes the top HUD band: ${JSON.stringify(rect)}.`);
    }
  }

  if (ui.mode === 'mobilePortrait') {
    const topControls = [...ui.vitals, ui.stateChip, ui.buttons.reset];
    for (const rect of topControls) {
      if (rect.y + rect.height > ui.hudHeight) {
        throw new Error(`Portrait HUD control escapes the top HUD band: ${JSON.stringify(rect)}.`);
      }
    }
    if (!ui.controls?.drive) throw new Error('Portrait mobile layout is missing drive control.');
    if (ui.buttons.launch.width < 120 || ui.buttons.launch.height < 64) {
      throw new Error(`Portrait launch button is too small in scene units: ${JSON.stringify(ui.buttons.launch)}.`);
    }
    if (ui.controls.drive.width < 160 || ui.controls.drive.height < 120) {
      throw new Error(`Portrait drive target is too small in scene units: ${JSON.stringify(ui.controls.drive)}.`);
    }
    if (rectsOverlap(ui.buttons.launch, ui.controls.drive)) {
      throw new Error('Portrait drive control overlaps the drone button.');
    }
  }

  for (let index = 0; index < controls.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < controls.length; otherIndex += 1) {
      if (rectsOverlap(controls[index], controls[otherIndex])) {
        throw new Error(`HUD controls overlap: ${JSON.stringify(controls[index])} and ${JSON.stringify(controls[otherIndex])}.`);
      }
    }
  }

  return assertHudTextLayout(ui, snapshot.gameSize);
}

function assertHudTextLayout(ui, gameSize) {
  if (!ui.textBounds) throw new Error('Debug snapshot is missing rendered text bounds.');

  const checks = [
    ['vital-Nanobots-label', ui.vitals[0]],
    ['vital-Nanobots-value', ui.vitals[0]],
    ['vital-Ore-label', ui.vitals[1]],
    ['vital-Ore-value', ui.vitals[1]],
    ['vital-Sun-label', ui.vitals[2]],
    ['vital-Sun-value', ui.vitals[2]],
    ['state-chip-label', ui.stateChip],
    ['state-chip-detail', ui.stateChip],
    ['button-launch-title', ui.buttons.launch],
    ['button-launch-status', ui.buttons.launch],
    ['button-reset', ui.buttons.reset]
  ];

  for (const [name, container] of checks) {
    const bounds = ui.textBounds[name];
    if (!bounds) throw new Error(`Missing rendered text bounds for ${name}.`);
    assertRectWithinPadded(bounds, container, 4, `${name} inside ${JSON.stringify(container)}`);
  }

  const yieldBounds = ui.textBounds['yield-readout'];
  if (!yieldBounds) throw new Error('Missing rendered text bounds for yield-readout.');
  assertRectWithin(yieldBounds, gameSize);
  if (yieldBounds.y + yieldBounds.height > ui.hudHeight) {
    throw new Error(`Yield readout escapes the HUD band: ${JSON.stringify(yieldBounds)}.`);
  }

  return checks.length + 1;
}

function assertRectWithin(rect, bounds) {
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > bounds.x || rect.y + rect.height > bounds.y) {
    throw new Error(`UI rect is outside the game bounds: ${JSON.stringify(rect)}.`);
  }
}

function assertRectWithinPadded(rect, bounds, tolerance, label) {
  if (
    rect.x < bounds.x - tolerance ||
    rect.y < bounds.y - tolerance ||
    rect.x + rect.width > bounds.x + bounds.width + tolerance ||
    rect.y + rect.height > bounds.y + bounds.height + tolerance
  ) {
    throw new Error(`Rendered text escapes ${label}: ${JSON.stringify(rect)}.`);
  }
}

function rectsOverlap(first, second) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

async function readSnapshot(page) {
  return page.evaluate((snapshotScriptId) => {
    const element = document.getElementById(snapshotScriptId);
    if (!element?.textContent) return null;
    return JSON.parse(element.textContent);
  }, SNAPSHOT_SCRIPT_ID);
}

function startVite(port) {
  const viteBin = `${PROJECT_ROOT}node_modules/vite/bin/vite.js`;
  if (!existsSync(viteBin)) {
    throw new Error('Vite is not installed. Run `npm install` before the smoke harness.');
  }

  return spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);

  const chromePath = candidates.find((candidate) => existsSync(candidate));
  if (!chromePath) {
    throw new Error('Could not find Chrome/Chromium. Set CHROME_PATH to a headless-capable browser executable.');
  }
  return chromePath;
}

async function waitFor(label, probe, timeoutMs = 8000, intervalMs = 50) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const result = await probe();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(intervalMs);
  }

  const cause = lastError instanceof Error ? ` Last error: ${lastError.message}` : '';
  throw new Error(`Timed out waiting for ${label}.${cause}`);
}

async function waitForHttp(url, label) {
  return waitFor(label, async () => {
    const response = await httpRequest(url);
    return response.statusCode && response.statusCode < 500;
  });
}

function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ statusCode: response.statusCode, body });
      });
    });
    request.on('error', reject);
    request.setTimeout(1000, () => {
      request.destroy(new Error(`Timed out requesting ${url}`));
    });
  });
}

function getOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Could not allocate a local port.')));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

function stopProcess(child) {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
}

function signedAngleDelta(from, to) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}
