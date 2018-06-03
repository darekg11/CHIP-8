class CanvasRenderer {
  constructor(canvas, width, height, scale) {
    this.canvasContext = canvas.getContext('2d');
    this.canvas = canvas;
    this.scale = scale;
    this.width = width;
    this.height = height;
    this.canvas.width = this.scale * this.width;
    this.canvas.height = this.scale * this.height;
    this.clearScreen();
  }

  clearScreen = () => {
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, this.width * this.scale, this.height * this.scale);
  }

  render = (pixelMap) => {
    this.clearScreen();
    for (let cnt = 0; cnt < pixelMap.length; cnt += 1) {
      // (cnt % width)
      // (10 % 64) = 10
      // (65 % 64) = 1
      // Will wrap around
      const x = (cnt % this.width) * this.scale;
      // (cnt / i)
      // (63 / 64) = 0
      // (64 / 64) = 1
      // Will wrap in height
      const y = Math.floor(cnt / this.width) * this.scale;
      this.canvasContext.fillStyle = pixelMap[cnt] === 1 ? 'white' : 'black';
      this.canvasContext.fillRect(x, y, this.scale, this.scale);
    }
  }
}
export default CanvasRenderer;
