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

  // Load game data into memory, starting at 0x200 memory location
  loadGameToMemory = (gameData) => {
    for (let gameMemory = 0; gameMemory < gameData.length; gameMemory += 1) {
      this.memoryBank[0x200 + gameMemory] = gameData[gameMemory];
    }
  }

  getValueAtAddress = (address) => {
    if (address < 0 || address >= this.memoryBank.length) {
      console.error(`[memory][getValueAtAddress][out-of-bounds] ${address} value is out of bounds`);
      return null;
    }
    return this.memoryBank[address];
  }

  storeValueAtAddress = (address, value) => {
    if (address < 0 || address >= this.memoryBank.length) {
      console.error(`[memory][storeValueAtAddress][out-of-bounds] ${address} value is out of bounds`);
      return false;
    }
    this.memoryBank[address] = value;
    return true;
  }
}

export default Memory;

