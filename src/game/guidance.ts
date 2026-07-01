import type { WorldState } from './types';
import { samePoint } from './keys';

export interface Guidance {
  objective: string;
  nudge: string;
}

export function getGuidance(state: WorldState): Guidance {
  if (state.phase === 'won') {
    return {
      objective: 'Extraction complete',
      nudge: 'The ore is back at base before sunset.'
    };
  }

  if (state.phase === 'lost') {
    return {
      objective: 'Run failed',
      nudge: state.message
    };
  }

  if (state.rover.ore >= state.targetOre && !samePoint(state.rover, state.base)) {
    return {
      objective: 'Return to base',
      nudge: 'Bring the ore home before the solar window closes.'
    };
  }

  const oreHere = state.tiles[state.rover.y][state.rover.x].ore > 0;
  if (oreHere) {
    return {
      objective: 'Mine this deposit',
      nudge: 'Mine the ore under the rover, then plan the route home.'
    };
  }

  if (state.rover.ore > 0 && state.rover.ore < state.targetOre && state.nanobots <= 8) {
    return {
      objective: 'Recover nanobots',
      nudge: 'Recover the highlighted old rail near the first deposit before driving farther.'
    };
  }

  if (state.nanobots <= 4) {
    return {
      objective: 'Recover nanobots',
      nudge: 'Recover a reachable rail spur to refill the printer.'
    };
  }

  if (state.rover.ore === 0) {
    return {
      objective: 'Reach first ore',
      nudge: 'Head for the lower-center deposit. Rail auto-prints into valid terrain.'
    };
  }

  return {
    objective: 'Reach next ore',
    nudge: 'Drive east along your rail line toward the next deposit.'
  };
}
