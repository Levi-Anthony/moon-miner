import { build } from 'esbuild';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outfile = join(tmpdir(), 'moon-miner-last-light-report.mjs');

await build({
  entryPoints: ['src/game/continuousSelfPlay.ts'],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  logLevel: 'silent'
});

const { formatLastLightRouteOutcomeTable } = await import(pathToFileURL(outfile));

console.log('Last Light Return route outcomes');
console.log(formatLastLightRouteOutcomeTable());
