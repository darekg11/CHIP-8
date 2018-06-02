import characters from './fonts';

class Memory {
  constructor() {
    // CHIP-8 has 0x1000 memory size (4096 bytes = 4KB)
    const buffer = new ArrayBuffer(0x1000);
    // Use Unsigned 8 bit ints as internal memory storage
    this.memoryBank = new Uint8Array(buffer);
    this.reset();
  }

  reset() {
    // Clear every bit of memory
    for (let memCnt = 0; memCnt < this.memoryBank.length; memCnt += 1) {
      this.memoryBank[memCnt] = 0;
    }

    // Write fonts hexcodes to beginning of memory
    for (let memCnt = 0; memCnt < characters.length; memCnt += 1) {
      this.memoryBank[memCnt] = characters[memCnt];
    }
  }
}

export default Memory;
