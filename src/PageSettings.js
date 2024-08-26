class PageSettings {
  constructor() {
    this._canvasWidth = 900;
    this._canvasHeight = 1400;

    // Marges du canvas
    this._marginTop = 96;
    this._marginBottom = 96;
    this._marginLeft = 96;
    this._marginRight = 96;

    this.updateContentDimensions();
  }

  get canvasWidth() {
    return this._canvasWidth;
  }

  get canvasHeight() {
    return this._canvasHeight;
  }

  get marginTop() {
    return this._marginTop;
  }

  get marginBottom() {
    return this._marginBottom;
  }

  get marginLeft() {
    return this._marginLeft;
  }

  get marginRight() {
    return this._marginRight;
  }

  get contentWidth() {
    return this._contentWidth;
  }

  get contentHeight() {
    return this._contentHeight;
  }

  setCanvasSize(width, height) {
    this._canvasWidth = width;
    this._canvasHeight = height;
    this.updateContentDimensions();
  }

  updateContentDimensions() {
    this._contentWidth =
      this._canvasWidth - this._marginLeft - this._marginRight;
    this._contentHeight =
      this._canvasHeight - this._marginTop - this._marginBottom;
  }

  setMargins(top, bottom, left, right) {
    this._marginTop = top;
    this._marginBottom = bottom;
    this._marginLeft = left;
    this._marginRight = right;
    this.updateContentDimensions();
  }
}

export default PageSettings;
