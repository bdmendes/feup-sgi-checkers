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
        this.game = new Game(); // TODO: Start here the game? How to reset?
        this.pieces = new Map();
        this.blackButtons = {};
        this.whiteButtons = {};
        this.blackRemainingSeconds = 5 * 60;
        this.whiteRemainingSeconds = 5 * 60;
        this.whiteAuxiliaryBoard = null;
        this.blackAuxiliaryBoard = null;
        this.clock = null;
        this.stackState = null;
        this.hintWhite = false;
        this.hintBlack = false;

        // selected piece
        this.selectedPiece = null;

        // controllers
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene, this);
        this.uiController = new UIController();
    }

    notifyPick(component) {
        if (component.id.includes('Piece')) {
            this.state.onPiecePicked(component);
        } else if (component.id.includes('position')) {
            this.state.onPositionPicked(component);
        } else if (component.id.includes('Button')) {
            console.log(component.id);
            this.state.onButtonPicked(component);
        }
    }

    notifyTime() {
        this.state.updateButtonsVisibility();
        this.state.onTimeElapsed();
    }

    notifyGraphLoaded() {
        if (this.graphLoaded) {
            // TODO: What happens when the graph is changed to another scenario?
            console.log("Graph already loaded. Ignoring this call. TODO!");
            return;
        }
        this.graphLoaded = true;

        this.stackState = getInitialStack();

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
                consoleComponent, player, () => { this.start() });

            // Init undo button
            const undoButtonID = 'undoButton';
            consoleButtons[undoButtonID] = new BoardButton(this.scene, consoleComponent.children[undoButtonID],
                consoleComponent, player, () => { this.undo() });

            // Init movie button
            const movieButtonID = 'movieButton';
            consoleButtons[movieButtonID] = new BoardButton(this.scene, consoleComponent.children[movieButtonID],
                consoleComponent, player, () => { this.movie() });

            // Init switch scene button
            const switchSceneButtonID = 'switchSceneButton';
            consoleButtons[switchSceneButtonID] = new BoardButton(this.scene, consoleComponent.children[switchSceneButtonID],
                consoleComponent, player, () => { this.switchScene() });

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

    _initGameCamera() {
        this.cameraBlackPosition = this.scene.graph.cameras["gameCamera"].position;
        this.cameraWhitePosition = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1], this.cameraBlackPosition[2] - 5);
        this.cameraTarget = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1] - 3.2, this.cameraBlackPosition[2] - 2.5);
    }

    setGameCamera(currentPlayer, gameCameraID = "gameCamera") {
        this.scene.graph.selectedCameraID = gameCameraID;
        this.scene.graph.cameras[gameCameraID].position = currentPlayer === BLACK ? this.cameraBlackPosition : this.cameraWhitePosition;
        this.scene.camera = this.scene.graph.cameras[gameCameraID];
        this.scene.interface.setActiveCamera(this.scene.graph.cameras[gameCameraID]);
    }

    undo() {
        alert("TODO: Undo");
    }

    movie() {
        alert("TODO: Movie");
    }

    switchScene() {
        alert("TODO: Switch Scene");
    }

    start(hintWhite, hintBlack) {
        if (this.state instanceof InGameState) {
            // TODO: Resign
            alert("Game already started. TODO: Resign");
            return;
        }

        this.hintWhite = hintWhite;
        this.hintBlack = hintBlack;

        this.state = new InGameState(this);

        // Init game camera
        this._initGameCamera();
    }

    switchCamera() {
        // TODO: If camera does not return to current player, do not switch when he moves
        this.animationController.injectCameraAnimation();
    }
}
