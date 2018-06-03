const OP_CODES = {
  // LD I, addr
  // Set I = nnn.
  // The value of register I is set to nnn.
  LD_I: 0xA,

  // CLS / RET
  // Both start with 0 as first 4 bits
  CLS_RET: 0x0,

  // Clear the display.
  CLS: 0x00E0,

  // Return from a subroutine.
  // The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
  RET: 0x00EE,

  // 1nnn
  // Jump to location nnn.
  // The interpreter sets the program counter to nnn.
  JP: 0x1,

  // 2nnn
  // Call subroutine at nnn.
  // The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
  CALL: 0x2,

  // 3xkk - SE Vx, byte
  // Skip next instruction if Vx = kk.
  // The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
  SE_VX_BYTE: 0x3,

  // 4xkk - SNE Vx, byte
  // Skip next instruction if Vx != kk.
  // The interpreter compares register Vx to kk, and if they are not equal, increments the program counter by 2.
  SNE_VX_BYTE: 0x4,

  // 5xy0 - SE Vx, Vy
  // Skip next instruction if Vx = Vy.
  // The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
  SE_VX_VY: 0x5,

  // 6xkk - LD Vx, byte
  // Set Vx = kk.
  // The interpreter puts the value kk into register Vx.
  LD_VX_BYTE: 0x6,

  // 7xkk - ADD Vx, byte
  // Set Vx = Vx + kk.
  // Adds the value kk to the value of register Vx, then stores the result in Vx.
  ADD_VX_BYTE: 0x7,

  // LR / OR / AND / XOR / ADD/ SUB / SHR / SUBN / SHL
  // All start with 8 at first 4 bits
  LD_OR_AND_XOR_ADD_SUB_SHR_SUBN_SHL: 0x8,

  // 8xy0 - LD Vx, Vy
  // Set Vx = Vy.
  // Stores the value of register Vy in register Vx.
  LD_VX_VY: 0x0,

  // 8xy1 - OR Vx, Vy
  // Set Vx = Vx OR Vy.
  // Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx.
  OR_VX_VY: 0x1,

  // 8xy2 - AND Vx, Vy
  // Set Vx = Vx AND Vy.
  // Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx.
  AND_VX_VY: 0x2,

  // 8xy3 - XOR Vx, Vy
  // Set Vx = Vx XOR Vy.
  // Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx.
  XOR_VX_VY: 0x3,

  // 8xy4 - ADD Vx, Vy
  // Set Vx = Vx + Vy, set VF = carry.
  // The values of Vx and Vy are added together. If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0.
  // Only the lowest 8 bits of the result are kept, and stored in Vx.
  ADD_VX_VY: 0x4,

  // 8xy5 - SUB Vx, Vy
  // Set Vx = Vx - Vy, set VF = NOT borrow.
  // If Vx > Vy, then VF is set to 1, otherwise 0.
  // Then Vy is subtracted from Vx, and the results stored in Vx.
  SUB_VY_VY: 0x5,

  // 8xy6 - SHR Vx, Vy
  // Set Vx = Vx SHR 1.
  // If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0.
  // Then Vx is divided by 2.
  SHR_VX_VY: 0x6,

  // 8xy7 - SUBN Vx, Vy
  // Set Vx = Vy - Vx, set VF = NOT borrow.
  // If Vy > Vx, then VF is set to 1, otherwise 0.
  // Then Vx is subtracted from Vy, and the results stored in Vx.
  SUBN_VX_VY: 0x7,

  // 8xyE - SHL Vx, Vy
  // Set Vx = Vx SHL 1.
  // If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0.
  // Then Vx is multiplied by 2.
  SHL_VX_VY: 0xE,

  // Skip next instruction if Vx != Vy.
  // The values of Vx and Vy are compared, and if they are not equal,
  // the program counter is increased by 2.
  SNE_VX_VY: 0x9,

  // Bnnn - JP V0, addr
  // Jump to location nnn + V0.
  // The program counter is set to nnn plus the value of V0.
  JP_V0: 0xB,

  // Cxkk - RND Vx, byte
  // Set Vx = random byte AND kk.
  // The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk.
  // The results are stored in Vx
  RND_VX_BYTE: 0xC,
};

export default OP_CODES;
