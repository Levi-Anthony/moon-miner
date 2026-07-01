import type { ContinuousWorldState, DroneStatus, SpeedState } from './continuous';

export type ContinuousLoopMilestoneId =
  | 'preparedAbundance'
  | 'overextension'
  | 'emergencyCrawl'
  | 'droneRecovery';

export interface ContinuousLoopMilestone {
  hit: boolean;
  atSeconds?: number;
  detail?: string;
}

export interface ContinuousLoopTraceEvent {
  kind: ContinuousLoopMilestoneId | 'droneLaunch' | 'droneDelivery' | 'runEnd';
  atSeconds: number;
  speedState: SpeedState;
  droneStatus: DroneStatus;
  nanobots: number;
  ore: number;
  x: number;
  y: number;
  detail: string;
}

export interface ContinuousLoopTrace {
  startedAtSeconds: number;
  updatedAtSeconds: number;
  startNanobots: number;
  lowestNanobots: number;
  lowestNanobotsDuringCrawl?: number;
  deliveredNanobots: number;
  deliveredNanobotsAfterCrawl: number;
  droneLaunches: number;
  droneDeliveries: number;
  speedSeconds: Record<SpeedState, number>;
  milestones: Record<ContinuousLoopMilestoneId, ContinuousLoopMilestone>;
  events: ContinuousLoopTraceEvent[];
}

export interface ContinuousLoopSummary {
  hitLoop: boolean;
  nextMilestone?: ContinuousLoopMilestoneId;
  elapsedSeconds: number;
  lowestNanobots: number;
  deliveredNanobots: number;
  deliveredNanobotsAfterCrawl: number;
  droneLaunches: number;
  droneDeliveries: number;
  speedSeconds: Record<SpeedState, number>;
  milestones: Array<{
    id: ContinuousLoopMilestoneId;
    label: string;
    shortLabel: string;
    hit: boolean;
    atSeconds?: number;
    detail?: string;
  }>;
}

const LOOP_MILESTONES: Array<{
  id: ContinuousLoopMilestoneId;
  label: string;
  shortLabel: string;
}> = [
  { id: 'preparedAbundance', label: 'Prepared abundance', shortLabel: 'Prep' },
  { id: 'overextension', label: 'Overextension', shortLabel: 'Extend' },
  { id: 'emergencyCrawl', label: 'Emergency crawl', shortLabel: 'Crawl' },
  { id: 'droneRecovery', label: 'Drone recovery', shortLabel: 'Drone' }
];

const PREPARED_SPEED_THRESHOLD_RATIO = 0.8;
const OVEREXTENSION_SPEND_THRESHOLD = 2.5;
const CRAWL_SECONDS_THRESHOLD = 0.2;
const RECOVERY_REBOUND_THRESHOLD = 3;

export function createContinuousLoopTrace(state: ContinuousWorldState): ContinuousLoopTrace {
  return {
    startedAtSeconds: state.elapsedSeconds,
    updatedAtSeconds: state.elapsedSeconds,
    startNanobots: state.nanobots,
    lowestNanobots: state.nanobots,
    deliveredNanobots: 0,
    deliveredNanobotsAfterCrawl: 0,
    droneLaunches: 0,
    droneDeliveries: 0,
    speedSeconds: {
      prepared: 0,
      fabricating: 0,
      crawl: 0
    },
    milestones: {
      preparedAbundance: { hit: false },
      overextension: { hit: false },
      emergencyCrawl: { hit: false },
      droneRecovery: { hit: false }
    },
    events: []
  };
}

export function recordContinuousLoopDroneLaunch(trace: ContinuousLoopTrace, state: ContinuousWorldState): void {
  trace.droneLaunches += 1;
  pushEvent(
    trace,
    state,
    'droneLaunch',
    `target ${state.drone.targetPatchId ?? 'unknown'} eta ${state.drone.etaSeconds.toFixed(1)}s`
  );
}

export function recordContinuousLoopTick(
  trace: ContinuousLoopTrace,
  previous: ContinuousWorldState,
  current: ContinuousWorldState,
  deltaSeconds: number
): void {
  const elapsedDelta = Math.max(0, deltaSeconds);
  trace.updatedAtSeconds = current.elapsedSeconds;
  trace.speedSeconds[current.speedState] += elapsedDelta;
  trace.lowestNanobots = Math.min(trace.lowestNanobots, current.nanobots);

  if (current.speedState === 'crawl') {
    trace.lowestNanobotsDuringCrawl =
      trace.lowestNanobotsDuringCrawl === undefined
        ? current.nanobots
        : Math.min(trace.lowestNanobotsDuringCrawl, current.nanobots);
  }

  const delivered = previous.drone.status === 'returning' && current.drone.status === 'ready' ? previous.drone.payload : 0;
  if (delivered > 0) {
    trace.droneDeliveries += 1;
    trace.deliveredNanobots += delivered;
    if (trace.milestones.emergencyCrawl.hit) {
      trace.deliveredNanobotsAfterCrawl += delivered;
    }
    pushEvent(trace, current, 'droneDelivery', `payload +${delivered.toFixed(1)}`);
  }

  maybeHitPreparedAbundance(trace, current);
  maybeHitOverextension(trace, current);
  maybeHitEmergencyCrawl(trace, current);
  maybeHitDroneRecovery(trace, current);

  if (previous.phase !== current.phase) {
    pushEvent(trace, current, 'runEnd', current.phase);
  }
}

export function getContinuousLoopSummary(trace: ContinuousLoopTrace): ContinuousLoopSummary {
  const milestones = LOOP_MILESTONES.map((definition) => ({
    ...definition,
    ...trace.milestones[definition.id]
  }));
  const nextMilestone = milestones.find((milestone) => !milestone.hit)?.id;

  return {
    hitLoop: milestones.every((milestone) => milestone.hit),
    nextMilestone,
    elapsedSeconds: round(trace.updatedAtSeconds - trace.startedAtSeconds),
    lowestNanobots: round(trace.lowestNanobots),
    deliveredNanobots: round(trace.deliveredNanobots),
    deliveredNanobotsAfterCrawl: round(trace.deliveredNanobotsAfterCrawl),
    droneLaunches: trace.droneLaunches,
    droneDeliveries: trace.droneDeliveries,
    speedSeconds: {
      prepared: round(trace.speedSeconds.prepared),
      fabricating: round(trace.speedSeconds.fabricating),
      crawl: round(trace.speedSeconds.crawl)
    },
    milestones
  };
}

function maybeHitPreparedAbundance(trace: ContinuousLoopTrace, state: ContinuousWorldState): void {
  if (trace.milestones.preparedAbundance.hit) return;
  if (state.speedState !== 'prepared') return;
  if (state.rover.speed < state.tuning.preparedSpeed * PREPARED_SPEED_THRESHOLD_RATIO) return;
  if (state.nanobots < trace.startNanobots - 0.25) return;

  hitMilestone(
    trace,
    state,
    'preparedAbundance',
    `speed ${state.rover.speed.toFixed(0)}, nanobots ${state.nanobots.toFixed(1)}`
  );
}

function maybeHitOverextension(trace: ContinuousLoopTrace, state: ContinuousWorldState): void {
  if (!trace.milestones.preparedAbundance.hit || trace.milestones.overextension.hit) return;
  if (state.speedState !== 'fabricating') return;
  if (state.nanobots > trace.startNanobots - OVEREXTENSION_SPEND_THRESHOLD) return;

  hitMilestone(
    trace,
    state,
    'overextension',
    `spent ${(trace.startNanobots - state.nanobots).toFixed(1)} nanobots`
  );
}

function maybeHitEmergencyCrawl(trace: ContinuousLoopTrace, state: ContinuousWorldState): void {
  if (!trace.milestones.overextension.hit || trace.milestones.emergencyCrawl.hit) return;
  if (state.speedState !== 'crawl') return;
  if (trace.speedSeconds.crawl < CRAWL_SECONDS_THRESHOLD) return;

  hitMilestone(trace, state, 'emergencyCrawl', `low ${state.nanobots.toFixed(1)} nanobots`);
}

function maybeHitDroneRecovery(trace: ContinuousLoopTrace, state: ContinuousWorldState): void {
  if (!trace.milestones.emergencyCrawl.hit || trace.milestones.droneRecovery.hit) return;
  if (trace.deliveredNanobotsAfterCrawl <= 0) return;
  if (state.nanobots < trace.lowestNanobots + RECOVERY_REBOUND_THRESHOLD) return;

  hitMilestone(
    trace,
    state,
    'droneRecovery',
    `rebounded to ${state.nanobots.toFixed(1)} after +${trace.deliveredNanobotsAfterCrawl.toFixed(1)} delivery`
  );
}

function hitMilestone(
  trace: ContinuousLoopTrace,
  state: ContinuousWorldState,
  id: ContinuousLoopMilestoneId,
  detail: string
): void {
  trace.milestones[id] = {
    hit: true,
    atSeconds: round(state.elapsedSeconds),
    detail
  };
  pushEvent(trace, state, id, detail);
}

function pushEvent(
  trace: ContinuousLoopTrace,
  state: ContinuousWorldState,
  kind: ContinuousLoopTraceEvent['kind'],
  detail: string
): void {
  trace.events.push({
    kind,
    atSeconds: round(state.elapsedSeconds),
    speedState: state.speedState,
    droneStatus: state.drone.status,
    nanobots: round(state.nanobots),
    ore: round(state.rover.ore),
    x: round(state.rover.x),
    y: round(state.rover.y),
    detail
  });
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
