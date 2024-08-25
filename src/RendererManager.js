class RendererManager {
  constructor(ctx, textRenderer, cursor, selection, textBuffer) {
    this.ctx = ctx;
    this.textRenderer = textRenderer;
    this.cursor = cursor;
    this.selection = selection;
    this.textBuffer = textBuffer;
  }

  renderAll() {
    this.textRenderer.render(this.textBuffer, this.cursor);
    this.selection.drawSelection(
      this.ctx,
      this.textBuffer,
      this.cursor,
      this.textRenderer
    );
  }
}

export default RendererManager;
