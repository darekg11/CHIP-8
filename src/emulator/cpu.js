import OP_CODES from './opcodes';

const toHexString = numberToConvert => Number(numberToConvert).toString(16).toUpperCase();

class CPU {
  constructor(memoryController, graphicsController, inputController) {
    this.memoryController = memoryController;
    this.graphicsController = graphicsController;
    this.inputController = inputController;
    // The Chip 8 has 15 8-bit general purpose registers named V0,V1 up to VE.
    // The 16th register is used  for the ‘carry flag’
    this.v = new Array(16);
    // Index register
    this.i = 0;
    // Program Counter [start executing at 0x200 address]
    this.pc = 0x200;
    // The stack is an array of 16 16-bit values
    // used to store the address that the interpreter shoud return to when finished with a subroutine.
    // Chip-8 allows for up to 16 levels of nested subroutines.
    this.stack = new Array(16);
    // Stack pointer
    this.sp = 0;
    // The delay timer is active whenever the delay timer register (DT) is non-zero.
    // This timer does nothing more than subtract 1 from the value of DT at a rate of 60Hz.
    // When DT reaches 0, it deactivates.
    this.delayTimer = 0;
    // The sound timer is active whenever the sound timer register (ST) is non-zero.
    // This timer also decrements at a rate of 60Hz, however, as long as ST's value is greater than zero
    // the Chip-8 buzzer will sound. When ST reaches zero, the sound timer deactivates.
    // The sound produced by the Chip-8 interpreter has only one tone.
    // The frequency of this tone is decided by the author of the interpreter.
    this.soundTimer = 0;

    // Draw flag used indicating when display should be refreshed
    this.drawFlag = false;
    this.reset();
  }

  reset = () => {
    this.memoryController.reset();
    this.graphicsController.reset();
    this.inputController.reset();
    // reset V registers
    for (let vRegCounter = 0; vRegCounter < this.v.length; vRegCounter += 1) {
      this.v[vRegCounter] = 0;
    }

    // reset Index Register
    this.i = 0;

    // reset Program Counter [start executing at 0x200 address]
    this.pc = 0x200;

    // reset stack
    for (let stackCounter = 0; stackCounter < this.stack.length; stackCounter += 1) {
      this.stack[stackCounter] = 0;
    }

    // reset stack pointer
    this.sp = 0;

    // reset delayTimer
    this.delayTimer = 0;

    // reset soundTimer
    this.soundTimer = 0;

    // reset draw flag
    this.drawFlag = false;
  }

  loadGameRom = (romData) => {
    this.reset();
    this.memoryController.loadGameToMemory(romData);
  }

  executeCycle = () => {
    // Data is stored in an array in which each address contains one byte.
    // As one opcode is 2 bytes long, we will need to fetch two successive bytes and merge them to get the
    // actual opcode.
    const firstPartOfOpcode = this.memoryController.getValueAtAddress(this.pc);
    const secondPartOfOpcode = this.memoryController.getValueAtAddress(this.pc + 1);
    if (!firstPartOfOpcode || !secondPartOfOpcode) {
      console.error(`[cpu][executeCycle] Op code could not be fetched. PC is at: ${this.pc}`);
    } else {
      // Shift 8 bits to to left = add eight zero bits
      // 10100010 => 1010001000000000
      const firstPartOfOpcodeShifted = firstPartOfOpcode << 8;
      // Merging both opcodes
      // 1010001000000000 | // 0xA200
      //         11110000 = // 0xF0 (0x00F0)
      // -----------------------------------
      // 1010001011110000   // 0xA2F0
      const opCodeFull = firstPartOfOpcodeShifted | secondPartOfOpcode;
      // Use first 4 bytes to determine op code to execute
      // 1010001011110000 & 0xF000 = 1010 0000 0000 000 (A000)
      // Shit 12 bits to right in order to drop not required 0s
      const opCodeCommand = (opCodeFull & 0xF000) >> 12;

      console.log(`[cpu][executeCycle] Fetched OP Code Full [hex]: ${toHexString(opCodeFull)} `);
      console.log(`[cpu][executeCycle] Fetched OP Code Instruction [hex]: ${toHexString(opCodeCommand)}`);

      switch (opCodeCommand) {
        case OP_CODES['LD-I']: {
          const valueToSetToIRegister = opCodeFull & 0x0FFF;
          this.i = valueToSetToIRegister;
          console.log(`[cpu][executeCycle][LD-I] Register I will be set to: ${toHexString(valueToSetToIRegister)}`);
          break;
        }
        default: {
          break;
        }
      }

      // Increase Program Counter by two (fetching two memory address in order to
      // constuct single op code) every time cycle is executed
      this.pc += 2;
    }
  }
}

export default CPU;

