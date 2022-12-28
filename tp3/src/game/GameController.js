import { parsePosition, checkValidPosition, getInitialPositions, getInitialStack } from './gameUtils.js';
import { AnimationController } from './AnimationController.js';
import { Game, BLACK, WHITE } from './Game.js';
import { TextureController } from './TextureController.js';
import { UIController } from './UIController.js';
import { MyPiece } from './MyPiece.js';


export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);

        // game
        this.game = null;
        this.pieces = new Map();
        this.stackState = null;
        this.hintWhite = false;
        this.hintBlack = false;

        // selected piece
        this.selectedPiece = null;

        // init game
        this.initGame();

        // controllers
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene, this.stackState);
        this.uiController = new UIController();

        // to call when the user pick start button
        this._initGameCamera();
    }

    notifyPick(component) {
        if (component.id.includes('Piece')) {
            this.pickPiece(component);
        } else if (component.id.includes('position')) {
            this.pickPosition(component);
        }
    }

    pickPiece(component) {
        if (this.selectedPiece != null) {
            this.cleanTextures();
        }

        let previousComponentID = this.selectedPiece != null ? this.selectedPiece.componentID : null;

        this.selectedPiece = this.pieces.get(component.id);

        if (this.game.currentPlayer != this.selectedPiece.color) {
            this.clean("Invalid piece to play. Turn: " + (this.game.currentPlayer === BLACK ? "black pieces" : "white pieces"));
            return;
        }

        if (previousComponentID === component.id) {
            this.clean()
            return;
        }

        this.selectedPiece.possibleMoves = this.game.possibleMoves(this.selectedPiece.position).map(move => move[1]);
        this.textureController.applyPossibleMoveTexture(this.selectedPiece.position, this.selectedPiece.possibleMoves);
    }

    pickPosition(component) {
        if (this.selectedPiece == null) {
            this.clean("Invalid position. Firstly, choose a valid " + (this.game.currentPlayer === BLACK ? "black piece" : "white piece"))
            return;
        }

        if (this.selectedPiece != null) {
            this.cleanTextures();
        }

        // TODO: Illuminate picked position and follow animation

        let pickedPosition = parsePosition(component);

        if (!checkValidPosition(this.selectedPiece.possibleMoves, pickedPosition)) {
            this.clean("Invalid move");
            return;
        }

        let currentPlayer = this.game.currentPlayer;

        this.game.move(this.selectedPiece.position, pickedPosition)
        this.game.printBoard();
        this.selectedPiece.position = pickedPosition;

        let [from, to, isCapture, nextToPlay] = this.game.moves[this.game.moves.length - 1];

        let capturedPieces = this._getCapturedPieces(from, to);

        let pickedComponent = this.scene.graph.components[this.selectedPiece.componentID];
        this.animationController.injectMoveAnimation(pickedComponent, from, to,
            (this.selectedPiece.color == BLACK) ? to[0] == 0 : to[0] == 7, capturedPieces);

        // force game camera
        this._setGameCamera(currentPlayer);
        if (currentPlayer != nextToPlay) {
            this.animationController.injectCameraAnimation(isCapture);
        }

        capturedPieces = null;
        this.selectedPiece = null;
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

    initGame() {
        this.game = new Game();

        let [initBlackPositions, initWhitePositions] = getInitialPositions();

        for (let [key, value] of initBlackPositions) {
            this.pieces.set('blackPiece' + key, new MyPiece(key, 'blackPiece' + key, BLACK, value));
        }

        for (let [key, value] of initWhitePositions) {
            this.pieces.set('whitePiece' + key, new MyPiece(key, 'whitePiece' + key, WHITE, value));
        }

        this.stackState = getInitialStack();
    }

    _getCapturedPieces(from, to) {
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
        // TODO: call when the game start (after implement start button) to get game camera position instead of hardcoded values
        // this.cameraBlackPosition = this.scene.graph.cameras["gameCamera"].position;
        // this.cameraWhitePosition = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1], this.cameraBlackPosition[2] - 5);
        // this.cameraTarget = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1] - 3.2, this.cameraBlackPosition[2] - 2.5);

        this.cameraBlackPosition = vec3.fromValues(3, 6.5, -4.5);
        this.cameraWhitePosition = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1], this.cameraBlackPosition[2] - 5);
        this.cameraTarget = vec3.fromValues(3, 3.3, -7);
    }

    _setGameCamera(currentPlayer, gameCameraID = "gameCamera") {
        this.scene.graph.selectedCameraID = gameCameraID;
        this.scene.graph.cameras[gameCameraID].position = currentPlayer === BLACK ? this.cameraBlackPosition : this.cameraWhitePosition;
        this.scene.camera = this.scene.graph.cameras[gameCameraID];
        this.scene.interface.setActiveCamera(this.scene.graph.cameras[gameCameraID]);
    }

    startGame(hintWhite, hintBlack) {
        this.hintWhite = hintWhite;
        this.hintBlack = hintBlack;
    }
}
