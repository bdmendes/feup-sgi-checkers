import { getInitialPositions, getInitialStack } from '../view/Board.js';
import { AnimationController } from './AnimationController.js';
import { LightController } from './LightController.js';
import { CameraController } from './CameraController.js';
import { Game, BLACK, WHITE } from '../model/Game.js';
import { TextureController } from './TextureController.js';
import { MyPiece } from '../view/MyPiece.js';
import { BoardButton } from '../view/BoardButton.js';
import { BoardClock } from '../view/BoardClock.js';
import { InGameState } from '../state/InGameState.js';
import { StartState } from '../state/StartState.js';
import { AuxiliaryBoard } from '../view/AuxiliaryBoard.js';
import { UIController } from './UIController.js';
import { InMovieState } from '../state/InMovieState.js';
import { GameOverState } from '../state/GameOverState.js';
import { UndoState } from '../state/UndoState.js';

export const GAME_TIME = 5 * 60;

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
        this.resignedGame = null;

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
        this.hintWhite = null;
        this.hintBlack = null;

        // controllers
        this.lightController = new LightController(scene);
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene, this);
        this.cameraController = new CameraController(this);
        this.uiController = new UIController();

        // saved state for resetting
        this.savedAnimations = {};
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
            this._state.onPiecePicked(component);
        } else if (component.id.includes('position')) {
            this._state.onPositionPicked(component);
        } else if (component.id.includes('Button')) {
            this._state.onButtonPicked(component);
        }
    }

    notifyTime() {
        this._state.onTimeElapsed();
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
        this.lightController.setSpotlight();

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
            const startButtonID = 'startButton';
            consoleButtons[startButtonID] = new BoardButton(this.scene, consoleComponent.children[startButtonID],
                consoleComponent, player, () => {
                    if (this._state instanceof InGameState) {
                        if (!confirm("Do you want to restart the game? All progress will be lost.")) {
                            return;
                        }
                        this.switchState(new GameOverState(this));
                        this.resignedGame = true;
                        return;
                    }

                    setTimeout(function () {
                        document.getElementById('modal').style.visibility = 'visible';
                    }, 250);
                });

            // Init undo button
            const undoButtonID = 'undoButton';
            consoleButtons[undoButtonID] = new BoardButton(this.scene, consoleComponent.children[undoButtonID],
                consoleComponent, player, () => { this.switchState(new UndoState(this)) });

            // Init movie button
            const movieButtonID = 'movieButton';
            consoleButtons[movieButtonID] = new BoardButton(this.scene, consoleComponent.children[movieButtonID],
                consoleComponent, player, () => {
                    if (this._state instanceof InMovieState) {
                        this.switchState(!this.resignedGame && this.game.winner() == null
                            ? new InGameState(this) : new GameOverState(this));
                        return;
                    }

                    this.switchState(new InMovieState(this));
                });

            // Init switch scene button
            const switchSceneButtonID = 'switchSceneButton';
            consoleButtons[switchSceneButtonID] = new BoardButton(this.scene, consoleComponent.children[switchSceneButtonID],
                consoleComponent, player, () => this.graphSwitcher());

            // Init switch camera button
            const switchCameraButtonID = 'switchCameraButton';
            consoleButtons[switchCameraButtonID] = new BoardButton(this.scene, consoleComponent.children[switchCameraButtonID],
                consoleComponent, player, () => this.cameraController.switchCamera());
        }

        // Update scene-dependent state variables
        this._state.onSceneChanged();
    }

    start(hintBlack, hintWhite) {
        // Update hint settings
        this.hintBlack = hintBlack;
        this.hintWhite = hintWhite;

        // Init game model
        this.game = new Game();
        this.resignedGame = false;

        // Reset game view
        this.reset();

        // Hook pieces
        const [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (let [key, value] of initBlackPositions) {
            if (this.pieces.has('blackPiece' + key)) {
                this.pieces.get('blackPiece' + key).position = value;
                continue;
            }
            this.pieces.set('blackPiece' + key, new MyPiece(key, 'blackPiece' + key, BLACK, value));
        }
        for (let [key, value] of initWhitePositions) {
            if (this.pieces.has('whitePiece' + key)) {
                this.pieces.get('whitePiece' + key).position = value;
                continue;
            }
            this.pieces.set('whitePiece' + key, new MyPiece(key, 'whitePiece' + key, WHITE, value));
        }

        // Switch to game state
        this.switchState(new InGameState(this));

        // Flash welcome message
        this.uiController.flashToast("Game started! Good luck!");
    }

    reset() {
        // Put pieces in their initial positions
        const [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (const [id, piece] of this.pieces) {
            const component = this.scene.graph.components[id];
            if (component.animationID != null) {
                this.savedAnimations[id] = this.scene.graph.animations[component.animationID];
                delete this.scene.graph.animations[component.animationID];
                component.animationID = null;
            }
            this.savedPieces.set(id, { ...piece });
            piece.position = (piece.color == BLACK ? initBlackPositions : initWhitePositions).get(piece.id);
            piece.isCaptured = false;
        }

        // Save time and reset it
        this.savedWhiteSeconds = this.whiteRemainingSeconds;
        this.savedBlackSeconds = this.blackRemainingSeconds;
        this.whiteRemainingSeconds = GAME_TIME;
        this.blackRemainingSeconds = GAME_TIME;
        this.clock.update(GAME_TIME, GAME_TIME);

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
        // Restore piece positions
        for (const [id, _] of this.pieces) {
            const component = this.scene.graph.components[id];
            if (this.savedAnimations[id] != null) {
                component.animationID = this.savedAnimations[id].id;
                this.scene.graph.animations[component.animationID] = this.savedAnimations[component.animationID];
            }
            this.pieces.set(id, { ...this.savedPieces.get(id) });
        }

        // Restore time
        this.whiteRemainingSeconds = this.savedWhiteSeconds;
        this.blackRemainingSeconds = this.savedBlackSeconds;
        this.clock.update(this.whiteRemainingSeconds, this.blackRemainingSeconds);

        // Restore captured pieces
        this.whiteAuxiliaryBoard.setCapturedPieces(this.savedWhiteCapturedPieces);
        this.blackAuxiliaryBoard.setCapturedPieces(this.savedBlackCapturedPieces);
        this.stackState = { ...this.savedStackState };
        this.capturedPieces = { ...this.savedCapturedPieces };
    }

    switchState(newState) {
        this._state?.destruct();
        this._state = newState;
        this._state.init();
    }
}
