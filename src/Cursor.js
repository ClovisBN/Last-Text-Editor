class Cursor {
  constructor() {
    this._position = 0;
    this._visible = true;
  }

  get position() {
    return this._position;
  }

  set position(value) {
    this._position = value;
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = value;
  }

  draw(ctx, x, y, fontSize) {
    if (this._visible) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + fontSize);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1; // ou une autre valeur d'épaisseur pour le curseur
      ctx.stroke();
    }
  }

  toggleVisibility() {
    this._visible = !this._visible;
  }
}

export default Cursor;
