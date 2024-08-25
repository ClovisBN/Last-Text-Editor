class EventManager {
  constructor(canvas, keyController, mouseHandler, cursor) {
    this.canvas = canvas;
    this.keyController = keyController;
    this.mouseHandler = mouseHandler;
    this.cursor = cursor;
  }

  attachEvents() {
    document.addEventListener("keydown", (e) =>
      this.keyController.handleKeydown(e)
    );
    document.addEventListener("mousedown", (e) =>
      this.mouseHandler.handleMouseDown(e)
    );
    document.addEventListener("mousemove", (e) =>
      this.mouseHandler.handleMouseMove(e)
    );
    document.addEventListener("mouseup", () =>
      this.mouseHandler.handleMouseUp()
    );

    this.canvas.addEventListener("click", () => this.canvas.focus());
    this.canvas.tabIndex = 1000;
  }
}

export default EventManager;
