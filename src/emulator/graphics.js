class Graphics {
  constructor(width, height) {
    // The graphics of the Chip 8 are black and white and the screen has a total of 2048 pixels (64 x 32).
    // This can easily be implemented using an array that hold the pixel state (1 or 0)
    this.pixelMap = new Array(width * height);
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset = () => {
    for (let memoryCnt = 0; memoryCnt < this.pixelMap.length; memoryCnt += 1) {
      this.pixelMap[memoryCnt] = 0;
    }
  }

  clearScreen = () => {
    this.reset();
  }

  // returns true if pixel was overwritten
  // false otherwise
  setPixel = (x, y) => {
    let xOverflowProtected = x;
    let yOverflowProtected = y;

    if (xOverflowProtected > this.width) {
      xOverflowProtected -= this.width;
    }
    if (xOverflowProtected < 0) {
      xOverflowProtected += this.width;
    }

    if (yOverflowProtected > this.height) {
      yOverflowProtected -= this.height;
    }
    if (yOverflowProtected < 0) {
      yOverflowProtected += this.height;
    }

    const destinationGraphicLocation = xOverflowProtected + (yOverflowProtected * this.width);
    const willOverlap = this.pixelMap[destinationGraphicLocation] === 1;
    this.pixelMap[destinationGraphicLocation] ^= 1;
    return willOverlap;
  }

  getGraphicsMemoryMap = () => this.pixelMap;
}

export default Graphics;

