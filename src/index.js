import './index.css';

import CPU from './emulator/cpu';
import Memory from './emulator/memory';
import Graphics from './emulator/graphics';
import Input from './emulator/input';
import CanvasRenderer from './emulator/canvasRenderer';
import BeepSoundPlayer from './emulator/beepSoundPlayer';

const roms = [
  'Breakout [Carmelo Cortez, 1979]',
  'Pong [Paul Vervalin, 1990]',
  'Astro Dodge [Revival Studios, 2008]',
  'Bowling [Gooitzen van der Wal]',
  'Hi-Lo [Jef Winsor, 1978]',
  'Kaleidoscope [Joseph Weisbecker, 1978]',
  'Guess [David Winter]',
  'Blitz [David Winter]',
  'Connect 4 [David Winter]',
  'Biorhythm [Jef Winsor]',
  'Shooting Stars [Philip Baltzer, 1978]',
  'Brick (Brix hack, 1990)',
  'Hidden [David Winter, 1996]',
  'Coin Flipping [Carmelo Cortez, 1978]',
  'Space Invaders [David Winter]',
  'Craps [Camerlo Cortez, 1978]',
  'Slide [Joyce Weisbecker]',
  'Animal Race [Brian Astle]',
  '15 Puzzle [Roger Ivie]',
  'Tetris [Fran Dachille, 1991]',
  'Deflection [John Fort]',
];

const HEIGHT = 32;
const WIDTH = 64;
let cyclesPerRender = 10;
let scale = 5;
let isEmulationRunning = false;

class Emulator {
  constructor() {
    this.memory = new Memory();
    this.graphics = new Graphics(WIDTH, HEIGHT);
    this.input = new Input();
    this.sound = new BeepSoundPlayer();
    this.cpu = new CPU(this.memory, this.graphics, this.input, this.sound);
  }

  loadGame = (roomBinDump) => {
    this.cpu.loadGameRom(roomBinDump);
  };

  executeCycle = () => {
    this.cpu.executeCycle();
  };

  executeTimers = () => {
    this.cpu.executeTimers();
  };
}

const hookUpControlls = (emulatorInstance) => {
  const keyMappings = {
    49: 0x1,
    50: 0x2,
    51: 0x3,
    52: 0xc,
    81: 0x4,
    87: 0x5,
    69: 0x6,
    82: 0xd,
    65: 0x7,
    83: 0x8,
    68: 0x9,
    70: 0xe,
    90: 0xa,
    88: 0x0,
    67: 0xb,
    86: 0xf,
  };
  document.addEventListener('keydown', (event) => {
    const { keyCode } = event;
    emulatorInstance.cpu.keyPressed(keyMappings[keyCode]);
  });

  document.addEventListener('keyup', (event) => {
    const { keyCode } = event;
    emulatorInstance.cpu.keyReleased(keyMappings[keyCode]);
  });
};

let renderer = '';
const initializeRenderCanvas = () => {
  const canvas = document.getElementById('chip8-canvas');
  renderer = new CanvasRenderer(canvas, WIDTH, HEIGHT, scale);
};

const emulator = new Emulator();
hookUpControlls(emulator);
initializeRenderCanvas();

const romSelectionInput = document.getElementById('rom-selection');
const romDescriptionText = document.getElementById('rom-description');
roms.forEach((singleRom) => {
  romSelectionInput.options.add(new Option(singleRom, singleRom));
});

romSelectionInput.addEventListener('change', (event) => {
  const selectedRomName = event.target.value;
  const xhrRequestForRom = new XMLHttpRequest();
  xhrRequestForRom.responseType = 'arraybuffer';
  xhrRequestForRom.open('GET', `../roms/${selectedRomName}.bin`, true);
  xhrRequestForRom.onload = (result) => {
    const romBinDump = result.target.response;
    const romBinDumpConvertedToUintArray = new Uint8Array(romBinDump);
    emulator.loadGame(romBinDumpConvertedToUintArray);
    isEmulationRunning = true;
  };
  const xhrRequestForRomDescription = new XMLHttpRequest();
  xhrRequestForRomDescription.responseType = 'text';
  xhrRequestForRomDescription.open('GET', `../roms/${selectedRomName}.txt`, true);
  xhrRequestForRomDescription.onload = (result) => {
    const romDescription = result.target.response;
    romDescriptionText.textContent = romDescription;
  };
  xhrRequestForRom.send();
  xhrRequestForRomDescription.send();
});

const emulationStartStopButton = document.getElementById('btn-start-stop-emulation');
emulationStartStopButton.addEventListener('click', () => {
  isEmulationRunning = !isEmulationRunning;
});

const rendererCanvasSizeRatioInput = document.getElementById('screen-ratio-size');
rendererCanvasSizeRatioInput.addEventListener('change', (event) => {
  let enteredNumber = Number(event.target.value);
  if (enteredNumber > 10) {
    enteredNumber = 10;
  }
  if (enteredNumber < 5) {
    enteredNumber = 5;
  }
  // if value is different
  if (enteredNumber !== scale) {
    scale = enteredNumber;
    initializeRenderCanvas();
  }
});

const emulationSpeedInput = document.getElementById('emulation-speed');
emulationSpeedInput.addEventListener('change', (event) => {
  let enteredNumber = Number(event.target.value);
  if (enteredNumber > 20) {
    enteredNumber = 20;
  }
  if (enteredNumber < 1) {
    enteredNumber = 1;
  }
  // if value is different
  if (enteredNumber !== scale) {
    cyclesPerRender = enteredNumber;
  }
});

const gameLoop = () => {
  if (isEmulationRunning) {
    for (let i = 0; i < cyclesPerRender; i += 1) {
      emulator.executeCycle();
    }
  }

  if (emulator.cpu.drawFlag) {
    const pixelsToDraw = emulator.graphics.pixelMap;
    renderer.render(pixelsToDraw);
    emulator.cpu.drawFlag = false;
  }

  emulator.executeTimers();

  requestAnimationFrame(gameLoop);
};

gameLoop();
