import CPU from './emulator/cpu';
import Memory from './emulator/memory';

class Emulator {
  constructor() {
    this.memory = new Memory();
    this.cpu = new CPU(this.memory);
  }
}

// const canvas = document.querySelector('#chip8-canvas');
const emulator = new Emulator();
console.log(emulator);
