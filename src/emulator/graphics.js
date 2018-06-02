class Graphics {
  constructor(width, height) {
    // The graphics of the Chip 8 are black and white and the screen has a total of 2048 pixels (64 x 32).
    // This can easily be implemented using an array that hold the pixel state (1 or 0)
    this.pixelMap = new Array(width * height);
    this.reset();
  }

  reset() {
    for (let memoryCnt = 0; memoryCnt < this.pixelMap.length; memoryCnt += 1) {
      this.pixelMap[memoryCnt] = 0;
    }
  }

  clearScreen() {
    this.reset();
  }
}

export default Graphics;

