import TextBuffer from "./TextBuffer";
import PageSettings from "./PageSettings";
import TextRenderer from "./TextRenderer";
import Cursor from "./Cursor";
import TextSelection from "./TextSelection";
import ArrowKeysHandler from "./KeyCommands/ArrowKeysHandler";
import BackspaceHandler from "./KeyCommands/BackspaceHandler";
import EnterKeyHandler from "./KeyCommands/EnterKeyHandler";
import CharacterKeyHandler from "./KeyCommands/CharacterKeyHandler";
import MouseHandler from "./MouseCommands/MouseHandler";
import KeyController from "./KeyCommands/KeyController";
import EventManager from "./EventManager";
import RendererManager from "./RendererManager";

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

    // Initialiser les gestionnaires de commandes de touches et de souris
    this.arrowKeysHandler = new ArrowKeysHandler(this.textBuffer);
    this.backspaceHandler = new BackspaceHandler(this.textBuffer);
    this.enterKeyHandler = new EnterKeyHandler(this.textBuffer);
    this.characterKeyHandler = new CharacterKeyHandler(this.textBuffer);
    this.mouseHandler = new MouseHandler(this);
    this.keyController = new KeyController(this);

    // Facteur de rendu
    this.rendererManager = new RendererManager(
      this.ctx,
      this.renderer,
      this.cursor,
      this.selection,
      this.textBuffer
    );

    // Gestionnaire d'événements
    this.eventManager = new EventManager(
      this.canvas,
      this.keyController,
      this.mouseHandler,
      this.cursor
    );

    this.initialize();
  }

  initialize() {
    this.eventManager.attachEvents();
    this.cursor.startBlinking();
    this.render();
  }

  render() {
    this.rendererManager.renderAll();
  }
}

export default TextEditor;
