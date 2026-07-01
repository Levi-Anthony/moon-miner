import Phaser from 'phaser';
import './styles.css';
import { ContinuousMoonMinerScene } from './scenes/ContinuousMoonMinerScene';

const params = new URLSearchParams(window.location.search);
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
  scene: [ContinuousMoonMinerScene]
};

new Phaser.Game(config);
