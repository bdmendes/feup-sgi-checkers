import { getInitialPositions, getInitialStack } from '../view/hooks/Board.js';
import { AnimationController } from './AnimationController.js';
import { LightController } from './LightController.js';
import { CameraController } from './CameraController.js';
import { Game, BLACK, WHITE } from '../model/Game.js';
import { TextureController } from './TextureController.js';
import { MyPiece } from '../view/hooks/MyPiece.js';
import { BoardButton } from '../view/hooks/BoardButton.js';
import { BoardClock } from '../view/hooks/BoardClock.js';
import { InGameState } from '../state/InGameState.js';
import { StartState } from '../state/StartState.js';
import { AuxiliaryBoard } from '../view/hooks/AuxiliaryBoard.js';
import { UIController } from './UIController.js';
import { InMovieState } from '../state/InMovieState.js';
import { UndoState } from '../state/UndoState.js';
import { BlockingState } from '../state/BlockingState.js';

export const START_BUTTON_ID = "startButton";
export const UNDO_BUTTON_ID = "undoButton";
export const MOVIE_BUTTON_ID = "movieButton";
export const SWITCH_SCENE_BUTTON_ID = "switchSceneButton";
export const SWITCH_CAMERA_BUTTON_ID = "switchCameraButton";

export class GameController {
    constructor(scene, graphSwitcher) {
        this.scene = scene;
        this.scene.addPickListener(this);
        this.scene.addTimeListener(this);
        this.scene.addGraphLoadedListener(this);
        this.firstGraphLoaded = false;
        this.graphSwitcher = graphSwitcher;

        // state
        this.switchState(new StartState(this));

        // game
        this.game = null;
        this.gameOver = null;

        // component hooks
        this.pieces = new Map();
        this.blackButtons = {};
        this.whiteButtons = {};
        this.blackRemainingSeconds = null;
        this.whiteRemainingSeconds = null;
        this.whiteAuxiliaryBoard = null;
        this.blackAuxiliaryBoard = null;
        this.clock = null;
        this.stackState = null;

        // settings
        this.hintWhite = null;
        this.hintBlack = null;
        this.gameTime = null;

        // controllers
        this.lightController = new LightController(scene);
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene, this);
        this.cameraController = new CameraController(this);
        this.uiController = new UIController();

        // saved state for resetting
        this.savedAnimations = {};
        this.savedTempTextureIDs = {};
        this.savedPieces = new Map();
        this.savedWhiteSeconds = 0;
        this.savedBlackSeconds = 0;
        this.savedWhiteCapturedPieces = 0;
        this.savedBlackCapturedPieces = 0;
        this.savedStackState = null;
        this.savedCapturedPieces = null;

        // saved captured pieces for undoing
        this.capturedPieces = {};
    }

    notifyPick(component) {
        if (component.id.includes('Piece')) {
            this.state.onPiecePicked(component);
        } else if (component.id.includes('position')) {
            this.state.onPositionPicked(component);
        } else if (component.id.includes('Button')) {
            this.state.onButtonPicked(component);
        }
    }

    notifyTime() {
        this.state.onTimeElapsed();
    }

    notifyGraphLoaded(force = false) {
        // Stop concurrent calls
        if (this.firstGraphLoaded && !force) {
            return;
        }
        this.firstGraphLoaded = true;

        // Hook camera
        this.cameraController.hookSceneCamera();

        // Hook light
        this.lightController.hookSpotlight();

        // Hook clock
        this.clock = new BoardClock(this.scene.graph.components["timer"]);
        if (this.blackRemainingSeconds != null) {
            this.clock.update(this.blackRemainingSeconds, this.whiteRemainingSeconds);
        }

        // Hook auxiliary boards
        if (this.blackAuxiliaryBoard == null) {
            this.whiteAuxiliaryBoard = new AuxiliaryBoard(this.scene.graph.components["supportBlockPlayer2"], WHITE);
            this.blackAuxiliaryBoard = new AuxiliaryBoard(this.scene.graph.components["supportBlockPlayer1"], BLACK);
        } else {
            this.whiteCapturedPieces = this.whiteAuxiliaryBoard.getCapturedPieces();
            this.blackCapturedPieces = this.blackAuxiliaryBoard.getCapturedPieces();
            this.whiteAuxiliaryBoard.component = this.scene.graph.components["supportBlockPlayer2"];
            this.blackAuxiliaryBoard.component = this.scene.graph.components["supportBlockPlayer1"];
            this.whiteAuxiliaryBoard.setCapturedPieces(this.whiteCapturedPieces);
            this.blackAuxiliaryBoard.setCapturedPieces(this.blackCapturedPieces);
        }

        // Init buttons console
        const blackConsoleID = 'blackPlayerButtons';
        const whiteConsoleID = 'whitePlayerButtons';
        for (const player of [BLACK, WHITE]) {
            const consoleID = player === BLACK ? blackConsoleID : whiteConsoleID;
            let consoleComponent = this.scene.graph.components[consoleID];
            const consoleButtons = player === BLACK ? this.blackButtons : this.whiteButtons;

            // Init start button
            consoleButtons[START_BUTTON_ID] = new BoardButton(this.scene, consoleComponent.children[START_BUTTON_ID],
                consoleComponent, player, () => {
                    if (this.state instanceof InGameState) {
                        setTimeout(function (gameController) {
                            if (!confirm("Do you want to restart the game? All progress will be lost.")) {
                                return;
                            }
                            gameController.switchState(new StartState(gameController));
                            gameController.gameOver = true;
                            gameController.uiController.flashToast("You resigned. You can now start a new game.");
                        }, 250, this);
                        return;
                    }

                    setTimeout(function () {
                        document.getElementById('modal').style.visibility = 'visible';
                    }, 250);
                });

            // Init undo button
            consoleButtons[UNDO_BUTTON_ID] = new BoardButton(this.scene, consoleComponent.children[UNDO_BUTTON_ID],
                consoleComponent, player, () => { this.switchState(new UndoState(this)) });

            // Init movie button
            consoleButtons[MOVIE_BUTTON_ID] = new BoardButton(this.scene, consoleComponent.children[MOVIE_BUTTON_ID],
                consoleComponent, player, () => {
                    if (this.state instanceof InMovieState) {
                        this.switchState(!this.gameOver && this.game.winner() == null
                            ? new InGameState(this) : new StartState(this));
                        return;
                    }

                    this.switchState(new InMovieState(this));
                });

            // Init switch scene button
            consoleButtons[SWITCH_SCENE_BUTTON_ID] = new BoardButton(this.scene, consoleComponent.children[SWITCH_SCENE_BUTTON_ID],
                consoleComponent, player, () => {
                    this.state.beforeSceneChanged();
                    const oldState = this.state;
                    this.state = new BlockingState();
                    this.graphSwitcher();
                    this.state = oldState;
                    this.state.onSceneChanged();
                });

            // Init switch camera button
            consoleButtons[SWITCH_CAMERA_BUTTON_ID] = new BoardButton(this.scene, consoleComponent.children[SWITCH_CAMERA_BUTTON_ID],
                consoleComponent, player, () => this.cameraController.switchCamera());
        }
    }

    start(hintBlack = true, hintWhite = true, gameTime = 5 * 60) {
        // Update hint and time settings
        this.hintBlack = hintBlack;
        this.hintWhite = hintWhite;
        this.gameTime = gameTime;
        this.blackRemainingSeconds = this.gameTime;
        this.whiteRemainingSeconds = this.gameTime;

        // Init game model
        this.game = new Game();
        this.gameOver = false;

        // Reset game view
        this.reset();

        // Hook pieces
        const [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (let [key, value] of initBlackPositions) {
            this.pieces.set('blackPiece' + key, new MyPiece(key, 'blackPiece' + key, BLACK, value));
        }
        for (let [key, value] of initWhitePositions) {
            this.pieces.set('whitePiece' + key, new MyPiece(key, 'whitePiece' + key, WHITE, value));
        }

        // Switch to game state
        this.switchState(new InGameState(this));

        // Flash welcome message
        this.uiController.flashToast("Game started! Good luck!");
    }

    reset() {
        // Put pieces in their initial positions and reset textures
        const [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (const [id, piece] of this.pieces) {
            const component = this.scene.graph.components[id];
            if (component.animationID != null) {
                this.savedAnimations[id] = this.scene.graph.animations[component.animationID];
                delete this.scene.graph.animations[component.animationID];
                component.animationID = null;
            }

            this.savedTempTextureIDs[id] = component.tempTextureID;
            component.tempTextureID = null;

            this.savedPieces.set(id, { ...piece });
            piece.position = (piece.color == BLACK ? initBlackPositions : initWhitePositions).get(piece.id);
            piece.isCaptured = false;
            piece.kingPromotionMove = null;
        }

        // Save time and reset it
        this.savedWhiteSeconds = this.whiteRemainingSeconds;
        this.savedBlackSeconds = this.blackRemainingSeconds;
        this.whiteRemainingSeconds = this.gameTime;
        this.blackRemainingSeconds = this.gameTime;
        this.clock.update(this.gameTime, this.gameTime);

        // Reset captured pieces
        this.savedCapturedPieces = { ...this.capturedPieces };
        this.savedStackState = { ...this.stackState };
        this.savedWhiteCapturedPieces = this.whiteAuxiliaryBoard.getCapturedPieces();
        this.savedBlackCapturedPieces = this.blackAuxiliaryBoard.getCapturedPieces();
        this.stackState = getInitialStack();
        this.whiteAuxiliaryBoard.setCapturedPieces(0);
        this.blackAuxiliaryBoard.setCapturedPieces(0);
    }

    undoReset() {
        // Restore piece positions and textures
        for (const [id, _] of this.pieces) {
            const component = this.scene.graph.components[id];
            if (this.savedAnimations[id] != null) {
                component.animationID = this.savedAnimations[id].id;
                this.scene.graph.animations[component.animationID] = this.savedAnimations[component.animationID];
            }
            component.tempTextureID = this.savedTempTextureIDs[id];
            this.pieces.set(id, { ...this.savedPieces.get(id) });
        }

        // Restore time
        this.whiteRemainingSeconds = this.savedWhiteSeconds;
        this.blackRemainingSeconds = this.savedBlackSeconds;
        this.clock.update(this.blackRemainingSeconds, this.whiteRemainingSeconds);

        // Restore captured pieces
        this.whiteAuxiliaryBoard.setCapturedPieces(this.savedWhiteCapturedPieces);
        this.blackAuxiliaryBoard.setCapturedPieces(this.savedBlackCapturedPieces);
        this.stackState = { ...this.savedStackState };
        this.capturedPieces = { ...this.savedCapturedPieces };
    }

    switchState(newState) {
        this.state?.destruct();
        this.state = newState;
        this.state.init();
    }
}
