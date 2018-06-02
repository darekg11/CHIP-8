class Input {
  constructor() {
    // Chip 8 has a HEX based keypad (0x0-0xF), you can use an array to store the current state of the key.
    this.inputMap = new Array(16);
    this.reset();
  }

  reset() {
    for (let memoryCnt = 0; memoryCnt < this.inputMap.length; memoryCnt += 1) {
      this.inputMap[memoryCnt] = 0;
    }
  }
}

export default Input;
