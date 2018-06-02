import CPU from './emulator/cpu';
import Memory from './emulator/memory';
import Graphics from './emulator/graphics';
import Input from './emulator/input';

// const pongBinDump = [
//   0x6A, 0x02, 0x6B, 0x0C, 0x6C, 0x3F,
//   0x6D, 0x0C, 0xA2, 0xEA, 0xDA, 0xB6,
//   0xDC, 0xD6, 0x6E, 0x00, 0x22, 0xD4,
//   0x66, 0x03, 0x68, 0x02, 0x60, 0x60,
//   0xF0, 0x15, 0xF0, 0x07, 0x30, 0x00,
//   0x12, 0x1A, 0xC7, 0x17, 0x77, 0x08,
//   0x69, 0xFF, 0xA2, 0xF0, 0xD6, 0x71,
//   0xA2, 0xEA, 0xDA, 0xB6, 0xDC, 0xD6,
//   0x60, 0x01, 0xE0, 0xA1, 0x7B, 0xFE,
//   0x60, 0x04, 0xE0, 0xA1, 0x7B, 0x02,
//   0x60, 0x1F, 0x8B, 0x02, 0xDA, 0xB6,
//   0x60, 0x0C, 0xE0, 0xA1, 0x7D, 0xFE,
//   0x60, 0x0D, 0xE0, 0xA1, 0x7D, 0x02,
//   0x60, 0x1F, 0x8D, 0x02, 0xDC, 0xD6,
//   0xA2, 0xF0, 0xD6, 0x71, 0x86, 0x84,
//   0x87, 0x94, 0x60, 0x3F, 0x86, 0x02,
//   0x61, 0x1F, 0x87, 0x12, 0x46, 0x02,
//   0x12, 0x78, 0x46, 0x3F, 0x12, 0x82,
//   0x47, 0x1F, 0x69, 0xFF, 0x47, 0x00,
//   0x69, 0x01, 0xD6, 0x71, 0x12, 0x2A,
//   0x68, 0x02, 0x63, 0x01, 0x80, 0x70,
//   0x80, 0xB5, 0x12, 0x8A, 0x68, 0xFE,
//   0x63, 0x0A, 0x80, 0x70, 0x80, 0xD5,
//   0x3F, 0x01, 0x12, 0xA2, 0x61, 0x02,
//   0x80, 0x15, 0x3F, 0x01, 0x12, 0xBA,
//   0x80, 0x15, 0x3F, 0x01, 0x12, 0xC8,
//   0x80, 0x15, 0x3F, 0x01, 0x12, 0xC2,
//   0x60, 0x20, 0xF0, 0x18, 0x22, 0xD4,
//   0x8E, 0x34, 0x22, 0xD4, 0x66, 0x3E,
//   0x33, 0x01, 0x66, 0x03, 0x68, 0xFE,
//   0x33, 0x01, 0x68, 0x02, 0x12, 0x16,
//   0x79, 0xFF, 0x49, 0xFE, 0x69, 0xFF,
//   0x12, 0xC8, 0x79, 0x01, 0x49, 0x02,
//   0x69, 0x01, 0x60, 0x04, 0xF0, 0x18,
//   0x76, 0x01, 0x46, 0x40, 0x76, 0xFE,
//   0x12, 0x6C, 0xA2, 0xF2, 0xFE, 0x33,
//   0xF2, 0x65, 0xF1, 0x29, 0x64, 0x14,
//   0x65, 0x00, 0xD4, 0x55, 0x74, 0x15,
//   0xF2, 0x29, 0xD4, 0x55, 0x00, 0xEE,
//   0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
//   0x80, 0x00, 0x00, 0x00, 0x00, 0x00,
// ];

const testProgram = [
  0xA2, 0xF0,
];

class Emulator {
  constructor() {
    this.memory = new Memory();
    this.graphics = new Graphics(32, 64);
    this.input = new Input();
    this.cpu = new CPU(this.memory, this.graphics, this.input);
  }

  loadGame = () => {
    this.cpu.loadGameRom(testProgram);
  }

  executeCycle = () => {
    this.cpu.executeCycle();
  }
}

// const canvas = document.querySelector('#chip8-canvas');
const emulator = new Emulator();
emulator.loadGame();
emulator.executeCycle();
