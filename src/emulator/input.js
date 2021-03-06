import Logger from '../logger';

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

  pressKey = (keyAddress) => {
    if (keyAddress < 0 || keyAddress > 0xF) {
      Logger.logError(`Key Address: ${keyAddress} is outside of input mapping size!`);
    } else {
      this.inputMap[keyAddress] = 1;
    }
  }

  releaseKey = (keyAddress) => {
    if (keyAddress < 0 || keyAddress > 0xF) {
      Logger.logError(`Key Address: ${keyAddress} is outside of input mapping size!`);
    } else {
      this.inputMap[keyAddress] = 0;
    }
  }

  isKeyPressed = (keyAddress) => {
    if (keyAddress < 0 || keyAddress >= 0xF) {
      return false;
    }
    return this.inputMap[keyAddress] === 1;
  }

  isAnyKeyPressed = () => {
    for (let keyMapCnt = 0; keyMapCnt < this.inputMap.length; keyMapCnt += 1) {
      if (this.inputMap[keyMapCnt] === 1) {
        return keyMapCnt;
      }
    }
    return false;
  }
}

export default Input;
