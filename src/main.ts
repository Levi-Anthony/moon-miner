import Phaser from 'phaser';
import './styles.css';
import { ContinuousMoonMinerScene } from './scenes/ContinuousMoonMinerScene';
import { SandboxScene } from './scenes/SandboxScene';

const params = new URLSearchParams(window.location.search);
// A minimal drive + lay-road + slide sandbox, isolated from the main game so
// the core feel can be tuned without the rest of the machinery. ?sandbox=1
const useSandbox = params.get('sandbox') === '1';
const forceMobile = params.get('mobile') === '1';
const forceDesktop = params.get('desktop') === '1';
const portraitTouch =
  !forceDesktop &&
  (forceMobile ||
    (window.matchMedia('(pointer: coarse)').matches && window.innerHeight > window.innerWidth && window.innerWidth <= 760));
const gameSize = portraitTouch ? { width: 430, height: 930 } : { width: 1040, height: 720 };

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#090b12',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameSize.width,
    height: gameSize.height
  },
  scene: [useSandbox ? SandboxScene : ContinuousMoonMinerScene]
};

new Phaser.Game(config);
