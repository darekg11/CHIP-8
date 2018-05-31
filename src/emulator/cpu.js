class CPU {
  constructor(memoryController) {
    this.memoryController = memoryController;
    this.reset();
  }

  reset = () => {
    this.memoryController.reset();
  }
}

export default CPU;

