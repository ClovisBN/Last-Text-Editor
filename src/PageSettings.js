class PageSettings {
  constructor() {
    // Dimensions du canvas
    this._canvasWidth = 900; // Largeur en pixels
    this._canvasHeight = 1400; // Hauteur en pixels

    // Marges du canvas
    this._marginTop = 96; // Marge supérieure en pixels
    this._marginBottom = 96; // Marge inférieure en pixels
    this._marginLeft = 96; // Marge gauche en pixels
    this._marginRight = 96; // Marge droite en pixels

    // Taille de la zone de contenu (calculée)
    this.updateContentDimensions();
  }

  // Getters pour les dimensions du canvas et les marges
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

  // Getters pour les dimensions de la zone de contenu
  get contentWidth() {
    return this._contentWidth;
  }

  get contentHeight() {
    return this._contentHeight;
  }

  // Méthode pour redimensionner le canvas
  setCanvasSize(width, height) {
    this._canvasWidth = width;
    this._canvasHeight = height;
    this.updateContentDimensions();
  }

  // Méthode pour mettre à jour les dimensions de la zone de contenu
  updateContentDimensions() {
    this._contentWidth =
      this._canvasWidth - this._marginLeft - this._marginRight;
    this._contentHeight =
      this._canvasHeight - this._marginTop - this._marginBottom;
  }

  // Méthode pour définir les marges
  setMargins(top, bottom, left, right) {
    this._marginTop = top;
    this._marginBottom = bottom;
    this._marginLeft = left;
    this._marginRight = right;
    this.updateContentDimensions();
  }
}

export default PageSettings;
