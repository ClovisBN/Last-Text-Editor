import TextBuffer from "./TextBuffer";
import PageSettings from "./PageSettings";
import TextRenderer from "./TextRenderer";
import Cursor from "./Cursor";
import TextSelection from "./TextSelection";
import TextRunManager from "./TextRunManager";
import ArrowKeysHandler from "./KeyCommands/ArrowKeysHandler";
import BackspaceHandler from "./KeyCommands/BackspaceHandler";
import EnterKeyHandler from "./KeyCommands/EnterKeyHandler";
import CharacterKeyHandler from "./KeyCommands/CharacterKeyHandler";
import MouseHandler from "./MouseCommands/MouseHandler";
import KeyController from "./KeyCommands/KeyController";
import ToolBarTextStyle from "./toolBarTextStyle";

class TextEditor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Utilisation de PageSettings pour définir les dimensions du canvas
    this.pageSettings = new PageSettings();

    this.canvas.width = this.pageSettings.canvasWidth;
    this.canvas.height = this.pageSettings.canvasHeight;

    this.textBuffer = new TextBuffer();
    this.renderer = new TextRenderer(this.ctx, this.pageSettings);
    this.cursor = new Cursor(this, this.renderer, this.pageSettings);
    this.selection = new TextSelection();

    this.cursorBlinkInterval = null;
    this.isMouseDown = false;

    this.textRunManager = new TextRunManager(this.textBuffer);

    // Initialiser les gestionnaires de commandes de touches et de souris
    this.arrowKeysHandler = new ArrowKeysHandler(this.textBuffer);
    this.backspaceHandler = new BackspaceHandler(this.textBuffer);
    this.enterKeyHandler = new EnterKeyHandler(this.textBuffer);
    this.characterKeyHandler = new CharacterKeyHandler(this.textBuffer);
    this.mouseHandler = new MouseHandler(this);
    this.keyController = new KeyController(this);

    this.toolBarTextStyle = new ToolBarTextStyle(this); // Ajout de la barre d'outils

    this.initialize();
  }

  initialize() {
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
    this.cursor.startBlinking();
    this.render();
  }

  render() {
    this.renderer.render(this.textBuffer, this.cursor);
    this.selection.drawSelection(
      this.ctx,
      this.textBuffer,
      this.cursor,
      this.renderer
    );
  }

  initializeSplitButton() {
    const splitButton = document.createElement("button");
    splitButton.textContent = "Split TextRun";
    splitButton.addEventListener("click", () => this.handleSplitTextRun());
    document.body.appendChild(splitButton);
  }

  handleSplitTextRun() {
    const selectionRange = this.selection.getSelectionRange();
    if (selectionRange) {
      this.textRunManager.splitTextRun(
        selectionRange.start,
        selectionRange.end
      );
      this.render();
    }
  }
}

export default TextEditor;
