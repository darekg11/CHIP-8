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

      const vRegisterNumber = (opCodeFull & 0x0F00) >> 8;
      const yRegisterNumber = (opCodeFull & 0x00F0) >> 4;

      console.log(`[cpu][executeCycle] Fetched OP Code Full [hex]: ${toHexString(opCodeFull)} `);
      console.log(`[cpu][executeCycle] Fetched OP Code Instruction [hex]: ${toHexString(opCodeCommand)}`);

      switch (opCodeCommand) {
        case OP_CODES.LD_I: {
          const valueToSetToIRegister = opCodeFull & 0x0FFF;
          this.i = valueToSetToIRegister;
          console.log(`[cpu][executeCycle][LD-I] Register I will be set to: ${toHexString(valueToSetToIRegister)}`);
          this.pc += 2;
          break;
        }
        case OP_CODES.CLS_RET: {
          switch (opCodeFull) {
            case OP_CODES.CLS: {
              console.log('[cpu][executeCycle][CLS] Clearing screen');
              this.graphicsController.clearScreen();
              this.drawFlag = true;
              this.pc += 2;
              break;
            }
            case OP_CODES.RET: {
              console.log('[cpu][executeCycle][RET] Returning from subroutine');
              this.sp -= 1;
              this.pc = this.stack[this.sp];
              this.pc += 2; // Not sure 100%
              break;
            }
            default: {
              console.error(`[cpu][executeCycle][CLS/RET] Unknown OP Code. Full value ${toHexString(opCodeFull)}`);
              break;
            }
          }
          break;
        }
        case OP_CODES.JP: {
          const jmpAddress = opCodeFull & 0x0FFF;
          this.pc = jmpAddress;
          console.log(`[cpu][executeCycle][JP] Jumping to address: ${toHexString(jmpAddress)}`);
          break;
        }
        case OP_CODES.CALL: {
          const callEntryAddress = opCodeFull & 0x0FFF;
          // Save current PC address to stack to know where to return when subroutine finishes
          this.stack[this.sp] = this.pc;
          // Increase stack pointer to write new RETURN address at new array index to not overwrite previous one
          this.sp += 1;
          this.pc = callEntryAddress;
          console.log(`[cpu][executeCycle][CALL] Stack Pointer set to: ${this.sp}`);
          console.log(`[cpu][executeCycle][CALL] Return address pushed on stack: ${toHexString(this.sp[this.sp - 1])}`);
          console.log(`[cpu][executeCycle][CALL] Jumping to address: ${toHexString(callEntryAddress)}`);
          break;
        }
        case OP_CODES.SE_VX_BYTE: {
          // 3xkk, get X, shift 8 bits to the right to get register number
          // 0000 1010 0000 000 -> 1010
          const valueToCompare = opCodeFull & 0x00FF;
          console.log(`[cpu][executeCycle][SE_VX_BYTE] V Register: ${vRegisterNumber}`);
          console.log(`[cpu][executeCycle][SE_VX_BYTE] Value to compare: ${toHexString(valueToCompare)}`);
          if (this.v[vRegisterNumber] === valueToCompare) {
            console.log('[cpu][executeCycle][SE_VX_BYTE] Skipping instruction');
            this.pc += 4;
          } else {
            this.pc += 2;
          }
          break;
        }
        case OP_CODES.SNE_VX_BYTE: {
          // 4xkk, get X, shift 8 bits to the right to get register number
          // 0000 1010 0000 000 -> 1010
          const valueToCompare = opCodeFull & 0x00FF;
          console.log(`[cpu][executeCycle][SNE_VX_BYTE] V Register: ${vRegisterNumber}`);
          console.log(`[cpu][executeCycle][SNE_VX_BYTE] Value to compare: ${toHexString(valueToCompare)}`);
          if (this.v[vRegisterNumber] !== valueToCompare) {
            console.log('[cpu][executeCycle][SNE_VX_BYTE] Skipping instruction');
            this.pc += 4;
          } else {
            this.pc += 2;
          }
          break;
        }
        case OP_CODES.SE_VX_VY: {
          console.log(`[cpu][executeCycle][OP_CODES.SE_VX_VY] V Register: ${vRegisterNumber}`);
          console.log(`[cpu][executeCycle][OP_CODES.SE_VX_VY] V Register: ${yRegisterNumber}`);
          if (this.v[vRegisterNumber] === this.v[yRegisterNumber]) {
            console.log('[cpu][executeCycle][SE_VX_VY] Skipping instruction');
            this.pc += 4;
          } else {
            this.pc += 2;
          }
          break;
        }
        case OP_CODES.LD_VX_BYTE: {
          const valueToInsert = opCodeFull & 0x00FF;
          this.v[vRegisterNumber] = valueToInsert;
          console.log(`[cpu][executeCycle][OP_CODES.LD_VX_BYTE] V Register: ${vRegisterNumber}`);
          console.log(`[cpu][executeCycle][OP_CODES.LD_VX_BYTE] Value to insert: ${toHexString(valueToInsert)}`);
          this.pc += 2;
          break;
        }
        case OP_CODES.ADD_VX_BYTE: {
          const valueToAdd = opCodeFull & 0x00FF;
          const valueAtRegister = this.v[vRegisterNumber];
          let sum = valueAtRegister + valueToAdd;
          // check for overflow
          if (sum > 255) {
            sum -= 256;
          }
          this.v[vRegisterNumber] = sum;
          console.log(`[cpu][executeCycle][OP_CODES.ADD_VX_BYTE] V Register: ${vRegisterNumber}`);
          console.log(`[cpu][executeCycle][OP_CODES.ADD_VX_BYTE] Value to insert: ${sum}`);
          this.pc += 2;
          break;
        }
        case OP_CODES.LD_OR_AND_XOR_ADD_SUB_SHR_SUBN_SHL: {
          const directOpCode = (opCodeFull & 0x000F) << 12;
          console.log(`[cpu][executeCycle][OP_CODES.LD_OR_AND_XOR_ADD_SUB_SHR_SUBN_SHL] Direct OP Code: ${directOpCode}`);
          switch (directOpCode) {
            case OP_CODES.LD_VX_VY: {
              this.v[vRegisterNumber] = this.v[yRegisterNumber];
              console.log(`[cpu][executeCycle][OP_CODES.LD_VX_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.LD_VX_VY] V Register: ${yRegisterNumber}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.OR_VX_VY: {
              this.v[vRegisterNumber] = this.v[vRegisterNumber] | this.v[yRegisterNumber];
              console.log(`[cpu][executeCycle][OP_CODES.OR_VX_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.OR_VX_VY] V Register: ${yRegisterNumber}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.AND_VX_VY: {
              this.v[vRegisterNumber] = this.v[vRegisterNumber] & this.v[yRegisterNumber];
              console.log(`[cpu][executeCycle][OP_CODES.AND_VX_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.AND_VX_VY] V Register: ${yRegisterNumber}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.XOR_VX_VY: {
              this.v[vRegisterNumber] = this.v[vRegisterNumber] ^ this.v[yRegisterNumber];
              console.log(`[cpu][executeCycle][OP_CODES.XOR_VX_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.XOR_VX_VY] V Register: ${yRegisterNumber}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.ADD_VX_VY: {
              let sum = this.v[vRegisterNumber] + this.v[yRegisterNumber];
              // check for overflow
              if (sum > 255) {
                console.log('[cpu][executeCycle][OP_CODES.ADD_VX_VY] Overflow detected. VF SET TO 1');
                // SET CARRY FLAG TO 1
                this.v[0xF] = 1;
                sum -= 256;
              } else {
                console.log('[cpu][executeCycle][OP_CODES.ADD_VX_VY] No Overflow detected. VF SET TO 0');
                // UNSET CARRY FLAG
                this.v[0xF] = 0;
              }
              this.v[vRegisterNumber] = sum;
              console.log(`[cpu][executeCycle][OP_CODES.ADD_VX_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.ADD_VX_VY] Value to insert: ${sum}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.SUB_VY_VY: {
              // Carry flag
              this.v[0xF] = this.v[vRegisterNumber] > this.v[yRegisterNumber] ? 1 : 0;
              let diff = this.v[vRegisterNumber] - this.v[yRegisterNumber];
              // check for underflow
              if (diff < 0) {
                diff += 256;
              }
              this.v[vRegisterNumber] = diff;
              console.log(`[cpu][executeCycle][OP_CODES.SUB_VY_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.SUB_VY_VY] Value to insert: ${diff}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.SHR_VX_VY: {
              this.v[0xF] = this.v[yRegisterNumber] & 0x1;
              this.v[vRegisterNumber] = this.v[yRegisterNumber] >> 1;
              console.log(`[cpu][executeCycle][OP_CODES.SHR_VX_VY] Shifted V Register: ${yRegisterNumber} by one to right, result saved in V Register: ${vRegisterNumber}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.SUBN_VX_VY: {
              // Carry flag
              this.v[0xF] = this.v[yRegisterNumber] > this.v[vRegisterNumber] ? 1 : 0;
              let diff = this.v[yRegisterNumber] - this.v[vRegisterNumber];
              // check for underflow
              if (diff < 0) {
                diff += 256;
              }
              this.v[vRegisterNumber] = diff;
              console.log(`[cpu][executeCycle][OP_CODES.SUBN_VX_VY] V Register: ${vRegisterNumber}`);
              console.log(`[cpu][executeCycle][OP_CODES.SUBN_VX_VY] Value to insert: ${diff}`);
              this.pc += 2;
              break;
            }
            case OP_CODES.SHL_VX_VY: {
              // 0x80 = 10000000
              // We need to acquire the most signigicant bit
              this.v[0xF] = this.v[yRegisterNumber] & 0x80;
              let registerValueAfterShifting = this.v[yRegisterNumber] << 1;
              // check for overflow
              // shifting left is the same as multiply by two
              if (registerValueAfterShifting > 255) {
                registerValueAfterShifting -= 256;
              }
              this.v[vRegisterNumber] = registerValueAfterShifting;
              console.log(`[cpu][executeCycle][OP_CODES.SHL_VX_VY] Shifted V Register: ${yRegisterNumber} by one to left, result saved in V Register: ${vRegisterNumber}`);
              this.pc += 2;
              break;
            }
            default: {
              console.error(`[cpu][executeCycle][LD/OR/AND/XOR/ADD/SUB/SHR/SUBN/SHL] Unknown OP Code. Full value ${toHexString(opCodeFull)}`);
              break;
            }
          }
          break;
        }
        case OP_CODES.SNE_VX_VY: {
          const registerXValue = this.v[vRegisterNumber];
          const registerYValue = this.v[yRegisterNumber];
          console.log(`[cpu][executeCycle][SE_VX_BYTE] V Register Value: ${toHexString(registerXValue)}`);
          console.log(`[cpu][executeCycle][SE_VX_BYTE] Y Register Value: ${toHexString(registerYValue)}`);
          if (registerXValue !== registerYValue) {
            console.log('[cpu][executeCycle][SNE_VX_VY] Skipping instruction');
            this.pc += 4;
          } else {
            this.pc += 2;
          }
          break;
        }
        case OP_CODES.JP_V0: {
          const jmpAddress = opCodeFull & 0x0FFF;
          this.pc = this.v[0] + jmpAddress;
          console.log(`[cpu][executeCycle][JP_V0] Jumping to address: ${toHexString(this.pc)}`);
          this.pc += 2;
          break;
        }
        case OP_CODES.RND_VX_BYTE: {
          const randomNumber = Math.floor(Math.random() * 256);
          const valueToAndWith = opCodeFull & 0x00FF;
          const result = randomNumber & valueToAndWith;
          this.v[vRegisterNumber] = result;
          console.log(`[cpu][executeCycle][RND_VX_BYTE] Random number: ${randomNumber}`);
          console.log(`[cpu][executeCycle][RND_VX_BYTE] Value to AND with: ${valueToAndWith}`);
          console.log(`[cpu][executeCycle][RND_VX_BYTE] Result: ${result}`);
          this.pc += 2;
          break;
        }
        default: {
          console.error(`[cpu][executeCycle] Unknown OP Code. Full value ${toHexString(opCodeFull)} Command: ${toHexString(opCodeCommand)}`);
          break;
        }
      }
    }
  }
}

export default CPU;

