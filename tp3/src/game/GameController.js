import { parsePosition, checkValidPosition, getInitialPositions } from './gameUtils.js';
import { AnimationController } from './AnimationController.js';
import { Game, BLACK, WHITE } from './Game.js';
import { TextureController } from './TextureController.js';
import { MyPiece } from './MyPiece.js';


export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);

        // controllers
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene);

        // game
        this.game = null;
        this.pieces = new Map();

        // selected piece
        this.selectedPiece = null;

        // init game
        this.initGame();
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

        ////// TEMPORARY CODE TO CLONE BOARD
        const currBoard = this.game.board.map(row => row.slice());

        this.game.move(this.selectedPiece.getPosition(), pickedPosition)
        this.game.printBoard();

        ////// TEMPORARY CODE TO CLONE BOARD
        const newBoard = this.game.board.map(row => row.slice());

        this.selectedPiece.setPosition(pickedPosition);

        ////// TEMPORARY CODE TO REMOVE CAPTURED PIECES
        this.removeCapturedPiece(currBoard, newBoard);

        let [from, to, isCapture, nextToPlay] = this.game.moves[this.game.moves.length - 1];

        let pickedComponent = this.scene.graph.components[this.selectedPiece.getComponentID()];
        this.animationController.injectMoveAnimation(pickedComponent, from, to);

        // force game camera
        this._setGameCamera();
        if (currentPlayer != nextToPlay) {
            this.animationController.injectCameraAnimation();
        }
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
    }

    _setGameCamera(gameCameraID = "gameCamera") {
        if (this.scene.graph.selectedCameraID == gameCameraID) { return; }

        this.scene.graph.selectedCameraID = gameCameraID;
        this.scene.camera = this.scene.graph.cameras[gameCameraID];
        this.scene.interface.setActiveCamera(this.scene.graph.cameras[gameCameraID]);
    }

    ////// TEMPORARY CODE TO REMOVE CAPTURED PIECES
    removeCapturedPiece(currBoard, newBoard) {
        for (let i = 0; i < currBoard.length; i++) {
            for (let j = 0; j < currBoard[i].length; j++) {
                if (newBoard[i][j] === 0 && currBoard[i][j] !== 0) {
                    if (currBoard[i][j] === BLACK) {
                        for (let [key, piece] of this.pieces) {
                            let value = piece.getPosition();
                            if (value[0] === i && value[1] === j) {
                                this.scene.graph.animations[key].isVisible = false;
                                this.pieces.delete(key);
                                break;
                            }
                        }
                    } else {
                        for (let [key, piece] of this.pieces) {
                            let value = piece.getPosition();
                            if (value[0] === i && value[1] === j) {
                                this.scene.graph.animations["whitePiece" + key].isVisible = false;
                                this.pieces.delete(key);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
