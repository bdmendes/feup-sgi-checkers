import { AnimationController } from './AnimationController.js';
import { Game, BLACK, WHITE } from './Game.js';
import { TextureController } from './TextureController.js';
import { MyPiece } from './MyPiece.js';
import { parsePosition } from './gameUtils.js';
import { checkValidPosition } from './gameUtils.js';

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

        ////// TEMPORARY CODE TO CLONE BOARD
        const newBoard = this.game.board.map(row => row.slice());

        this.selectedPiece.setPosition(pickedPosition);

        ////// TEMPORARY CODE TO REMOVE CAPTURED PIECES
        for (let i = 0; i < currBoard.length; i++) {
            for (let j = 0; j < currBoard[i].length; j++) {
                if (newBoard[i][j] === 0 && currBoard[i][j] !== 0) {
                    console.log(i);
                    console.log(j);
                    if (currBoard[i][j] === BLACK) {
                        for (let [key, piece] of this.pieces) {
                            let value = piece.getPosition();
                            if (value[0] === i && value[1] === j) {
                                console.log(this.scene.graph.animations);
                                console.log(key);
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
        //////

        let [from, to, isCapture, nextToPlay] = this.game.moves[this.game.moves.length - 1];
        this.game.printBoard();

        let pickedComponent = this.scene.graph.components[this.selectedPiece.getComponentID()];
        this.animationController.injectMoveAnimation(pickedComponent, from, to);

        if (currentPlayer != nextToPlay) {
            this.animationController.injectCameraAnimation(this.scene.camera, this.game.currentPlayer);
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

        let initBlackPositions = new Map([
            [1, [7, 0]],
            [2, [7, 2]],
            [3, [7, 4]],
            [4, [7, 6]],
            [5, [6, 1]],
            [6, [6, 3]],
            [7, [6, 5]],
            [8, [6, 7]],
            [9, [5, 0]],
            [10, [5, 2]],
            [11, [5, 4]],
            [12, [5, 6]],
        ]);

        let initWhitePositions = new Map([
            [1, [0, 7]],
            [2, [0, 5]],
            [3, [0, 3]],
            [4, [0, 1]],
            [5, [1, 6]],
            [6, [1, 4]],
            [7, [1, 2]],
            [8, [1, 0]],
            [9, [2, 7]],
            [10, [2, 5]],
            [11, [2, 3]],
            [12, [2, 1]],
        ]);

        for (let [key, value] of initBlackPositions) {
            this.pieces.set('blackPiece' + key, new MyPiece(key, 'blackPiece' + key, BLACK, value));
        }

        for (let [key, value] of initWhitePositions) {
            this.pieces.set('whitePiece' + key, new MyPiece(key, 'whitePiece' + key, WHITE, value));
        }
    }
}
