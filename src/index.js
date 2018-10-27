import CPU from './emulator/cpu';
import Memory from './emulator/memory';
import Graphics from './emulator/graphics';
import Input from './emulator/input';
import CanvasRenderer from './emulator/canvasRenderer';
import BeepSoundPlayer from './emulator/beepSoundPlayer';

const pongBinDump = [
  0x6a,
  0x02,
  0x6b,
  0x0c,
  0x6c,
  0x3f,
  0x6d,
  0x0c,
  0xa2,
  0xea,
  0xda,
  0xb6,
  0xdc,
  0xd6,
  0x6e,
  0x00,
  0x22,
  0xd4,
  0x66,
  0x03,
  0x68,
  0x02,
  0x60,
  0x60,
  0xf0,
  0x15,
  0xf0,
  0x07,
  0x30,
  0x00,
  0x12,
  0x1a,
  0xc7,
  0x17,
  0x77,
  0x08,
  0x69,
  0xff,
  0xa2,
  0xf0,
  0xd6,
  0x71,
  0xa2,
  0xea,
  0xda,
  0xb6,
  0xdc,
  0xd6,
  0x60,
  0x01,
  0xe0,
  0xa1,
  0x7b,
  0xfe,
  0x60,
  0x04,
  0xe0,
  0xa1,
  0x7b,
  0x02,
  0x60,
  0x1f,
  0x8b,
  0x02,
  0xda,
  0xb6,
  0x60,
  0x0c,
  0xe0,
  0xa1,
  0x7d,
  0xfe,
  0x60,
  0x0d,
  0xe0,
  0xa1,
  0x7d,
  0x02,
  0x60,
  0x1f,
  0x8d,
  0x02,
  0xdc,
  0xd6,
  0xa2,
  0xf0,
  0xd6,
  0x71,
  0x86,
  0x84,
  0x87,
  0x94,
  0x60,
  0x3f,
  0x86,
  0x02,
  0x61,
  0x1f,
  0x87,
  0x12,
  0x46,
  0x02,
  0x12,
  0x78,
  0x46,
  0x3f,
  0x12,
  0x82,
  0x47,
  0x1f,
  0x69,
  0xff,
  0x47,
  0x00,
  0x69,
  0x01,
  0xd6,
  0x71,
  0x12,
  0x2a,
  0x68,
  0x02,
  0x63,
  0x01,
  0x80,
  0x70,
  0x80,
  0xb5,
  0x12,
  0x8a,
  0x68,
  0xfe,
  0x63,
  0x0a,
  0x80,
  0x70,
  0x80,
  0xd5,
  0x3f,
  0x01,
  0x12,
  0xa2,
  0x61,
  0x02,
  0x80,
  0x15,
  0x3f,
  0x01,
  0x12,
  0xba,
  0x80,
  0x15,
  0x3f,
  0x01,
  0x12,
  0xc8,
  0x80,
  0x15,
  0x3f,
  0x01,
  0x12,
  0xc2,
  0x60,
  0x20,
  0xf0,
  0x18,
  0x22,
  0xd4,
  0x8e,
  0x34,
  0x22,
  0xd4,
  0x66,
  0x3e,
  0x33,
  0x01,
  0x66,
  0x03,
  0x68,
  0xfe,
  0x33,
  0x01,
  0x68,
  0x02,
  0x12,
  0x16,
  0x79,
  0xff,
  0x49,
  0xfe,
  0x69,
  0xff,
  0x12,
  0xc8,
  0x79,
  0x01,
  0x49,
  0x02,
  0x69,
  0x01,
  0x60,
  0x04,
  0xf0,
  0x18,
  0x76,
  0x01,
  0x46,
  0x40,
  0x76,
  0xfe,
  0x12,
  0x6c,
  0xa2,
  0xf2,
  0xfe,
  0x33,
  0xf2,
  0x65,
  0xf1,
  0x29,
  0x64,
  0x14,
  0x65,
  0x00,
  0xd4,
  0x55,
  0x74,
  0x15,
  0xf2,
  0x29,
  0xd4,
  0x55,
  0x00,
  0xee,
  0x80,
  0x80,
  0x80,
  0x80,
  0x80,
  0x80,
  0x80,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
];

const HEIGHT = 32;
const WIDTH = 64;
const SCALE = 5;
const CYCLES_PER_RENDER = 10;
let isEmulationRunning = false;

class Emulator {
  constructor() {
    this.memory = new Memory();
    this.graphics = new Graphics(WIDTH, HEIGHT);
    this.input = new Input();
    this.sound = new BeepSoundPlayer();
    this.cpu = new CPU(this.memory, this.graphics, this.input, this.sound);
  }

  loadGame = () => {
    this.cpu.loadGameRom(pongBinDump);
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

const emulationStartStopButton = document.getElementById('btn-start-stop-emulation');
emulationStartStopButton.addEventListener('click', () => {
  isEmulationRunning = !isEmulationRunning;
});

const canvas = document.getElementById('chip8-canvas');
const renderer = new CanvasRenderer(canvas, WIDTH, HEIGHT, SCALE);
const emulator = new Emulator();
hookUpControlls(emulator);
renderer.clearScreen();
emulator.loadGame();

const gameLoop = () => {
  if (isEmulationRunning) {
    for (let i = 0; i < CYCLES_PER_RENDER; i += 1) {
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
