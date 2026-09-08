import Phaser from 'phaser';
import {
  createContinuousWorld,
  DEFAULT_DYNAMICS_PRESET_ID,
  DYNAMICS_PRESETS,
  findFertileZoneAt,
  getDroneReclaimDiagnostics,
  getPreparedCoverage,
  getContinuousGuidance,
  carryDepletionOvernight,
  carryFieldsOvernight,
  type FieldPatch,
  getReclaimPreview,
  isRoadSpendable,
  isRoverAtExtraction,
  launchReclaimDrone,
  resolveContinuousTuning,
  tickContinuousWorld,
  type ContinuousInput,
  type ContinuousPhase,
  type ContinuousTuning,
  type ContinuousWorldState,
  type DynamicsPresetDefinition,
  type DynamicsPresetId,
  type DroneReclaimDiagnostics,
  type DroneStatus,
  type FertileZone,
  type ReclaimPreview,
  type SpeedState,
  type Vec2
} from '../game/continuous';
import {
  CONTINUOUS_ARENAS,
  DEFAULT_CONTINUOUS_ARENA_ID,
  type ContinuousArenaId
} from '../game/continuousArena';
import {
  createContinuousLoopTrace,
  getContinuousLoopSummary,
  recordContinuousLoopDroneLaunch,
  recordContinuousLoopTick,
  type ContinuousLoopSummary,
  type ContinuousLoopTrace
} from '../game/continuousTrace';
import {
  getDefaultContinuousSelfPlayRouteId,
  getContinuousSelfPlayInput,
  getContinuousSelfPlayRoute,
  getContinuousSelfPlayTarget,
  type ContinuousSelfPlayRoute,
  type ContinuousSelfPlayRouteId,
  type ContinuousSelfPlayWaypoint
} from '../game/continuousSelfPlay';

const DESKTOP_HUD_HEIGHT = 86;
const MOBILE_PORTRAIT_HUD_HEIGHT = 132;
const DESKTOP_CAMERA_CENTER_Y = 505;
const FIELD_DECK_COLOR = 0x6d8f89;

function mixColor(from: number, to: number, t: number): number {
  const lerp = (shift: number) => {
    const a = (from >> shift) & 0xff;
    const b = (to >> shift) & 0xff;
    return Math.round(a + (b - a) * t) << shift;
  };
  return lerp(16) | lerp(8) | lerp(0);
}
const MOBILE_CAMERA_CENTER_Y = 475;
const DESKTOP_CAMERA_LOOK_AHEAD = 92;
const MOBILE_CAMERA_LOOK_AHEAD = 138;
const DESKTOP_CAMERA_ZOOM = 1.16;
const MOBILE_CAMERA_ZOOM = 1.28;
const DESKTOP_TACTICAL_ZOOM = 0.88;
const MOBILE_TACTICAL_ZOOM = 0.58;
const PROJECTED_Y_SCALE = 0.78;
const PROJECTED_SHEAR = -0.1;
const CAMERA_TURN_RESPONSE = 1.75;
const TACTICAL_CAMERA_RESPONSE = 1.4;
const LOW_NANOBOT_RATIO = 0.18;
const DRONE_URGENCY_RATIO = 0.32;
const DELIVERY_READOUT_MS = 1260;
const TUNING_STORAGE_KEY = 'moon-miner-continuous-tuning-v5';
const CARRIED_ROAD_STORAGE_KEY = 'moon-miner-carried-road-v1';
const ARENA_STORAGE_KEY = 'moon-miner-continuous-arena-v1';
const CAMERA_LAB_STORAGE_KEY = 'moon-miner-camera-lab-v1';
const DRONE_RAIL_LAB_STORAGE_KEY = 'moon-miner-drone-rail-lab-v1';
const TERRAIN_CRATER_COUNT = 18;
const TERRAIN_FISSURE_COUNT = 22;

type ButtonId = 'launch' | 'reset';
type EffectKind = 'launch' | 'delivery' | 'recovery' | 'sprint' | 'build' | 'crawl' | 'mine' | 'win' | 'loss' | 'blocked';
type ArmRole = 'building' | 'mining' | 'stabilizing' | 'emergency' | 'helper';
type LayoutMode = 'desktop' | 'mobilePortrait';
type ViewMode = 'tactical' | 'chase' | 'hybrid';
type TuningKey = keyof ContinuousTuning;
type CameraPresetId = 'tacticalMap' | 'tractorChase';
type NumericTuningKey = {
  [Key in keyof ContinuousTuning]: ContinuousTuning[Key] extends number ? Key : never;
}[keyof ContinuousTuning];
type BooleanTuningKey = {
  [Key in keyof ContinuousTuning]: ContinuousTuning[Key] extends boolean ? Key : never;
}[keyof ContinuousTuning];
type NumericCameraControlKey = {
  [Key in keyof CameraLabSettings]: CameraLabSettings[Key] extends number ? Key : never;
}[keyof CameraLabSettings];
type BooleanCameraControlKey = {
  [Key in keyof CameraLabSettings]: CameraLabSettings[Key] extends boolean ? Key : never;
}[keyof CameraLabSettings];

interface CameraLabSettings {
  preset: CameraPresetId;
  viewMode: ViewMode;
  cameraZoom: number;
  tacticalZoom: number;
  cameraCenterX: number;
  cameraCenterY: number;
  roverScreenBias: number;
  lookAheadDistance: number;
  smoothing: number;
  turnResponse: number;
  maxCameraRotation: number;
  rotationBlendAmount: number;
  followBlend: number;
  followDeadzone: number;
  worldLabelsVisible: boolean;
  cameraYawRate: number;
  cameraMaxYawLag: number;
  cameraYawDeadzone: number;
  cameraPitchDegrees: number;
  cameraRigDistance: number;
  projectedYScale: number;
  projectionShear: number;
  depthScaleStrength: number;
  projectedScaleStrength: number;
  gridVisible: boolean;
  horizonVisible: boolean;
  zoomOutLowNanobots: boolean;
  zoomOutDroneReadyWithPreview: boolean;
  zoomOutDroneActive: boolean;
  zoomOutDuringCrawl: boolean;
  temporaryWiderViewOnLaunch: boolean;
  returnToNormalDelay: number;
  tacticalPullbackStrength: number;
  overlayCameraFocus: boolean;
  overlayRoverHeading: boolean;
  overlayCameraForward: boolean;
  overlayScreenBounds: boolean;
  overlayReclaimPreview: boolean;
  overlayDroneRoute: boolean;
  overlayFieldAgeValue: boolean;
  overlayProjectionLabel: boolean;
}

interface CameraPresetDefinition {
  id: CameraPresetId;
  label: string;
  settings: CameraLabSettings;
}

interface CameraControlDefinition {
  key: NumericCameraControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
}

interface CameraToggleDefinition {
  key: BooleanCameraControlKey;
  label: string;
}

interface TuningNumericControlDefinition {
  key: NumericTuningKey;
  label: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
}

interface TuningBooleanControlDefinition {
  key: BooleanTuningKey;
  label: string;
}

interface DroneRailLabSettings {
  selectedDynamicsPresetId: DynamicsPresetId;
  overlayReclaimEligibility: boolean;
  overlayFieldAge: boolean;
  overlayFieldValue: boolean;
  overlaySelectedDroneTarget: boolean;
  overlayRejectedReclaimCandidates: boolean;
  overlayDroneRoute: boolean;
  overlayRefillEtaLabels: boolean;
  overlayPreparedCoverage: boolean;
  overlayPreparedMagnetInfluence: boolean;
  overlayFieldEmissionPoints: boolean;
  overlayCrawlEmissionPoints: boolean;
}

type DroneRailOverlayKey = {
  [Key in keyof DroneRailLabSettings]: DroneRailLabSettings[Key] extends boolean ? Key : never;
}[keyof DroneRailLabSettings];

interface DroneRailOverlayDefinition {
  key: DroneRailOverlayKey;
  label: string;
}

interface SceneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SceneLayout {
  mode: LayoutMode;
  width: number;
  height: number;
  hudHeight: number;
  controlBandTop?: number;
  cameraCenterX: number;
  cameraCenterY: number;
  cameraLookAhead: number;
  cameraZoom: number;
  message: SceneRect & { fontSize: number };
  vitals: SceneRect[];
  stateChip: SceneRect;
  launchButton: SceneRect;
  resetButton: SceneRect;
  drive?: SceneRect;
  yieldReadout: { x: number; y: number; fontSize: number };
}

interface TuningControlDefinition {
  key: NumericTuningKey;
  label: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
}

const TUNING_CONTROLS: TuningControlDefinition[] = [
  { key: 'preparedSpeed', label: 'Normal speed', min: 60, max: 150, step: 1 },
  { key: 'fabricatingSpeed', label: 'Raw speed', min: 45, max: 120, step: 1 },
  { key: 'crawlSpeed', label: 'Crawl speed', min: 8, max: 32, step: 1 },
  { key: 'fabricateCostPerSecond', label: 'Fabrication drain', min: 1, max: 4.2, step: 0.1, precision: 1 },
  { key: 'droneSpeed', label: 'Drone speed', min: 260, max: 620, step: 10 },
  { key: 'dronePickupRadius', label: 'Drone pickup', min: 70, max: 260, step: 2 },
  { key: 'crawlRecoveryPerSecond', label: 'Crawl recovery', min: 0.02, max: 0.3, step: 0.01, precision: 2 },
  { key: 'mineRate', label: 'Mining yield', min: 0.18, max: 0.55, step: 0.01, precision: 2 },
  { key: 'startingNanobots', label: 'Start stock', min: 3, max: 16, step: 1 },
  { key: 'startingSolarSeconds', label: 'Sun window', min: 90, max: 220, step: 5 },
  { key: 'preparedFieldMinAgeSeconds', label: 'Prep delay', min: 0.2, max: 1.4, step: 0.05, precision: 2 }
];

const DRONE_RAIL_NUMERIC_GROUPS: Array<{ label: string; controls: TuningNumericControlDefinition[] }> = [
  {
    label: 'Launch Gating',
    controls: [
      { key: 'reclaimMinFieldAgeSeconds', label: 'Reclaim min age', min: 0, max: 8, step: 0.05, precision: 2 },
      { key: 'reclaimMinFieldValue', label: 'Reclaim min value', min: 0, max: 0.4, step: 0.005, precision: 3 },
      { key: 'reclaimMinDistanceFromRover', label: 'Min distance', min: 0, max: 220, step: 1 },
      { key: 'dronePickupRadius', label: 'Pickup radius', min: 40, max: 260, step: 2 },
      { key: 'droneSpeed', label: 'Drone speed', min: 180, max: 760, step: 10 },
      { key: 'reclaimLockSeconds', label: 'Reclaim lock', min: 0.05, max: 2.5, step: 0.01, precision: 2 },
      { key: 'minReclaimClusterPayload', label: 'Min payload', min: 0, max: 1.2, step: 0.01, precision: 2 },
      { key: 'minReclaimCandidateCount', label: 'Min candidates', min: 1, max: 6, step: 1 }
    ]
  },
  {
    label: 'Target Scoring',
    controls: [
    ]
  },
  {
    label: 'Rail / Field',
    controls: [
      { key: 'fieldRadius', label: 'Field radius', min: 18, max: 82, step: 1 },
      { key: 'fieldEmitDistance', label: 'Normal emit dist', min: 8, max: 80, step: 1 },
      { key: 'crawlFieldEmitDistance', label: 'Crawl emit dist', min: 4, max: 48, step: 1 },
      { key: 'normalFieldPatchMinValue', label: 'Normal min value', min: 0.01, max: 0.5, step: 0.005, precision: 3 },
      { key: 'crawlFieldPatchMinValue', label: 'Crawl min value', min: 0.005, max: 0.16, step: 0.005, precision: 3 },
      { key: 'fabricateCostPerSecond', label: 'Fabrication drain', min: 0.2, max: 5, step: 0.05, precision: 2 },
      { key: 'fieldValueMultiplierFromSpentStock', label: 'Spent stock value', min: 0.2, max: 2.4, step: 0.05, precision: 2 },
      { key: 'startingFieldValue', label: 'Starting field value', min: 0.1, max: 2, step: 0.05, precision: 2 },
      { key: 'maxFieldPatches', label: 'Max patches', min: 120, max: 1800, step: 20 },
      { key: 'trimmableCrawlFieldValue', label: 'Trim crawl value', min: 0.005, max: 0.25, step: 0.005, precision: 3 }
    ]
  },
  {
    label: 'Prepared Field',
    controls: [
      { key: 'preparedFieldMinAgeSeconds', label: 'Prepared min age', min: 0.1, max: 4, step: 0.05, precision: 2 },
      { key: 'preparedCoverageThreshold', label: 'Coverage threshold', min: 0.02, max: 0.8, step: 0.01, precision: 2 },
      { key: 'preparedFieldMinValue', label: 'Prepared min value', min: 0, max: 0.5, step: 0.005, precision: 3 },
      { key: 'preparedMagnetInfluenceMultiplier', label: 'Magnet influence', min: 0, max: 3.5, step: 0.05, precision: 2 },
      { key: 'preparedMagnetCenterPull', label: 'Center pull', min: 0, max: 2, step: 0.05, precision: 2 },
      { key: 'preparedMagnetPassiveTurnRate', label: 'Passive turn', min: 0, max: 5, step: 0.05, precision: 2 },
      { key: 'preparedMagnetActiveTurnRate', label: 'Active turn', min: 0, max: 2, step: 0.05, precision: 2 },
      { key: 'preparedMagnetCorrectionRange', label: 'Correction range', min: 0.1, max: 2, step: 0.05, precision: 2 }
    ]
  },
  {
    label: 'Stock / Crawl',
    controls: [
      { key: 'startingNanobots', label: 'Starting stock', min: 0, max: 24, step: 1 },
      { key: 'maxNanobots', label: 'Max stock', min: 8, max: 64, step: 1 },
      { key: 'crawlRecoveryPerSecond', label: 'Crawl recovery', min: 0, max: 0.5, step: 0.01, precision: 2 },
      { key: 'crawlSpeed', label: 'Crawl speed', min: 4, max: 44, step: 1 },
      { key: 'fabricatingSpeed', label: 'Raw speed', min: 30, max: 140, step: 1 },
      { key: 'preparedSpeed', label: 'Prepared speed', min: 40, max: 180, step: 1 },
      { key: 'lowStockWarningRatio', label: 'Low-stock ratio', min: 0.02, max: 0.6, step: 0.01, precision: 2 },
      { key: 'droneUrgencyRatio', label: 'Drone urgency ratio', min: 0.02, max: 0.75, step: 0.01, precision: 2 }
    ]
  }
];

const DRONE_RAIL_BOOLEAN_CONTROLS: TuningBooleanControlDefinition[] = [
  { key: 'allowCloseReclaim', label: 'Allow close reclaim' },
  { key: 'allowLowPayloadLaunch', label: 'Allow low payload launch' }
];

const DEFAULT_DRONE_RAIL_LAB_SETTINGS: DroneRailLabSettings = {
  selectedDynamicsPresetId: DEFAULT_DYNAMICS_PRESET_ID,
  overlayReclaimEligibility: false,
  overlayFieldAge: false,
  overlayFieldValue: false,
  overlaySelectedDroneTarget: false,
  overlayRejectedReclaimCandidates: false,
  overlayDroneRoute: false,
  overlayRefillEtaLabels: false,
  overlayPreparedCoverage: false,
  overlayPreparedMagnetInfluence: false,
  overlayFieldEmissionPoints: false,
  overlayCrawlEmissionPoints: false
};

const DRONE_RAIL_OVERLAY_CONTROLS: DroneRailOverlayDefinition[] = [
  { key: 'overlayReclaimEligibility', label: 'Reclaim eligibility' },
  { key: 'overlayFieldAge', label: 'Field age visualization' },
  { key: 'overlayFieldValue', label: 'Field value visualization' },
  { key: 'overlaySelectedDroneTarget', label: 'Selected drone target' },
  { key: 'overlayRejectedReclaimCandidates', label: 'Rejected reclaim candidates' },
  { key: 'overlayDroneRoute', label: 'Drone route line' },
  { key: 'overlayRefillEtaLabels', label: 'Refill ETA labels' },
  { key: 'overlayPreparedCoverage', label: 'Prepared coverage' },
  { key: 'overlayPreparedMagnetInfluence', label: 'Prepared magnet influence' },
  { key: 'overlayFieldEmissionPoints', label: 'Field emission points' },
  { key: 'overlayCrawlEmissionPoints', label: 'Crawl emission points' }
];

const DEFAULT_CAMERA_LAB_SETTINGS: CameraLabSettings = {
  preset: 'tacticalMap',
  viewMode: 'tactical',
  cameraZoom: DESKTOP_CAMERA_ZOOM,
  tacticalZoom: DESKTOP_TACTICAL_ZOOM,
  cameraCenterX: 0,
  cameraCenterY: 0,
  roverScreenBias: 0,
  lookAheadDistance: DESKTOP_CAMERA_LOOK_AHEAD,
  smoothing: TACTICAL_CAMERA_RESPONSE,
  turnResponse: CAMERA_TURN_RESPONSE,
  maxCameraRotation: 42,
  rotationBlendAmount: 0.2,
  followBlend: 0,
  followDeadzone: 90,
  worldLabelsVisible: false,
  // The tractor turns at 2.25 rad/s. The camera turns slower on purpose, so a
  // held turn swings the tractor out to the side of frame with its flank and
  // the fresh track in view, and the camera never quite catches up until the
  // turn stops.
  cameraYawRate: 1.1,
  cameraMaxYawLag: 74,
  cameraYawDeadzone: 6,
  cameraPitchDegrees: 32,
  cameraRigDistance: 250,
  projectedYScale: 1,
  projectionShear: 0,
  depthScaleStrength: 0,
  projectedScaleStrength: 0,
  gridVisible: true,
  horizonVisible: false,
  zoomOutLowNanobots: true,
  zoomOutDroneReadyWithPreview: true,
  zoomOutDroneActive: true,
  zoomOutDuringCrawl: true,
  temporaryWiderViewOnLaunch: true,
  returnToNormalDelay: 1.4,
  tacticalPullbackStrength: 0.55,
  overlayCameraFocus: false,
  overlayRoverHeading: false,
  overlayCameraForward: false,
  overlayScreenBounds: false,
  overlayReclaimPreview: false,
  overlayDroneRoute: false,
  overlayFieldAgeValue: false,
  overlayProjectionLabel: true
};

const CAMERA_PRESETS: CameraPresetDefinition[] = [
  {
    id: 'tacticalMap',
    label: 'Tactical Map',
    settings: { ...DEFAULT_CAMERA_LAB_SETTINGS }
  },
  {
    id: 'tractorChase',
    label: 'Tractor Chase',
    settings: {
      ...DEFAULT_CAMERA_LAB_SETTINGS,
      preset: 'tractorChase',
      viewMode: 'chase',
      cameraZoom: 1.38,
      cameraCenterY: -18,
      roverScreenBias: 12,
      lookAheadDistance: 24,
      smoothing: 3.4,
      followDeadzone: 30,
      followBlend: 0,
      projectedYScale: 0.7,
      projectionShear: 0,
      depthScaleStrength: 0.3,
      projectedScaleStrength: 0.3,
      horizonVisible: true,
      cameraYawRate: 1.1,
      cameraMaxYawLag: 74,
      cameraYawDeadzone: 6,
      cameraPitchDegrees: 32,
      cameraRigDistance: 250
    }
  },
];

const CAMERA_CONTROL_GROUPS: Array<{ label: string; controls: CameraControlDefinition[] }> = [
  {
    label: 'Core',
    controls: [
      { key: 'cameraZoom', label: 'Camera zoom', min: 0.45, max: 1.8, step: 0.01, precision: 2 },
      { key: 'tacticalZoom', label: 'Tactical zoom', min: 0.38, max: 1.35, step: 0.01, precision: 2 },
      { key: 'cameraCenterX', label: 'Camera center X', min: -260, max: 260, step: 1 },
      { key: 'cameraCenterY', label: 'Camera center Y', min: -180, max: 180, step: 1 },
      { key: 'roverScreenBias', label: 'Rover screen bias', min: -160, max: 180, step: 1 },
      { key: 'lookAheadDistance', label: 'Look-ahead', min: 0, max: 240, step: 1 },
      { key: 'smoothing', label: 'Camera smoothing', min: 0.25, max: 8, step: 0.05, precision: 2 },
      { key: 'turnResponse', label: 'Turn response', min: 0.15, max: 7, step: 0.05, precision: 2 },
      { key: 'maxCameraRotation', label: 'Max rotation', min: 0, max: 180, step: 1 },
      { key: 'rotationBlendAmount', label: 'Rotation blend', min: 0, max: 1, step: 0.01, precision: 2 },
      { key: 'followBlend', label: 'Follow route blend', min: 0, max: 1, step: 0.01, precision: 2 }
    ]
  },
  {
    label: 'Perspective',
    controls: [
      { key: 'projectedYScale', label: 'Projected Y scale', min: 0.45, max: 1, step: 0.01, precision: 2 },
      { key: 'projectionShear', label: 'Projection shear', min: -0.38, max: 0.38, step: 0.01, precision: 2 },
      { key: 'depthScaleStrength', label: 'Depth scale', min: 0, max: 0.7, step: 0.01, precision: 2 },
      { key: 'projectedScaleStrength', label: 'Field/rover scale', min: 0, max: 0.8, step: 0.01, precision: 2 }
    ]
  },
  {
    label: 'Hybrid',
    controls: [
      { key: 'returnToNormalDelay', label: 'Return delay', min: 0, max: 5, step: 0.1, precision: 1 },
      { key: 'tacticalPullbackStrength', label: 'Pullback strength', min: 0, max: 1, step: 0.01, precision: 2 }
    ]
  }
];

const CAMERA_TOGGLE_GROUPS: Array<{ label: string; toggles: CameraToggleDefinition[] }> = [
  {
    label: 'Perspective',
    toggles: [
      { key: 'gridVisible', label: 'Grid visibility' },
      { key: 'horizonVisible', label: 'Horizon / ground plane' }
    ]
  },
  {
    label: 'Hybrid',
    toggles: [
      { key: 'zoomOutLowNanobots', label: 'Zoom out on low nanobots' },
      { key: 'zoomOutDroneReadyWithPreview', label: 'Zoom out on ready drone preview' },
      { key: 'zoomOutDroneActive', label: 'Zoom out while drone flies' },
      { key: 'zoomOutDuringCrawl', label: 'Zoom out during crawl' },
      { key: 'temporaryWiderViewOnLaunch', label: 'Wider view on launch' }
    ]
  },
  {
    label: 'Overlays',
    toggles: [
      { key: 'overlayCameraFocus', label: 'Camera focus point' },
      { key: 'overlayRoverHeading', label: 'Rover heading axis' },
      { key: 'overlayCameraForward', label: 'Camera forward axis' },
      { key: 'overlayScreenBounds', label: 'Projected screen bounds' },
      { key: 'overlayReclaimPreview', label: 'Reclaim preview target' },
      { key: 'overlayDroneRoute', label: 'Drone route line' },
      { key: 'overlayFieldAgeValue', label: 'Old field age/value' },
      { key: 'overlayProjectionLabel', label: 'Projection mode label' }
    ]
  }
];

interface Button {
  id: ButtonId;
  rect: Phaser.Geom.Rectangle;
  label: string;
}

interface VisualEffect {
  kind: EffectKind;
  x: number;
  y: number;
  startedAt: number;
  durationMs: number;
  amount?: number;
}

interface ContinuousDebugSnapshot {
  state: ContinuousWorldState;
  loopTrace: ContinuousLoopTrace;
  loopSummary: ContinuousLoopSummary;
  selfPlay?: ContinuousSelfPlayStatus;
  arenaId: ContinuousArenaId;
  pointerTarget?: Vec2;
  gameSize: Vec2;
  ui: ContinuousUiSnapshot;
}

interface ContinuousUiRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ContinuousUiSnapshot {
  mode: LayoutMode;
  viewMode: ViewMode;
  cameraLab: CameraLabSnapshot;
  droneRailLab: DroneRailLabSnapshot;
  visual: ContinuousVisualSnapshot;
  hudHeight: number;
  debugOverlayVisible: boolean;
  vitals: ContinuousUiRect[];
  stateChip: ContinuousUiRect;
  buttons: Record<ButtonId, ContinuousUiRect>;
  controls?: {
    drive: ContinuousUiRect;
  };
  eventFeed: ContinuousUiRect;
  textBounds: Record<string, ContinuousUiRect>;
  helperArm: {
    duty: string;
    status: string;
    miningAssistRate: number;
    lastAssistYield: number;
  };
  droneCue: {
    launchUrgent: boolean;
    previewTarget?: ContinuousUiRect;
    previewPayload?: number;
    previewEtaSeconds?: number;
    reservedTarget?: ContinuousUiRect;
    returnPayloadVisible: boolean;
    deliveryReadoutVisible: boolean;
    deliveryAmount?: number;
  };
}

interface ContinuousVisualSnapshot {
  terrain: TerrainVisualSnapshot;
  oreVeins: OreVeinVisualSnapshot[];
}

interface TerrainVisualSnapshot {
  craterCount: number;
  fissureCount: number;
  fertileBedCount: number;
  preparedFieldBedCount: number;
  ridgeCount: number;
}

interface OreVeinVisualSnapshot {
  id: string;
  screenBounds: ContinuousUiRect;
  remainingRatio: number;
  richness: number;
  richnessPipCount: number;
  depletionScarCount: number;
  active: boolean;
  activeMiningCue: boolean;
}

interface DroneRailLabSnapshot {
  settings: DroneRailLabSettings;
  dynamicsPresetId: DynamicsPresetId;
  dynamicsPresetName: string;
  selectedDynamicsPresetId: DynamicsPresetId;
  selectedDynamicsPresetName: string;
  matchesSelectedDynamicsPreset: boolean;
  diagnostics: DroneReclaimDiagnostics;
  blockedReason?: string;
  candidateReclaimCount: number;
  bestTargetScore?: number;
  bestTargetPayload?: number;
  bestTargetFieldCount?: number;
  bestTargetRefillEta?: number;
  oldestFieldAge: number;
  nearestEligibleFieldDistance?: number;
  nearestNearEligibleFieldDistance?: number;
  preparedCoverage: number;
  speedState: SpeedState;
  tuning: ContinuousTuning;
}

interface CameraLabSnapshot {
  preset: CameraPresetId;
  presetLabel: string;
  viewMode: ViewMode;
  projectionMode: string;
  settings: CameraLabSettings;
  focus: Vec2;
  center: Vec2;
  zoom: number;
  heading: number;
}

interface ContinuousSelfPlayStatus {
  routeId: string;
  label: string;
  targetLabel: string;
  elapsedSeconds: number;
}

declare global {
  interface Window {
    __moonMinerContinuous?: {
      getState: () => ContinuousWorldState;
      getPointerTarget: () => Vec2 | undefined;
      getLoopTrace: () => ContinuousLoopTrace;
      getLoopSummary: () => ContinuousLoopSummary;
      getReclaimPreview: () => ReclaimPreview | undefined;
      getArenaId: () => ContinuousArenaId;
      setArena: (arenaId: ContinuousArenaId) => void;
      getCameraLab: () => CameraLabSnapshot;
      setCameraPreset: (presetId: CameraPresetId) => void;
      setCameraSettings: (settings: Partial<CameraLabSettings>) => void;
      setViewMode: (viewMode: ViewMode) => void;
      getDynamicsPresets: () => DynamicsPresetDefinition[];
      setDynamicsPreset: (presetId: DynamicsPresetId) => void;
      getDroneRailLab: () => DroneRailLabSnapshot;
      setDynamicsTuning: (tuning: Partial<ContinuousTuning>) => void;
      startSelfPlay: (routeId?: ContinuousSelfPlayRouteId) => void;
      stopSelfPlay: () => void;
      getSelfPlayStatus: () => ContinuousSelfPlayStatus | undefined;
    };
  }
}

export class ContinuousMoonMinerScene extends Phaser.Scene {
  private state!: ContinuousWorldState;
  private loopTrace!: ContinuousLoopTrace;
  private graphics!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private buttons: Button[] = [];
  private effects: VisualEffect[] = [];
  private pointerTarget?: Vec2;
  private mobileDrive?: { pointerId: number; origin: Vec2; current: Vec2 };
  private preSelfPlayPointerTarget?: Vec2;
  private eventMessage?: { text: string; expiresAtMs: number; priority: number };
  private selfPlay?: {
    route: ContinuousSelfPlayRoute;
    launchedAtSeconds: Set<number>;
  };
  private cameraLab: CameraLabSettings = { ...DEFAULT_CAMERA_LAB_SETTINGS };
  private droneRailLab: DroneRailLabSettings = { ...DEFAULT_DRONE_RAIL_LAB_SETTINGS };
  private viewMode: ViewMode = 'tactical';
  private tacticalCameraFocus: Vec2 = { x: 420, y: 500 };
  private cameraHeading = -0.18;
  private readonly drawnBeatLabelKeys = new Set<string>();
  private chaseCameraFocus: Vec2 = { x: 420, y: 500 };
  private droneClaimAtMs = -10000;
  private hybridPullbackUntilMs = 0;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private escapeKey?: Phaser.Input.Keyboard.Key;
  private debugStateElement?: HTMLScriptElement;
  private tuningPanelElement?: HTMLElement;
  private cameraLabElement?: HTMLElement;
  private droneRailLabElement?: HTMLElement;
  private droneRailDiagnosticsElement?: HTMLElement;
  private cameraPresetSelectElement?: HTMLSelectElement;
  private cameraViewModeSelectElement?: HTMLSelectElement;
  private droneRailPresetSelectElement?: HTMLSelectElement;
  private arenaSelectElement?: HTMLSelectElement;
  private tuningControls = new Map<TuningKey, { range: HTMLInputElement; number: HTMLInputElement; value: HTMLElement }>();
  private droneRailNumericControls = new Map<NumericTuningKey, { range: HTMLInputElement; number: HTMLInputElement; value: HTMLElement }>();
  private droneRailBooleanControls = new Map<BooleanTuningKey, HTMLInputElement>();
  private droneRailOverlayControls = new Map<DroneRailOverlayKey, HTMLInputElement>();
  private cameraNumericControls = new Map<NumericCameraControlKey, { range: HTMLInputElement; number: HTMLInputElement; value: HTMLElement }>();
  private cameraToggleControls = new Map<BooleanCameraControlKey, HTMLInputElement>();
  private debugOverlayVisible = false;
  private previousDroneStatus: DroneStatus = 'ready';
  private previousSpeedState: SpeedState = 'prepared';
  private previousPhase: ContinuousPhase = 'playing';
  private previousOre = 0;

  constructor() {
    super('continuous-moon-miner');
  }

  create(): void {
    this.state = createContinuousWorld('apollo-17', this.loadStoredTuning(), this.loadStoredArenaId(), this.loadCarriedRoad(), this.carriedDepletion);
    this.cameraLab = this.loadInitialCameraLab();
    this.droneRailLab = this.loadStoredDroneRailLab();
    this.viewMode = this.cameraLab.viewMode;
    this.debugOverlayVisible = this.shouldOpenDebugOverlay();
    this.cameraHeading = this.state.rover.heading;
    this.tacticalCameraFocus = this.tacticalCameraTarget();
    this.loopTrace = createContinuousLoopTrace(this.state);
    this.previousDroneStatus = this.state.drone.status;
    this.previousSpeedState = this.state.speedState;
    this.previousPhase = this.state.phase;
    this.previousOre = this.state.rover.ore;

    this.graphics = this.add.graphics();
    this.hud = this.add
      .text(24, 18, '', {
        color: '#f6f8fb',
        fontFamily: 'monospace',
        fontSize: '17px'
      })
      .setName('hud-text');
    this.message = this.add
      .text(24, 672, '', {
        color: '#dce6ef',
        fontFamily: 'monospace',
        fontSize: '17px',
        wordWrap: { width: 930 }
      })
      .setName('event-feed');

    this.buttons = this.createButtons();

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,R,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
    this.escapeKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.handleKeyboardEvent(event));
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer));
    this.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer));

    this.exposeDebugHook();
    this.createTuningPanel();
    this.createCameraLabPanel();
    this.createDroneRailLabPanel();
    this.draw();
  }

  update(timeMs: number, deltaMs: number): void {
    this.handleKeyboardCommands();
    this.updateSelfPlayCommands();

    const previousState = this.state;
    const previousDroneStatus = this.state.drone.status;
    const previousSpeedState = this.state.speedState;
    const previousPhase = this.state.phase;
    const previousOre = this.state.rover.ore;
    const previousDronePayload = this.state.drone.payload;
    const previousNanobots = this.state.nanobots;
    const previousSolarSeconds = this.state.solarSeconds;
    const deltaSeconds = Math.min(deltaMs / 1000, 0.08);

    this.state = tickContinuousWorld(this.state, this.readInput(), deltaSeconds);
    this.updateCamera(deltaSeconds);
    recordContinuousLoopTick(this.loopTrace, previousState, this.state, deltaSeconds);
    this.captureTransitions(
      timeMs,
      previousDroneStatus,
      previousSpeedState,
      previousPhase,
      previousOre,
      previousDronePayload,
      previousNanobots,
      previousSolarSeconds
    );
    this.effects = this.effects.filter((effect) => timeMs - effect.startedAt <= effect.durationMs);
    this.draw();
  }

  private createButtons(): Button[] {
    const layout = this.getLayout();
    return [
      { id: 'launch', rect: this.rectFromLayout(layout.launchButton), label: 'Launch Drone' },
      { id: 'reset', rect: this.rectFromLayout(layout.resetButton), label: 'Reset' }
    ];
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const layout = this.getLayout();

    // When the run is over, anything starts the next day. A small button
    // labelled Reset in the corner of the HUD was the only way forward, and it
    // reads as start-over rather than continue -- so the day after was there
    // and unreachable. Tap anywhere, or press R.
    if (this.state.phase !== 'playing') {
      this.resetRun();
      return;
    }

    const button = this.buttons.find((candidate) => Phaser.Geom.Rectangle.Contains(candidate.rect, pointer.x, pointer.y));
    if (button) {
      if (button.id === 'launch') this.launchDrone();
      if (button.id === 'reset') this.resetRun();
      return;
    }

    if (layout.mode === 'mobilePortrait') {
      if (layout.drive && this.rectContains(layout.drive, pointer.x, pointer.y)) {
        this.beginMobileDrive(pointer);
        if (this.selfPlay) this.stopSelfPlay(false);
      }
      this.clearPointerTarget();
      return;
    }

    if (this.selfPlay) this.stopSelfPlay(false);
    this.pointerTarget = this.pointerToWorld(pointer);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const layout = this.getLayout();
    if (layout.mode === 'mobilePortrait') {
      if (this.mobileDrive?.pointerId === pointer.id) {
        this.mobileDrive.current = { x: pointer.x, y: pointer.y };
      }
      return;
    }

    if (pointer.isDown) this.pointerTarget = this.pointerToWorld(pointer);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.mobileDrive?.pointerId === pointer.id) {
      this.mobileDrive = undefined;
    }
  }

  private beginMobileDrive(pointer: Phaser.Input.Pointer): void {
    this.mobileDrive = {
      pointerId: pointer.id,
      origin: { x: pointer.x, y: pointer.y },
      current: { x: pointer.x, y: pointer.y }
    };
  }

  private handleKeyboardCommands(): void {
    if (!this.keys) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.launchDrone();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      this.resetRun();
    }

    if (this.escapeKey && Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.clearPointerTarget();
    }
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    if (!import.meta.env.DEV) return;
    if (event.repeat) return;

    if (event.key === '`' || event.key === '~') {
      event.preventDefault();
      this.debugOverlayVisible = !this.debugOverlayVisible;
      this.syncDebugOverlayVisibility();
      return;
    }

    if (this.isTypingInForm(event.target)) return;

    if (event.key.toLowerCase() === 'v') {
      event.preventDefault();
      this.cycleCameraPreset();
      return;
    }

    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.cycleViewMode();
      return;
    }

    if (event.key === '[' || event.key === ']') {
      event.preventDefault();
      const direction = event.key === ']' ? 1 : -1;
      if (event.shiftKey) {
        this.applyCameraNumericValue('lookAheadDistance', this.cameraLab.lookAheadDistance + direction * 8);
      } else {
        const key: NumericCameraControlKey = this.viewMode === 'tactical' ? 'tacticalZoom' : 'cameraZoom';
        this.applyCameraNumericValue(key, this.cameraLab[key] + direction * 0.04);
      }
      return;
    }

    if (event.key === '\\') {
      event.preventDefault();
      this.resetCameraLab();
    }
  }

  private shiftNumber = 1;
  private carriedIn = 0;
  private carriedDepletion: Record<string, number> = {};
  private survivedTheNight = 0;

  // On by default now, opt out with ?shift=0. It shipped behind ?shift=1 out of
  // caution about a documented deferral, and the result was that the next day
  // was unreachable: a published artifact does not necessarily carry a query
  // string through to the page, so the flag could not be set at all. A feature
  // nobody can turn on is not a cautious default, it is a missing one.
  private isShiftModeEnabled(): boolean {
    try {
      return new URLSearchParams(window.location.search).get('shift') !== '0';
    } catch {
      return true;
    }
  }

  // Every finished run writes itself somewhere I can read. The loop trace has
  // always recorded exactly the right things -- the canon's own success test,
  // fieldCommit / overextension / emergencyCrawl / droneRecovery, with position,
  // stock, ore and time in each speed state -- and it lived in memory, was
  // reachable only from the player's own console, and was wiped at the start of
  // the next run. So six passes of tuning were argued from self-play routes
  // instead of from how the game is actually played. This closes that.
  private async recordRunTrace(): Promise<void> {
    const claude = (window as unknown as { claude?: { use?: (name: string) => Promise<unknown> } }).claude;
    if (!claude?.use) return;

    try {
      const db = (await claude.use('db')) as
        | { doc: (path: string) => { set: (value: Record<string, unknown>) => Promise<unknown> } }
        | null;
      if (!db) return;

      const summary = getContinuousLoopSummary(this.loopTrace);
      const id = `${Date.now()}`;
      await db.doc(`runs/${id}`).set({
        recordedAt: new Date().toISOString(),
        shift: this.shiftNumber,
        carriedIn: this.carriedIn,
        survivedTheNight: this.survivedTheNight,
        arenaId: this.state.arenaId,
        result: this.state.phase,
        message: this.state.message,
        ore: Number(this.state.rover.ore.toFixed(2)),
        oreRequired: this.state.arena.extraction?.oreRequired ?? this.state.targetOre,
        solarRemaining: Number(this.state.solarSeconds.toFixed(2)),
        solarWindow: this.state.solarWindowSeconds,
        elapsed: Number(this.state.elapsedSeconds.toFixed(2)),
        reachedExtraction: isRoverAtExtraction(this.state),
        // The four beats the design says the run has to have.
        milestones: summary.milestones.map((milestone) => ({
          id: milestone.id,
          hit: milestone.hit,
          atSeconds: milestone.atSeconds === undefined ? null : Number(milestone.atSeconds.toFixed(2))
        })),
        hitLoop: summary.hitLoop,
        lowestNanobots: Number(summary.lowestNanobots.toFixed(2)),
        deliveredNanobots: Number(summary.deliveredNanobots.toFixed(2)),
        droneLaunches: summary.droneLaunches,
        droneDeliveries: summary.droneDeliveries,
        // Where the time actually went, which is the question every "it feels
        // weird" report has really been about.
        secondsCrawling: Number(summary.speedSeconds.crawl.toFixed(2)),
        secondsFabricating: Number(summary.speedSeconds.fabricating.toFixed(2)),
        secondsPrepared: Number(summary.speedSeconds.prepared.toFixed(2)),
        // Trimmed so one document can never approach the size limit.
        events: this.loopTrace.events.slice(-60).map((event) => ({
          kind: event.kind,
          at: Number(event.atSeconds.toFixed(2)),
          speed: event.speedState,
          drone: event.droneStatus,
          nanobots: Number(event.nanobots.toFixed(2)),
          ore: Number(event.ore.toFixed(2)),
          x: Math.round(event.x),
          y: Math.round(event.y)
        }))
      });
    } catch {
      // No store in this view, or the write was refused. A run that cannot be
      // recorded still has to be playable.
    }
  }

  private loadCarriedRoad(): FieldPatch[] {
    const save = this.loadShiftSave();
    this.shiftNumber = save.shift;
    this.carriedIn = save.fields.length;
    this.carriedDepletion = save.depletion;
    return save.fields;
  }

  private loadShiftSave(): { shift: number; fields: FieldPatch[]; depletion: Record<string, number> } {
    if (!this.isShiftModeEnabled()) return { shift: 1, fields: [], depletion: {} };

    try {
      const raw = window.localStorage.getItem(CARRIED_ROAD_STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as { shift?: number; fields?: FieldPatch[]; depletion?: Record<string, number> })
        : undefined;
      return {
        shift: typeof parsed?.shift === 'number' ? parsed.shift : 1,
        fields: Array.isArray(parsed?.fields) ? parsed.fields : [],
        depletion: parsed?.depletion && typeof parsed.depletion === 'object' ? parsed.depletion : {}
      };
    } catch {
      return { shift: 1, fields: [], depletion: {} };
    }
  }

  private saveCarriedRoad(): void {
    if (!this.isShiftModeEnabled()) return;

    try {
      const carried = carryFieldsOvernight(this.state.fields, this.state.tuning);
      this.survivedTheNight = carried.length;
      window.localStorage.setItem(
        CARRIED_ROAD_STORAGE_KEY,
        JSON.stringify({
          shift: this.shiftNumber + 1,
          fields: carried,
          depletion: carryDepletionOvernight(this.state.fertileZones)
        })
      );
    } catch {
      // Storage can be unavailable; the shift simply does not carry.
    }
  }

  private shouldOpenDebugOverlay(): boolean {
    if (!import.meta.env.DEV) return false;

    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('debug') === '1';
    } catch {
      return false;
    }
  }

  private readUrlViewMode(): ViewMode | undefined {
    if (!import.meta.env.DEV) return undefined;

    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'chase' || view === 'hybrid' || view === 'tactical') return view;
      return undefined;
    } catch {
      return undefined;
    }
  }

  private isTypingInForm(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
  }

  private getLayout(): SceneLayout {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    const mobilePortrait = height > width && width <= 560;

    if (mobilePortrait) {
      const gutter = 16;
      const vitalGap = 18;
      const vitalWidth = Math.floor((width - gutter * 2 - vitalGap * 2) / 3);
      const controlBandTop = height - 212;
      const controlGap = 20;
      const controlWidth = width - gutter * 2 - controlGap;
      const driveWidth = Math.floor(controlWidth * 0.51);
      const launchWidth = controlWidth - driveWidth;
      return {
        mode: 'mobilePortrait',
        width,
        height,
        hudHeight: MOBILE_PORTRAIT_HUD_HEIGHT,
        controlBandTop,
        cameraCenterX: width / 2,
        cameraCenterY: this.viewMode === 'tactical' ? Math.floor(MOBILE_PORTRAIT_HUD_HEIGHT + (controlBandTop - MOBILE_PORTRAIT_HUD_HEIGHT) * 0.48) : MOBILE_CAMERA_CENTER_Y,
        cameraLookAhead: MOBILE_CAMERA_LOOK_AHEAD,
        cameraZoom: this.viewMode === 'tactical' ? MOBILE_TACTICAL_ZOOM : MOBILE_CAMERA_ZOOM,
        message: { x: 18, y: controlBandTop - 22, width: width - 36, height: 34, fontSize: 15 },
        vitals: [
          { x: gutter, y: 12, width: vitalWidth, height: 58 },
          { x: gutter + vitalWidth + vitalGap, y: 12, width: vitalWidth, height: 58 },
          { x: gutter + (vitalWidth + vitalGap) * 2, y: 12, width: vitalWidth, height: 58 }
        ],
        stateChip: { x: 16, y: 76, width: 154, height: 46 },
        launchButton: { x: gutter + driveWidth + controlGap, y: height - 172, width: launchWidth, height: 88 },
        resetButton: { x: width - 84, y: 80, width: 68, height: 40 },
        drive: { x: gutter, y: height - 186, width: driveWidth, height: 162 },
        yieldReadout: { x: 188, y: 104, fontSize: 12 }
      };
    }

    return {
      mode: 'desktop',
      width,
      height,
      hudHeight: DESKTOP_HUD_HEIGHT,
      cameraCenterX: width / 2,
      cameraCenterY: this.viewMode === 'tactical' ? Math.floor(DESKTOP_HUD_HEIGHT + (height - DESKTOP_HUD_HEIGHT) * 0.52) : DESKTOP_CAMERA_CENTER_Y,
      cameraLookAhead: DESKTOP_CAMERA_LOOK_AHEAD,
      cameraZoom: this.viewMode === 'tactical' ? DESKTOP_TACTICAL_ZOOM : DESKTOP_CAMERA_ZOOM,
      message: { x: 24, y: height - 48, width: 930, height: 28, fontSize: 17 },
      vitals: [
        { x: 24, y: 10, width: 176, height: 58 },
        { x: 218, y: 10, width: 176, height: 58 },
        { x: 412, y: 10, width: 156, height: 58 }
      ],
      stateChip: { x: 592, y: 14, width: 152, height: 48 },
      launchButton: { x: 770, y: 14, width: 164, height: 48 },
      resetButton: { x: 950, y: 18, width: 66, height: 40 },
      yieldReadout: { x: 24, y: 76, fontSize: 12 }
    };
  }

  private rectFromLayout(rect: SceneRect): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height);
  }

  private rectContains(rect: SceneRect, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private clampScreenPoint(point: Vec2, marginX = 16, marginY = 16): Vec2 {
    const layout = this.getLayout();
    return {
      x: clamp(point.x, marginX, layout.width - marginX),
      y: clamp(point.y, layout.hudHeight + marginY, layout.height - marginY)
    };
  }

  private readInput(): ContinuousInput {
    let steer = 0;
    const layout = this.getLayout();
    const leftHeld = Boolean(this.keys?.A.isDown || this.cursors?.left.isDown);
    const rightHeld = Boolean(this.keys?.D.isDown || this.cursors?.right.isDown);
    const upHeld = Boolean(this.keys?.W.isDown || this.cursors?.up.isDown);
    const downHeld = Boolean(this.keys?.S.isDown || this.cursors?.down.isDown);
    const mobileDriveInput = this.getMobileDriveInput();
    const manualHeld = leftHeld || rightHeld || upHeld || downHeld || Boolean(mobileDriveInput);

    const selfPlayTarget = this.getSelfPlayTarget();
    if (selfPlayTarget && !manualHeld) {
      return getContinuousSelfPlayInput(this.state, selfPlayTarget);
    }

    if (this.selfPlay && manualHeld) {
      this.stopSelfPlay(true);
    }

    if (mobileDriveInput) {
      this.clearPointerTarget();
      return mobileDriveInput;
    }

    if (layout.mode === 'mobilePortrait' && !manualHeld) {
      return {
        steer: 0,
        throttle: 0,
        driveIntent: false
      };
    }

    if (leftHeld) steer -= 1;
    if (rightHeld) steer += 1;
    if (leftHeld || rightHeld) this.clearPointerTarget();

    if (this.pointerTarget && steer === 0) {
      const desiredAngle = Math.atan2(this.pointerTarget.y - this.state.rover.y, this.pointerTarget.x - this.state.rover.x);
      steer = clamp(angleDifference(desiredAngle, this.state.rover.heading) / 0.85, -1, 1);
    }

    // S backs up. S with A or D swings the machine on the spot. Neither touches
    // the forward path, which is plain steer-and-throttle again.
    const reversing = downHeld && !upHeld;
    const driveIntent = upHeld || Boolean(this.pointerTarget);
    return {
      steer,
      throttle: upHeld ? 1 : this.pointerTarget ? 0.62 : 0,
      brake: false,
      reverseIntent: reversing,
      driveIntent: reversing ? false : driveIntent,
      pivotIntent: reversing || (!driveIntent && Math.abs(steer) > 0.001)
    };
  }

  private getMobileDriveInput(): ContinuousInput | undefined {
    const layout = this.getLayout();
    if (layout.mode !== 'mobilePortrait' || !layout.drive || !this.mobileDrive) return undefined;

    const dx = this.mobileDrive.current.x - this.mobileDrive.origin.x;
    const dy = this.mobileDrive.current.y - this.mobileDrive.origin.y;
    const radius = Math.min(layout.drive.width, layout.drive.height) * 0.38;
    const distance = Math.hypot(dx, dy);
    const deadzone = radius * 0.18;
    if (distance < deadzone) {
      return {
        steer: 0,
        throttle: 0,
        driveIntent: false
      };
    }

    const commitment = clamp((distance - deadzone) / (radius - deadzone), 0, 1);
    const forwardBias = clamp((-dy - deadzone) / (radius - deadzone), 0, 1);
    const pullingBack = dy > deadzone;

    // Same grammar as the keyboard: back is reverse, back-and-across swings on
    // the spot. It hardcoded steer 0, so the thumb could only ever reverse and
    // the swing was unreachable on a phone at all.
    if (pullingBack) {
      // A wide lateral deadzone on the way back, deliberately wider than the
      // stick's own. Straight back has to be reachable with an ordinary thumb
      // pull -- if a few degrees of drift starts the machine swinging, the
      // control demands a precision the game never asked for anywhere else.
      const swingDeadzone = radius * 0.42;
      const swinging = Math.abs(dx) > swingDeadzone;
      return {
        steer: swinging ? clamp((dx - Math.sign(dx) * swingDeadzone) / (radius - swingDeadzone), -1, 1) : 0,
        throttle: 0,
        reverseIntent: true,
        driveIntent: false,
        pivotIntent: true
      };
    }

    return {
      steer: clamp(dx / radius, -1, 1),
      throttle: clamp(Math.max(commitment, forwardBias), 0, 1),
      driveIntent: true
    };
  }

  private launchDrone(): boolean {
    const result = launchReclaimDrone(this.state);
    this.state = result.state;
    this.state.message = result.message;

    if (result.ok) {
      recordContinuousLoopDroneLaunch(this.loopTrace, this.state);
      this.addEffect('launch', this.state.drone.x, this.state.drone.y, 520);
      if (this.cameraLab.temporaryWiderViewOnLaunch) {
        this.hybridPullbackUntilMs = Math.max(
          this.hybridPullbackUntilMs,
          this.time.now + this.cameraLab.returnToNormalDelay * 1000
        );
      }
      this.showEventMessage('Drone away. It will come back to you.', 1400, this.time.now, 2);
    } else {
      this.addEffect('blocked', this.state.rover.x, this.state.rover.y, 320);
      this.showEventMessage(this.formatPlayerMessage(result.message), 1100, this.time.now, 2);
    }
    return result.ok;
  }

  private resetRun(): void {
    this.state = createContinuousWorld(this.state.seed, this.state.tuning, this.state.arenaId, this.loadCarriedRoad(), this.carriedDepletion);
    this.cameraHeading = this.state.rover.heading;
    this.tacticalCameraFocus = this.tacticalCameraTarget();
    this.loopTrace = createContinuousLoopTrace(this.state);
    this.pointerTarget = undefined;
    this.mobileDrive = undefined;
    this.selfPlay = undefined;
    this.effects = [];
    this.eventMessage = undefined;
    this.previousDroneStatus = this.state.drone.status;
    this.previousSpeedState = this.state.speedState;
    this.previousPhase = this.state.phase;
    this.previousOre = this.state.rover.ore;
    this.syncTuningPanel();
    this.syncCameraLabPanel();
    this.syncDroneRailLabPanel();
  }

  private setArena(arenaId: ContinuousArenaId): void {
    if (!CONTINUOUS_ARENAS[arenaId]) return;

    const tuning = this.state.tuning;
    const seed = this.state.seed;
    this.state = createContinuousWorld(seed, tuning, arenaId, this.loadCarriedRoad(), this.carriedDepletion);
    this.cameraHeading = this.state.rover.heading;
    this.tacticalCameraFocus = this.tacticalCameraTarget();
    this.loopTrace = createContinuousLoopTrace(this.state);
    this.pointerTarget = undefined;
    this.mobileDrive = undefined;
    this.preSelfPlayPointerTarget = undefined;
    this.selfPlay = undefined;
    this.effects = [];
    this.eventMessage = undefined;
    this.previousDroneStatus = this.state.drone.status;
    this.previousSpeedState = this.state.speedState;
    this.previousPhase = this.state.phase;
    this.previousOre = this.state.rover.ore;
    this.saveStoredArenaId();
    this.syncTuningPanel();
    this.syncCameraLabPanel();
    this.syncDroneRailLabPanel();
  }

  private startSelfPlay(routeId: ContinuousSelfPlayRouteId = getDefaultContinuousSelfPlayRouteId(this.state.arenaId)): void {
    const route = getContinuousSelfPlayRoute(routeId);
    this.preSelfPlayPointerTarget = this.pointerTarget ? { ...this.pointerTarget } : undefined;
    this.resetRun();
    this.selfPlay = {
      route,
      launchedAtSeconds: new Set()
    };
    const target = getContinuousSelfPlayTarget(route, this.state.elapsedSeconds);
    this.pointerTarget = { x: target.x, y: target.y };
    this.state.message = `Self-play route: ${route.label}.`;
  }

  private stopSelfPlay(restoreManualTarget = true): void {
    this.selfPlay = undefined;
    this.pointerTarget = restoreManualTarget && this.preSelfPlayPointerTarget ? { ...this.preSelfPlayPointerTarget } : undefined;
    this.preSelfPlayPointerTarget = undefined;
    this.state.message = 'Auto route stopped. Manual navigation restored.';
  }

  private updateSelfPlayCommands(): void {
    if (!this.selfPlay) return;

    if (this.state.phase !== 'playing' || this.state.elapsedSeconds >= this.selfPlay.route.durationSeconds) {
      this.stopSelfPlay(false);
      return;
    }

    for (const launchSecond of this.selfPlay.route.droneLaunchSeconds) {
      if (this.selfPlay.launchedAtSeconds.has(launchSecond)) continue;
      if (this.state.elapsedSeconds < launchSecond) continue;
      if (this.state.drone.status !== 'ready') continue;

      if (this.launchDrone()) {
        this.selfPlay.launchedAtSeconds.add(launchSecond);
      }
    }

    const target = getContinuousSelfPlayTarget(this.selfPlay.route, this.state.elapsedSeconds);
    this.pointerTarget = { x: target.x, y: target.y };
  }

  private getSelfPlayTarget(): ContinuousSelfPlayWaypoint | undefined {
    if (!this.selfPlay) return undefined;
    return getContinuousSelfPlayTarget(this.selfPlay.route, this.state.elapsedSeconds);
  }

  private getSelfPlayStatus(): ContinuousSelfPlayStatus | undefined {
    if (!this.selfPlay) return undefined;

    const target = this.getSelfPlayTarget();
    return {
      routeId: this.selfPlay.route.id,
      label: this.selfPlay.route.label,
      targetLabel: target?.label ?? 'complete',
      elapsedSeconds: Math.round(this.state.elapsedSeconds * 10) / 10
    };
  }

  private createTuningPanel(): void {
    if (!import.meta.env.DEV) return;

    const existing = document.getElementById('moon-miner-tuning-panel');
    const panel = existing ?? document.createElement('aside');
    panel.id = 'moon-miner-tuning-panel';
    panel.className = 'moon-miner-tuning';
    panel.textContent = '';
    this.tuningControls.clear();

    const title = document.createElement('h2');
    title.textContent = 'Dynamics';
    panel.appendChild(title);

    const arenaRow = document.createElement('label');
    arenaRow.className = 'moon-miner-tuning__row moon-miner-tuning__row--select';

    const arenaName = document.createElement('span');
    arenaName.className = 'moon-miner-tuning__name';
    arenaName.textContent = 'Arena';

    const arenaSelect = document.createElement('select');
    arenaSelect.className = 'moon-miner-tuning__select';
    for (const arena of Object.values(CONTINUOUS_ARENAS)) {
      const option = document.createElement('option');
      option.value = arena.id;
      option.textContent = arena.label;
      arenaSelect.appendChild(option);
    }
    arenaSelect.addEventListener('change', () => this.setArena(arenaSelect.value as ContinuousArenaId));

    arenaRow.append(arenaName, arenaSelect);
    panel.appendChild(arenaRow);
    this.arenaSelectElement = arenaSelect;

    for (const definition of TUNING_CONTROLS) {
      const row = document.createElement('label');
      row.className = 'moon-miner-tuning__row';

      const name = document.createElement('span');
      name.className = 'moon-miner-tuning__name';
      name.textContent = definition.label;

      const range = document.createElement('input');
      range.type = 'range';
      range.min = String(definition.min);
      range.max = String(definition.max);
      range.step = String(definition.step);

      const number = document.createElement('input');
      number.type = 'number';
      number.min = String(definition.min);
      number.max = String(definition.max);
      number.step = String(definition.step);

      const value = document.createElement('span');
      value.className = 'moon-miner-tuning__value';

      range.addEventListener('input', () => this.applyTuningValue(definition.key, Number(range.value)));
      number.addEventListener('change', () => this.applyTuningValue(definition.key, Number(number.value)));

      row.append(name, range, number, value);
      panel.appendChild(row);
      this.tuningControls.set(definition.key, { range, number, value });
    }

    const actions = document.createElement('div');
    actions.className = 'moon-miner-tuning__actions';

    const resetRunButton = document.createElement('button');
    resetRunButton.type = 'button';
    resetRunButton.textContent = 'Reset Run';
    resetRunButton.addEventListener('click', () => this.resetRun());

    const defaultsButton = document.createElement('button');
    defaultsButton.type = 'button';
    defaultsButton.textContent = 'Defaults';
    defaultsButton.addEventListener('click', () => this.applyDynamicsPreset(DEFAULT_DYNAMICS_PRESET_ID));

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy JSON';
    copyButton.addEventListener('click', () => this.copyTuningJson(copyButton));

    const autoRouteButton = document.createElement('button');
    autoRouteButton.type = 'button';
    autoRouteButton.textContent = 'Auto Route';
    autoRouteButton.addEventListener('click', () => this.startSelfPlay());

    const stopAutoButton = document.createElement('button');
    stopAutoButton.type = 'button';
    stopAutoButton.textContent = 'Stop Auto';
    stopAutoButton.addEventListener('click', () => this.stopSelfPlay());

    actions.append(resetRunButton, defaultsButton, copyButton, autoRouteButton, stopAutoButton);
    panel.appendChild(actions);

    if (!existing) document.body.appendChild(panel);
    this.tuningPanelElement = panel;
    this.syncTuningPanel();
    this.syncDebugOverlayVisibility();
  }

  private createCameraLabPanel(): void {
    if (!import.meta.env.DEV) return;

    const existing = document.getElementById('moon-miner-camera-lab');
    const panel = existing ?? document.createElement('aside');
    panel.id = 'moon-miner-camera-lab';
    panel.className = 'moon-miner-tuning moon-miner-camera-lab';
    panel.textContent = '';
    this.cameraNumericControls.clear();
    this.cameraToggleControls.clear();

    const title = document.createElement('h2');
    title.textContent = 'Camera Lab';
    panel.appendChild(title);

    const presetRow = document.createElement('label');
    presetRow.className = 'moon-miner-tuning__row moon-miner-tuning__row--select';
    const presetName = document.createElement('span');
    presetName.className = 'moon-miner-tuning__name';
    presetName.textContent = 'Preset';
    const presetSelect = document.createElement('select');
    presetSelect.className = 'moon-miner-tuning__select';
    for (const preset of CAMERA_PRESETS) {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.label;
      presetSelect.appendChild(option);
    }
    presetSelect.addEventListener('change', () => this.applyCameraPreset(presetSelect.value as CameraPresetId));
    presetRow.append(presetName, presetSelect);
    panel.appendChild(presetRow);
    this.cameraPresetSelectElement = presetSelect;

    const viewRow = document.createElement('label');
    viewRow.className = 'moon-miner-tuning__row moon-miner-tuning__row--select';
    const viewName = document.createElement('span');
    viewName.className = 'moon-miner-tuning__name';
    viewName.textContent = 'View mode';
    const viewSelect = document.createElement('select');
    viewSelect.className = 'moon-miner-tuning__select';
    for (const mode of ['tactical', 'chase', 'hybrid'] satisfies ViewMode[]) {
      const option = document.createElement('option');
      option.value = mode;
      option.textContent = mode;
      viewSelect.appendChild(option);
    }
    viewSelect.addEventListener('change', () => this.setCameraViewMode(viewSelect.value as ViewMode));
    viewRow.append(viewName, viewSelect);
    panel.appendChild(viewRow);
    this.cameraViewModeSelectElement = viewSelect;

    for (const group of CAMERA_CONTROL_GROUPS) {
      const heading = document.createElement('h3');
      heading.textContent = group.label;
      panel.appendChild(heading);

      for (const definition of group.controls) {
        const row = document.createElement('label');
        row.className = 'moon-miner-tuning__row';

        const name = document.createElement('span');
        name.className = 'moon-miner-tuning__name';
        name.textContent = definition.label;

        const range = document.createElement('input');
        range.type = 'range';
        range.min = String(definition.min);
        range.max = String(definition.max);
        range.step = String(definition.step);

        const number = document.createElement('input');
        number.type = 'number';
        number.min = String(definition.min);
        number.max = String(definition.max);
        number.step = String(definition.step);

        const value = document.createElement('span');
        value.className = 'moon-miner-tuning__value';

        range.addEventListener('input', () => this.applyCameraNumericValue(definition.key, Number(range.value)));
        number.addEventListener('change', () => this.applyCameraNumericValue(definition.key, Number(number.value)));

        row.append(name, range, number, value);
        panel.appendChild(row);
        this.cameraNumericControls.set(definition.key, { range, number, value });
      }
    }

    for (const group of CAMERA_TOGGLE_GROUPS) {
      const heading = document.createElement('h3');
      heading.textContent = group.label;
      panel.appendChild(heading);

      for (const definition of group.toggles) {
        const row = document.createElement('label');
        row.className = 'moon-miner-tuning__toggle';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => this.applyCameraToggleValue(definition.key, checkbox.checked));

        const name = document.createElement('span');
        name.textContent = definition.label;

        row.append(checkbox, name);
        panel.appendChild(row);
        this.cameraToggleControls.set(definition.key, checkbox);
      }
    }

    const actions = document.createElement('div');
    actions.className = 'moon-miner-tuning__actions';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy JSON';
    copyButton.addEventListener('click', () => this.copyCameraLabJson(copyButton));

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = 'Defaults';
    resetButton.addEventListener('click', () => this.resetCameraLab());

    actions.append(copyButton, resetButton);
    panel.appendChild(actions);

    if (!existing) document.body.appendChild(panel);
    this.cameraLabElement = panel;
    this.syncCameraLabPanel();
    this.syncDebugOverlayVisibility();
  }

  private createDroneRailLabPanel(): void {
    if (!import.meta.env.DEV) return;

    const existing = document.getElementById('moon-miner-drone-rail-lab');
    const panel = existing ?? document.createElement('aside');
    panel.id = 'moon-miner-drone-rail-lab';
    panel.className = 'moon-miner-tuning moon-miner-drone-rail-lab';
    panel.textContent = '';
    this.droneRailNumericControls.clear();
    this.droneRailBooleanControls.clear();
    this.droneRailOverlayControls.clear();

    const title = document.createElement('h2');
    title.textContent = 'Drone / Rail Lab';
    panel.appendChild(title);

    const presetRow = document.createElement('label');
    presetRow.className = 'moon-miner-tuning__row moon-miner-tuning__row--select';
    const presetName = document.createElement('span');
    presetName.className = 'moon-miner-tuning__name';
    presetName.textContent = 'Dynamics preset';
    const presetSelect = document.createElement('select');
    presetSelect.className = 'moon-miner-tuning__select';
    for (const preset of DYNAMICS_PRESETS) {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    }
    presetSelect.addEventListener('change', () => this.selectDynamicsPreset(presetSelect.value as DynamicsPresetId));
    presetRow.append(presetName, presetSelect);
    panel.appendChild(presetRow);
    this.droneRailPresetSelectElement = presetSelect;

    const diagnostics = document.createElement('pre');
    diagnostics.className = 'moon-miner-tuning__diagnostics';
    panel.appendChild(diagnostics);
    this.droneRailDiagnosticsElement = diagnostics;

    for (const group of DRONE_RAIL_NUMERIC_GROUPS) {
      const details = document.createElement('details');
      details.open = group.label === 'Launch Gating' || group.label === 'Target Scoring';
      const summary = document.createElement('summary');
      summary.textContent = group.label;
      details.appendChild(summary);

      for (const definition of group.controls) {
        const row = document.createElement('label');
        row.className = 'moon-miner-tuning__row';

        const name = document.createElement('span');
        name.className = 'moon-miner-tuning__name';
        name.textContent = definition.label;

        const range = document.createElement('input');
        range.type = 'range';
        range.min = String(definition.min);
        range.max = String(definition.max);
        range.step = String(definition.step);

        const number = document.createElement('input');
        number.type = 'number';
        number.min = String(definition.min);
        number.max = String(definition.max);
        number.step = String(definition.step);

        const value = document.createElement('span');
        value.className = 'moon-miner-tuning__value';

        range.addEventListener('input', () => this.applyTuningValue(definition.key, Number(range.value)));
        number.addEventListener('change', () => this.applyTuningValue(definition.key, Number(number.value)));

        row.append(name, range, number, value);
        details.appendChild(row);
        this.droneRailNumericControls.set(definition.key, { range, number, value });
      }

      panel.appendChild(details);
    }

    const gates = document.createElement('details');
    gates.open = true;
    const gatesSummary = document.createElement('summary');
    gatesSummary.textContent = 'Test Gates';
    gates.appendChild(gatesSummary);
    for (const definition of DRONE_RAIL_BOOLEAN_CONTROLS) {
      const row = document.createElement('label');
      row.className = 'moon-miner-tuning__toggle';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', () => this.applyTuningBooleanValue(definition.key, checkbox.checked));
      const name = document.createElement('span');
      name.textContent = definition.label;
      row.append(checkbox, name);
      gates.appendChild(row);
      this.droneRailBooleanControls.set(definition.key, checkbox);
    }
    panel.appendChild(gates);

    const overlays = document.createElement('details');
    overlays.open = false;
    const overlaysSummary = document.createElement('summary');
    overlaysSummary.textContent = 'Overlays';
    overlays.appendChild(overlaysSummary);
    for (const definition of DRONE_RAIL_OVERLAY_CONTROLS) {
      const row = document.createElement('label');
      row.className = 'moon-miner-tuning__toggle';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', () => this.applyDroneRailOverlayValue(definition.key, checkbox.checked));
      const name = document.createElement('span');
      name.textContent = definition.label;
      row.append(checkbox, name);
      overlays.appendChild(row);
      this.droneRailOverlayControls.set(definition.key, checkbox);
    }
    panel.appendChild(overlays);

    const actions = document.createElement('div');
    actions.className = 'moon-miner-tuning__actions';

    const applyPresetButton = document.createElement('button');
    applyPresetButton.type = 'button';
    applyPresetButton.textContent = 'Apply Preset';
    applyPresetButton.addEventListener('click', () => this.applySelectedDynamicsPreset());

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = 'Reset Stable First Run';
    resetButton.addEventListener('click', () => this.resetStableFirstRunDynamics());

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy Dynamics JSON';
    copyButton.addEventListener('click', () => this.copyDroneRailDynamicsJson(copyButton));

    actions.append(applyPresetButton, resetButton, copyButton);
    panel.appendChild(actions);

    if (!existing) document.body.appendChild(panel);
    this.droneRailLabElement = panel;
    this.syncDroneRailLabPanel();
    this.syncDebugOverlayVisibility();
  }

  private syncDebugOverlayVisibility(): void {
    if (!import.meta.env.DEV) return;
    if (!this.tuningPanelElement && !this.cameraLabElement && !this.droneRailLabElement) return;

    for (const panel of [this.tuningPanelElement, this.cameraLabElement, this.droneRailLabElement]) {
      if (!panel) continue;
      panel.hidden = !this.debugOverlayVisible;
      panel.dataset.open = this.debugOverlayVisible ? 'true' : 'false';
      panel.dataset.layout = this.getLayout().mode;
    }
    document.body.classList.toggle(
      'moon-miner-debug-workbench',
      this.debugOverlayVisible && this.getLayout().mode === 'mobilePortrait'
    );
  }

  private applyTuningValue(key: NumericTuningKey, value: number): void {
    if (!Number.isFinite(value)) return;

    this.state.tuning = resolveContinuousTuning({
      ...this.state.tuning,
      [key]: value
    });
    this.state.maxNanobots = this.state.tuning.maxNanobots;
    this.state.targetOre = this.state.tuning.targetOre;
    this.state.nanobots = clamp(this.state.nanobots, 0, this.state.maxNanobots);
    this.state.solarWindowSeconds = this.state.arena.solarWindowSeconds ?? this.state.tuning.startingSolarSeconds;
    this.state.solarSeconds = Math.min(this.state.solarSeconds, this.state.solarWindowSeconds);
    this.saveStoredTuning();
    this.syncTuningPanel();
    this.syncDroneRailLabPanel();
  }

  private applyTuningBooleanValue(key: BooleanTuningKey, value: boolean): void {
    this.state.tuning = resolveContinuousTuning({
      ...this.state.tuning,
      [key]: value
    });
    this.saveStoredTuning();
    this.syncDroneRailLabPanel();
  }

  private setDynamicsTuning(tuning: Partial<ContinuousTuning>): void {
    this.state.tuning = resolveContinuousTuning({
      ...this.state.tuning,
      ...tuning
    });
    this.state.maxNanobots = this.state.tuning.maxNanobots;
    this.state.targetOre = this.state.tuning.targetOre;
    this.state.nanobots = clamp(this.state.nanobots, 0, this.state.maxNanobots);
    this.state.solarWindowSeconds = this.state.arena.solarWindowSeconds ?? this.state.tuning.startingSolarSeconds;
    this.state.solarSeconds = Math.min(this.state.solarSeconds, this.state.solarWindowSeconds);
    this.saveStoredTuning();
    this.syncTuningPanel();
    this.syncDroneRailLabPanel();
  }

  private syncTuningPanel(): void {
    if (this.arenaSelectElement) {
      this.arenaSelectElement.value = this.state.arenaId;
    }

    for (const definition of TUNING_CONTROLS) {
      const controls = this.tuningControls.get(definition.key);
      if (!controls) continue;

      const value = this.state.tuning[definition.key];
      const formatted = this.formatTuningValue(definition, value);
      controls.range.value = String(value);
      controls.number.value = formatted;
      controls.value.textContent = formatted;
    }
  }

  private syncDroneRailLabPanel(): void {
    if (this.droneRailPresetSelectElement) {
      this.droneRailPresetSelectElement.value = this.droneRailLab.selectedDynamicsPresetId;
    }

    for (const group of DRONE_RAIL_NUMERIC_GROUPS) {
      for (const definition of group.controls) {
        const controls = this.droneRailNumericControls.get(definition.key);
        if (!controls) continue;

        const value = this.state.tuning[definition.key];
        const formatted = this.formatDroneRailValue(definition, value);
        controls.range.value = String(value);
        controls.number.value = formatted;
        controls.value.textContent = formatted;
      }
    }

    for (const definition of DRONE_RAIL_BOOLEAN_CONTROLS) {
      const checkbox = this.droneRailBooleanControls.get(definition.key);
      if (checkbox) checkbox.checked = this.state.tuning[definition.key];
    }

    for (const definition of DRONE_RAIL_OVERLAY_CONTROLS) {
      const checkbox = this.droneRailOverlayControls.get(definition.key);
      if (checkbox) checkbox.checked = this.droneRailLab[definition.key];
    }

    if (this.droneRailDiagnosticsElement) {
      this.droneRailDiagnosticsElement.textContent = this.formatDroneRailDiagnostics();
    }
  }

  private formatDroneRailValue(definition: TuningNumericControlDefinition, value: number): string {
    return value.toFixed(definition.precision ?? 0);
  }

  private formatDroneRailDiagnostics(): string {
    const diagnostics = getDroneReclaimDiagnostics(this.state);
    const best = diagnostics.bestTarget;
    const preset = this.getDynamicsPresetSnapshot();
    const lines = [
      `Preset: ${preset.dynamicsPresetName}`,
      `Launch: ${diagnostics.blockedReason ?? 'available'}`,
      `Candidates: ${diagnostics.candidateCount}  Oldest: ${diagnostics.oldestFieldAge.toFixed(1)}s`,
      `Prepared: ${diagnostics.currentPreparedCoverage.toFixed(2)}  Speed: ${diagnostics.currentSpeedState}`
    ];

    if (best) {
      lines.push(
        `Best #${best.targetPatchId}: +${best.payload.toFixed(2)} / ${best.fieldCount} fields / ${best.distanceFromRover.toFixed(0)}u`,
        `ETA: out ${best.eta.outboundSeconds.toFixed(2)} + lock ${best.eta.reclaimLockSeconds.toFixed(2)} + return ${best.eta.returnSeconds.toFixed(2)} = ${best.eta.totalSeconds.toFixed(2)}s`,
        `Nearest set road: ${best.distanceFromRover.toFixed(0)} away, +${best.payload.toFixed(1)} in ${best.refillEtaSeconds.toFixed(1)}s`
      );
    }

    if (diagnostics.topCandidates.length > 1) {
      lines.push(
        `Top 3: ${diagnostics.topCandidates
          .map((candidate) => `#${candidate.targetPatchId} ${candidate.score.toFixed(1)} +${candidate.payload.toFixed(1)}`)
          .join(' | ')}`
      );
    }

    return lines.join('\n');
  }

  private formatTuningValue(definition: TuningControlDefinition, value: number): string {
    return value.toFixed(definition.precision ?? 0);
  }

  private loadStoredTuning(): ContinuousTuning {
    if (!import.meta.env.DEV) return resolveContinuousTuning();

    try {
      const raw = window.localStorage.getItem(TUNING_STORAGE_KEY);
      return raw ? resolveContinuousTuning(JSON.parse(raw) as Partial<ContinuousTuning>) : resolveContinuousTuning();
    } catch {
      return resolveContinuousTuning();
    }
  }

  private loadStoredArenaId(): ContinuousArenaId {
    if (!import.meta.env.DEV) return DEFAULT_CONTINUOUS_ARENA_ID;

    try {
      const raw = window.localStorage.getItem(ARENA_STORAGE_KEY) as ContinuousArenaId | null;
      return raw && CONTINUOUS_ARENAS[raw] ? raw : DEFAULT_CONTINUOUS_ARENA_ID;
    } catch {
      return DEFAULT_CONTINUOUS_ARENA_ID;
    }
  }

  private saveStoredTuning(): void {
    if (!import.meta.env.DEV) return;

    try {
      window.localStorage.setItem(TUNING_STORAGE_KEY, JSON.stringify(this.state.tuning));
    } catch {
      // Local storage can be unavailable in hardened browser contexts; live tuning still works.
    }
  }

  private saveStoredArenaId(): void {
    if (!import.meta.env.DEV) return;

    try {
      window.localStorage.setItem(ARENA_STORAGE_KEY, this.state.arenaId);
    } catch {
      // Local storage can be unavailable in hardened browser contexts; live arena switching still works.
    }
  }

  private loadStoredDroneRailLab(): DroneRailLabSettings {
    if (!import.meta.env.DEV) return { ...DEFAULT_DRONE_RAIL_LAB_SETTINGS };

    try {
      const raw = window.localStorage.getItem(DRONE_RAIL_LAB_STORAGE_KEY);
      return this.normalizeDroneRailLabSettings(raw ? (JSON.parse(raw) as Partial<DroneRailLabSettings>) : undefined);
    } catch {
      return { ...DEFAULT_DRONE_RAIL_LAB_SETTINGS };
    }
  }

  private saveStoredDroneRailLab(): void {
    if (!import.meta.env.DEV) return;

    try {
      window.localStorage.setItem(DRONE_RAIL_LAB_STORAGE_KEY, JSON.stringify(this.droneRailLab));
    } catch {
      // Local storage can be unavailable in hardened browser contexts; live overlays still work.
    }
  }

  private applyDroneRailOverlayValue(key: DroneRailOverlayKey, value: boolean): void {
    this.droneRailLab = {
      ...this.droneRailLab,
      [key]: value
    };
    this.saveStoredDroneRailLab();
    this.syncDroneRailLabPanel();
  }

  private selectDynamicsPreset(presetId: DynamicsPresetId): void {
    const preset = this.getDynamicsPreset(presetId);
    this.droneRailLab = {
      ...this.droneRailLab,
      selectedDynamicsPresetId: preset.id
    };
    this.saveStoredDroneRailLab();
    this.syncDroneRailLabPanel();
  }

  private applySelectedDynamicsPreset(): void {
    this.applyDynamicsPreset(this.droneRailLab.selectedDynamicsPresetId);
  }

  private applyDynamicsPreset(presetId: DynamicsPresetId): void {
    const preset = this.getDynamicsPreset(presetId);
    this.droneRailLab = {
      ...this.droneRailLab,
      selectedDynamicsPresetId: preset.id
    };
    this.saveStoredDroneRailLab();
    this.setDynamicsTuning(preset.tuning);
    this.resetRun();
  }

  private resetStableFirstRunDynamics(): void {
    this.applyDynamicsPreset(DEFAULT_DYNAMICS_PRESET_ID);
  }

  private normalizeDroneRailLabSettings(settings?: Partial<DroneRailLabSettings>): DroneRailLabSettings {
    const candidatePresetId = settings?.selectedDynamicsPresetId;
    const selectedDynamicsPresetId: DynamicsPresetId = candidatePresetId && DYNAMICS_PRESETS.some((preset) => preset.id === candidatePresetId)
      ? candidatePresetId
      : DEFAULT_DYNAMICS_PRESET_ID;
    return {
      ...DEFAULT_DRONE_RAIL_LAB_SETTINGS,
      ...settings,
      selectedDynamicsPresetId
    };
  }

  private getDynamicsPreset(presetId: DynamicsPresetId): DynamicsPresetDefinition {
    return DYNAMICS_PRESETS.find((preset) => preset.id === presetId) ?? DYNAMICS_PRESETS[0];
  }

  private tuningMatchesPreset(preset: DynamicsPresetDefinition): boolean {
    return (Object.keys(preset.tuning) as Array<keyof ContinuousTuning>).every(
      (key) => this.state.tuning[key] === preset.tuning[key]
    );
  }

  private getDynamicsPresetSnapshot(): Pick<
    DroneRailLabSnapshot,
    | 'dynamicsPresetId'
    | 'dynamicsPresetName'
    | 'selectedDynamicsPresetId'
    | 'selectedDynamicsPresetName'
    | 'matchesSelectedDynamicsPreset'
  > {
    const selected = this.getDynamicsPreset(this.droneRailLab.selectedDynamicsPresetId);
    const matching = DYNAMICS_PRESETS.find((preset) => this.tuningMatchesPreset(preset));
    const current = matching ?? selected;
    const matchesSelectedDynamicsPreset = Boolean(matching && matching.id === selected.id);

    return {
      dynamicsPresetId: current.id,
      dynamicsPresetName: matching ? current.name : `${selected.name} (modified)`,
      selectedDynamicsPresetId: selected.id,
      selectedDynamicsPresetName: selected.name,
      matchesSelectedDynamicsPreset
    };
  }

  private copyDroneRailDynamicsJson(button: HTMLButtonElement): void {
    const original = button.textContent ?? 'Copy Dynamics JSON';
    const preset = this.getDynamicsPresetSnapshot();
    const text = JSON.stringify(
      {
        preset,
        tuning: this.state.tuning,
        overlays: this.droneRailLab,
        diagnostics: getDroneReclaimDiagnostics(this.state)
      },
      null,
      2
    );

    if (!navigator.clipboard) {
      console.info('Moon Miner drone/rail dynamics JSON:', text);
      button.textContent = 'Logged';
      window.setTimeout(() => {
        button.textContent = original;
      }, 900);
      return;
    }

    void navigator.clipboard
      .writeText(text)
      .then(() => {
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      })
      .catch(() => {
        button.textContent = 'Copy failed';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      });
  }

  private copyTuningJson(button: HTMLButtonElement): void {
    const original = button.textContent ?? 'Copy JSON';
    const text = JSON.stringify(this.state.tuning, null, 2);

    if (!navigator.clipboard) {
      console.info('Moon Miner tuning JSON:', text);
      button.textContent = 'Logged';
      window.setTimeout(() => {
        button.textContent = original;
      }, 900);
      return;
    }

    void navigator.clipboard
      .writeText(text)
      .then(() => {
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      })
      .catch(() => {
        button.textContent = 'Copy failed';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      });
  }

  private applyCameraSettings(settings: Partial<CameraLabSettings>): void {
    this.cameraLab = this.normalizeCameraLabSettings({ ...this.cameraLab, ...settings });
    this.viewMode = this.cameraLab.viewMode;
    this.tacticalCameraFocus = this.tacticalCameraTarget();
    this.saveStoredCameraLab();
    this.syncCameraLabPanel();
  }

  private applyCameraPreset(presetId: CameraPresetId): void {
    const preset = this.getCameraPreset(presetId);
    this.cameraLab = this.normalizeCameraLabSettings({ ...preset.settings });
    this.viewMode = this.cameraLab.viewMode;
    this.cameraHeading = this.state.rover.heading;
    this.tacticalCameraFocus = this.tacticalCameraTarget();
    this.hybridPullbackUntilMs = 0;
    this.saveStoredCameraLab();
    this.syncCameraLabPanel();
  }

  private cycleCameraPreset(): void {
    const index = CAMERA_PRESETS.findIndex((preset) => preset.id === this.cameraLab.preset);
    const next = CAMERA_PRESETS[(index + 1) % CAMERA_PRESETS.length] ?? CAMERA_PRESETS[0];
    this.applyCameraPreset(next.id);
  }

  private cycleViewMode(): void {
    const modes: ViewMode[] = ['tactical', 'chase', 'hybrid'];
    const index = modes.indexOf(this.viewMode);
    this.setCameraViewMode(modes[(index + 1) % modes.length] ?? 'tactical');
  }

  private setCameraViewMode(viewMode: ViewMode): void {
    this.viewMode = viewMode;
    this.cameraLab = this.normalizeCameraLabSettings({
      ...this.cameraLab,
      viewMode
    });
    this.saveStoredCameraLab();
    this.syncCameraLabPanel();
  }

  private applyCameraNumericValue(key: NumericCameraControlKey, value: number): void {
    if (!Number.isFinite(value)) return;

    const definition = CAMERA_CONTROL_GROUPS.flatMap((group) => group.controls).find((control) => control.key === key);
    const nextValue = definition ? clamp(value, definition.min, definition.max) : value;
    this.cameraLab = this.normalizeCameraLabSettings({
      ...this.cameraLab,
      [key]: nextValue
    });
    this.viewMode = this.cameraLab.viewMode;
    this.saveStoredCameraLab();
    this.syncCameraLabPanel();
  }

  private applyCameraToggleValue(key: BooleanCameraControlKey, value: boolean): void {
    this.cameraLab = this.normalizeCameraLabSettings({
      ...this.cameraLab,
      [key]: value
    });
    this.saveStoredCameraLab();
    this.syncCameraLabPanel();
  }

  private resetCameraLab(): void {
    this.applyCameraPreset('tacticalMap');
  }

  private syncCameraLabPanel(): void {
    if (this.cameraPresetSelectElement) this.cameraPresetSelectElement.value = this.cameraLab.preset;
    if (this.cameraViewModeSelectElement) this.cameraViewModeSelectElement.value = this.viewMode;

    for (const group of CAMERA_CONTROL_GROUPS) {
      for (const definition of group.controls) {
        const controls = this.cameraNumericControls.get(definition.key);
        if (!controls) continue;

        const value = this.cameraLab[definition.key];
        const formatted = this.formatCameraValue(definition, value);
        controls.range.value = String(value);
        controls.number.value = formatted;
        controls.value.textContent = formatted;
      }
    }

    for (const group of CAMERA_TOGGLE_GROUPS) {
      for (const definition of group.toggles) {
        const checkbox = this.cameraToggleControls.get(definition.key);
        if (checkbox) checkbox.checked = this.cameraLab[definition.key];
      }
    }
  }

  private formatCameraValue(definition: CameraControlDefinition, value: number): string {
    return value.toFixed(definition.precision ?? 0);
  }

  private loadInitialCameraLab(): CameraLabSettings {
    const stored = this.loadStoredCameraLab();
    const urlViewMode = this.readUrlViewMode();
    if (!urlViewMode) return stored;

    const presetId: CameraPresetId =
      urlViewMode === 'tactical' ? 'tacticalMap' : 'tractorChase';
    return this.normalizeCameraLabSettings({ ...this.getCameraPreset(presetId).settings });
  }

  private loadStoredCameraLab(): CameraLabSettings {
    if (!import.meta.env.DEV) return this.normalizeCameraLabSettings({ ...this.getCameraPreset('tractorChase').settings });

    try {
      const raw = window.localStorage.getItem(CAMERA_LAB_STORAGE_KEY);
      if (!raw) return this.normalizeCameraLabSettings({ ...this.getCameraPreset('tractorChase').settings });
      return this.normalizeCameraLabSettings(JSON.parse(raw) as Partial<CameraLabSettings>);
    } catch {
      return this.normalizeCameraLabSettings({ ...this.getCameraPreset('tractorChase').settings });
    }
  }

  private saveStoredCameraLab(): void {
    if (!import.meta.env.DEV) return;

    try {
      window.localStorage.setItem(CAMERA_LAB_STORAGE_KEY, JSON.stringify(this.cameraLab));
    } catch {
      // Local storage can be unavailable in hardened browser contexts; live camera tuning still works.
    }
  }

  private normalizeCameraLabSettings(settings?: Partial<CameraLabSettings>): CameraLabSettings {
    const merged = {
      ...DEFAULT_CAMERA_LAB_SETTINGS,
      ...settings
    };
    const preset = CAMERA_PRESETS.some((candidate) => candidate.id === merged.preset) ? merged.preset : 'tacticalMap';
    const viewMode: ViewMode =
      merged.viewMode === 'chase' || merged.viewMode === 'hybrid' || merged.viewMode === 'tactical' ? merged.viewMode : 'tactical';
    const normalized: CameraLabSettings = {
      ...merged,
      preset,
      viewMode
    };

    for (const group of CAMERA_CONTROL_GROUPS) {
      for (const definition of group.controls) {
        const value = normalized[definition.key];
        normalized[definition.key] = clamp(Number.isFinite(value) ? value : DEFAULT_CAMERA_LAB_SETTINGS[definition.key], definition.min, definition.max);
      }
    }

    return normalized;
  }

  private getCameraPreset(presetId: CameraPresetId): CameraPresetDefinition {
    return CAMERA_PRESETS.find((preset) => preset.id === presetId) ?? CAMERA_PRESETS[0];
  }

  private copyCameraLabJson(button: HTMLButtonElement): void {
    const original = button.textContent ?? 'Copy JSON';
    const text = JSON.stringify(this.cameraLab, null, 2);

    if (!navigator.clipboard) {
      console.info('Moon Miner camera lab JSON:', text);
      button.textContent = 'Logged';
      window.setTimeout(() => {
        button.textContent = original;
      }, 900);
      return;
    }

    void navigator.clipboard
      .writeText(text)
      .then(() => {
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      })
      .catch(() => {
        button.textContent = 'Copy failed';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      });
  }

  private clearPointerTarget(): void {
    this.pointerTarget = undefined;
  }

  private updateCamera(deltaSeconds: number): void {
    const target = this.tacticalCameraTarget();
    const tacticalBlend = 1 - Math.exp(-this.cameraLab.smoothing * deltaSeconds);
    this.tacticalCameraFocus = {
      x: Phaser.Math.Linear(this.tacticalCameraFocus.x, target.x, tacticalBlend),
      y: Phaser.Math.Linear(this.tacticalCameraFocus.y, target.y, tacticalBlend)
    };

    if (this.viewMode === 'tactical') {
      return;
    }

    const offset = angleDifference(this.state.rover.heading, this.cameraHeading);
    const magnitude = Math.abs(offset);
    const direction = Math.sign(offset) || 1;
    const deadzone = (this.cameraLab.cameraYawDeadzone * Math.PI) / 180;
    const maxLag = (this.cameraLab.cameraMaxYawLag * Math.PI) / 180;
    const rate = this.state.speedState === 'crawl' ? this.cameraLab.cameraYawRate * 1.45 : this.cameraLab.cameraYawRate;

    if (magnitude > maxLag) {
      // Saturated. Hold the lag steady so a sustained turn parks the tractor at
      // the edge of frame instead of swinging it out of shot.
      this.cameraHeading = wrapAngle(this.state.rover.heading - direction * maxLag);
      this.updateChaseFocus(deltaSeconds);
      return;
    }

    if (magnitude <= deadzone) {
      this.updateChaseFocus(deltaSeconds);
      return;
    }

    const step = Math.min(magnitude, rate * deltaSeconds);
    this.cameraHeading = wrapAngle(this.cameraHeading + direction * step);
    this.updateChaseFocus(deltaSeconds);
  }

  private updateChaseFocus(deltaSeconds: number): void {
    const desired = {
      x: this.state.rover.x + Math.cos(this.cameraHeading) * this.cameraLab.lookAheadDistance,
      y: this.state.rover.y + Math.sin(this.cameraHeading) * this.cameraLab.lookAheadDistance
    };
    const offsetX = desired.x - this.chaseCameraFocus.x;
    const offsetY = desired.y - this.chaseCameraFocus.y;
    const distance = Math.hypot(offsetX, offsetY);
    const deadzone = Math.max(0, this.cameraLab.followDeadzone);
    if (distance <= deadzone) return;

    const blend = 1 - Math.exp(-this.cameraLab.smoothing * deltaSeconds);
    this.chaseCameraFocus = {
      x: Phaser.Math.Linear(this.chaseCameraFocus.x, desired.x, blend),
      y: Phaser.Math.Linear(this.chaseCameraFocus.y, desired.y, blend)
    };
  }

  private captureTransitions(
    timeMs: number,
    previousDroneStatus: DroneStatus,
    previousSpeedState: SpeedState,
    previousPhase: ContinuousPhase,
    previousOre: number,
    previousDronePayload: number,
    previousNanobots: number,
    previousSolarSeconds: number
  ): void {
    if (previousDroneStatus === 'ready' && this.state.drone.status !== 'ready') {
      this.droneClaimAtMs = timeMs;
    }

    let deliveredPayload = 0;
    if (previousDroneStatus !== 'ready' && this.state.drone.status === 'ready') {
      this.addEffect('recovery', this.state.rover.x, this.state.rover.y, 980);
      if (previousDronePayload > 0) {
        deliveredPayload = previousDronePayload;
        this.addEffect('delivery', this.state.rover.x, this.state.rover.y, DELIVERY_READOUT_MS, deliveredPayload);
      }
    }

    if (previousSpeedState !== this.state.speedState) {
      if (this.state.speedState === 'prepared') {
        this.addEffect('sprint', this.state.rover.x, this.state.rover.y, 620);
        this.showEventMessage('Your own road. Free to drive, and the arms can mine.', 1200, timeMs, 1);
      }
      if (this.state.speedState === 'fabricating') {
        this.addEffect('build', this.state.rover.x, this.state.rover.y, 620);
        this.showEventMessage('Raw ground. Every second here costs nanobots.', 1200, timeMs, 1);
      }
      if (this.state.speedState === 'crawl') {
        this.addEffect('crawl', this.state.rover.x, this.state.rover.y, 820);
        this.showEventMessage(
          this.state.drone.status === 'ready' ? 'Out of nanobots. Press Space for a refill.' : 'Out of nanobots. Crawling until the drone returns.',
          1800,
          timeMs,
          2
        );
      }
    }

    const crossedIntoLaunchPressure =
      previousNanobots / this.state.maxNanobots >= this.state.tuning.droneUrgencyRatio &&
      this.state.nanobots / this.state.maxNanobots < this.state.tuning.droneUrgencyRatio;
    if (crossedIntoLaunchPressure && this.state.drone.status === 'ready') {
      this.addEffect('crawl', this.state.rover.x, this.state.rover.y, 620);
      this.showEventMessage('Nanobots low. Space sends the drone.', 1450, timeMs, 2);
    }

    if (this.state.arena.extraction && this.state.phase === 'playing') {
      const previousSolarRatio = previousSolarSeconds / Math.max(1, this.state.solarWindowSeconds);
      const solarRatio = this.getSolarRatio();
      if (previousSolarRatio >= 0.5 && solarRatio < 0.5) {
        this.showEventMessage('Sun past half. Start working your way home.', 1900, timeMs, 1);
      }
      if (previousSolarRatio >= 0.25 && solarRatio < 0.25) {
        this.showEventMessage('Last light. Turn toward extraction.', 2200, timeMs, 2);
      }
      if (previousSolarRatio >= 0.1 && solarRatio < 0.1) {
        this.showEventMessage('Extraction now. No more detours.', 2400, timeMs, 3);
      }
    }

    if (deliveredPayload > 0) {
      // The scene was composing its own line here and throwing away the one the
      // simulation wrote, so the relaid rail -- the only thing the drone gives
      // you rather than takes -- arrived unannounced.
      this.showEventMessage(this.state.message, 1800, timeMs, 2);
    }

    if (this.state.rover.ore > previousOre + 0.02) {
      this.addEffect('mine', this.state.rover.x, this.state.rover.y, 260);
    }

    if (previousPhase !== this.state.phase) {
      this.addEffect(this.state.phase === 'won' ? 'win' : 'loss', this.state.rover.x, this.state.rover.y, 1200);
      // The shift ends whether you made quota or not. What you laid well is
      // still there in the morning; what you scraped out while dying is not.
      if (this.state.phase !== 'playing') {
        this.saveCarriedRoad();
        void this.recordRunTrace();
      }
    }

    this.previousDroneStatus = this.state.drone.status;
    this.previousSpeedState = this.state.speedState;
    this.previousPhase = this.state.phase;
    this.previousOre = this.state.rover.ore;
  }

  private showEventMessage(text: string, durationMs = 1400, nowMs = this.time.now, priority = 1): void {
    if (this.eventMessage && nowMs <= this.eventMessage.expiresAtMs && priority < this.eventMessage.priority) return;

    this.eventMessage = {
      text,
      expiresAtMs: nowMs + durationMs,
      priority
    };
  }

  private draw(): void {
    this.graphics.clear();
    this.drawBackdrop();
    this.drawTerrainLayer();
    this.drawArenaNavigationGuides();
    this.drawFertileZones();
    this.drawFirstRunAffordances();
    this.drawBeatMarkers();
    this.drawRidges();
    this.drawFields();
    this.drawReclaimPreview();
    this.drawDroneReservation();
    this.drawPointerTarget();
    this.drawDrone();
    this.drawRover();
    this.drawEffects();
    this.drawSolarWindowOverlay();
    this.drawDroneRailDebugOverlays();
    this.drawCameraDebugOverlays();
    this.drawHud();
    this.drawPhaseBanner();
    this.syncDroneRailDiagnosticsText();
    this.updateDebugState();
  }

  private syncDroneRailDiagnosticsText(): void {
    if (!import.meta.env.DEV || !this.debugOverlayVisible || !this.droneRailDiagnosticsElement) return;
    this.droneRailDiagnosticsElement.textContent = this.formatDroneRailDiagnostics();
  }

  private drawBackdrop(): void {
    const layout = this.getLayout();
    const visualCalm = this.visualCalm();
    this.graphics.fillStyle(0x070910, 1);
    this.graphics.fillRect(0, 0, layout.width, layout.height);

    this.graphics.fillStyle(this.viewMode === 'tactical' ? 0x11151e : 0x05070e, 1);
    this.graphics.fillRect(0, layout.hudHeight, layout.width, layout.height - layout.hudHeight);

    if (this.viewMode === 'tactical') {
      this.drawTacticalBackdrop(layout, visualCalm);
      return;
    }

    if (this.cameraLab.horizonVisible) {
      this.drawRegolith();
    }

    if (this.cameraLab.gridVisible) {
      for (let index = 0; index < 8; index += 1) {
        const forward = 500 - index * 120;
        const from = this.project(this.cameraLocalPoint(-620, forward));
        const to = this.project(this.cameraLocalPoint(620, forward));
        this.graphics.lineStyle(1, 0x222a36, 0.2 + 0.18 * visualCalm);
        this.graphics.lineBetween(from.x, from.y, to.x, to.y);
      }

      for (let index = 0; index < 46; index += 1) {
        if (visualCalm < 0.7 && index % 2 === 1) continue;
        const point = this.project(
          this.cameraLocalPoint(-560 + ((index * 173) % 1120), -330 + ((index * 89) % 840))
        );
        const radius = 1 + (index % 3);
        this.graphics.fillStyle(index % 5 === 0 ? 0x465060 : 0x252c38, (0.32 + 0.33 * visualCalm));
        this.graphics.fillCircle(point.x, point.y, radius);
      }
    }

    this.graphics.lineStyle(1, 0x262e3b, 0.8);
    this.graphics.lineBetween(0, layout.hudHeight, layout.width, layout.hudHeight);
  }

  private static mixColor(from: number, to: number, amount: number): number {
    const t = clamp(amount, 0, 1);
    const fr = (from >> 16) & 0xff;
    const fg = (from >> 8) & 0xff;
    const fb = from & 0xff;
    const tr = (to >> 16) & 0xff;
    const tg = (to >> 8) & 0xff;
    const tb = to & 0xff;
    return (
      ((Math.round(fr + (tr - fr) * t) & 0xff) << 16) |
      ((Math.round(fg + (tg - fg) * t) & 0xff) << 8) |
      (Math.round(fb + (tb - fb) * t) & 0xff)
    );
  }

  // Ground used to be drawn one shade off the sky, which is why the world read
  // as a void. Lay it down in depth bands instead: warm lit dust close to the
  // tractor falling away to cold haze at the horizon.
  private horizonScreenY(): number {
    const rig = this.cameraRig();
    return this.getCameraCenter().y - (rig.focal * rig.sin) / rig.cos;
  }

  // Sky only exists once there is a horizon to put it under: dusty just above
  // the ground, falling to deep black overhead, with stars thinning downward.
  private drawSky(): void {
    const layout = this.getLayout();
    const horizon = this.horizonScreenY();
    const top = layout.hudHeight;
    if (horizon <= top) return;

    const SKY_BANDS = 18;
    for (let index = 0; index < SKY_BANDS; index += 1) {
      const t0 = index / SKY_BANDS;
      const t1 = (index + 1) / SKY_BANDS;
      const shade = ContinuousMoonMinerScene.mixColor(0x05070e, 0x2f3444, Math.pow(t0, 1.6));
      this.graphics.fillStyle(shade, 1);
      this.graphics.fillRect(0, top + (horizon - top) * t0, layout.width, (horizon - top) * (t1 - t0) + 1);
    }

    for (let index = 0; index < 90; index += 1) {
      const x = (((index * 373) % 1000) / 1000) * layout.width;
      const bias = Math.pow(((index * 173) % 1000) / 1000, 1.5);
      const y = top + (horizon - top) * bias;
      const twinkle = 0.25 + (((index * 37) % 100) / 100) * 0.5;
      this.graphics.fillStyle(index % 7 === 0 ? 0xcfe6ff : 0x8fa3bd, twinkle * (1 - bias * 0.75));
      this.graphics.fillCircle(x, y, index % 11 === 0 ? 1.6 : 1);
    }
  }

  private drawRegolith(): void {
    this.drawSky();
    const NEAR = -360;
    const FAR = 2600;
    const BANDS = 34;
    const nearColor = 0x7d7061;
    const farColor = 0x1b2130;

    const layout = this.getLayout();
    const horizon = this.horizonScreenY();
    this.graphics.fillStyle(farColor, 1);
    this.graphics.fillRect(0, horizon, layout.width, layout.height - horizon);

    for (let index = 0; index < BANDS; index += 1) {
      const t0 = Math.pow(index / BANDS, 2.1);
      const t1 = Math.pow((index + 1) / BANDS, 2.1);
      const forward0 = NEAR + (FAR - NEAR) * t0;
      const forward1 = NEAR + (FAR - NEAR) * t1;
      const shade = ContinuousMoonMinerScene.mixColor(nearColor, farColor, Math.pow(index / BANDS, 0.55));
      this.graphics.fillStyle(shade, 1);
      this.graphics.fillPoints(
        [
          this.project(this.cameraLocalPoint(-(900 + forward0 * 2.2), forward0)),
          this.project(this.cameraLocalPoint(900 + forward0 * 2.2, forward0)),
          this.project(this.cameraLocalPoint(900 + forward1 * 2.2, forward1)),
          this.project(this.cameraLocalPoint(-(900 + forward1 * 2.2), forward1))
        ],
        true,
        true
      );
    }

    // Scattered grit so the surface has texture to move against.
    for (let index = 0; index < 120; index += 1) {
      const lateral = -1200 + ((index * 617) % 2400);
      const forward = NEAR + ((index * 331) % (FAR - NEAR));
      const depth = (forward - NEAR) / (FAR - NEAR);
      if (depth > 0.72) continue;
      const point = this.project(this.cameraLocalPoint(lateral, forward));
      const tone = index % 4 === 0 ? 0x8a8072 : 0x4a4640;
      this.graphics.fillStyle(tone, 0.5 * (1 - depth));
      this.graphics.fillCircle(point.x, point.y, (1 + (index % 3)) * (1 - depth * 0.6));
    }

    // Haze band where ground meets sky.
    for (let index = 0; index < 7; index += 1) {
      const spread = 4 + index * 7;
      this.graphics.fillStyle(0x39414f, 0.16 - index * 0.02);
      this.graphics.fillRect(0, horizon - spread * 0.35, this.getLayout().width, spread);
    }
  }

  private drawTacticalBackdrop(layout: SceneLayout, visualCalm: number): void {
    const topLeft = this.project({ x: 0, y: 0 });
    const topRight = this.project({ x: this.state.width, y: 0 });
    const bottomRight = this.project({ x: this.state.width, y: this.state.height });
    const bottomLeft = this.project({ x: 0, y: this.state.height });
    const worldLeft = Math.min(topLeft.x, bottomLeft.x);
    const worldRight = Math.max(topRight.x, bottomRight.x);
    const worldTop = Math.min(topLeft.y, topRight.y);
    const worldBottom = Math.max(bottomLeft.y, bottomRight.y);

    this.graphics.fillStyle(0x141924, 0.94);
    this.graphics.fillRect(worldLeft, worldTop, worldRight - worldLeft, worldBottom - worldTop);
    this.graphics.lineStyle(2, 0x344052, 0.88);
    this.graphics.strokeRect(worldLeft, worldTop, worldRight - worldLeft, worldBottom - worldTop);

    if (this.cameraLab.gridVisible) {
      this.graphics.lineStyle(1, 0x263040, 0.22 + visualCalm * 0.18);
      for (let x = 0; x <= this.state.width; x += 120) {
        const from = this.project({ x, y: 0 });
        const to = this.project({ x, y: this.state.height });
        this.graphics.lineBetween(from.x, from.y, to.x, to.y);
      }
      for (let y = 80; y <= this.state.height; y += 120) {
        const from = this.project({ x: 0, y });
        const to = this.project({ x: this.state.width, y });
        this.graphics.lineBetween(from.x, from.y, to.x, to.y);
      }
    }

    this.graphics.lineStyle(2, 0x222b39, 0.52);
    const beats = this.state.arena.beats.map((beat) => this.project(beat));
    for (let index = 0; index < beats.length - 1; index += 1) {
      this.graphics.lineBetween(beats[index].x, beats[index].y, beats[index + 1].x, beats[index + 1].y);
    }

    for (let index = 0; index < 42; index += 1) {
      const point = this.project({
        x: 42 + ((index * 173) % Math.max(1, this.state.width - 84)),
        y: 80 + ((index * 89) % Math.max(1, this.state.height - 118))
      });
      const radius = 1.2 + (index % 3);
      this.graphics.fillStyle(index % 5 === 0 ? 0x465060 : 0x252c38, 0.2 + 0.28 * visualCalm);
      this.graphics.fillCircle(point.x, point.y, radius);
    }

    this.graphics.lineStyle(1, 0x262e3b, 0.8);
    this.graphics.lineBetween(0, layout.hudHeight, layout.width, layout.hudHeight);
  }

  private drawTerrainLayer(): void {
    const visualCalm = this.visualCalm();

    for (let index = 0; index < TERRAIN_CRATER_COUNT; index += 1) {
      this.drawTerrainCrater(index, visualCalm);
    }

    for (let index = 0; index < TERRAIN_FISSURE_COUNT; index += 1) {
      this.drawTerrainFissure(index, visualCalm);
    }

    for (const zone of this.state.fertileZones) {
      this.drawFertileTerrainBed(zone, visualCalm);
    }

    this.drawPreparedFieldTerrainBeds(visualCalm);
  }

  private drawArenaNavigationGuides(): void {
    this.drawSafeReturnPath();
    this.drawExtractionZone();
  }

  private drawSafeReturnPath(): void {
    // Deliberately empty. In a round trip the road home is the one you laid, so
    // a pre-drawn line running away from the depot taught exactly the wrong
    // lesson. The corridor data stays on the arena for self-play metrics.
    this.drawStaticText('safe-path-label', 0, 0, '', 1, '#ffffff');
  }

  private drawExtractionZone(): void {
    const extraction = this.state.arena.extraction;
    if (!extraction) {
      this.drawStaticText('extraction-label', 0, 0, '', 1, '#ffffff');
      this.drawStaticText('home-direction-label', 0, 0, '', 1, '#ffffff');
      return;
    }

    const center = this.project(extraction);
    const scale = this.projectedScale(extraction);
    const radius = extraction.radius * scale;
    const sunRatio = this.getSolarRatio();
    const pulse = this.state.phase === 'playing' ? 0.5 + Math.sin(this.time.now / (sunRatio < 0.25 ? 95 : 190)) * 0.5 : 0.3;
    const urgent = sunRatio < 0.25;
    const color = sunRatio < 0.1 ? 0xffe0a8 : urgent ? 0x96ffe8 : 0x77f2ca;
    this.graphics.fillStyle(urgent ? 0x31402c : 0x163b34, urgent ? 0.34 + pulse * 0.08 : 0.25 + pulse * 0.05);
    this.graphics.fillCircle(center.x, center.y, radius * (urgent ? 1.58 : 1.35));
    this.graphics.lineStyle(urgent ? 5 : 4, color, urgent ? 0.74 + pulse * 0.22 : 0.62 + pulse * 0.18);
    this.graphics.strokeCircle(center.x, center.y, radius * (urgent ? 1.58 : 1.35));
    this.graphics.lineStyle(2, 0xeafffb, urgent ? 0.72 : 0.58);
    this.graphics.lineBetween(center.x - radius * 0.72, center.y, center.x + radius * 0.72, center.y);
    this.graphics.lineBetween(center.x, center.y - radius * 0.72, center.x, center.y + radius * 0.72);
    this.drawStaticText('extraction-label', center.x + 18, center.y - 12, urgent ? 'GO HOME' : 'EXTRACTION', 12, urgent ? '#fff0ba' : '#bfffee');
    this.drawHomeDirectionCue(center, urgent, color);
  }

  private drawHomeDirectionCue(extractionScreen: Vec2, urgent: boolean, color: number): void {
    const extraction = this.state.arena.extraction;
    if (!extraction || this.state.phase !== 'playing') {
      this.drawStaticText('home-direction-label', 0, 0, '', 1, '#ffffff');
      return;
    }

    const distanceHome = Math.hypot(this.state.rover.x - extraction.x, this.state.rover.y - extraction.y);
    if (distanceHome < 260) {
      this.drawStaticText('home-direction-label', 0, 0, '', 1, '#ffffff');
      return;
    }

    const roverScreen = this.project(this.state.rover);
    const angle = Math.atan2(extractionScreen.y - roverScreen.y, extractionScreen.x - roverScreen.x);
    const cue = {
      x: roverScreen.x + Math.cos(angle) * 58,
      y: roverScreen.y + Math.sin(angle) * 58
    };
    const left = {
      x: cue.x - Math.cos(angle) * 16 + Math.cos(angle + Math.PI / 2) * 8,
      y: cue.y - Math.sin(angle) * 16 + Math.sin(angle + Math.PI / 2) * 8
    };
    const right = {
      x: cue.x - Math.cos(angle) * 16 + Math.cos(angle - Math.PI / 2) * 8,
      y: cue.y - Math.sin(angle) * 16 + Math.sin(angle - Math.PI / 2) * 8
    };
    const alpha = urgent ? 0.76 + Math.sin(this.time.now / 120) * 0.12 : 0.42;
    this.graphics.fillStyle(color, alpha);
    this.graphics.fillTriangle(cue.x, cue.y, left.x, left.y, right.x, right.y);
    this.graphics.lineStyle(2, color, alpha);
    this.graphics.lineBetween(cue.x, cue.y, left.x, left.y);
    this.graphics.lineBetween(left.x, left.y, right.x, right.y);
    this.graphics.lineBetween(right.x, right.y, cue.x, cue.y);
    if (this.cameraLab.worldLabelsVisible || urgent) {
      this.drawStaticText('home-direction-label', cue.x + 12, cue.y - 8, urgent ? 'HOME NOW' : 'home', urgent ? 12 : 10, urgent ? '#fff0ba' : '#bfffee');
    } else {
      this.drawStaticText('home-direction-label', 0, 0, '', 1, '#ffffff');
    }
  }

  private drawSolarWindowOverlay(): void {
    if (!this.state.arena.extraction) {
      this.drawStaticText('last-light-warning', 0, 0, '', 1, '#ffffff');
      return;
    }

    const layout = this.getLayout();
    const sunRatio = this.getSolarRatio();
    if (sunRatio > 0.5) {
      this.drawStaticText('last-light-warning', 0, 0, '', 1, '#ffffff');
      return;
    }

    const pressure = clamp((0.5 - sunRatio) / 0.5, 0, 1);
    const urgentPulse = sunRatio < 0.25 ? 0.5 + Math.sin(this.time.now / (sunRatio < 0.1 ? 70 : 110)) * 0.5 : 0;
    this.graphics.fillStyle(sunRatio < 0.25 ? 0x2b1615 : 0x1d1d27, 0.1 + pressure * 0.22 + urgentPulse * 0.06);
    this.graphics.fillRect(0, layout.hudHeight, layout.width, layout.height - layout.hudHeight);
    this.graphics.lineStyle(sunRatio < 0.1 ? 4 : 2, sunRatio < 0.25 ? 0xff9f73 : 0xa8c9ff, 0.28 + pressure * 0.34);
    this.graphics.lineBetween(0, layout.hudHeight + 2, layout.width, layout.hudHeight + 2);

    if (sunRatio <= 0.25) {
      this.drawStaticText(
        'last-light-warning',
        layout.width / 2,
        layout.hudHeight + 22,
        sunRatio < 0.1 ? 'LAST LIGHT: EXTRACTION NOW' : 'LAST LIGHT CLOSING',
        layout.mode === 'mobilePortrait' ? 13 : 14,
        sunRatio < 0.1 ? '#fff0ba' : '#ffd0b8',
        0.5
      );
    } else {
      this.drawStaticText('last-light-warning', 0, 0, '', 1, '#ffffff');
    }
  }

  private drawTerrainCrater(index: number, visualCalm: number): void {
    const point = this.terrainFeaturePoint(index, 37);
    const screen = this.project(point);
    const scale = this.projectedScale(point);
    const yScale = this.shapeYScale();
    const radius = 18 + ((index * 23) % 44);
    const width = radius * (1.45 + (index % 4) * 0.12) * scale;
    const height = radius * (0.72 + (index % 3) * 0.1) * yScale * scale;

    // Lit from the upper left: a bright rim on the sun side, the bowl in shadow
    // on the other, so craters read as holes in the ground instead of outlines
    // drawn over it.
    const lift = Math.max(2, height * 0.13);
    this.graphics.fillStyle(0x8d8371, 0.5 + visualCalm * 0.14);
    this.graphics.fillEllipse(screen.x - lift * 0.7, screen.y - lift, width * 1.04, height * 1.06);
    this.graphics.fillStyle(0x231f1b, 0.62 + visualCalm * 0.12);
    this.graphics.fillEllipse(screen.x + lift * 0.35, screen.y + lift * 0.4, width, height);
    this.graphics.fillStyle(0x4a4339, 0.72);
    this.graphics.fillEllipse(screen.x + lift * 0.1, screen.y + lift * 0.15, width * 0.74, height * 0.7);
  }

  private drawTerrainFissure(index: number, visualCalm: number): void {
    const start = this.terrainFeaturePoint(index, 113);
    const angle = ((index * 41) % 360) * (Math.PI / 180);
    const length = 48 + ((index * 31) % 96);
    const kink = this.pointFromHeading(start, angle + Math.sin(index) * 0.4, length * 0.48);
    const end = this.pointFromHeading(kink, angle - 0.34 + (index % 5) * 0.12, length * 0.58);
    const from = this.project(start);
    const mid = this.project(kink);
    const to = this.project(end);
    const alpha = 0.16 + visualCalm * 0.15;

    this.graphics.lineStyle(2, index % 2 === 0 ? 0x2a342d : 0x2b3340, alpha);
    this.graphics.lineBetween(from.x, from.y, mid.x, mid.y);
    this.graphics.lineBetween(mid.x, mid.y, to.x, to.y);
    this.graphics.lineStyle(1, 0x697180, alpha * 0.38);
    this.graphics.lineBetween(from.x + 2, from.y - 2, mid.x + 2, mid.y - 2);
  }

  private static hashNoise(seed: number): number {
    const value = Math.sin(seed * 127.1) * 43758.5453;
    return value - Math.floor(value);
  }

  // An irregular patch hugging the vein, tapered at both ends, so ore reads as
  // mineral in the ground rather than a rectangle laid on top of it.
  private fertilePatchPolygon(zone: FertileZone, halfWidth: number, salt: number): Vec2[] {
    if (!zone.vein) return [];
    const from = zone.vein.from;
    const to = zone.vein.to;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const normalX = -dy / length;
    const normalY = dx / length;
    const STEPS = 10;
    const seedBase = salt + zone.id.length * 17 + zone.radius;
    const points: Vec2[] = [];

    for (const side of [1, -1]) {
      for (let index = 0; index <= STEPS; index += 1) {
        const step = index / STEPS;
        const t = side === 1 ? step : 1 - step;
        const noise = ContinuousMoonMinerScene.hashNoise(seedBase + index * 3.7 + (side === 1 ? 0 : 51));
        const taper = Math.pow(Math.max(0.001, Math.sin(Math.PI * clamp(t, 0, 1))), 0.34);
        const width = halfWidth * (0.6 + noise * 0.75) * taper;
        points.push(
          this.project({
            x: from.x + dx * t + normalX * width * side,
            y: from.y + dy * t + normalY * width * side
          })
        );
      }
    }
    return points;
  }

  private drawFertileTerrainBed(zone: FertileZone, visualCalm: number): void {
    if (!zone.vein) {
      const center = this.project(zone);
      const scale = this.projectedScale(zone);
      const yScale = this.shapeYScale();
      this.graphics.fillStyle(0x25281e, 0.16 + visualCalm * 0.08);
      this.graphics.fillEllipse(center.x, center.y, zone.radius * 2.55 * scale, zone.radius * 1.64 * yScale * scale);
      this.graphics.lineStyle(1, 0x66704c, 0.18 + visualCalm * 0.1);
      this.graphics.strokeEllipse(center.x, center.y, zone.radius * 2.55 * scale, zone.radius * 1.64 * yScale * scale);
      return;
    }

    const outer = this.fertilePatchPolygon(zone, (zone.vein.width + 92) / 2, 11);
    this.graphics.fillStyle(0x3d382c, 0.5 + visualCalm * 0.12);
    this.graphics.fillPoints(outer, true, true);

    const inner = this.fertilePatchPolygon(zone, (zone.vein.width + 34) / 2, 29);
    this.graphics.fillStyle(0x4a422f, 0.5 + visualCalm * 0.1);
    this.graphics.fillPoints(inner, true, true);
  }

  private drawPreparedFieldTerrainBeds(visualCalm: number): void {
    const preparedFields = [...this.state.fields]
      .filter((field) => {
        return field.age >= this.state.tuning.preparedFieldMinAgeSeconds && field.value >= this.state.tuning.preparedFieldMinValue;
      })
      .sort((a, b) => a.id - b.id);
    const sections = this.fieldSections(preparedFields);

    for (const section of sections) {
      if (section.length === 1) {
        this.drawPreparedFieldTerrainCap(section[0], visualCalm);
        continue;
      }

      for (let index = 0; index < section.length - 1; index += 1) {
        this.drawPreparedFieldTerrainSegment(section[index], section[index + 1], visualCalm);
      }
      this.drawPreparedFieldTerrainCap(section[0], visualCalm);
      this.drawPreparedFieldTerrainCap(section[section.length - 1], visualCalm);
    }
  }

  private drawPreparedFieldTerrainSegment(
    from: { x: number; y: number; radius: number; value: number },
    to: { x: number; y: number; radius: number; value: number },
    visualCalm: number
  ): void {
    const fromScreen = this.project(from);
    const toScreen = this.project(to);
    const dx = toScreen.x - fromScreen.x;
    const dy = toScreen.y - fromScreen.y;
    const length = Math.hypot(dx, dy);
    if (length <= 0.01) return;

    const normal = { x: -dy / length, y: dx / length };
    const fromWidth = this.fieldRoadWidth(from) * 1.42;
    const toWidth = this.fieldRoadWidth(to) * 1.42;
    const points = [
      { x: fromScreen.x + normal.x * fromWidth, y: fromScreen.y + normal.y * fromWidth },
      { x: toScreen.x + normal.x * toWidth, y: toScreen.y + normal.y * toWidth },
      { x: toScreen.x - normal.x * toWidth, y: toScreen.y - normal.y * toWidth },
      { x: fromScreen.x - normal.x * fromWidth, y: fromScreen.y - normal.y * fromWidth }
    ];

    this.graphics.fillStyle(0x193334, 0.12 + visualCalm * 0.06);
    this.graphics.fillPoints(points, true, true);
    this.graphics.lineStyle(1, 0x3b5f5c, 0.18 + visualCalm * 0.1);
    this.graphics.strokePoints(points, true, true);
  }

  private drawPreparedFieldTerrainCap(
    field: { x: number; y: number; radius: number; value: number },
    visualCalm: number
  ): void {
    const center = this.project(field);
    const width = this.fieldRoadWidth(field) * 1.42;
    const yScale = this.shapeYScale();
    this.graphics.fillStyle(0x193334, 0.1 + visualCalm * 0.05);
    this.graphics.fillEllipse(center.x, center.y, width * 2.12, width * 1.22 * yScale);
    this.graphics.lineStyle(1, 0x3b5f5c, 0.14 + visualCalm * 0.1);
    this.graphics.strokeEllipse(center.x, center.y, width * 2.12, width * 1.22 * yScale);
  }

  private terrainFeaturePoint(index: number, salt: number): Vec2 {
    return {
      x: 58 + ((index * 197 + salt * 53) % Math.max(1, this.state.width - 116)),
      y: 84 + ((index * 131 + salt * 71) % Math.max(1, this.state.height - 132))
    };
  }

  private drawFertileZones(): void {
    const visualCalm = this.visualCalm();
    const activeZone = findFertileZoneAt(this.state, this.state.rover);
    for (const zone of this.state.fertileZones) {
      const active = activeZone?.id === zone.id;
      if (zone.vein) {
        this.drawFertileVein(zone, visualCalm, active);
      } else {
        const center = this.project(zone);
        const scale = this.projectedScale(zone);
        const yScale = this.shapeYScale();
        const activePulse = active ? 0.14 + Math.sin(this.time.now / 130) * 0.04 : 0;
        const remainingRatio = this.fertileZoneRemainingRatio(zone);
        const depletedRatio = 1 - remainingRatio;
        const scarCount = this.fertileZoneDepletionScarCount(zone);
        this.graphics.fillStyle(0x8a6837, 0.1 + (0.16 + 0.17 * visualCalm + activePulse) * remainingRatio);
        this.graphics.fillEllipse(center.x, center.y, zone.radius * 2.1 * scale, zone.radius * 1.36 * yScale * scale);
        this.graphics.lineStyle(active ? 5 : 3, active ? 0xffe48a : 0xf0bc4f, 0.18 + (0.26 + 0.24 * visualCalm + activePulse) * remainingRatio);
        this.graphics.strokeEllipse(center.x, center.y, zone.radius * 2.1 * scale, zone.radius * 1.36 * yScale * scale);
        this.graphics.fillStyle(0xffdc75, (0.08 + 0.1 * visualCalm) * remainingRatio);
        this.graphics.fillEllipse(
          center.x + zone.radius * 0.1 * scale,
          center.y - zone.radius * 0.08 * yScale * scale,
          zone.radius * 1.1 * scale,
          zone.radius * 0.52 * yScale * scale
        );
        for (let index = 0; index < scarCount; index += 1) {
          const angle = (index / Math.max(1, scarCount)) * Math.PI * 2;
          const scar = {
            x: center.x + Math.cos(angle) * zone.radius * 0.7 * scale * depletedRatio,
            y: center.y + Math.sin(angle) * zone.radius * 0.36 * yScale * scale * depletedRatio
          };
          this.graphics.lineStyle(2, 0x33271f, 0.74);
          this.graphics.lineBetween(scar.x - 8 * scale, scar.y - 3 * yScale * scale, scar.x + 8 * scale, scar.y + 3 * yScale * scale);
        }
      }
    }
  }

  private drawFirstRunAffordances(): void {
    const zone = this.getCurrentAffordanceZone();
    if (!zone) return;

    const pulse = 0.5 + Math.sin(this.time.now / 190) * 0.5;
    const urgent = this.shouldShowDroneLaunchUrgency() || this.state.drone.status === 'returning';
    const color = urgent ? 0x8dffea : 0xffe48a;
    const bright = urgent ? 0xeafffb : 0xfff0b5;
    if (zone.vein) {
      this.drawFertileVeinPulse(zone.vein.from, zone.vein.to, zone.vein.width + (urgent ? 36 : 24), pulse, color, bright);
      return;
    }

    const center = this.project(zone);
    const scale = this.projectedScale(zone);
    const yScale = this.shapeYScale();
    this.graphics.lineStyle(2, color, 0.18 + pulse * 0.24);
    this.graphics.strokeEllipse(center.x, center.y, zone.radius * 2.35 * scale, zone.radius * 1.5 * yScale * scale);
  }

  private getCurrentAffordanceZone(): FertileZone | undefined {
    if (this.state.phase !== 'playing') return undefined;

    const urgentRecovery =
      this.shouldShowDroneLaunchUrgency() ||
      this.state.drone.status === 'returning' ||
      (this.state.speedState === 'crawl' && this.state.elapsedSeconds < 34);
    if (urgentRecovery) return this.findFertileZoneById('recovery-pocket');

    if (this.state.elapsedSeconds <= 10 && this.state.rover.ore <= 1.4) {
      return this.findFertileZoneById('runway-pocket');
    }

    if (this.state.elapsedSeconds <= 24 && this.state.rover.ore < this.state.targetOre * 0.56) {
      return this.findFertileZoneById('temptation-lobe');
    }

    if (this.state.elapsedSeconds <= 38) {
      return this.findFertileZoneById('recovery-pocket');
    }

    return undefined;
  }

  private findFertileZoneById(id: string): FertileZone | undefined {
    return this.state.fertileZones.find((zone) => zone.id === id && zone.remaining > 0);
  }

  private drawBeatMarkers(): void {
    if (this.viewMode !== 'tactical') {
      this.clearBeatMarkerText();
      return;
    }

    const activeZone = this.getCurrentAffordanceZone();
    const layout = this.getLayout();
    const showLabels = layout.mode === 'desktop' && this.cameraLab.worldLabelsVisible;
    const liveKeys = new Set(this.state.arena.beats.map((beat) => `beat-label-${beat.id}`));
    for (const key of [...this.drawnBeatLabelKeys]) {
      if (liveKeys.has(key)) continue;
      this.drawStaticText(key, 0, 0, '', 1, '#ffffff');
      this.drawnBeatLabelKeys.delete(key);
    }
    for (const beat of this.state.arena.beats) {
      const screen = this.project(beat);
      const active =
        (activeZone?.id === 'runway-pocket' && beat.id === 'runway') ||
        (activeZone?.id === 'temptation-lobe' && beat.id === 'temptation') ||
        (activeZone?.id === 'recovery-pocket' && beat.id === 'recovery');
      const pulse = active ? 0.5 + Math.sin(this.time.now / 180) * 0.5 : 0;
      const color = active && this.shouldShowDroneLaunchUrgency() ? 0x8dffea : active ? 0xffe48a : 0x647286;

      this.graphics.fillStyle(0x0b1018, active ? 0.78 : 0.56);
      this.graphics.fillCircle(screen.x, screen.y, active ? 8 + pulse * 2 : 5);
      this.graphics.lineStyle(active ? 3 : 1, color, active ? 0.76 + pulse * 0.2 : 0.42);
      this.graphics.strokeCircle(screen.x, screen.y, active ? 15 + pulse * 4 : 10);

      if (showLabels) {
        this.drawnBeatLabelKeys.add(`beat-label-${beat.id}`);
        this.drawStaticText(
          `beat-label-${beat.id}`,
          screen.x + 13,
          screen.y - 12,
          beat.label,
          11,
          active ? '#fff1bf' : '#8f9caf'
        );
      } else {
        this.drawStaticText(`beat-label-${beat.id}`, 0, 0, '', 1, '#ffffff');
        this.drawnBeatLabelKeys.delete(`beat-label-${beat.id}`);
      }
    }
  }

  private clearBeatMarkerText(): void {
    for (const key of this.drawnBeatLabelKeys) {
      this.drawStaticText(key, 0, 0, '', 1, '#ffffff');
    }
    this.drawnBeatLabelKeys.clear();
  }

  private drawFertileVeinPulse(
    from: Vec2,
    to: Vec2,
    width: number,
    pulse: number,
    color = 0xffe48a,
    bright = 0xfff0b5
  ): void {
    const fromScreen = this.project(from);
    const toScreen = this.project(to);
    const dx = toScreen.x - fromScreen.x;
    const dy = toScreen.y - fromScreen.y;
    const length = Math.hypot(dx, dy);
    if (length <= 0.01) return;

    const normal = { x: -dy / length, y: dx / length };
    const fromWidth = (width / 2) * this.projectedScale(from);
    const toWidth = (width / 2) * this.projectedScale(to);
    const points = [
      { x: fromScreen.x + normal.x * fromWidth, y: fromScreen.y + normal.y * fromWidth },
      { x: toScreen.x + normal.x * toWidth, y: toScreen.y + normal.y * toWidth },
      { x: toScreen.x - normal.x * toWidth, y: toScreen.y - normal.y * toWidth },
      { x: fromScreen.x - normal.x * fromWidth, y: fromScreen.y - normal.y * fromWidth }
    ];

    this.graphics.lineStyle(2, color, 0.2 + pulse * 0.28);
    this.graphics.strokePoints(points, true, true);
    this.graphics.lineStyle(3, bright, 0.18 + pulse * 0.22);
    this.graphics.lineBetween(fromScreen.x, fromScreen.y, toScreen.x, toScreen.y);
  }

  private drawFertileVein(zone: FertileZone, visualCalm: number, active = false): void {
    if (!zone.vein) return;

    const polygon = this.fertileVeinScreenPolygon(zone, zone.vein.width);
    const fromScreen = this.project(zone.vein.from);
    const toScreen = this.project(zone.vein.to);
    const remainingRatio = this.fertileZoneRemainingRatio(zone);
    const depletedRatio = 1 - remainingRatio;
    // Floor lowered from 0.45 and the divisor raised to the actual top of the
    // range, so pip size and scatter track richness across the whole field
    // instead of across its upper half.
    const richnessRatio = clamp(zone.richness / 3.1, 0.16, 1);
    const pulse = active ? 0.5 + Math.sin(this.time.now / 145) * 0.5 : 0;
    const activeMiningCue = active && this.state.lastYieldRate > 0.001;

    // A worked-out seam goes grey. Depletion carries between shifts now, so
    // "have I already stripped this" is a question the player asks on sight
    // from across the map, and the ore-bearing rock has to stop looking
    // ore-bearing once it isn't.
    const spent = clamp(depletedRatio, 0, 1);
    const rock = this.fertilePatchPolygon(zone, zone.vein.width / 2, 5);
    const lit = rock.map((point) => ({ x: point.x - 3, y: point.y - 4 }));
    this.graphics.fillStyle(mixColor(0xa8895a, 0x7c7970, spent), 0.9);
    this.graphics.fillPoints(lit, true, true);
    this.graphics.fillStyle(mixColor(0x6d5330, 0x4b4a46, spent), 0.95);
    this.graphics.fillPoints(rock, true, true);
    const rim = this.fertilePatchPolygon(zone, zone.vein.width / 2.6, 73);
    this.graphics.fillStyle(mixColor(active ? 0x8f6a2f : 0x7d5c2b, 0x55534e, spent), 0.85 + pulse * 0.1);
    this.graphics.fillPoints(rim, true, true);

    if (depletedRatio > 0.025) {
      this.drawVeinDepletionBand(zone, depletedRatio, polygon);
    }

    if (remainingRatio > 0.025) {
      const richStart = depletedRatio;
      this.drawOreRichnessPips(zone, richStart, remainingRatio, richnessRatio, active);
    }

    if (activeMiningCue) {
      this.drawActiveMiningCue(zone, pulse);
    } else if (active) {
      const markerProgress = depletedRatio + ((this.time.now / 620) % 1) * remainingRatio;
      const marker = this.pointOnSegment(fromScreen, toScreen, markerProgress);
      this.graphics.fillStyle(0xfff0b5, 0.84);
      this.graphics.fillCircle(marker.x, marker.y, 5);
      this.graphics.lineStyle(1, 0xfff7d0, 0.86);
      this.graphics.strokeCircle(marker.x, marker.y, 10);
    }
  }

  private drawVeinDepletionBand(
    zone: FertileZone,
    depletedRatio: number,
    polygon: { normal: Vec2; fromWidth: number; toWidth: number }
  ): void {
    if (!zone.vein) return;

    const fromScreen = this.project(zone.vein.from);
    const toScreen = this.project(zone.vein.to);
    const depletedEnd = this.pointOnSegment(fromScreen, toScreen, depletedRatio);
    this.graphics.lineStyle(8, 0x2b211a, 0.86);
    this.graphics.lineBetween(fromScreen.x, fromScreen.y, depletedEnd.x, depletedEnd.y);

    const scarCount = this.fertileZoneDepletionScarCount(zone);
    for (let index = 0; index < scarCount; index += 1) {
      const progress = clamp(((index + 0.5) / Math.max(1, scarCount)) * depletedRatio, 0.02, Math.max(0.02, depletedRatio));
      const center = this.pointOnSegment(fromScreen, toScreen, progress);
      const localWidth = Phaser.Math.Linear(polygon.fromWidth, polygon.toWidth, progress) * 0.62;
      const jag = index % 2 === 0 ? 1 : -1;
      this.graphics.lineStyle(2, 0x100c09, 0.9);
      this.graphics.lineBetween(
        center.x - polygon.normal.x * localWidth + jag * 3,
        center.y - polygon.normal.y * localWidth - jag * 2,
        center.x + polygon.normal.x * localWidth - jag * 3,
        center.y + polygon.normal.y * localWidth + jag * 2
      );
      this.graphics.lineStyle(1, 0x6b5840, 0.42);
      this.graphics.lineBetween(
        center.x - polygon.normal.x * localWidth * 0.54,
        center.y - polygon.normal.y * localWidth * 0.54,
        center.x + polygon.normal.x * localWidth * 0.54,
        center.y + polygon.normal.y * localWidth * 0.54
      );
    }
  }

  private drawOreRichnessPips(
    zone: FertileZone,
    richStart: number,
    remainingRatio: number,
    richnessRatio: number,
    active: boolean
  ): void {
    if (!zone.vein) return;

    const fromScreen = this.project(zone.vein.from);
    const toScreen = this.project(zone.vein.to);
    const pipCount = this.fertileZoneRichnessPipCount(zone);
    const visiblePips = Math.min(pipCount, Math.max(1, Math.ceil(pipCount * remainingRatio)));
    const pulse = active ? 0.5 + Math.sin(this.time.now / 150) * 0.5 : 0;

    for (let index = 0; index < visiblePips; index += 1) {
      const local = (index + 0.5) / visiblePips;
      const progress = clamp(richStart + local * remainingRatio, 0.04, 0.98);
      const center = this.pointOnSegment(fromScreen, toScreen, progress);
      const span = Math.max(1, Math.hypot(toScreen.x - fromScreen.x, toScreen.y - fromScreen.y));
      const normalX = (toScreen.y - fromScreen.y) / span;
      const normalY = -(toScreen.x - fromScreen.x) / span;
      const scatter = ContinuousMoonMinerScene.hashNoise(index * 7.3 + zone.radius) - 0.5;
      const along = (ContinuousMoonMinerScene.hashNoise(index * 13.1 + zone.richness) - 0.5) * 12;
      const offset = scatter * (14 + richnessRatio * 16);
      const pip = {
        x: center.x + normalX * offset + (normalY * along),
        y: center.y + normalY * offset - (normalX * along)
      };
      const grade = ContinuousMoonMinerScene.hashNoise(index * 3.9 + zone.radius * 2);
      const radius = 2.2 + grade * (3.4 + richnessRatio * 3) + (active ? pulse * 1.2 : 0);
      this.graphics.fillStyle(grade > 0.62 ? 0xffd166 : 0xc9913c, 0.95);
      this.graphics.fillCircle(pip.x, pip.y, radius);
      this.graphics.fillStyle(0x2a1e10, 0.5);
      this.graphics.fillCircle(pip.x + radius * 0.32, pip.y + radius * 0.34, radius * 0.55);
    }
  }

  private drawActiveMiningCue(zone: FertileZone, pulse: number): void {
    if (!zone.vein) return;

    const miningPoint = this.closestPointOnFertileZone(zone, this.state.rover);
    const screen = this.project(miningPoint);
    const scale = this.projectedScale(miningPoint);
    this.graphics.fillStyle(0xffe48a, 0.18 + pulse * 0.12);
    this.graphics.fillCircle(screen.x, screen.y, 20 * scale + pulse * 7);
    this.graphics.lineStyle(3, 0xfff0b5, 0.82 + pulse * 0.14);
    this.graphics.strokeCircle(screen.x, screen.y, 16 * scale + pulse * 6);

    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2 + this.time.now / 170;
      const startRadius = 9 * scale;
      const endRadius = (16 + (index % 3) * 5 + pulse * 7) * scale;
      this.graphics.lineStyle(index % 2 === 0 ? 2 : 1, index % 2 === 0 ? 0xfff5c6 : 0xffb650, 0.58 + pulse * 0.28);
      this.graphics.lineBetween(
        screen.x + Math.cos(angle) * startRadius,
        screen.y + Math.sin(angle) * startRadius,
        screen.x + Math.cos(angle) * endRadius,
        screen.y + Math.sin(angle) * endRadius
      );
    }
  }

  private fertileVeinScreenPolygon(
    zone: FertileZone,
    width: number
  ): { points: Vec2[]; normal: Vec2; fromWidth: number; toWidth: number } {
    const vein = zone.vein;
    if (!vein) {
      return {
        points: [],
        normal: { x: 0, y: 1 },
        fromWidth: 0,
        toWidth: 0
      };
    }

    const fromScreen = this.project(vein.from);
    const toScreen = this.project(vein.to);
    const dx = toScreen.x - fromScreen.x;
    const dy = toScreen.y - fromScreen.y;
    const length = Math.hypot(dx, dy);
    if (length <= 0.01) {
      return {
        points: [fromScreen, toScreen],
        normal: { x: 0, y: 1 },
        fromWidth: 0,
        toWidth: 0
      };
    }

    const normal = { x: -dy / length, y: dx / length };
    const fromWidth = (width / 2) * this.projectedScale(vein.from);
    const toWidth = (width / 2) * this.projectedScale(vein.to);
    return {
      points: [
        { x: fromScreen.x + normal.x * fromWidth, y: fromScreen.y + normal.y * fromWidth },
        { x: toScreen.x + normal.x * toWidth, y: toScreen.y + normal.y * toWidth },
        { x: toScreen.x - normal.x * toWidth, y: toScreen.y - normal.y * toWidth },
        { x: fromScreen.x - normal.x * fromWidth, y: fromScreen.y - normal.y * fromWidth }
      ],
      normal,
      fromWidth,
      toWidth
    };
  }

  private fertileZoneInitialRemaining(zone: FertileZone): number {
    return this.state.arena.fertileZones.find((candidate) => candidate.id === zone.id)?.remaining ?? zone.remaining;
  }

  private fertileZoneRemainingRatio(zone: FertileZone): number {
    const initial = Math.max(0.001, this.fertileZoneInitialRemaining(zone));
    return clamp(zone.remaining / initial, 0, 1);
  }

  // Widened hard. The field is three rings whose whole point is that richness
  // rises with distance -- 0.85 near, 3.1 far -- and this compressed that 3.6x
  // spread into 5 pips against 8, so a poor seam and a rich one looked the
  // same from the tractor. The decision the level is built around was invisible
  // in the one place the player looks.
  private fertileZoneRichnessPipCount(zone: FertileZone): number {
    return clamp(Math.round(1 + zone.richness * 3.8), 2, 15);
  }

  private fertileZoneDepletionScarCount(zone: FertileZone): number {
    const depletedRatio = 1 - this.fertileZoneRemainingRatio(zone);
    return Math.floor(depletedRatio * 9);
  }

  private pointOnSegment(from: Vec2, to: Vec2, progress: number): Vec2 {
    return {
      x: Phaser.Math.Linear(from.x, to.x, progress),
      y: Phaser.Math.Linear(from.y, to.y, progress)
    };
  }

  private drawRidges(): void {
    const visualCalm = this.visualCalm();

    for (const ridge of this.state.arena.ridges) {
      const from = this.project(ridge.from);
      const to = this.project(ridge.to);
      const highlightFrom = this.project({ x: ridge.from.x + 5, y: ridge.from.y - 5 });
      const highlightTo = this.project({ x: ridge.to.x + 5, y: ridge.to.y - 5 });
      this.graphics.lineStyle(5, 0x333b47, 0.18 + 0.3 * visualCalm);
      this.graphics.lineBetween(from.x, from.y, to.x, to.y);
      this.graphics.lineStyle(1, 0x697180, 0.12 + 0.2 * visualCalm);
      this.graphics.lineBetween(highlightFrom.x, highlightFrom.y, highlightTo.x, highlightTo.y);
    }
  }

  private drawFields(): void {
    const fields = [...this.state.fields].sort((a, b) => a.id - b.id);
    const ordinary = fields.filter((field) => !field.reservedByDrone);
    const reserved = fields.filter((field) => field.reservedByDrone);

    // Your road is one thing and it is painted one colour. It used to be split
    // live into "protected" and "spendable", and that reads as inscrutable
    // because both of those are measured from the rover: the corridor runs to
    // extraction from wherever you are, and the forward arc follows your
    // heading. So a stretch of road flipped between cyan and amber as you drove
    // past it, changing for reasons tied to your own motion rather than to
    // anything about the road. Road that repaints itself while you look at it
    // is not road.
    //
    // The distinction still exists and still matters, so it is shown at the
    // only moment it is a decision: the cluster the drone would actually lift
    // is highlighted while the launch is available. That is a targeting
    // reticle, which is allowed to move, rather than a property of the ground,
    // which is not.
    const preview = getReclaimPreview(this.state);
    const targeted = new Set<number>();
    if (preview) {
      for (const field of ordinary) {
        if (Math.hypot(field.x - preview.target.x, field.y - preview.target.y) <= this.state.tuning.dronePickupRadius) {
          targeted.add(field.id);
        }
      }
    }

    this.drawFieldRibbon(ordinary.filter((field) => !targeted.has(field.id)), 0x6cf5dd, false);
    this.drawFieldRibbon(ordinary.filter((field) => targeted.has(field.id)), 0xd8a24a, false);
    this.drawFieldRibbon(reserved, 0xffa06c, true);
    this.drawFieldBirthMarkers(ordinary);
  }

  private drawFieldRibbon(
    fields: Array<{ x: number; y: number; radius: number; value: number; age: number }>,
    color: number,
    reserved: boolean
  ): void {
    const sections = this.fieldSections(fields);

    for (const section of sections) {
      if (section.length === 1) {
        this.drawFieldCap(section[0], color, reserved, this.fieldAlpha(section[0]));
        continue;
      }

      for (let index = 0; index < section.length - 1; index += 1) {
        const from = section[index];
        const to = section[index + 1];
        this.drawFieldSegment(from, to, color, reserved);
        this.drawFieldJoint(to, reserved, color);
      }

      this.drawFieldJoint(section[0], reserved, color);
      this.drawFieldCap(section[0], color, reserved, this.fieldAlpha(section[0]));
      this.drawFieldCap(section[section.length - 1], color, reserved, this.fieldAlpha(section[section.length - 1]));
      this.drawFieldCenterLine(section, color, reserved);
    }
  }

  private fieldSections<T extends Vec2>(fields: T[]): T[][] {
    const sections: T[][] = [];
    let current: T[] = [];

    for (const field of fields) {
      const previous = current[current.length - 1];
      if (previous && Math.hypot(field.x - previous.x, field.y - previous.y) > 92) {
        if (current.length > 0) sections.push(current);
        current = [];
      }
      current.push(field);
    }

    if (current.length > 0) sections.push(current);
    return sections;
  }

  private drawFieldSegment(
    from: { x: number; y: number; radius: number; value: number; age: number },
    to: { x: number; y: number; radius: number; value: number; age: number },
    color: number,
    reserved: boolean
  ): void {
    const fromScreen = this.project(from);
    const toScreen = this.project(to);
    const dx = toScreen.x - fromScreen.x;
    const dy = toScreen.y - fromScreen.y;
    const length = Math.hypot(dx, dy);
    if (length <= 0.01) return;

    const normal = { x: -dy / length, y: dx / length };
    const fromWidth = this.fieldRoadWidth(from);
    const toWidth = this.fieldRoadWidth(to);
    const points = [
      { x: fromScreen.x + normal.x * fromWidth, y: fromScreen.y + normal.y * fromWidth },
      { x: toScreen.x + normal.x * toWidth, y: toScreen.y + normal.y * toWidth },
      { x: toScreen.x - normal.x * toWidth, y: toScreen.y - normal.y * toWidth },
      { x: fromScreen.x - normal.x * fromWidth, y: fromScreen.y - normal.y * fromWidth }
    ];
    const alpha = Math.min(this.fieldAlpha(from), this.fieldAlpha(to));
    const ordinaryAlpha = alpha * (0.34 + 0.24 * this.visualCalm());

    const shadow = [
      { x: fromScreen.x + normal.x * (fromWidth + 4), y: fromScreen.y + normal.y * (fromWidth + 4) },
      { x: toScreen.x + normal.x * (toWidth + 4), y: toScreen.y + normal.y * (toWidth + 4) },
      { x: toScreen.x - normal.x * (toWidth + 4), y: toScreen.y - normal.y * (toWidth + 4) },
      { x: fromScreen.x - normal.x * (fromWidth + 4), y: fromScreen.y - normal.y * (fromWidth + 4) }
    ];
    this.graphics.fillStyle(0x14201f, alpha * 0.62);
    this.graphics.fillPoints(shadow, true, true);
    // The deck used to be filled with FIELD_DECK_COLOR unconditionally, so the
    // `color` argument was thrown away for every road that is not reserved --
    // which is nearly all of it. That is why the road read as a scuff in the
    // regolith: 0x6d8f89 is very close to the ground it is drawn on. Tinting
    // the deck toward the state colour is what makes the corridor rule visible
    // at all, and it is the only reason this function takes a colour.
    this.graphics.fillStyle(
      reserved ? color : mixColor(FIELD_DECK_COLOR, color, 0.5),
      reserved ? alpha * 0.5 : Math.min(0.94, ordinaryAlpha + 0.4)
    );
    this.graphics.fillPoints(points, true, true);
    if (reserved) {
      this.graphics.lineStyle(4, color, alpha * 0.88);
      this.graphics.strokePoints(points, true, true);
      const scanProgress = (this.time.now / 480) % 1;
      const scan = {
        x: Phaser.Math.Linear(fromScreen.x, toScreen.x, scanProgress),
        y: Phaser.Math.Linear(fromScreen.y, toScreen.y, scanProgress)
      };
      this.graphics.fillStyle(0xffd2b7, alpha * 0.92);
      this.graphics.fillCircle(scan.x, scan.y, 5);
      this.graphics.lineStyle(1, 0xfff0df, alpha * 0.82);
      this.graphics.strokeCircle(scan.x, scan.y, 10);
    } else {
      // The edge is where the two road states read most cheaply, so it carries
      // the colour at full strength while the deck stays ambient.
      this.graphics.lineStyle(3, color, Math.min(0.92, alpha * 0.95));
      this.graphics.strokePoints(points, true, true);
    }
  }

  private drawFieldJoint(
    field: { x: number; y: number; radius: number; value: number; age: number },
    reserved: boolean,
    color: number
  ): void {
    if (reserved) return;
    const center = this.project(field);
    const width = this.fieldRoadWidth(field);
    const yScale = this.shapeYScale();
    const alpha = Math.min(0.94, this.fieldAlpha(field) * (0.24 + 0.18 * this.visualCalm()) + 0.4);
    // Joints take the same tint as the segments they connect, or the ribbon
    // reads as coloured plates strung on a grey thread.
    this.graphics.fillStyle(mixColor(FIELD_DECK_COLOR, color, 0.5), alpha);
    this.graphics.fillEllipse(center.x, center.y, width * 2, width * 2 * yScale);
  }

  private drawFieldCap(
    field: { x: number; y: number; radius: number; value: number; age: number },
    color: number,
    reserved: boolean,
    alpha: number
  ): void {
    const center = this.project(field);
    const width = this.fieldRoadWidth(field);
    const yScale = this.shapeYScale();
    const ordinaryAlpha = alpha * (0.24 + 0.18 * this.visualCalm());
    this.graphics.fillStyle(color, reserved ? alpha * 0.34 : ordinaryAlpha);
    this.graphics.fillEllipse(center.x, center.y, width * 2.08, width * 1.2 * yScale);
    this.graphics.lineStyle(reserved ? 4 : 2, color, reserved ? alpha * 0.9 : alpha * (0.34 + 0.24 * this.visualCalm()));
    this.graphics.strokeEllipse(center.x, center.y, width * 2.08, width * 1.2 * yScale);
  }

  private drawFieldCenterLine<T extends Vec2>(section: T[], color: number, reserved: boolean): void {
    if (section.length < 2) return;

    this.graphics.lineStyle(reserved ? 3 : 2, color, reserved ? 0.86 : 0.38 + 0.22 * this.visualCalm());
    for (let index = 0; index < section.length - 1; index += 1) {
      const from = this.project(section[index]);
      const to = this.project(section[index + 1]);
      this.graphics.lineBetween(from.x, from.y, to.x, to.y);
    }
  }

  private drawFieldBirthMarkers(fields: Array<{ x: number; y: number; radius: number; value: number; age: number }>): void {
    for (const field of fields) {
      const readyAge = this.state.tuning.preparedFieldMinAgeSeconds;
      if (field.age > readyAge) continue;

      const progress = clamp(field.age / readyAge, 0, 1);
      const alpha = 1 - progress;
      const center = this.project(field);
      const scale = this.projectedScale(field);
      const yScale = this.shapeYScale();
      const radius = this.fieldRoadWidth(field) * (0.52 + progress * 0.5);

      this.graphics.lineStyle(2, 0x9ffff1, 0.56 * alpha);
      this.graphics.strokeEllipse(center.x, center.y, radius * 2.18, radius * 1.25 * yScale);
      this.graphics.fillStyle(0x9ffff1, 0.08 * alpha);
      this.graphics.fillCircle(center.x, center.y, 26 * scale);
    }
  }

  private drawReclaimPreview(): void {
    const preview = getReclaimPreview(this.state);
    if (!preview) {
      this.clearDronePreviewText();
      return;
    }

    const targetScreen = this.project(preview.target);
    const previewFields = this.state.fields.filter((field) => {
      return Math.hypot(field.x - preview.target.x, field.y - preview.target.y) <= this.state.tuning.dronePickupRadius;
    });
    const pulse = 0.5 + Math.sin(this.time.now / 260) * 0.5;
    const radius = this.droneReservationRadius(targetScreen, previewFields);

    const previewThin = preview.netPayload < preview.payload * 0.55;
    this.graphics.fillStyle(previewThin ? 0x8a6a5c : 0xffb36d, 0.05 + pulse * 0.03);
    this.graphics.fillCircle(targetScreen.x, targetScreen.y, radius + 10 + pulse * 3);
    this.graphics.lineStyle(2, previewThin ? 0x8a6a5c : 0xffb36d, 0.38 + pulse * 0.18);
    this.graphics.strokeCircle(targetScreen.x, targetScreen.y, radius + pulse * 4);
    this.graphics.lineStyle(1, 0xffeddf, 0.28 + pulse * 0.14);
    this.graphics.strokeCircle(targetScreen.x, targetScreen.y, radius + 12);

    const labelPoint = this.clampScreenPoint({ x: targetScreen.x + radius + 16, y: targetScreen.y - radius - 8 }, 118, 28);
    const thin = preview.netPayload < preview.payload * 0.55;
    this.drawStaticText(
      'drone-preview-readout',
      labelPoint.x,
      labelPoint.y,
      `${preview.netPayload > 0 ? '+' : ''}${preview.netPayload.toFixed(1)} NET`,
      14,
      thin ? '#f0a58c' : '#ffd2b7'
    );
    this.drawStaticText(
      'drone-preview-detail',
      labelPoint.x,
      labelPoint.y + 17,
      preview.surcharge > 0.05
        ? `${preview.payload.toFixed(1)} haul - ${preview.surcharge.toFixed(1)} fuel`
        : `${preview.payload.toFixed(1)} haul, full tank`,
      10,
      thin ? '#dba894' : '#ffeddf'
    );
  }

  private clearDronePreviewText(): void {
    this.drawStaticText('drone-preview-readout', 0, 0, '', 1, '#ffffff');
    this.drawStaticText('drone-preview-detail', 0, 0, '', 1, '#ffffff');
  }

  private drawDroneReservation(): void {
    const target = this.state.drone.target;
    const reservingTarget = target && (this.state.drone.status === 'outbound' || this.state.drone.status === 'reclaiming');
    if (!reservingTarget) {
      this.clearDroneReservationText();
      return;
    }

    const targetScreen = this.project(target);
    const reservedFields = this.state.fields.filter((field) => field.reservedByDrone);
    const pulse = 0.5 + Math.sin(this.time.now / 150) * 0.5;
    const radius = this.droneReservationRadius(targetScreen, reservedFields);
    const reclaiming = this.state.drone.status === 'reclaiming';

    this.clearDroneReservationText();

    // Beat one: "I took that one." A hard mark on the claimed field at the
    // moment of reservation, gone within a second and a bit.
    const claimAge = (this.time.now - this.droneClaimAtMs) / 1000;
    if (claimAge < 1.15) {
      const fade = 1 - claimAge / 1.15;
      const bracket = 13;
      const outer = radius + 18 + (1 - fade) * 12;
      this.graphics.lineStyle(3, 0xfff0df, 0.9 * fade);
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          const x = targetScreen.x + sx * outer;
          const y = targetScreen.y + sy * outer;
          this.graphics.lineBetween(x, y, x - sx * bracket, y);
          this.graphics.lineBetween(x, y, x, y - sy * bracket);
        }
      }
      this.graphics.lineStyle(3, 0xff9a68, 0.85 * fade);
      this.graphics.strokeCircle(targetScreen.x, targetScreen.y, radius + (1 - fade) * 10);
    }

    // The rest of the flight is ambient: a quiet ring holding the claim, so the
    // field reads as spoken for without narrating itself.
    this.graphics.lineStyle(2, reclaiming ? 0xffd2b7 : 0xff9a68, reclaiming ? 0.34 + pulse * 0.12 : 0.24);
    this.graphics.strokeCircle(targetScreen.x, targetScreen.y, radius + 4);
  }

  private clearDroneReservationText(): void {
    this.drawStaticText('drone-target-readout', 0, 0, '', 1, '#ffffff');
    this.drawStaticText('drone-target-detail', 0, 0, '', 1, '#ffffff');
  }

  private droneReservationRadius(targetScreen: Vec2, reservedFields: Array<{ x: number; y: number; radius: number; value: number }>): number {
    let radius = 34;
    for (const field of reservedFields) {
      const fieldScreen = this.project(field);
      radius = Math.max(radius, Math.hypot(fieldScreen.x - targetScreen.x, fieldScreen.y - targetScreen.y) + this.fieldRoadWidth(field) * 0.72);
    }
    return clamp(radius, 34, 78);
  }

  private fieldRoadWidth(field: { x: number; y: number; radius: number; value: number }): number {
    return field.radius * this.projectedScale(field) * clamp(0.52 + field.value * 0.12, 0.48, 0.7);
  }

  private fieldAlpha(field: { value: number; age: number }): number {
    const maturityAlpha =
      field.age < this.state.tuning.preparedFieldMinAgeSeconds
        ? clamp(0.44 + (field.age / this.state.tuning.preparedFieldMinAgeSeconds) * 0.36, 0.44, 0.8)
        : 1;
    const ageAlpha = clamp(1 - field.age / 140, 0.44, 0.92);
    const valueAlpha = clamp(field.value / 0.85, 0.42, 1);
    return maturityAlpha * ageAlpha * valueAlpha;
  }

  private drawPointerTarget(): void {
    if (!this.pointerTarget || this.state.phase !== 'playing') return;

    const rover = this.project(this.state.rover);
    const target = this.project(this.pointerTarget);
    const dx = target.x - rover.x;
    const dy = target.y - rover.y;
    const length = Math.hypot(dx, dy);
    const normal = length > 0 ? { x: -dy / length, y: dx / length } : { x: 0, y: 1 };
    const pulse = 0.5 + Math.sin(this.time.now / 150) * 0.5;

    this.graphics.lineStyle(2, 0x89d8ff, 0.46);
    this.graphics.lineBetween(rover.x, rover.y, target.x, target.y);
    if (length > 32) {
      const lead = {
        x: target.x - (dx / length) * 20,
        y: target.y - (dy / length) * 20
      };
      this.graphics.fillStyle(0x89d8ff, 0.32);
      this.graphics.fillTriangle(
        target.x,
        target.y,
        lead.x + normal.x * 8,
        lead.y + normal.y * 8,
        lead.x - normal.x * 8,
        lead.y - normal.y * 8
      );
    }
    this.graphics.lineStyle(3, 0x89d8ff, 0.66 + pulse * 0.18);
    this.graphics.strokeCircle(target.x, target.y, 12 + pulse * 3);
    this.graphics.lineStyle(1, 0xd5f4ff, 0.7);
    this.graphics.strokeCircle(target.x, target.y, 22);
  }

  private drawDrone(): void {
    const drone = this.state.drone;
    const pulse = 0.5 + Math.sin(this.time.now / 140) * 0.5;
    if (drone.status === 'ready') {
      const dock = this.pointFromHeading(this.state.rover, this.state.rover.heading + Math.PI * 0.75, 28);
      const dockScreen = this.project(dock);
      const urgent = this.shouldShowDroneLaunchUrgency();
      const deliveryBurstActive = Boolean(this.getActiveDeliveryEffect());
      if (urgent) {
        this.graphics.fillStyle(0xff765f, 0.16 + pulse * 0.12);
        this.graphics.fillCircle(dockScreen.x, dockScreen.y, 38 + pulse * 10);
        this.graphics.lineStyle(4, 0xff765f, 0.64 + pulse * 0.26);
        this.graphics.strokeCircle(dockScreen.x, dockScreen.y, 26 + pulse * 8);
        this.graphics.lineStyle(2, 0xffd2b7, 0.78);
        this.graphics.strokeCircle(dockScreen.x, dockScreen.y, 42 + pulse * 12);
        if (deliveryBurstActive) {
          this.drawStaticText('drone-callout', 0, 0, '', 1, '#ffffff');
        } else {
          this.drawStaticText('drone-callout', 0, 0, '', 1, '#ffffff');
        }
      } else {
        this.drawStaticText('drone-callout', 0, 0, '', 1, '#ffffff');
      }
      this.graphics.fillStyle(urgent ? 0xff765f : 0xff9a68, 1);
      this.graphics.fillCircle(dockScreen.x, dockScreen.y, urgent ? 8 + pulse * 2 : 6);
      this.graphics.lineStyle(2, urgent ? 0xfff0df : 0xffd2b7, urgent ? 0.96 : 0.72);
      this.graphics.strokeCircle(dockScreen.x, dockScreen.y, urgent ? 16 + pulse * 5 : 11);
      return;
    }

    if (drone.target && (drone.status === 'outbound' || drone.status === 'reclaiming')) {
      const droneScreen = this.project(drone);
      const targetScreen = this.project(drone.target);
      this.graphics.lineStyle(6, 0x4f2b23, 0.48);
      this.graphics.lineBetween(droneScreen.x, droneScreen.y, targetScreen.x, targetScreen.y);
      this.graphics.lineStyle(3, 0xff9a68, 0.82);
      this.graphics.lineBetween(droneScreen.x, droneScreen.y, targetScreen.x, targetScreen.y);
      this.graphics.lineStyle(3, 0xffd2b7, 0.95);
      this.graphics.strokeCircle(targetScreen.x, targetScreen.y, drone.status === 'reclaiming' ? 30 + pulse * 3 : 20 + pulse * 2);
      this.graphics.lineStyle(1, 0xfff0df, 0.85);
      this.graphics.strokeCircle(targetScreen.x, targetScreen.y, drone.status === 'reclaiming' ? 42 : 30);

      if (drone.status === 'reclaiming') {
        const progress = 1 - clamp(drone.reclaimSeconds / this.state.tuning.reclaimLockSeconds, 0, 1);
        this.drawProgressRing(targetScreen, 38, progress, 0xffd2b7);
        this.drawDroneReclaimFragments(targetScreen, droneScreen);
      }
    }

    if (drone.status === 'returning') {
      const droneScreen = this.project(drone);
      const roverScreen = this.project(this.state.rover);
      this.graphics.lineStyle(7, 0x0d423b, 0.45);
      this.graphics.lineBetween(droneScreen.x, droneScreen.y, roverScreen.x, roverScreen.y);
      this.graphics.lineStyle(4, 0x79f5dc, 0.86);
      this.graphics.lineBetween(droneScreen.x, droneScreen.y, roverScreen.x, roverScreen.y);
      this.graphics.fillStyle(0x79f5dc, 0.22);
      this.graphics.fillCircle(droneScreen.x, droneScreen.y - 14, clamp(drone.payload * 2.2, 12, 24));
      this.graphics.fillStyle(0x79f5dc, 0.82);
      this.graphics.fillCircle(droneScreen.x, droneScreen.y - 14, clamp(drone.payload * 1.7, 7, 17));
      this.graphics.lineStyle(2, 0xeafffb, 0.86);
      this.graphics.strokeCircle(droneScreen.x, droneScreen.y - 14, clamp(drone.payload * 1.9, 10, 21));
    }

    const droneScreen = this.project(drone);
    this.graphics.fillStyle(0xff9a68, 1);
    this.graphics.fillCircle(droneScreen.x, droneScreen.y, 9);
    this.graphics.lineStyle(3, 0xffd2b7, 0.98);
    this.graphics.strokeCircle(droneScreen.x, droneScreen.y, 15);
    this.drawDroneCallout(droneScreen);
  }

  private drawDroneCallout(droneScreen: Vec2): void {
    let label = 'DRONE';
    if (this.state.drone.status === 'returning') label = `RETURN +${this.state.drone.payload.toFixed(1)}`;
    if (this.state.drone.status === 'reclaiming') label = 'RECLAIM';
    if (this.state.drone.status === 'outbound') label = 'TARGET';

    this.drawStaticText('drone-callout', 0, 0, '', 1, '#ffffff');
  }

  private drawProgressRing(center: Vec2, radius: number, progress: number, color: number): void {
    const segments = 18;
    this.graphics.lineStyle(2, 0x4f2b23, 0.64);
    this.graphics.strokeCircle(center.x, center.y, radius);
    this.graphics.lineStyle(4, color, 0.96);
    for (let index = 0; index < Math.floor(segments * progress); index += 1) {
      const start = -Math.PI / 2 + (index / segments) * Math.PI * 2;
      const end = -Math.PI / 2 + ((index + 0.55) / segments) * Math.PI * 2;
      const from = { x: center.x + Math.cos(start) * radius, y: center.y + Math.sin(start) * radius };
      const to = { x: center.x + Math.cos(end) * radius, y: center.y + Math.sin(end) * radius };
      this.graphics.lineBetween(from.x, from.y, to.x, to.y);
    }
  }

  private drawDroneReclaimFragments(targetScreen: Vec2, droneScreen: Vec2): void {
    for (let index = 0; index < 6; index += 1) {
      const progress = (this.time.now / 360 + index * 0.19) % 1;
      const angle = index * 1.7 + this.time.now / 260;
      const origin = {
        x: targetScreen.x + Math.cos(angle) * (18 + (index % 3) * 6),
        y: targetScreen.y + Math.sin(angle) * (10 + (index % 2) * 5)
      };
      const x = Phaser.Math.Linear(origin.x, droneScreen.x, progress);
      const y = Phaser.Math.Linear(origin.y, droneScreen.y, progress);
      this.graphics.fillStyle(0xffd2b7, 0.85 * (1 - progress * 0.45));
      this.graphics.fillCircle(x, y, 3);
    }
  }

  private drawRover(): void {
    const rover = this.state.rover;
    const fertile = findFertileZoneAt(this.state, rover);
    const preparedCoverage = getPreparedCoverage(this.state, rover);

    this.drawStateAura(rover, preparedCoverage);
    this.drawStateMotionCues(rover, preparedCoverage);
    this.drawArms(fertile, 'behind');

    const roverScreen = this.project(rover);
    const scale = this.projectedScale(rover);
    const yScale = this.shapeYScale();

    this.graphics.fillStyle(0x02050a, 0.5);
    this.graphics.fillEllipse(roverScreen.x - 3 * scale, roverScreen.y + 11 * scale, 78 * scale, 38 * yScale * scale);
    this.drawTractorBody(rover, scale);
    // Arms that reach toward the camera pass in front of the chassis. Drawing
    // every arm behind the body left only the far ones visible, so they read as
    // roof antennae instead of limbs wrapped around a machine.
    this.drawArms(fertile, 'front');

    if (preparedCoverage > 0.2) {
      this.graphics.lineStyle(3, 0x78f7df, 0.4 + preparedCoverage * 0.5);
      this.graphics.strokeEllipse(roverScreen.x, roverScreen.y + 2, 82 * scale, 46 * yScale * scale);
    }
  }

  // A machine with a front, a back and treads, in the one warm colour on a cold
  // moon. Speed state moves to a roof beacon instead of recolouring the hull,
  // so the tractor stays recognisable as the same object in every state.
  private drawTractorBody(rover: Vec2, scale: number): void {
    const heading = this.state.rover.heading;
    const at = (lateral: number, forward: number): Vec2 =>
      this.project(
        this.pointFromHeading(this.pointFromHeading(rover, heading + Math.PI / 2, lateral), heading, forward)
      );
    const shape = (points: Vec2[], fill: number, alpha = 1, outline = 0x14161b): void => {
      this.graphics.fillStyle(fill, alpha);
      this.graphics.fillPoints(points, true, true);
      this.graphics.lineStyle(2, outline, 0.9);
      this.graphics.strokePoints(points, true, true);
    };

    const TREAD = 0x24262c;
    const HULL = 0xd2a044;
    const HULL_SHADE = 0x8d6a28;
    const GLASS = 0x8fdcf5;

    shape([at(-27, -28), at(-15, -28), at(-15, 30), at(-27, 30)], TREAD);
    shape([at(27, -28), at(15, -28), at(15, 30), at(27, 30)], TREAD);

    shape([at(-17, -27), at(17, -27), at(21, 12), at(13, 31), at(-13, 31), at(-21, 12)], HULL);
    shape([at(-17, -27), at(17, -27), at(17, -12), at(-17, -12)], HULL_SHADE);
    shape([at(-10, 3), at(10, 3), at(8, 22), at(-8, 22)], GLASS, 0.92);

    const beaconScreen = at(0, -19);
    this.graphics.fillStyle(this.roverBodyColor(this.state.speedState), 1);
    this.graphics.fillCircle(beaconScreen.x, beaconScreen.y, 5 * scale);
    this.graphics.lineStyle(2, 0x14161b, 0.9);
    this.graphics.strokeCircle(beaconScreen.x, beaconScreen.y, 5 * scale);

    for (const lateral of [-9, 9]) {
      const lamp = at(lateral, 32);
      this.graphics.fillStyle(0xfff3d0, 0.95);
      this.graphics.fillCircle(lamp.x, lamp.y, 2.6 * scale);
    }
  }

  private drawStateMotionCues(rover: Vec2, preparedCoverage: number): void {
    const scale = this.projectedScale(rover);
    const pulse = 0.5 + Math.sin(this.time.now / 120) * 0.5;
    const heading = this.state.rover.heading;

    if (this.state.speedState === 'prepared') {
      const alpha = 0.38 + preparedCoverage * 0.34;
      for (const offset of [-18, 0, 18]) {
        const start = this.pointFromHeading(
          this.pointFromHeading(rover, heading + Math.PI / 2, offset),
          heading + Math.PI,
          30 + pulse * 7
        );
        const end = this.pointFromHeading(start, heading + Math.PI, 28);
        const from = this.project(start);
        const to = this.project(end);
        this.graphics.lineStyle(3, 0x78f7df, alpha);
        this.graphics.lineBetween(from.x, from.y, to.x, to.y);
      }
      return;
    }

    if (this.state.speedState === 'fabricating') {
      for (let index = 0; index < 7; index += 1) {
        const side = (index - 3) * 9;
        const forward = 34 + ((this.time.now / 42 + index * 7) % 26);
        const world = this.pointFromHeading(this.pointFromHeading(rover, heading + Math.PI / 2, side), heading, forward);
        const screen = this.project(world);
        this.graphics.fillStyle(index % 2 === 0 ? 0x71efff : 0xb8fbff, 0.42 + pulse * 0.28);
        this.graphics.fillCircle(screen.x, screen.y, (2.5 + (index % 3)) * scale);
      }
      return;
    }

    for (let index = 0; index < 5; index += 1) {
      const side = (index - 2) * 10;
      const scrape = this.pointFromHeading(this.pointFromHeading(rover, heading + Math.PI / 2, side), heading + Math.PI, 18);
      const tip = this.pointFromHeading(scrape, heading + Math.PI, 12 + pulse * 9);
      const from = this.project(scrape);
      const to = this.project(tip);
      this.graphics.lineStyle(2, index % 2 === 0 ? 0xff765f : 0xffb084, 0.42 + pulse * 0.28);
      this.graphics.lineBetween(from.x, from.y, to.x, to.y);
    }
  }

  private drawStateAura(rover: Vec2, preparedCoverage: number): void {
    const roverScreen = this.project(rover);
    const scale = this.projectedScale(rover);
    const yScale = this.shapeYScale();
    const pulse = 0.5 + Math.sin(this.time.now / 150) * 0.5;
    const color =
      this.state.speedState === 'prepared'
        ? 0x78f7df
        : this.state.speedState === 'fabricating'
          ? 0x5db7ff
          : 0xff765f;
    const radius = this.state.speedState === 'crawl' ? 56 : this.state.speedState === 'fabricating' ? 48 : 42;
    const alpha =
      this.state.speedState === 'prepared'
        ? 0.16 + preparedCoverage * 0.16
        : this.state.speedState === 'fabricating'
          ? 0.18 + pulse * 0.12
          : 0.3 + pulse * 0.2;

    this.graphics.fillStyle(color, alpha * 0.18);
    this.graphics.fillEllipse(roverScreen.x, roverScreen.y + 5, radius * 1.7 * scale, radius * yScale * scale);
    this.graphics.lineStyle(this.state.speedState === 'crawl' ? 4 : 2, color, alpha);
    this.graphics.strokeEllipse(roverScreen.x, roverScreen.y + 5, radius * 1.7 * scale, radius * yScale * scale);
    if (this.state.speedState === 'fabricating') {
      this.graphics.lineStyle(2, 0xc7eeff, 0.24 + pulse * 0.22);
      this.graphics.strokeEllipse(roverScreen.x, roverScreen.y + 5, radius * 2.05 * scale, radius * 1.16 * yScale * scale);
    }
  }

  private drawArms(fertile: FertileZone | undefined, layer: 'behind' | 'front'): void {
    const rover = this.state.rover;
    const armAngles = [-145, -108, -70, -32, 32, 70, 108, 145].map((degrees) => (degrees * Math.PI) / 180);

    // Spread each duty across both flanks. Filling the angle slots in order put
    // all four building arms on the left and left the right side bare, so the
    // machine read as lopsided rather than as one thing allocating itself.
    const ordered = this.armRoles();
    const interleaved: ArmRole[] = [];
    const slots = [0, 4, 1, 5, 2, 6, 3, 7];
    ordered.forEach((role, index) => {
      interleaved[slots[index] ?? index] = role;
    });
    const roles = interleaved;

    armAngles.forEach((angle, index) => {
      const role = roles[index] ?? 'stabilizing';
      const anchor = this.pointFromHeading(rover, rover.heading + angle, 18);
      let target: Vec2;
      let color = 0xa7b2c3;
      let width = 2;

      if (role === 'helper') {
        target = this.getHelperArmTarget(anchor, angle, fertile);
        color =
          this.state.arms.helper.duty === 'miningAssist'
            ? 0xb7ff7a
            : this.state.arms.helper.duty === 'droneDocking'
              ? 0xff94df
              : this.state.arms.helper.duty === 'emergency'
                ? 0xff765f
                : 0xc6b2ff;
        width = this.state.arms.helper.duty === 'miningAssist' ? 5 : 3;
      } else if (role === 'building') {
        target = this.pointFromHeading(rover, rover.heading + angle * 0.28, this.state.speedState === 'crawl' ? 34 : 64);
        color = 0x68f3ff;
        width = 4;
      } else if (role === 'mining') {
        const miningTarget = fertile
          ? this.closestPointOnFertileZone(fertile, this.pointFromHeading(rover, rover.heading + angle * 0.24, 70))
          : this.pointFromHeading(rover, rover.heading + angle * 0.45, 56);
        target = {
          x: Phaser.Math.Linear(anchor.x, miningTarget.x, fertile ? 0.78 : 0.2),
          y: Phaser.Math.Linear(anchor.y, miningTarget.y, fertile ? 0.78 : 0.2)
        };
        color = 0xffd35a;
        width = 4;
      } else if (role === 'emergency') {
        // Canon calls these "tiny millipede-like emergency reclaim legs". At a
        // reach of 25 to 33 they sat inside the chassis silhouette and were
        // simply invisible -- the whole humiliating-crawl beat rendered as a
        // red arc. Out past the body, splayed wide, and scuttling out of phase
        // with each other so the machine looks like it is dragging itself.
        const scuttle = Math.sin(this.time.now / 105 + index * 2.1) * 6;
        target = this.pointFromHeading(rover, rover.heading + angle * 1.12, 46 + (index % 2) * 9 + scuttle);
        target.y += 10;
        color = 0xff765f;
        width = 2.6;
      } else {
        target = this.pointFromHeading(rover, rover.heading + angle, 40);
      }

      // Screen-space depth: anything whose tip lands below the chassis centre is
      // nearer the camera and belongs in front of it.
      const roverScreen = this.project(rover);
      const inFront = this.project(target).y > roverScreen.y;
      if ((layer === 'front') !== inFront) return;

      const scale = this.projectedScale(anchor);
      this.drawArmLimb(anchor, target, angle, index, color, width, scale, role);

      // A working tool throws sparks at the seam. Kept because it is the one
      // cue that says a bite actually landed; the rest of the old decoration
      // is now the tool silhouette's job.
      if ((role === 'mining' || (role === 'helper' && this.state.arms.helper.duty === 'miningAssist')) && fertile) {
        const tip = this.project(target);
        const sparkle = 0.5 + Math.sin(this.time.now / 80 + index) * 0.5;
        this.graphics.fillStyle(role === 'helper' ? 0xdfff8f : 0xffed9b, 0.32 + sparkle * 0.4);
        this.graphics.fillCircle(tip.x, tip.y, (4 + sparkle * 3) * scale);
      }
    });
  }

  // An arm, rather than a spoke. The previous version stroked one straight line
  // from the chassis to a point and capped it with a dot, which at the shipped
  // camera reads as a cluster of dots and nothing else -- the machine that the
  // design calls a "visible scheduler" was allocating eight arms and showing
  // none of them. Two segments and a knee are the cheapest thing that reads as
  // a limb: the elbow breaks the silhouette, and breaking the silhouette is
  // what makes a shape look articulated rather than radial.
  private drawArmLimb(
    anchor: Vec2,
    target: Vec2,
    angle: number,
    index: number,
    color: number,
    width: number,
    scale: number,
    role: ArmRole
  ): void {
    const shoulder = this.project(anchor);
    const tip = this.project(target);
    const span = Math.hypot(tip.x - shoulder.x, tip.y - shoulder.y);
    if (span < 0.5) return;

    // The knee bends away from the machine's centre line, so the left arms and
    // the right arms mirror each other and the whole thing reads as a spider
    // rather than a starburst. Working arms flex; idle ones sit still.
    const busy = role === 'building' || role === 'mining' || role === 'emergency';
    const flex = busy ? Math.sin(this.time.now / 150 + index * 1.7) * 0.14 : Math.sin(this.time.now / 900 + index) * 0.04;
    const bend = (angle < 0 ? -1 : 1) * (0.34 + flex);
    const normal = { x: -(tip.y - shoulder.y) / span, y: (tip.x - shoulder.x) / span };
    const knee = {
      x: shoulder.x + (tip.x - shoulder.x) * 0.52 + normal.x * span * bend,
      y: shoulder.y + (tip.y - shoulder.y) * 0.52 + normal.y * span * bend
    };

    // Widths track the projection so the limbs do not vanish when the camera
    // pulls back, with a floor so they never fall under a pixel.
    const upper = Math.max(2.2, width * scale * 1.15);
    const lower = Math.max(1.4, width * scale * 0.72);
    const alpha = role === 'stabilizing' ? 0.6 : 0.95;

    // A dark underlay gives the limb an edge against both regolith and field.
    this.graphics.lineStyle(upper + 2.2, 0x0d1117, 0.5);
    this.graphics.beginPath();
    this.graphics.moveTo(shoulder.x, shoulder.y);
    this.graphics.lineTo(knee.x, knee.y);
    this.graphics.lineTo(tip.x, tip.y);
    this.graphics.strokePath();

    this.graphics.lineStyle(upper, color, alpha);
    this.graphics.lineBetween(shoulder.x, shoulder.y, knee.x, knee.y);
    this.graphics.lineStyle(lower, color, alpha);
    this.graphics.lineBetween(knee.x, knee.y, tip.x, tip.y);

    this.graphics.fillStyle(0x1b2430, 0.95);
    this.graphics.fillCircle(knee.x, knee.y, Math.max(1.8, upper * 0.62));
    this.graphics.fillStyle(color, alpha);
    this.graphics.fillCircle(knee.x, knee.y, Math.max(1.1, upper * 0.36));

    this.drawArmTool(tip, color, scale, role, index);
  }

  // The business end. Each duty gets a silhouette you can tell apart at a
  // glance, because telling them apart at a glance is the entire job.
  private drawArmTool(tip: { x: number; y: number }, color: number, scale: number, role: ArmRole, index: number): void {
    const size = Math.max(2.3, 3.9 * scale);

    if (role === 'building') {
      // A printing head: a square nozzle laying field.
      this.graphics.fillStyle(color, 0.98);
      this.graphics.fillRect(tip.x - size, tip.y - size * 0.72, size * 2, size * 1.44);
      this.graphics.fillStyle(0x9ffff7, 0.55 + Math.sin(this.time.now / 110 + index) * 0.35);
      this.graphics.fillRect(tip.x - size * 0.45, tip.y + size * 0.5, size * 0.9, size * 1.1);
      return;
    }

    if (role === 'mining') {
      // A claw: two prongs biting the seam.
      this.graphics.lineStyle(Math.max(1.4, 2 * scale), color, 0.98);
      const gape = 0.5 + Math.sin(this.time.now / 130 + index) * 0.35;
      this.graphics.lineBetween(tip.x, tip.y, tip.x - size * 1.2, tip.y - size * gape);
      this.graphics.lineBetween(tip.x, tip.y, tip.x - size * 1.2, tip.y + size * gape);
      this.graphics.fillStyle(color, 0.98);
      this.graphics.fillCircle(tip.x, tip.y, size * 0.6);
      return;
    }

    if (role === 'emergency') {
      // A scraping foot, flat to the ground and planted.
      this.graphics.fillStyle(color, 0.95);
      this.graphics.fillRect(tip.x - size * 1.1, tip.y, size * 2.2, Math.max(1.4, size * 0.5));
      return;
    }

    this.graphics.fillStyle(color, role === 'stabilizing' ? 0.7 : 0.98);
    this.graphics.fillCircle(tip.x, tip.y, role === 'helper' ? size * 1.1 : size * 0.8);
  }

  private getHelperArmTarget(anchor: Vec2, angle: number, fertile: FertileZone | undefined): Vec2 {
    const rover = this.state.rover;
    const wiggle = Math.sin(this.time.now / 120) * 0.18;

    if (this.state.arms.helper.duty === 'miningAssist' && fertile) {
      const miningTarget = this.closestPointOnFertileZone(fertile, this.pointFromHeading(rover, rover.heading + angle * 0.16 + wiggle, 86));
      return {
        x: Phaser.Math.Linear(anchor.x, miningTarget.x, 0.88),
        y: Phaser.Math.Linear(anchor.y, miningTarget.y, 0.88)
      };
    }

    if (this.state.arms.helper.duty === 'droneDocking' && this.state.drone.status === 'returning') {
      return {
        x: Phaser.Math.Linear(anchor.x, this.state.drone.x, 0.58),
        y: Phaser.Math.Linear(anchor.y, this.state.drone.y, 0.58)
      };
    }

    const reach =
      this.state.arms.helper.duty === 'emergency'
        ? 27
        : this.state.arms.helper.duty === 'fabricationSupport'
          ? 48
          : 38;
    return this.pointFromHeading(rover, rover.heading + angle * 0.36 + wiggle, reach);
  }

  private closestPointOnFertileZone(zone: FertileZone, point: Vec2): Vec2 {
    if (!zone.vein) return { x: zone.x, y: zone.y };
    return this.closestPointOnSegment(point, zone.vein.from, zone.vein.to);
  }

  private closestPointOnSegment(point: Vec2, from: Vec2, to: Vec2): Vec2 {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared <= 0.0001) return { ...from };

    const progress = clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared, 0, 1);
    return {
      x: from.x + dx * progress,
      y: from.y + dy * progress
    };
  }

  private armRoles(): ArmRole[] {
    const roles: ArmRole[] = [];
    for (let index = 0; index < this.state.arms.emergency; index += 1) roles.push('emergency');
    for (let index = 0; index < this.state.arms.building; index += 1) roles.push('building');
    for (let index = 0; index < this.state.arms.mining; index += 1) roles.push('mining');
    for (let index = roles.length; index < this.state.arms.industrialTotal; index += 1) roles.push('stabilizing');
    roles.length = Math.min(roles.length, this.state.arms.industrialTotal);
    roles.push('helper');
    return roles.slice(0, this.state.arms.total);
  }

  private drawEffects(): void {
    const now = this.time.now;
    let deliveryReadoutVisible = false;
    for (const effect of this.effects) {
      const progress = clamp((now - effect.startedAt) / effect.durationMs, 0, 1);
      const alpha = 1 - progress;
      const center = this.project(effect);
      const scale = this.projectedScale(effect);

      if (effect.kind === 'blocked') {
        this.graphics.lineStyle(3, 0xff6f78, alpha);
        this.graphics.strokeCircle(center.x, center.y, (18 + progress * 8) * scale);
        continue;
      }

      const color = this.effectColor(effect.kind);
      if (effect.kind === 'delivery') {
        deliveryReadoutVisible = true;
        const pop = Math.sin(progress * Math.PI);
        const amount = effect.amount ?? 0;
        this.graphics.fillStyle(0x78f7df, 0.16 * alpha);
        this.graphics.fillCircle(center.x, center.y, (44 + pop * 18) * scale);
        this.graphics.lineStyle(6, 0xeafffb, 0.86 * alpha);
        this.graphics.strokeCircle(center.x, center.y, (18 + progress * 72) * scale);
        this.graphics.lineStyle(3, 0x78f7df, 0.74 * alpha);
        this.graphics.strokeCircle(center.x, center.y, (34 + progress * 96) * scale);
        for (let index = 0; index < 12; index += 1) {
          const angle = (index / 12) * Math.PI * 2 + progress * 0.7;
          const inner = (24 + pop * 8) * scale;
          const outer = (54 + progress * 72) * scale;
          this.graphics.lineStyle(index % 2 === 0 ? 3 : 2, index % 2 === 0 ? 0xeafffb : 0x78f7df, 0.7 * alpha);
          this.graphics.lineBetween(
            center.x + Math.cos(angle) * inner,
            center.y + Math.sin(angle) * inner,
            center.x + Math.cos(angle) * outer,
            center.y + Math.sin(angle) * outer
          );
        }
        const readout = this.clampScreenPoint({ x: center.x, y: center.y - 48 - pop * 12 }, 96, 28);
        this.drawStaticText('delivery-readout', readout.x, readout.y, `+${amount.toFixed(1)} NANOBOTS`, 18, '#eafffb', 0.5);
        continue;
      }

      const radius =
        effect.kind === 'crawl'
          ? 28 + progress * 46
          : effect.kind === 'recovery'
            ? 18 + progress * 58
            : effect.kind === 'sprint' || effect.kind === 'build'
              ? 18 + progress * 38
              : 12 + progress * 42;
      const width = effect.kind === 'recovery' ? 5 : effect.kind === 'crawl' ? 4 : 3;
      this.graphics.lineStyle(width, color, alpha);
      this.graphics.strokeCircle(center.x, center.y, radius * scale);

      if (effect.kind === 'mine' || effect.kind === 'recovery') {
        this.graphics.fillStyle(color, 0.12 * alpha);
        this.graphics.fillCircle(center.x, center.y, 28 * scale);
      }
    }

    if (!deliveryReadoutVisible) {
      this.drawStaticText('delivery-readout', 0, 0, '', 1, '#ffffff');
    }
  }

  private drawHud(): void {
    const layout = this.getLayout();
    this.graphics.fillStyle(0x0a0f19, 0.96);
    this.graphics.fillRect(0, 0, layout.width, layout.hudHeight);
    this.graphics.lineStyle(1, 0x293241, 0.95);
    this.graphics.lineBetween(0, layout.hudHeight, layout.width, layout.hudHeight);

    this.hud.setText('');
    this.syncMessageLayout(layout);
    this.message.setText(this.getEventFeedText());

    const nanobotRatio = this.state.nanobots / this.state.maxNanobots;
    const extractionRun = Boolean(this.state.arena.extraction);
    const oreTarget = extractionRun ? this.state.arena.extraction?.oreRequired ?? 1 : this.state.targetOre;
    const oreRatio = clamp(this.state.rover.ore / Math.max(0.001, oreTarget), 0, 1);
    const sunRatio = this.getSolarRatio();

    this.drawVital(
      'Nanobots',
      `${this.state.nanobots.toFixed(1)}/${this.state.maxNanobots}`,
      layout.vitals[0].x,
      layout.vitals[0].y + 5,
      layout.vitals[0].width,
      nanobotRatio,
      nanobotRatio < 0.18 ? 0xff765f : 0x78f7df
    );
    this.drawVital(
      'Ore',
      extractionRun
        ? `${this.state.rover.ore.toFixed(1)}/${this.state.arena.extraction?.oreRequired ?? 0}`
        : `${this.state.rover.ore.toFixed(1)}/${this.state.targetOre}`,
      layout.vitals[1].x,
      layout.vitals[1].y + 5,
      layout.vitals[1].width,
      oreRatio,
      0xffd35a
    );
    this.drawVital(
      'Sun',
      `${Math.ceil(this.state.solarSeconds)}s`,
      layout.vitals[2].x,
      layout.vitals[2].y + 5,
      layout.vitals[2].width,
      sunRatio,
      sunRatio < 0.1 ? 0xffd36d : sunRatio < 0.25 ? 0xff7d77 : sunRatio < 0.5 ? 0xffb36b : 0xa8c9ff
    );

    // Which day this is, and what yesterday left you. Without it the carried
    // road is indistinguishable from a level that always looked like this.
    this.drawStaticText(
      'hud-shift',
      layout.vitals[0].x,
      layout.hudHeight + 16,
      this.isShiftModeEnabled()
        ? `SHIFT ${this.shiftNumber}${this.carriedIn > 0 ? ` · ${this.carriedIn} lengths inherited` : ' · bare ground'}`
        : '',
      11,
      '#8fa3ba'
    );

    this.drawStateChip(layout.stateChip.x, layout.stateChip.y, layout.stateChip.width, layout.stateChip.height);
    if (layout.mode === 'mobilePortrait') this.drawMobileControls(layout);
    this.drawDroneHudButton();
    this.drawResetButton();
    this.drawLoopDebugPanel();
    if (this.debugOverlayVisible) {
      this.drawStaticText(
        'yield-readout',
        layout.yieldReadout.x,
        layout.yieldReadout.y,
        `Yield ${this.state.lastYieldRate.toFixed(1)}/s | U ${this.state.arms.helper.miningAssistRate.toFixed(1)}/s`,
        layout.yieldReadout.fontSize,
        '#aeb9c8'
      );
      if (layout.mode === 'desktop') this.drawArmRoleStrip(128, layout.yieldReadout.y);
    } else {
      this.drawStaticText('yield-readout', 0, 0, '', 1, '#ffffff');
      this.clearArmRoleStrip();
    }
  }

  private syncMessageLayout(layout: SceneLayout): void {
    this.message.setPosition(layout.message.x, layout.message.y);
    this.message.setFontSize(layout.message.fontSize);
    this.message.setWordWrapWidth(layout.message.width);
  }

  private drawMobileControls(layout: SceneLayout): void {
    if (!layout.controlBandTop || !layout.drive) return;

    this.graphics.fillStyle(0x0a0f19, 0.9);
    this.graphics.fillRect(0, layout.controlBandTop, layout.width, layout.height - layout.controlBandTop);
    this.graphics.lineStyle(1, 0x293241, 0.9);
    this.graphics.lineBetween(0, layout.controlBandTop, layout.width, layout.controlBandTop);

    const drive = layout.drive;
    const center = {
      x: this.mobileDrive?.origin.x ?? drive.x + drive.width * 0.5,
      y: this.mobileDrive?.origin.y ?? drive.y + drive.height * 0.5
    };
    const current = this.mobileDrive?.current ?? center;
    const radius = Math.min(drive.width, drive.height) * 0.35;
    const puck = {
      x: center.x + clamp(current.x - center.x, -radius, radius),
      y: center.y + clamp(current.y - center.y, -radius, radius)
    };

    this.graphics.fillStyle(0x111925, 0.96);
    this.graphics.fillRoundedRect(drive.x, drive.y, drive.width, drive.height, 10);
    this.graphics.lineStyle(2, 0x3f5667, 0.95);
    this.graphics.strokeRoundedRect(drive.x, drive.y, drive.width, drive.height, 10);
    this.graphics.lineStyle(2, 0x78f7df, this.mobileDrive ? 0.72 : 0.34);
    this.graphics.strokeCircle(center.x, center.y, radius);
    this.graphics.lineBetween(center.x - radius * 0.58, center.y, center.x + radius * 0.58, center.y);
    this.graphics.lineBetween(center.x, center.y - radius * 0.58, center.x, center.y + radius * 0.58);
    this.graphics.fillStyle(this.mobileDrive ? 0x78f7df : 0x445466, this.mobileDrive ? 0.95 : 0.9);
    this.graphics.fillCircle(puck.x, puck.y, this.mobileDrive ? 22 : 17);
    this.graphics.lineStyle(2, 0xeafffb, this.mobileDrive ? 0.86 : 0.42);
    this.graphics.strokeCircle(puck.x, puck.y, this.mobileDrive ? 27 : 22);
  }

  private drawVital(
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
    progress: number,
    color: number
  ): void {
    const nanobotWarningPulse = label === 'Nanobots' && progress < this.state.tuning.lowStockWarningRatio ? 0.5 + Math.sin(this.time.now / 105) * 0.5 : 0;
    const sunWarningPulse = label === 'Sun' && this.state.arena.extraction && progress < 0.25 ? 0.5 + Math.sin(this.time.now / (progress < 0.1 ? 62 : 92)) * 0.5 : 0;
    const warningPulse = Math.max(nanobotWarningPulse, sunWarningPulse);
    if (warningPulse > 0) {
      this.graphics.fillStyle(label === 'Sun' ? 0x3a2118 : 0x451f1a, 0.52 + warningPulse * 0.18);
      this.graphics.fillRoundedRect(x - 7, y - 3, width + 14, 62, 8);
      this.graphics.lineStyle(1, label === 'Sun' ? 0xffb36b : 0xff765f, 0.62 + warningPulse * 0.28);
      this.graphics.strokeRoundedRect(x - 7, y - 3, width + 14, 62, 8);
      this.drawStaticText(`vital-${label}-tag`, x + width - 28, y + 2, label === 'Sun' && progress < 0.1 ? 'GO' : 'LOW', 11, label === 'Sun' ? '#fff0ba' : '#ffc7ba');
    } else if (label === 'Nanobots' || label === 'Sun') {
      this.drawStaticText(`vital-${label}-tag`, 0, 0, '', 1, '#ffffff');
    }

    this.drawStaticText(`vital-${label}-label`, x, y + 2, label, 12, '#9eabbc');
    this.drawStaticText(`vital-${label}-value`, x, y + 23, value, 19, '#f6f8fb');
    this.drawBar(x, y + 43, width, 10, progress, color);
    if (label === 'Ore') {
      this.graphics.lineStyle(2, 0xfff0ba, 0.84);
      this.graphics.lineBetween(x + width - 2, y + 40, x + width - 2, y + 56);
    }
  }

  private drawArmRoleStrip(x: number, y: number): void {
    const roles: Array<{ label: string; count: number; color: number }> = [
      { label: 'B', count: this.state.arms.building, color: 0x71efff },
      { label: 'M', count: this.state.arms.mining, color: 0xffd35a },
      { label: 'E', count: this.state.arms.emergency, color: 0xff765f },
      { label: 'U', count: this.state.arms.helper.count, color: this.getHelperArmHudColor() }
    ];
    let cursor = x;
    for (const role of roles) {
      this.graphics.fillStyle(0x121a26, 0.95);
      this.graphics.fillRoundedRect(cursor, y - 9, 42, 18, 5);
      this.graphics.fillStyle(role.color, role.count > 0 ? 0.95 : 0.28);
      this.graphics.fillCircle(cursor + 9, y, 4);
      this.drawStaticText(`arm-role-${role.label}`, cursor + 17, y, `${role.label}${role.count}`, 11, role.count > 0 ? '#dfe8f2' : '#738093');
      cursor += 48;
    }
    this.drawStaticText('arm-role-helper-duty', cursor + 2, y, this.getHelperArmHudLabel(), 11, '#aeb9c8');
  }

  private clearArmRoleStrip(): void {
    for (const label of ['B', 'M', 'E', 'U']) {
      this.drawStaticText(`arm-role-${label}`, 0, 0, '', 1, '#ffffff');
    }
    this.drawStaticText('arm-role-helper-duty', 0, 0, '', 1, '#ffffff');
  }

  private getHelperArmHudColor(): number {
    if (this.state.arms.helper.duty === 'miningAssist') return 0xb7ff7a;
    if (this.state.arms.helper.duty === 'droneDocking') return 0xff94df;
    if (this.state.arms.helper.duty === 'emergency') return 0xff765f;
    if (this.state.arms.helper.duty === 'fabricationSupport') return 0x71efff;
    return 0xc6b2ff;
  }

  private getHelperArmHudLabel(): string {
    if (this.state.arms.helper.duty === 'miningAssist') return 'utility assist';
    if (this.state.arms.helper.duty === 'droneDocking') return 'utility dock';
    if (this.state.arms.helper.duty === 'emergency') return 'utility emergency';
    if (this.state.arms.helper.duty === 'fabricationSupport') return 'utility support';
    if (this.state.arms.helper.duty === 'scan') return 'utility scan';
    return 'utility systems';
  }

  private drawStateChip(x: number, y: number, width: number, height: number): void {
    const state = this.getSpeedStateDisplay();
    this.graphics.fillStyle(state.fill, 0.94);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(2, state.color, 0.95);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.drawStaticText('state-chip-label', x + 13, y + 17, state.label, 17, state.text);
    this.drawStaticText('state-chip-detail', x + 13, y + 36, state.detail, 11, state.subtext);
  }

  private getSpeedStateDisplay(): { label: string; detail: string; color: number; fill: number; text: string; subtext: string } {
    if (this.state.speedState === 'prepared') {
      return {
        label: 'Sprint',
        detail: 'field grip',
        color: 0x78f7df,
        fill: 0x123a37,
        text: '#effffb',
        subtext: '#a8f4e7'
      };
    }

    if (this.state.speedState === 'fabricating') {
      return {
        label: 'Building',
        detail: 'arms busy',
        color: 0x5db7ff,
        fill: 0x162d4e,
        text: '#effcff',
        subtext: '#b8ddff'
      };
    }

    return {
      label: 'Crawl',
      detail: 'launch drone',
      color: 0xff765f,
      fill: 0x4a1f1b,
      text: '#fff4f0',
      subtext: '#ffc5b8'
    };
  }

  private drawDroneHudButton(): void {
    const button = this.buttons.find((candidate) => candidate.id === 'launch');
    if (!button) return;

    const ready = this.state.drone.status === 'ready';
    const returning = this.state.drone.status === 'returning';
    const urgent = this.shouldShowDroneLaunchUrgency();
    const pulse = 0.5 + Math.sin(this.time.now / 130) * 0.5;
    const fill = urgent ? 0x5a211d : ready ? 0x1d5f58 : returning ? 0x164b44 : 0x252b36;
    const stroke = urgent ? 0xffd2b7 : ready ? 0x8dffea : returning ? 0x78f7df : 0xffb38b;

    this.graphics.fillStyle(fill, 1);
    this.graphics.fillRoundedRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height, 8);
    this.graphics.lineStyle(2, stroke, 1);
    this.graphics.strokeRoundedRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height, 8);
    if (urgent) {
      this.graphics.fillStyle(0xff765f, 0.1 + pulse * 0.1);
      this.graphics.fillRoundedRect(button.rect.x - 6, button.rect.y - 6, button.rect.width + 12, button.rect.height + 12, 11);
      this.graphics.lineStyle(3, 0xffd2b7, 0.62 + pulse * 0.34);
      this.graphics.strokeRoundedRect(button.rect.x - 4, button.rect.y - 4, button.rect.width + 8, button.rect.height + 8, 10);
      this.graphics.lineStyle(1, 0xfff0df, 0.4 + pulse * 0.26);
      this.graphics.strokeRoundedRect(button.rect.x - 10, button.rect.y - 10, button.rect.width + 20, button.rect.height + 20, 13);
    }
    if (!ready) {
      this.graphics.lineStyle(1, stroke, 0.28);
      for (let offset = -button.rect.height; offset < button.rect.width; offset += 24) {
        this.graphics.lineBetween(
          button.rect.x + offset,
          button.rect.y + button.rect.height,
          button.rect.x + offset + button.rect.height,
          button.rect.y
        );
      }
    }
    this.drawStaticText('button-launch-title', button.rect.x + 14, button.rect.y + 17, this.getDroneActionLabel(), 15, ready ? '#ffffff' : '#dfe8f2');
    this.drawStaticText(
      'button-launch-status',
      button.rect.x + 14,
      button.rect.y + 36,
      this.getDroneFuelDetail() ?? this.getDroneStatusLine(),
      11,
      urgent ? '#ffd2b7' : ready ? '#bcfff3' : returning ? '#a8f7e9' : '#ffd2b7'
    );
  }

  private drawResetButton(): void {
    const button = this.buttons.find((candidate) => candidate.id === 'reset');
    if (!button) return;

    this.graphics.fillStyle(0x202939, 1);
    this.graphics.fillRoundedRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height, 8);
    this.graphics.lineStyle(1, 0x6f8094, 1);
    this.graphics.strokeRoundedRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height, 8);
    const label = this.isShiftModeEnabled() && this.state.phase !== 'playing' ? 'Next Day' : button.label;
    this.drawStaticText('button-reset', button.rect.centerX, button.rect.centerY, label, 13, '#eef3f8', 0.5);
  }

  private drawLoopDebugPanel(): void {
    if (!import.meta.env.DEV || !this.debugOverlayVisible) {
      this.clearLoopDebugText();
      return;
    }

    const summary = getContinuousLoopSummary(this.loopTrace);
    const layout = this.getLayout();
    const width = layout.mode === 'mobilePortrait' ? layout.width - 28 : 210;
    const x = layout.mode === 'mobilePortrait' ? 14 : 806;
    const y = layout.mode === 'mobilePortrait' ? layout.hudHeight + 10 : 64;
    const height = 118;

    this.graphics.fillStyle(0x0c111a, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 6);
    this.graphics.lineStyle(1, summary.hitLoop ? 0x78f7df : 0x465060, 0.9);
    this.graphics.strokeRoundedRect(x, y, width, height, 6);

    this.drawStaticText(
      'loop-trace-title',
      x + 12,
      y + 16,
      summary.hitLoop ? 'LOOP TRACE HIT' : 'LOOP TRACE WAIT',
      12,
      summary.hitLoop ? '#78f7df' : '#dce6ef'
    );

    summary.milestones.forEach((milestone, index) => {
      this.drawStaticText(
        `loop-trace-${milestone.id}`,
        x + 12,
        y + 38 + index * 17,
        `${milestone.shortLabel.padEnd(6)} ${milestone.hit ? 'hit' : '--'}`,
        11,
        milestone.hit ? '#83f5da' : '#8792a1'
      );
    });

    this.drawStaticText(
      'loop-trace-stats',
      x + 12,
      y + 108,
      `Low ${summary.lowestNanobots.toFixed(1)}  Del +${summary.deliveredNanobotsAfterCrawl.toFixed(1)}`,
      11,
      '#aeb9c8'
    );
  }

  private clearLoopDebugText(): void {
    this.drawStaticText('loop-trace-title', 0, 0, '', 1, '#ffffff');
    for (const milestone of getContinuousLoopSummary(this.loopTrace).milestones) {
      this.drawStaticText(`loop-trace-${milestone.id}`, 0, 0, '', 1, '#ffffff');
    }
    this.drawStaticText('loop-trace-stats', 0, 0, '', 1, '#ffffff');
  }

  private drawDroneRailDebugOverlays(): void {
    if (!import.meta.env.DEV || !this.debugOverlayVisible) {
      this.clearDroneRailOverlayText();
      return;
    }

    const diagnostics = getDroneReclaimDiagnostics(this.state);
    const best = diagnostics.bestTarget;
    const bestId = best?.targetPatchId;
    const fieldLabelLimit = 36;
    let labelsDrawn = 0;

    for (const field of this.state.fields) {
      const screen = this.project(field);
      const distanceFromRover = Math.hypot(field.x - this.state.rover.x, field.y - this.state.rover.y);
      const oldEnough = field.age >= this.state.tuning.reclaimMinFieldAgeSeconds;
      const valuableEnough = field.value >= this.state.tuning.reclaimMinFieldValue;
      const farEnough = this.state.tuning.allowCloseReclaim || distanceFromRover >= this.state.tuning.reclaimMinDistanceFromRover;
      const eligible = !field.reservedByDrone && oldEnough && valuableEnough && farEnough;
      const radius = Math.max(7, this.fieldRoadWidth(field) * 0.7);

      if (this.droneRailLab.overlayReclaimEligibility) {
        this.graphics.lineStyle(eligible ? 3 : 1, eligible ? 0x86f6dc : 0xff7d77, eligible ? 0.86 : 0.52);
        this.graphics.strokeCircle(screen.x, screen.y, radius + (eligible ? 8 : 3));
      }

      if (this.droneRailLab.overlayRejectedReclaimCandidates && !eligible) {
        this.graphics.lineStyle(1, 0xff7d77, 0.46);
        this.graphics.lineBetween(screen.x - 8, screen.y - 8, screen.x + 8, screen.y + 8);
        this.graphics.lineBetween(screen.x + 8, screen.y - 8, screen.x - 8, screen.y + 8);
      }

      if (this.droneRailLab.overlayFieldAge && labelsDrawn < fieldLabelLimit) {
        const alpha = clamp(field.age / Math.max(0.1, this.state.tuning.reclaimMinFieldAgeSeconds), 0.18, 0.95);
        this.graphics.lineStyle(2, 0x9fb7ff, alpha);
        this.graphics.strokeCircle(screen.x, screen.y, radius + field.age * 0.5);
        this.drawStaticText(`drone-rail-field-${labelsDrawn}`, screen.x + 8, screen.y - 12, `${field.age.toFixed(1)}s`, 9, '#c8d6ff');
        labelsDrawn += 1;
      }

      if (this.droneRailLab.overlayFieldValue) {
        this.graphics.fillStyle(0xffd35a, clamp(field.value / Math.max(0.1, this.state.tuning.startingFieldValue), 0.12, 0.72));
        this.graphics.fillCircle(screen.x, screen.y, clamp(3 + field.value * 8, 3, 15));
      }

      if (this.droneRailLab.overlaySelectedDroneTarget && bestId === field.id) {
        this.graphics.lineStyle(4, 0xfff0ba, 0.96);
        this.graphics.strokeCircle(screen.x, screen.y, radius + 18);
        this.drawStaticText('drone-rail-selected-target', screen.x + 14, screen.y - 28, `BEST #${field.id}`, 11, '#fff0ba');
      }
    }

    for (let index = labelsDrawn; index < fieldLabelLimit; index += 1) {
      this.drawStaticText(`drone-rail-field-${index}`, 0, 0, '', 1, '#ffffff');
    }
    if (!this.droneRailLab.overlaySelectedDroneTarget) {
      this.drawStaticText('drone-rail-selected-target', 0, 0, '', 1, '#ffffff');
    }

    if (this.droneRailLab.overlayDroneRoute || this.droneRailLab.overlayRefillEtaLabels) {
      this.drawDroneRailRouteOverlay(diagnostics);
    } else {
      this.clearDroneRailRouteText();
    }

    if (this.droneRailLab.overlayPreparedCoverage) {
      const coverage = getPreparedCoverage(this.state, this.state.rover);
      const rover = this.project(this.state.rover);
      this.graphics.lineStyle(3, coverage >= this.state.tuning.preparedCoverageThreshold ? 0x78f7df : 0x7b8798, 0.72);
      this.graphics.strokeCircle(rover.x, rover.y, 30 + coverage * 42);
      this.drawStaticText('drone-rail-prepared-coverage', rover.x + 18, rover.y + 30, `coverage ${coverage.toFixed(2)}`, 10, '#a8f4e7');
    } else {
      this.drawStaticText('drone-rail-prepared-coverage', 0, 0, '', 1, '#ffffff');
    }

    if (this.droneRailLab.overlayPreparedMagnetInfluence) {
      for (const field of this.state.fields) {
        if (field.age < this.state.tuning.preparedFieldMinAgeSeconds || field.value < this.state.tuning.preparedFieldMinValue) continue;
        const screen = this.project(field);
        this.graphics.lineStyle(1, 0x78f7df, 0.24);
        this.graphics.strokeCircle(screen.x, screen.y, field.radius * this.projectedScale(field) * this.state.tuning.preparedMagnetInfluenceMultiplier);
      }
    }

    if (this.droneRailLab.overlayFieldEmissionPoints || this.droneRailLab.overlayCrawlEmissionPoints) {
      const offset = this.state.speedState === 'crawl' ? 6 : 14;
      const emission = this.pointFromHeading(this.state.rover, this.state.rover.heading + Math.PI, offset);
      const screen = this.project(emission);
      const show =
        (this.state.speedState === 'crawl' && this.droneRailLab.overlayCrawlEmissionPoints) ||
        (this.state.speedState !== 'crawl' && this.droneRailLab.overlayFieldEmissionPoints);
      if (show) {
        this.graphics.lineStyle(2, this.state.speedState === 'crawl' ? 0xff765f : 0x68f3ff, 0.92);
        this.graphics.strokeCircle(screen.x, screen.y, 12);
        this.drawStaticText('drone-rail-emission-point', screen.x + 14, screen.y + 14, `emit ${this.state.fieldEmitDistance.toFixed(1)}`, 10, '#dfe8f2');
      }
    } else {
      this.drawStaticText('drone-rail-emission-point', 0, 0, '', 1, '#ffffff');
    }
  }

  private drawDroneRailRouteOverlay(diagnostics: DroneReclaimDiagnostics): void {
    const target = this.state.drone.target ?? diagnostics.bestTarget?.target;
    if (!target) {
      this.clearDroneRailRouteText();
      return;
    }

    const origin = this.state.drone.status === 'ready' ? this.state.rover : this.state.drone;
    const originScreen = this.project(origin);
    const targetScreen = this.project(target);
    const roverScreen = this.project(this.state.rover);
    this.graphics.lineStyle(3, 0xffa06c, 0.78);
    this.graphics.lineBetween(originScreen.x, originScreen.y, targetScreen.x, targetScreen.y);
    this.graphics.lineStyle(2, 0x78f7df, 0.58);
    this.graphics.lineBetween(targetScreen.x, targetScreen.y, roverScreen.x, roverScreen.y);

    if (this.droneRailLab.overlayRefillEtaLabels) {
      const eta = diagnostics.bestTarget?.eta;
      const etaLabel = eta
        ? `out ${eta.outboundSeconds.toFixed(1)} lock ${eta.reclaimLockSeconds.toFixed(1)} ret ${eta.returnSeconds.toFixed(1)} = ${eta.totalSeconds.toFixed(1)}s`
        : `${this.state.drone.etaSeconds.toFixed(1)}s refill`;
      this.drawStaticText('drone-rail-eta-label', targetScreen.x + 14, targetScreen.y + 22, etaLabel, 10, '#ffeddf');
    } else {
      this.drawStaticText('drone-rail-eta-label', 0, 0, '', 1, '#ffffff');
    }
  }

  private clearDroneRailOverlayText(): void {
    for (let index = 0; index < 36; index += 1) {
      this.drawStaticText(`drone-rail-field-${index}`, 0, 0, '', 1, '#ffffff');
    }
    this.drawStaticText('drone-rail-selected-target', 0, 0, '', 1, '#ffffff');
    this.drawStaticText('drone-rail-prepared-coverage', 0, 0, '', 1, '#ffffff');
    this.drawStaticText('drone-rail-emission-point', 0, 0, '', 1, '#ffffff');
    this.clearDroneRailRouteText();
  }

  private clearDroneRailRouteText(): void {
    this.drawStaticText('drone-rail-eta-label', 0, 0, '', 1, '#ffffff');
  }

  private drawCameraDebugOverlays(): void {
    if (!import.meta.env.DEV || !this.debugOverlayVisible) {
      this.clearCameraDebugOverlayText();
      return;
    }

    const focus = this.cameraFocus();
    const focusScreen = this.project(focus);
    const roverScreen = this.project(this.state.rover);
    const axes = this.cameraAxes();

    if (this.cameraLab.overlayCameraFocus) {
      this.graphics.lineStyle(2, 0xf7f08c, 0.92);
      this.graphics.strokeCircle(focusScreen.x, focusScreen.y, 12);
      this.graphics.lineBetween(focusScreen.x - 18, focusScreen.y, focusScreen.x + 18, focusScreen.y);
      this.graphics.lineBetween(focusScreen.x, focusScreen.y - 18, focusScreen.x, focusScreen.y + 18);
    }

    if (this.cameraLab.overlayRoverHeading) {
      const heading = this.project(this.pointFromHeading(this.state.rover, this.state.rover.heading, 120));
      this.graphics.lineStyle(3, 0x83f5da, 0.88);
      this.graphics.lineBetween(roverScreen.x, roverScreen.y, heading.x, heading.y);
      this.graphics.fillStyle(0x83f5da, 0.95);
      this.graphics.fillCircle(heading.x, heading.y, 5);
    }

    if (this.cameraLab.overlayCameraForward) {
      const forward = this.project({ x: focus.x + axes.forward.x * 150, y: focus.y + axes.forward.y * 150 });
      this.graphics.lineStyle(3, 0x8ab7ff, 0.88);
      this.graphics.lineBetween(focusScreen.x, focusScreen.y, forward.x, forward.y);
      this.graphics.fillStyle(0x8ab7ff, 0.95);
      this.graphics.fillCircle(forward.x, forward.y, 5);
    }

    if (this.cameraLab.overlayScreenBounds) {
      const bounds = this.projectedWorldScreenBounds();
      this.graphics.lineStyle(2, 0xf4b86a, 0.75);
      this.graphics.strokePoints(bounds, true, true);
    }

    if (this.cameraLab.overlayReclaimPreview) {
      const preview = getReclaimPreview(this.state);
      if (preview) {
        const target = this.project(preview.target);
        this.graphics.lineStyle(3, 0xffd2b7, 0.95);
        this.graphics.strokeCircle(target.x, target.y, 30);
        this.graphics.lineBetween(target.x - 38, target.y, target.x + 38, target.y);
        this.graphics.lineBetween(target.x, target.y - 38, target.x, target.y + 38);
      }
    }

    if (this.cameraLab.overlayDroneRoute) {
      const drone = this.state.drone;
      const target = drone.target ?? getReclaimPreview(this.state)?.target;
      if (target) {
        const droneScreen = this.project(drone.status === 'ready' ? this.state.rover : drone);
        const targetScreen = this.project(target);
        this.graphics.lineStyle(2, 0xffa06c, 0.82);
        this.graphics.lineBetween(droneScreen.x, droneScreen.y, targetScreen.x, targetScreen.y);
      }
      if (drone.status === 'returning') {
        const droneScreen = this.project(drone);
        this.graphics.lineStyle(2, 0x78f7df, 0.82);
        this.graphics.lineBetween(droneScreen.x, droneScreen.y, roverScreen.x, roverScreen.y);
      }
    }

    if (this.cameraLab.overlayFieldAgeValue) {
      this.state.fields.forEach((field, index) => {
        if (index % 3 !== 0 && field.age < this.state.tuning.preparedFieldMinAgeSeconds * 2) return;
        const screen = this.project(field);
        const alpha = clamp(field.age / 120, 0.22, 0.9);
        const color = field.value > 0.75 ? 0xffd35a : field.age > 75 ? 0x8dffea : 0x6f8094;
        this.graphics.lineStyle(1, color, alpha);
        this.graphics.strokeCircle(screen.x, screen.y, 7 + field.value * 8);
      });
    }

    if (this.cameraLab.overlayProjectionLabel) {
      const layout = this.getLayout();
      this.drawStaticText(
        'camera-projection-label',
        18,
        layout.hudHeight + 18,
        `CAM ${this.getCameraPreset(this.cameraLab.preset).label} / ${this.getProjectionModeLabel()} / ${this.getCameraZoom().toFixed(2)}x`,
        11,
        '#b9c7d8'
      );
    } else {
      this.drawStaticText('camera-projection-label', 0, 0, '', 1, '#ffffff');
    }
  }

  private clearCameraDebugOverlayText(): void {
    this.drawStaticText('camera-projection-label', 0, 0, '', 1, '#ffffff');
  }

  private getDroneFuelDetail(): string | undefined {
    if (this.state.drone.status !== 'ready') return undefined;
    const preview = getReclaimPreview(this.state);
    if (!preview) return undefined;
    if (preview.surcharge <= 0.05) return `+${preview.netPayload.toFixed(1)} NET`;
    if (preview.netPayload < preview.payload * 0.55) return 'THIN - FUEL STILL HOT';
    return `+${preview.netPayload.toFixed(1)} NET AFTER FUEL`;
  }

  private getDroneActionLabel(): string {
    if (this.state.drone.status === 'ready') return 'Launch Drone';
    if (this.state.drone.status === 'returning') return 'Returning';
    if (this.state.drone.status === 'reclaiming') return 'Reclaiming';
    return 'Outbound';
  }

  private shouldShowDroneLaunchUrgency(): boolean {
    if (this.state.phase !== 'playing') return false;
    if (this.state.drone.status !== 'ready') return false;
    return this.state.speedState === 'crawl' || this.state.nanobots / this.state.maxNanobots < this.state.tuning.droneUrgencyRatio;
  }

  private getDroneStatusLine(): string {
    if (this.state.drone.status === 'ready') {
      if (this.state.speedState === 'crawl') return 'CRAWL READY';
      if (this.shouldShowDroneLaunchUrgency()) return 'LOW BUFFER';
      const preview = getReclaimPreview(this.state);
      return preview
        ? `+${preview.payload.toFixed(1)} in ${preview.etaSeconds.toFixed(1)}s`
        : this.formatDroneButtonBlockedReason(getDroneReclaimDiagnostics(this.state).blockedReason ?? 'no target');
    }
    if (this.state.drone.status === 'returning') {
      return `+${this.state.drone.payload.toFixed(1)} in ${this.state.drone.etaSeconds.toFixed(1)}s`;
    }
    return `${this.state.drone.etaSeconds.toFixed(1)}s to refill`;
  }

  private formatDroneButtonBlockedReason(reason: string): string {
    if (reason === 'No reclaimable field yet') return 'no target yet';
    if (reason === 'No unreserved reclaim target') return 'no target';
    if (reason === 'No field meets value gate') return 'field too low';
    if (reason === 'Cluster payload below launch gate') return 'payload low';

    const age = reason.match(/^Oldest field age ([\d.]+)s \/ need ([\d.]+)s$/);
    if (age) return `age ${age[1]}/${age[2]}s`;

    const distance = reason.match(/^Nearest old field ([\d.]+) \/ need ([\d.]+)$/);
    if (distance) return `range ${distance[1]}/${distance[2]}`;

    return reason.length > 18 ? `${reason.slice(0, 17)}...` : reason;
  }

  private drawBar(x: number, y: number, width: number, height: number, progress: number, color: number): void {
    this.graphics.fillStyle(0x141a24, 1);
    this.graphics.fillRoundedRect(x, y, width, height, height / 2);
    this.graphics.fillStyle(color, 0.9);
    this.graphics.fillRoundedRect(x, y, Math.max(3, width * clamp(progress, 0, 1)), height, height / 2);
  }

  private formatPlayerMessage(message: string): string {
    if (message.startsWith('Arms are fabricating')) return 'Building field. Arms are busy.';
    if (message.startsWith('Emergency crawl')) return 'Crawl protocol. Launch drone.';
    if (message.startsWith('Prepared field frees')) return 'Sprint field. Mining arms free.';
    if (message.startsWith('Mining arms harvesting')) return 'Mining while parked. Solar is ticking.';
    if (message.startsWith('Drone committed')) return 'Drone launched. Shape the return path.';
    if (message.startsWith('Drone recovered')) return message.replace(' nanobots. Shape the return.', '. Payload returning.');
    if (message.startsWith('Drone delivered')) return message.replace(' nanobots. Field buffer restored.', '. Buffer restored.');
    if (message.startsWith('Prepared field online')) return 'Prepared field online. Keep supplied.';
    if (message.startsWith('Raw field start')) return 'Raw start. Lay a line, then reclaim.';
    return message;
  }

  private getEventFeedText(): string {
    if (this.eventMessage && this.time.now <= this.eventMessage.expiresAtMs) {
      return this.eventMessage.text;
    }
    if (this.eventMessage && this.time.now > this.eventMessage.expiresAtMs) {
      this.eventMessage = undefined;
    }
    const guidance = getContinuousGuidance(this.state);
    return `${guidance.objective}. ${guidance.nudge}`;
  }

  private drawPhaseBanner(): void {
    const layout = this.getLayout();
    if (this.state.phase === 'playing') {
      this.drawStaticText('phase-title', 0, 0, '', 1, '#ffffff');
      this.drawStaticText('phase-body', 0, 0, '', 1, '#ffffff');
      this.drawStaticText('phase-shift', 0, 0, '', 1, '#ffffff');
      this.drawStaticText('phase-cta', 0, 0, '', 1, '#ffffff');
      return;
    }

    const won = this.state.phase === 'won';
    const width = Math.min(layout.width - 48, 524);
    const height = layout.mode === 'mobilePortrait' ? 132 : 116;
    const x = (layout.width - width) / 2;
    const y = layout.mode === 'mobilePortrait' ? layout.hudHeight + 150 : 276;
    this.graphics.fillStyle(won ? 0x12382f : 0x441d26, 0.94);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(2, won ? 0x77f2ca : 0xff8491, 1);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.drawStaticText(
      'phase-title',
      layout.width / 2,
      y + 36,
      won && this.state.arena.extraction ? 'EXTRACTION REACHED' : won ? 'EXTRACTION QUOTA MET' : 'RUN FAILED',
      layout.mode === 'mobilePortrait' ? 20 : 25,
      '#ffffff',
      0.5
    );
    this.drawStaticText('phase-body', layout.width / 2, y + 76, this.formatPlayerMessage(this.state.message), layout.mode === 'mobilePortrait' ? 14 : 16, '#dfe8f2', 0.5);
    this.drawStaticText(
      'phase-shift',
      layout.width / 2,
      y + height + 24,
      this.isShiftModeEnabled()
        ? `${this.survivedTheNight} lengths of rail survive the night`
        : '',
      layout.mode === 'mobilePortrait' ? 13 : 15,
      '#9fb3c8',
      0.5
    );

    // The call to action, sized like one and pulsing so it reads as live.
    const pulse = 0.68 + Math.sin(this.time.now / 420) * 0.32;
    const ctaWidth = Math.min(layout.width - 96, 330);
    const ctaX = (layout.width - ctaWidth) / 2;
    const ctaY = y + height + 48;
    this.graphics.fillStyle(0x1c6f5c, 0.42 + pulse * 0.3);
    this.graphics.fillRoundedRect(ctaX, ctaY, ctaWidth, 44, 10);
    this.graphics.lineStyle(2, 0x77f2ca, 0.6 + pulse * 0.4);
    this.graphics.strokeRoundedRect(ctaX, ctaY, ctaWidth, 44, 10);
    this.drawStaticText(
      'phase-cta',
      layout.width / 2,
      ctaY + 22,
      this.isShiftModeEnabled() ? `Tap or press R for shift ${this.shiftNumber + 1}` : 'Tap or press R to run again',
      layout.mode === 'mobilePortrait' ? 15 : 17,
      '#ecfffa',
      0.5
    );
  }

  private drawStaticText(
    name: string,
    x: number,
    y: number,
    text: string,
    fontSize: number,
    color: string,
    originX = 0
  ): void {
    const existing = this.children.getByName(name) as Phaser.GameObjects.Text | null;
    if (existing) {
      existing.setText(text);
      existing.setPosition(x, y);
      existing.setFontSize(fontSize);
      existing.setColor(color);
      existing.setOrigin(originX, 0.5);
      return;
    }

    this.add
      .text(x, y, text, {
        color,
        fontFamily: 'monospace',
        fontSize: `${fontSize}px`
      })
      .setOrigin(originX, 0.5)
      .setName(name);
  }

  private exposeDebugHook(): void {
    if (!import.meta.env.DEV) return;

    window.__moonMinerContinuous = {
      getState: () => JSON.parse(JSON.stringify(this.state)) as ContinuousWorldState,
      getPointerTarget: () => (this.pointerTarget ? { ...this.pointerTarget } : undefined),
      getLoopTrace: () => JSON.parse(JSON.stringify(this.loopTrace)) as ContinuousLoopTrace,
      getLoopSummary: () => getContinuousLoopSummary(this.loopTrace),
      getReclaimPreview: () => getReclaimPreview(this.state),
      getArenaId: () => this.state.arenaId,
      setArena: (arenaId) => this.setArena(arenaId),
      getCameraLab: () => this.getCameraLabSnapshot(),
      setCameraPreset: (presetId) => this.applyCameraPreset(presetId),
      setCameraSettings: (settings) => this.applyCameraSettings(settings),
      setViewMode: (viewMode) => this.setCameraViewMode(viewMode),
      getDynamicsPresets: () =>
        DYNAMICS_PRESETS.map((preset) => ({
          ...preset,
          tuning: { ...preset.tuning }
        })),
      setDynamicsPreset: (presetId) => this.applyDynamicsPreset(presetId),
      getDroneRailLab: () => this.getDroneRailLabSnapshot(),
      setDynamicsTuning: (tuning) => this.setDynamicsTuning(tuning),
      startSelfPlay: (routeId) => this.startSelfPlay(routeId),
      stopSelfPlay: () => this.stopSelfPlay(),
      getSelfPlayStatus: () => this.getSelfPlayStatus()
    };

    const existing = document.getElementById('moon-miner-continuous-debug-state') as HTMLScriptElement | null;
    this.debugStateElement = existing ?? document.createElement('script');
    this.debugStateElement.id = 'moon-miner-continuous-debug-state';
    this.debugStateElement.type = 'application/json';
    if (!existing) document.body.appendChild(this.debugStateElement);
    this.updateDebugState();
  }

  private updateDebugState(): void {
    if (!this.debugStateElement) return;

    const snapshot: ContinuousDebugSnapshot = {
      state: JSON.parse(JSON.stringify(this.state)) as ContinuousWorldState,
      loopTrace: JSON.parse(JSON.stringify(this.loopTrace)) as ContinuousLoopTrace,
      loopSummary: getContinuousLoopSummary(this.loopTrace),
      selfPlay: this.getSelfPlayStatus(),
      arenaId: this.state.arenaId,
      pointerTarget: this.pointerTarget ? { ...this.pointerTarget } : undefined,
      gameSize: { x: this.getLayout().width, y: this.getLayout().height },
      ui: this.getUiSnapshot()
    };
    this.debugStateElement.textContent = JSON.stringify(snapshot);
  }

  private getUiSnapshot(): ContinuousUiSnapshot {
    const layout = this.getLayout();
    const buttons = Object.fromEntries(
      this.buttons.map((button) => [button.id, this.rectToSnapshot(button.rect)])
    ) as Record<ButtonId, ContinuousUiRect>;

    return {
      mode: layout.mode,
      viewMode: this.viewMode,
      cameraLab: this.getCameraLabSnapshot(),
      droneRailLab: this.getDroneRailLabSnapshot(),
      visual: this.getVisualSnapshot(),
      hudHeight: layout.hudHeight,
      debugOverlayVisible: this.debugOverlayVisible,
      vitals: layout.vitals.map((rect) => ({ ...rect })),
      stateChip: { ...layout.stateChip },
      buttons,
      controls: layout.drive ? { drive: { ...layout.drive } } : undefined,
      eventFeed: { x: layout.message.x, y: layout.message.y - layout.message.height / 2, width: layout.message.width, height: layout.message.height },
      textBounds: this.getUiTextBounds(),
      helperArm: {
        duty: this.state.arms.helper.duty,
        status: this.state.arms.helper.status,
        miningAssistRate: this.state.arms.helper.miningAssistRate,
        lastAssistYield: this.state.arms.helper.lastAssistYield
      },
      droneCue: this.getDroneCueSnapshot()
    };
  }

  private getCameraLabSnapshot(): CameraLabSnapshot {
    return {
      preset: this.cameraLab.preset,
      presetLabel: this.getCameraPreset(this.cameraLab.preset).label,
      viewMode: this.viewMode,
      projectionMode: this.getProjectionModeLabel(),
      settings: { ...this.cameraLab },
      focus: this.cameraFocus(),
      center: this.getCameraCenter(),
      zoom: this.getCameraZoom(),
      heading: this.cameraHeading
    };
  }

  private getDroneRailLabSnapshot(): DroneRailLabSnapshot {
    const diagnostics = getDroneReclaimDiagnostics(this.state);
    const best = diagnostics.bestTarget;
    const preset = this.getDynamicsPresetSnapshot();
    return {
      settings: { ...this.droneRailLab },
      ...preset,
      diagnostics,
      blockedReason: diagnostics.blockedReason,
      candidateReclaimCount: diagnostics.candidateCount,
      bestTargetScore: best?.score,
      bestTargetPayload: best?.payload,
      bestTargetFieldCount: best?.fieldCount,
      bestTargetRefillEta: best?.refillEtaSeconds,
      oldestFieldAge: diagnostics.oldestFieldAge,
      nearestEligibleFieldDistance: diagnostics.nearestEligibleFieldDistance,
      nearestNearEligibleFieldDistance: diagnostics.nearestNearEligibleFieldDistance,
      preparedCoverage: diagnostics.currentPreparedCoverage,
      speedState: diagnostics.currentSpeedState,
      tuning: { ...this.state.tuning }
    };
  }

  private getVisualSnapshot(): ContinuousVisualSnapshot {
    const activeZone = findFertileZoneAt(this.state, this.state.rover);
    return {
      terrain: {
        craterCount: TERRAIN_CRATER_COUNT,
        fissureCount: TERRAIN_FISSURE_COUNT,
        fertileBedCount: this.state.fertileZones.length,
        preparedFieldBedCount: this.getPreparedFieldTerrainSectionCount(),
        ridgeCount: this.state.arena.ridges.length
      },
      oreVeins: this.state.fertileZones
        .filter((zone) => Boolean(zone.vein))
        .map((zone) => {
          const totalPips = this.fertileZoneRichnessPipCount(zone);
          const remainingRatio = this.fertileZoneRemainingRatio(zone);
          return {
            id: zone.id,
            screenBounds: this.getFertileVeinScreenBounds(zone),
            remainingRatio,
            richness: zone.richness,
            richnessPipCount: Math.min(totalPips, remainingRatio > 0.025 ? Math.max(1, Math.ceil(totalPips * remainingRatio)) : 0),
            depletionScarCount: this.fertileZoneDepletionScarCount(zone),
            active: activeZone?.id === zone.id,
            activeMiningCue: activeZone?.id === zone.id && this.state.lastYieldRate > 0.001
          };
        })
    };
  }

  private getPreparedFieldTerrainSectionCount(): number {
    const preparedFields = [...this.state.fields]
      .filter((field) => {
        return field.age >= this.state.tuning.preparedFieldMinAgeSeconds && field.value >= this.state.tuning.preparedFieldMinValue;
      })
      .sort((a, b) => a.id - b.id);
    return this.fieldSections(preparedFields).length;
  }

  private getFertileVeinScreenBounds(zone: FertileZone): ContinuousUiRect {
    const polygon = this.fertileVeinScreenPolygon(zone, zone.vein?.width ?? zone.radius);
    return this.rectFromPoints(polygon.points);
  }

  private rectFromPoints(points: Vec2[]): ContinuousUiRect {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  }

  private getDroneCueSnapshot(): ContinuousUiSnapshot['droneCue'] {
    const deliveryEffect = this.getActiveDeliveryEffect();
    const preview = getReclaimPreview(this.state);
    return {
      launchUrgent: this.shouldShowDroneLaunchUrgency(),
      previewTarget: preview ? this.getDronePreviewTargetSnapshot(preview) : undefined,
      previewPayload: preview?.payload,
      previewEtaSeconds: preview?.etaSeconds,
      reservedTarget: this.getDroneReservedTargetSnapshot(),
      returnPayloadVisible: this.state.drone.status === 'returning' && this.state.drone.payload > 0,
      deliveryReadoutVisible: Boolean(deliveryEffect),
      deliveryAmount: deliveryEffect?.amount
    };
  }

  private getDronePreviewTargetSnapshot(preview: ReclaimPreview): ContinuousUiRect {
    const screen = this.project(preview.target);
    const previewFields = this.state.fields.filter((field) => {
      return Math.hypot(field.x - preview.target.x, field.y - preview.target.y) <= this.state.tuning.dronePickupRadius;
    });
    const radius = this.droneReservationRadius(screen, previewFields) + 18;
    return {
      x: screen.x - radius,
      y: screen.y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  private getActiveDeliveryEffect(): VisualEffect | undefined {
    return this.effects.find((effect) => {
      return effect.kind === 'delivery' && this.time.now - effect.startedAt <= effect.durationMs;
    });
  }

  private getDroneReservedTargetSnapshot(): ContinuousUiRect | undefined {
    const target = this.state.drone.target;
    if (!target || (this.state.drone.status !== 'outbound' && this.state.drone.status !== 'reclaiming')) return undefined;

    const screen = this.project(target);
    const radius = this.droneReservationRadius(screen, this.state.fields.filter((field) => field.reservedByDrone)) + 22;
    return {
      x: screen.x - radius,
      y: screen.y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  private getUiTextBounds(): Record<string, ContinuousUiRect> {
    const names = [
      'vital-Nanobots-label',
      'vital-Nanobots-value',
      'vital-Ore-label',
      'vital-Ore-value',
      'vital-Sun-label',
      'vital-Sun-value',
      'state-chip-label',
      'state-chip-detail',
      'button-launch-title',
      'button-launch-status',
      'button-reset',
      'yield-readout'
    ];
    const bounds: Record<string, ContinuousUiRect> = {};

    for (const name of names) {
      const text = this.children.getByName(name) as Phaser.GameObjects.Text | null;
      if (!text || !text.text) continue;

      bounds[name] = this.rectToSnapshot(text.getBounds());
    }

    return bounds;
  }

  private rectToSnapshot(rect: Phaser.Geom.Rectangle): ContinuousUiRect {
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
  }

  private addEffect(kind: EffectKind, x: number, y: number, durationMs: number, amount?: number): void {
    this.effects.push({ kind, x, y, startedAt: this.time.now, durationMs, amount });
  }

  private pointerToWorld(pointer: Phaser.Input.Pointer): Vec2 {
    const world = this.unproject({ x: pointer.x, y: pointer.y });
    return {
      x: clamp(world.x, 22, this.state.width - 22),
      y: clamp(world.y, 56, this.state.height - 22)
    };
  }

  private cameraRig(): { sin: number; cos: number; distance: number; height: number; focal: number } {
    const pitch = (clamp(this.cameraLab.cameraPitchDegrees, 8, 80) * Math.PI) / 180;
    const distance = Math.max(40, this.cameraLab.cameraRigDistance);
    const sin = Math.sin(pitch);
    const cos = Math.cos(pitch);
    const height = distance * (sin / cos);
    const depthAtFocus = distance / cos;
    return { sin, cos, distance, height, focal: this.getCameraZoom() * depthAtFocus };
  }

  private project(point: Vec2): Vec2 {
    const center = this.getCameraCenter();
    const zoom = this.getCameraZoom();
    const camera = this.cameraFocus();
    if (this.usesTacticalProjection()) {
      const offset = { x: point.x - camera.x, y: point.y - camera.y };
      const yScale = this.tacticalPerspectiveEnabled() ? this.cameraLab.projectedYScale : 1;
      const shear = this.tacticalPerspectiveEnabled() ? this.cameraLab.projectionShear : 0;
      return {
        x: center.x + (offset.x + offset.y * shear) * zoom,
        y: center.y + offset.y * yScale * zoom
      };
    }

    const axes = this.cameraAxes();
    const offset = { x: point.x - camera.x, y: point.y - camera.y };
    const lateral = offset.x * axes.right.x + offset.y * axes.right.y;
    const forward = offset.x * axes.forward.x + offset.y * axes.forward.y;
    const rig = this.cameraRig();
    const along = forward + rig.distance;
    const depth = Math.max(24, along * rig.cos + rig.height * rig.sin);
    const up = along * rig.sin - rig.height * rig.cos;
    return {
      x: center.x + (rig.focal * lateral) / depth,
      y: center.y - (rig.focal * up) / depth
    };
  }

  private unproject(point: Vec2): Vec2 {
    const center = this.getCameraCenter();
    const zoom = this.getCameraZoom();
    const camera = this.cameraFocus();
    if (this.usesTacticalProjection()) {
      const yScale = this.tacticalPerspectiveEnabled() ? this.cameraLab.projectedYScale : 1;
      const shear = this.tacticalPerspectiveEnabled() ? this.cameraLab.projectionShear : 0;
      const dy = (point.y - center.y) / (yScale * zoom);
      return {
        x: camera.x + (point.x - center.x) / zoom - dy * shear,
        y: camera.y + dy
      };
    }

    const axes = this.cameraAxes();
    const rig = this.cameraRig();
    const normalizedX = (point.x - center.x) / rig.focal;
    const normalizedY = (center.y - point.y) / rig.focal;
    const denominator = rig.sin - normalizedY * rig.cos;
    // At or above the horizon the ray never meets the ground; hold it far out.
    const along = Math.abs(denominator) < 1e-4
      ? 100000
      : (rig.height * (rig.cos + normalizedY * rig.sin)) / denominator;
    const clampedAlong = clamp(along, 1, 100000);
    const depth = clampedAlong * rig.cos + rig.height * rig.sin;
    const forward = clampedAlong - rig.distance;
    const lateral = normalizedX * depth;
    return {
      x: camera.x + axes.right.x * lateral + axes.forward.x * forward,
      y: camera.y + axes.right.y * lateral + axes.forward.y * forward
    };
  }

  private projectedScale(point: Vec2): number {
    const zoom = this.getCameraZoom();
    if (this.usesTacticalProjection() && !this.tacticalPerspectiveEnabled()) return zoom;
    if (this.usesTacticalProjection()) {
      const layout = this.getLayout();
      const screen = this.project(point);
      const normalizedDepth = clamp((screen.y - layout.hudHeight) / (layout.height - layout.hudHeight), 0, 1);
      const perspective = 1 - this.cameraLab.projectedScaleStrength * 0.5 + normalizedDepth * this.cameraLab.projectedScaleStrength;
      return zoom * clamp(perspective, 0.45, 1.8);
    }

    const camera = this.cameraFocus();
    const axes = this.cameraAxes();
    const offset = { x: point.x - camera.x, y: point.y - camera.y };
    const forward = offset.x * axes.forward.x + offset.y * axes.forward.y;
    const rig = this.cameraRig();
    const depth = Math.max(24, (forward + rig.distance) * rig.cos + rig.height * rig.sin);
    return clamp(rig.focal / depth, zoom * 0.25, zoom * 3);
  }

  private shapeYScale(): number {
    if (this.usesTacticalProjection()) {
      return this.tacticalPerspectiveEnabled() ? this.cameraLab.projectedYScale : 1;
    }
    return this.cameraRig().sin;
  }

  private cameraFocus(): Vec2 {
    if (this.viewMode === 'tactical') return this.tacticalCameraFocus;

    const chaseFocus = this.chaseCameraFocus;
    const pullback = this.getHybridPullbackAmount() * this.cameraLab.tacticalPullbackStrength;
    const blend = clamp(this.cameraLab.followBlend + pullback, 0, 1);
    return {
      x: Phaser.Math.Linear(chaseFocus.x, this.tacticalCameraFocus.x, blend),
      y: Phaser.Math.Linear(chaseFocus.y, this.tacticalCameraFocus.y, blend)
    };
  }

  private tacticalCameraTarget(): Vec2 {
    // The camera rides with the miner. A deadzone lets ordinary maneuvering happen
    // without the view moving at all; the camera only gives chase once the rover
    // genuinely leaves the box.
    const deadzone = Math.max(0, this.cameraLab.followDeadzone);
    const anchor = this.tacticalCameraFocus;
    const offsetX = this.state.rover.x - anchor.x;
    const offsetY = this.state.rover.y - anchor.y;
    const distance = Math.hypot(offsetX, offsetY);
    const target =
      distance <= deadzone || distance === 0
        ? { x: anchor.x, y: anchor.y }
        : { x: this.state.rover.x, y: this.state.rover.y };
    const layout = this.getLayout();
    const playTop = layout.hudHeight;
    const playBottom = layout.controlBandTop ?? layout.height;
    const zoom = Math.max(this.getCameraZoom('tactical'), 0.1);
    const halfWidth = layout.width / (2 * zoom);
    const halfHeight = (playBottom - playTop) / (2 * zoom);
    const minX = halfWidth - 60;
    const maxX = this.state.width - halfWidth + 60;
    const minY = halfHeight - 20;
    const maxY = this.state.height - halfHeight + 20;
    return {
      x: minX <= maxX ? clamp(target.x, minX, maxX) : this.state.width / 2,
      y: minY <= maxY ? clamp(target.y, minY, maxY) : this.state.height / 2
    };
  }

  private getCameraCenter(): Vec2 {
    const layout = this.getLayout();
    const mobileCenterY =
      this.viewMode === 'tactical'
        ? Math.floor(layout.hudHeight + ((layout.controlBandTop ?? layout.height) - layout.hudHeight) * 0.48)
        : MOBILE_CAMERA_CENTER_Y;
    const desktopCenterY =
      this.viewMode === 'tactical'
        ? Math.floor(DESKTOP_HUD_HEIGHT + (layout.height - DESKTOP_HUD_HEIGHT) * 0.52)
        : DESKTOP_CAMERA_CENTER_Y;
    const baseCenterY = layout.mode === 'mobilePortrait' ? mobileCenterY : desktopCenterY;
    const bias = this.cameraLab.roverScreenBias;

    return {
      x: layout.width / 2 + this.cameraLab.cameraCenterX,
      y: baseCenterY + this.cameraLab.cameraCenterY + bias
    };
  }

  private getCameraZoom(forceMode?: ViewMode): number {
    const mode = forceMode ?? this.viewMode;
    const layout = this.getLayout();
    const mobileMultiplier =
      layout.mode === 'mobilePortrait' ? (mode === 'tactical' ? 1.12 : 0.72) : 1;
    if (mode === 'tactical') return this.cameraLab.tacticalZoom * mobileMultiplier;

    const pullback = mode === 'hybrid' ? this.getHybridPullbackAmount() * this.cameraLab.tacticalPullbackStrength : 0;
    const pulledZoom = Math.min(this.cameraLab.cameraZoom, this.cameraLab.tacticalZoom);
    return Phaser.Math.Linear(this.cameraLab.cameraZoom, pulledZoom, clamp(pullback, 0, 1)) * mobileMultiplier;
  }

  private usesTacticalProjection(): boolean {
    return this.viewMode === 'tactical';
  }

  private tacticalPerspectiveEnabled(): boolean {
    return (
      this.viewMode === 'tactical' &&
      (
        Math.abs(this.cameraLab.projectedYScale - 1) > 0.001 ||
        Math.abs(this.cameraLab.projectionShear) > 0.001)
    );
  }

  private getHybridPullbackAmount(): number {
    if (this.viewMode !== 'hybrid') return 0;

    const active =
      (this.cameraLab.zoomOutLowNanobots && this.state.nanobots / this.state.maxNanobots < this.state.tuning.droneUrgencyRatio) ||
      (this.cameraLab.zoomOutDroneReadyWithPreview && this.state.drone.status === 'ready' && Boolean(getReclaimPreview(this.state))) ||
      (this.cameraLab.zoomOutDroneActive && this.state.drone.status !== 'ready') ||
      (this.cameraLab.zoomOutDuringCrawl && this.state.speedState === 'crawl');

    if (active) {
      this.hybridPullbackUntilMs = Math.max(
        this.hybridPullbackUntilMs,
        this.time.now + this.cameraLab.returnToNormalDelay * 1000
      );
    }

    return this.time.now <= this.hybridPullbackUntilMs ? 1 : 0;
  }

  private cameraHeadingTarget(): number {
    return this.state.rover.heading;
  }

  private getProjectionModeLabel(): string {
    if (this.viewMode === 'hybrid') return this.getHybridPullbackAmount() > 0 ? 'hybrid pullback' : 'hybrid chase';
    if (this.viewMode === 'chase') return 'chase perspective';
    return this.tacticalPerspectiveEnabled() ? '3/4 tactical' : 'tactical map';
  }

  private projectedWorldScreenBounds(): Vec2[] {
    return [
      this.project({ x: 0, y: 0 }),
      this.project({ x: this.state.width, y: 0 }),
      this.project({ x: this.state.width, y: this.state.height }),
      this.project({ x: 0, y: this.state.height })
    ];
  }

  private cameraAxes(): { forward: Vec2; right: Vec2 } {
    const forward = {
      x: Math.cos(this.cameraHeading),
      y: Math.sin(this.cameraHeading)
    };
    return {
      forward,
      right: { x: -forward.y, y: forward.x }
    };
  }

  private cameraLocalPoint(lateral: number, forwardDistance: number): Vec2 {
    const camera = this.cameraFocus();
    const axes = this.cameraAxes();
    return {
      x: camera.x + axes.right.x * lateral + axes.forward.x * forwardDistance,
      y: camera.y + axes.right.y * lateral + axes.forward.y * forwardDistance
    };
  }

  private pointFromHeading(origin: Vec2, heading: number, distanceFromOrigin: number): Vec2 {
    return {
      x: origin.x + Math.cos(heading) * distanceFromOrigin,
      y: origin.y + Math.sin(heading) * distanceFromOrigin
    };
  }

  private visualCalm(): number {
    if (this.state.speedState === 'prepared') return 0.58;
    if (this.state.speedState === 'fabricating') return 0.78;
    return 1;
  }

  private getSolarRatio(): number {
    return clamp(this.state.solarSeconds / Math.max(1, this.state.solarWindowSeconds), 0, 1);
  }

  private roverBodyColor(speedState: SpeedState): number {
    if (speedState === 'prepared') return 0xf5f7ff;
    if (speedState === 'fabricating') return 0xdfe8f2;
    return 0xffc0ad;
  }

  private effectColor(kind: EffectKind): number {
    switch (kind) {
      case 'launch':
        return 0xff9a68;
      case 'delivery':
        return 0x78f7df;
      case 'recovery':
        return 0x8dffea;
      case 'sprint':
        return 0x78f7df;
      case 'build':
        return 0x5db7ff;
      case 'crawl':
        return 0xff765f;
      case 'mine':
        return 0xf1c65d;
      case 'win':
        return 0x77f2ca;
      case 'loss':
        return 0xff8491;
      case 'blocked':
        return 0xff6f78;
    }
  }
}

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return ((target - current + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function wrapAngle(radians: number): number {
  const twoPi = Math.PI * 2;
  return ((radians + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
