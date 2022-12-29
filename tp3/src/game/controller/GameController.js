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


export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);
        this.scene.addTimeListener(this);
        this.scene.addGraphLoadedListener(this);
        this.graphLoaded = false;

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

    notifyGraphLoaded() {
        if (this.graphLoaded) {
            return;
        }
        this.graphLoaded = true;

        // Init camera
        this.cameraBlackPosition = vec3.fromValues(...this.scene.graph.cameras["gameCamera"].position);
        this.cameraWhitePosition = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1], this.cameraBlackPosition[2] - 5);
        this.cameraTarget = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1] - 3.2, this.cameraBlackPosition[2] - 2.5);

        // Init pieces
        let [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (let [key, value] of initBlackPositions) {
            this.pieces.set('blackPiece' + key, new MyPiece(key, 'blackPiece' + key, BLACK, value));
        }
        for (let [key, value] of initWhitePositions) {
            this.pieces.set('whitePiece' + key, new MyPiece(key, 'whitePiece' + key, WHITE, value));
        }

        // Init clock
        this.clock = new BoardClock(this.scene, this.game, this.scene.graph.components["timer"]);

        // Init auxiliary boards
        this.stackState = getInitialStack();
        this.whiteAuxiliaryBoard = new AuxiliaryBoard(this.scene, this.scene.graph.components["supportBlockPlayer2"], WHITE);
        this.blackAuxiliaryBoard = new AuxiliaryBoard(this.scene, this.scene.graph.components["supportBlockPlayer1"], BLACK);

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
                    // give 250ms to click on the button
                    setTimeout(function () {
                        document.getElementById('modal').style.visibility = 'visible';
                    }, 300);
                });

            // Init undo button
            const undoButtonID = 'undoButton';
            consoleButtons[undoButtonID] = new BoardButton(this.scene, consoleComponent.children[undoButtonID],
                consoleComponent, player, () => { this.undo() });

            // Init movie button
            const movieButtonID = 'movieButton';
            consoleButtons[movieButtonID] = new BoardButton(this.scene, consoleComponent.children[movieButtonID],
                consoleComponent, player, () => {
                    if (this.state instanceof InMovieState) {
                        this.state.destruct();
                        this.state = new InGameState(this);
                        return;
                    }

                    this.state = new InMovieState(this);
                    this.state.init();
                });

            // Init switch scene button
            const switchSceneButtonID = 'switchSceneButton';
            consoleButtons[switchSceneButtonID] = new BoardButton(this.scene, consoleComponent.children[switchSceneButtonID],
                consoleComponent, player, () => { alert("TODO: Switch Scene"); });

            // Init switch scene button
            const switchCameraButtonID = 'switchCameraButton';
            consoleButtons[switchCameraButtonID] = new BoardButton(this.scene, consoleComponent.children[switchCameraButtonID],
                consoleComponent, player, () => { this.switchCamera() });
        }
    }

    clean(error = null) {
        if (error != null) {
            console.log(error);
        }
        this.selectedPiece = null;
    }

    cleanTextures() {
        this.textureController.cleanPossibleMoveTexture(this.selectedPiece.position, this.selectedPiece.possibleMoves);
    }

    getCapturedPieces(from, to) {
        let capturedPieces = [];
        let xdelta = (to[0] > from[0]) ? 1 : -1;
        let ydelta = (to[1] > from[1]) ? 1 : -1;
        let current = from.slice();
        while (current[0] + xdelta != to[0] && current[1] + ydelta != to[1]) {
            current[0] += xdelta;
            current[1] += ydelta;
            this.pieces.forEach((piece, key) => {
                if (piece.position[0] === current[0] && piece.position[1] === current[1]) {
                    capturedPieces.push(piece);
                }
            });
        }
        return capturedPieces;
    }

    undo() {
        alert("TODO: Undo");
    }

    start(hintBlack, hintWhite) {
        if (this.state instanceof InGameState) {
            // TODO: Confirm restart
        }

        this.game = new Game();
        this.reset();

        this.hintBlack = hintBlack;
        this.hintWhite = hintWhite;

        this.state = new InGameState(this);
        this.setGameCamera(this.game.currentPlayer);
    }

    reset() {
        // Put pieces in their initial positions
        const [initBlackPositions, initWhitePositions] = getInitialPositions();
        for (const [id, piece] of this.pieces) {
            const component = this.scene.graph.components[id];

            this.savedAnimations[id] = this.scene.graph.animations[component.animationID];
            component.animationID = null;

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
        this.savedStackState = { ...this.stackState };
        this.savedWhiteCapturedPieces = this.whiteAuxiliaryBoard.getCapturedPieces();
        this.savedBlackCapturedPieces = this.blackAuxiliaryBoard.getCapturedPieces();
        this.whiteAuxiliaryBoard.setCapturedPieces(0);
        this.blackAuxiliaryBoard.setCapturedPieces(0);
    }

    undoReset() {
        // Restore piece positions
        for (const [id, piece] in this.pieces) {
            const component = this.scene.graph.components[id];
            component.animationID = this.savedAnimations[id].id;
            this.scene.graph.animations[component.animationID] = this.savedAnimations[id];
        }
        this.pieces = this.savedPieces;

        // Restore time
        this.whiteRemainingSeconds = this.savedWhiteSeconds;
        this.blackRemainingSeconds = this.savedBlackSeconds;
        this.clock.update(this.whiteRemainingSeconds, this.blackRemainingSeconds);

        // Restore captured pieces
        this.whiteAuxiliaryBoard.setCapturedPieces(this.savedWhiteCapturedPieces);
        this.blackAuxiliaryBoard.setCapturedPieces(this.savedBlackCapturedPieces);
        this.stackState = { ...this.savedStackState };
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
