class PageSettings {
  constructor() {
    // Dimensions du canvas
    this.canvasWidth = 900; // Largeur en pixels
    this.canvasHeight = 1400; // Hauteur en pixels

    // Marges du canvas
    this.marginTop = 96; // Marge supérieure en pixels
    this.marginBottom = 96; // Marge inférieure en pixels
    this.marginLeft = 96; // Marge gauche en pixels
    this.marginRight = 96; // Marge droite en pixels

    // Taille de la zone de contenu (calculée)
    this.contentWidth = this.canvasWidth - this.marginLeft - this.marginRight;
    this.contentHeight = this.canvasHeight - this.marginTop - this.marginBottom;
  }

  // Méthode pour obtenir la largeur du canvas
  getCanvasWidth() {
    return this.canvasWidth;
  }

  // Méthode pour obtenir la hauteur du canvas
  getCanvasHeight() {
    return this.canvasHeight;
  }

  // Méthode pour obtenir la marge supérieure
  getMarginTop() {
    return this.marginTop;
  }

  // Méthode pour obtenir la marge inférieure
  getMarginBottom() {
    return this.marginBottom;
  }

  // Méthode pour obtenir la marge gauche
  getMarginLeft() {
    return this.marginLeft;
  }

  // Méthode pour obtenir la marge droite
  getMarginRight() {
    return this.marginRight;
  }

  // Méthode pour obtenir la largeur de la zone de contenu
  getContentWidth() {
    return this.contentWidth;
  }

  // Méthode pour obtenir la hauteur de la zone de contenu
  getContentHeight() {
    return this.contentHeight;
  }

  // Méthode pour redimensionner le canvas
  setCanvasSize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.updateContentDimensions();
  }

  // Méthode pour mettre à jour les dimensions de la zone de contenu
  updateContentDimensions() {
    this.contentWidth = this.canvasWidth - this.marginLeft - this.marginRight;
    this.contentHeight = this.canvasHeight - this.marginTop - this.marginBottom;
  }

  // Méthode pour définir les marges
  setMargins(top, bottom, left, right) {
    this.marginTop = top;
    this.marginBottom = bottom;
    this.marginLeft = left;
    this.marginRight = right;
    this.updateContentDimensions();
  }
}

export default PageSettings;
