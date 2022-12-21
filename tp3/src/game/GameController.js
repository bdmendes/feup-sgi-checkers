import { parsePosition, checkValidPosition, getInitialPositions } from './gameUtils.js';
import { AnimationController } from './AnimationController.js';
import { Game, BLACK, WHITE } from './Game.js';
import { TextureController } from './TextureController.js';
import { MyPiece } from './MyPiece.js';


export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);

        // game
        this.game = null;
        this.pieces = new Map();
        this.stackState = null;

        // selected piece
        this.selectedPiece = null;

        // init game
        this.initGame();

        // controllers
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene, this.stackState);
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

        let previousComponentID = this.selectedPiece != null ? this.selectedPiece.getComponentID() : null;

        this.selectedPiece = this.pieces.get(component.id);

        if (this.game.currentPlayer != this.selectedPiece.getColor()) {
            this.clean("Invalid piece to play. Turn: " + (this.game.currentPlayer === BLACK ? "black pieces" : "white pieces"));
            return;
        }

        if (previousComponentID === component.id) {
            this.clean()
            return;
        }

        this.selectedPiece.setPossibleMoves(this.game.possibleMoves(this.selectedPiece.getPosition()).map(move => move[1]));
        this.textureController.applyPossibleMoveTexture(this.selectedPiece.getPosition(), this.selectedPiece.getPossibleMoves());
    }

    pickPosition(component) {
        if (this.selectedPiece == null) {
            this.clean("Invalid position. Firstly, choose a valid " + (this.game.currentPlayer === BLACK ? "black piece" : "white piece"))
            return;
        }

        if (this.selectedPiece != null) {
            this.cleanTextures();
        }

        let pickedPosition = parsePosition(component);

        if (!checkValidPosition(this.selectedPiece.getPossibleMoves(), pickedPosition)) {
            this.clean("Invalid move");
            return;
        }

        let currentPlayer = this.game.currentPlayer;

        this.game.move(this.selectedPiece.getPosition(), pickedPosition)
        this.game.printBoard();
        this.selectedPiece.setPosition(pickedPosition);

        let [from, to, isCapture, nextToPlay] = this.game.moves[this.game.moves.length - 1];

        let capturedPieces = this._getCapturedPieces(from, to);

        let pickedComponent = this.scene.graph.components[this.selectedPiece.getComponentID()];
        this.animationController.injectMoveAnimation(pickedComponent, from, to, capturedPieces);

        // force game camera
        this._setGameCamera();
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
        this.textureController.cleanPossibleMoveTexture(this.selectedPiece.getPosition(), this.selectedPiece.getPossibleMoves());
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

        this.stackState = {
            blackStackPos: [-0.25, 10.5],
            blackStack: [],
            whiteStackPos: [7.25, 10.5],
            whiteStack: [],
        }
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
                if (piece.getPosition()[0] === current[0] && piece.getPosition()[1] === current[1]) {
                    capturedPieces.push(piece);
                }
            });
        }
        return capturedPieces;
    }

    _setGameCamera(gameCameraID = "gameCamera") {
        if (this.scene.graph.selectedCameraID == gameCameraID) { return; }

        this.scene.graph.selectedCameraID = gameCameraID;
        this.scene.camera = this.scene.graph.cameras[gameCameraID];
        this.scene.interface.setActiveCamera(this.scene.graph.cameras[gameCameraID]);
    }
}
