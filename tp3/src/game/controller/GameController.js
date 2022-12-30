import { CGFcamera } from '../../../../lib/CGF.js';
import { getInitialPositions, getInitialStack } from '../view/Board.js';
import { AnimationController } from './AnimationController.js';
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


export class GameController {
    constructor(scene, graphSwitcher) {
        this.scene = scene;
        this.scene.addPickListener(this);
        this.scene.addTimeListener(this);
        this.scene.addGraphLoadedListener(this);
        this.firstGraphLoaded = false;
        this.loadedGraphs = [];
        this.graphSwitcher = graphSwitcher;

        // state
        this.state = new StartState(this);

        // game
        this.game = null;
        this.pieces = new Map();
        this.blackButtons = {};
        this.whiteButtons = {};
        this.blackRemainingSeconds = null;
        this.whiteRemainingSeconds = null;
        this.whiteAuxiliaryBoard = null;
        this.blackAuxiliaryBoard = null;
        this.clock = null;
        this.stackState = null;
        this.hintWhite = false;
        this.hintBlack = false;
        this.cameraAnimation = 0;

        // selected piece
        this.selectedPiece = null;

        // captured pieces
        this.capturedPieces = {};

        // controllers
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene, this);
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

        // Hook camera (only once per graph, to maintain original camera position)
        if (!this.loadedGraphs.includes(this.scene.graph.filename)) {
            this.cameraTarget = vec3.fromValues(this.scene.graph.cameras["gameCamera"].target[0],
                this.scene.graph.cameras["gameCamera"].target[1], this.scene.graph.cameras["gameCamera"].target[2]);
            this.cameraBlackPosition = vec3.fromValues(...this.scene.graph.cameras["gameCamera"].position);
            this.cameraWhitePosition = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1],
                this.cameraBlackPosition[2] + 2 * (this.cameraTarget[2] - this.cameraBlackPosition[2]));
        }
        if (this.game != null) {
            this.setGameCamera(this.game.currentPlayer);
        }

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
                    setTimeout(function () {
                        document.getElementById('modal').style.visibility = 'visible';
                    }, 300);
                });

            // Init undo button
            const undoButtonID = 'undoButton';
            consoleButtons[undoButtonID] = new BoardButton(this.scene, consoleComponent.children[undoButtonID],
                consoleComponent, player, () => { this.state.undo() });

            // Init movie button
            const movieButtonID = 'movieButton';
            consoleButtons[movieButtonID] = new BoardButton(this.scene, consoleComponent.children[movieButtonID],
                consoleComponent, player, () => {
                    if (this.state instanceof InMovieState) {
                        this.state.destruct();
                        this.state = this.game.winner() == null ? new InGameState(this) : new GameOverState(this);
                        this.state.init();
                        return;
                    }

                    this.state = new InMovieState(this);
                    this.state.init();
                });

            // Init switch scene button
            const switchSceneButtonID = 'switchSceneButton';
            consoleButtons[switchSceneButtonID] = new BoardButton(this.scene, consoleComponent.children[switchSceneButtonID],
                consoleComponent, player, () => { this.graphSwitcher(); });

            // Init switch scene button
            const switchCameraButtonID = 'switchCameraButton';
            consoleButtons[switchCameraButtonID] = new BoardButton(this.scene, consoleComponent.children[switchCameraButtonID],
                consoleComponent, player, () => { this.switchCamera() });
        }

        // Remember that graph was loaded
        if (!this.loadedGraphs.includes(this.scene.graph.filename)) {
            this.loadedGraphs.push(this.scene.graph.filename);
        }
    }

    clean(error = null) {
        if (error != null) {
            this.uiController.flashToast(error);
        }
        this.selectedPiece = null;
    }

    cleanTextures() {
        if (this.selectedPiece != null) {
            this.textureController.cleanPossibleMoveTexture(this.selectedPiece.position, this.selectedPiece.possibleMoves);
        }
    }

    // TODO: Move this outahere!
    getCapturedPieces(from, to) {
        let capturedPieces = [];
        let xdelta = (to[0] > from[0]) ? 1 : -1;
        let ydelta = (to[1] > from[1]) ? 1 : -1;
        let current = from.slice();
        while (current[0] + xdelta != to[0] && current[1] + ydelta != to[1]) {
            current[0] += xdelta;
            current[1] += ydelta;
            this.pieces.forEach((piece, key) => {
                if (!piece.isCaptured && piece.position[0] === current[0] && piece.position[1] === current[1]) {
                    capturedPieces.push(piece);
                }
            });
        }
        return capturedPieces;
    }

    getPieceInPosition(position) {
        let piece = null;

        this.pieces.forEach((p, key) => {
            if (!p.isCaptured && p.position[0] === position[0] && p.position[1] === position[1]) {
                piece = p;
            }
        });
        return piece;
    }

    start(hintBlack, hintWhite) {
        if (this.state instanceof InGameState) {
            if (!confirm("Do you want to restart the game? All progress will be lost.")) {
                return;
            }
        }

        this.game = new Game();

        this.reset();

        // Init pieces
        let [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (let [key, value] of initBlackPositions) {
            this.pieces.set('blackPiece' + key, new MyPiece(key, 'blackPiece' + key, BLACK, value));
        }
        for (let [key, value] of initWhitePositions) {
            this.pieces.set('whitePiece' + key, new MyPiece(key, 'whitePiece' + key, WHITE, value));
        }

        this.hintBlack = hintBlack;
        this.hintWhite = hintWhite;

        this.state.destruct();
        this.state = new InGameState(this);
        this.state.init();

        this.setGameCamera(this.game.currentPlayer);

        this.uiController.flashToast("Game started! Good luck!");
    }

    reset() {
        // Clean selections
        this.clean();
        this.cleanTextures();

        // Put pieces in their initial positions
        const [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (const [id, piece] of this.pieces) {
            const component = this.scene.graph.components[id];
            if (component.animationID != null) {
                this.savedAnimations[id] = this.scene.graph.animations[component.animationID];
                component.animationID = null;
            }
            this.savedPieces.set(id, { ...piece });
            piece.position = (piece.color == BLACK ? initBlackPositions : initWhitePositions).get(piece.id);
            piece.isCaptured = false;
        }

        // Save time and reset it
        this.savedWhiteSeconds = this.whiteRemainingSeconds;
        this.savedBlackSeconds = this.blackRemainingSeconds;
        this.whiteRemainingSeconds = 5 * 60;
        this.blackRemainingSeconds = 5 * 60;
        this.clock.update(0, 0);

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

    //////////////////////////////////////////////////////////////
    // CAMERA CONTROLLER??

    setGameCamera(currentPlayer, gameCameraID = "gameCamera") {
        let camera = new CGFcamera(this.scene.camera.fov, this.scene.camera.near, this.scene.camera.far,
            currentPlayer === BLACK ? this.cameraBlackPosition : this.cameraWhitePosition, this.cameraTarget);

        this.scene.graph.selectedCameraID = gameCameraID;
        this.scene.graph.cameras[gameCameraID] = camera;
        this.scene.camera = this.scene.graph.cameras[gameCameraID];
        this.scene.interface.setActiveCamera(this.scene.camera);
    }

    switchCamera() {
        if (this.cameraAnimation++ % 2 == 0) {
            this.setGameCamera(this.game.currentPlayer);
        } else {
            this.setGameCamera((this.game.currentPlayer == BLACK) ? WHITE : BLACK);
        }

        // TODO: If camera does not return to current player, do not switch when he moves
        // I think this is impossible beacuse the camera can not be in the exact position of the other player
        this.animationController.injectCameraAnimation(false, false);
    }
}
