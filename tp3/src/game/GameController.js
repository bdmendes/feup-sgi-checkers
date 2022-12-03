import { Game, BLACK, WHITE } from './Game.js';
import { TextureController } from './TextureController.js';

const BLACK_PIECE_STR = 'blackPiece';
const WHITE_PIECE_STR = 'whitePiece';

export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);
        this.textureController = new TextureController(scene);
        this.blackPositions = null;
        this.whitePositions = null;
        this.game = null;
        this.selectedComponent = null;
        this.selectedPossibleMoves = null;
        this.selectedPosition = null;

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
        if (this.game.currentPlayer === BLACK && component.id.includes('black') || this.game.currentPlayer === WHITE && component.id.includes('white')) {
            if (this.selectedComponent != null) {
                this.textureController.clearPossibleMoveTexture(this.selectedPosition, this.selectedPossibleMoves);
            }

            this.selectedPosition = (this.game.currentPlayer === BLACK) ?
                this.blackPositions.get(
                    parseInt(component.id.substring(component.id.indexOf(BLACK_PIECE_STR) + BLACK_PIECE_STR.length))
                ) :
                this.whitePositions.get(
                    parseInt(component.id.substring(component.id.indexOf(WHITE_PIECE_STR) + WHITE_PIECE_STR.length))
                );

            if (this.selectedComponent != null && this.selectedComponent.id === component.id) {
                this.selectedComponent = null;
                this.selectedPossibleMoves = null;
                return;
            }

            this.selectedComponent = component;
            this.selectedPossibleMoves = this.game.possibleMoves(this.selectedPosition).map(move => move[1]);
            this.textureController.applyPossibleMoveTexture(this.selectedPosition, this.selectedPossibleMoves);
        } else {
            console.log("Invalid piece to play. Turn: " + (this.game.currentPlayer === BLACK ? "black pieces" : "white pieces"));
        }
    }

    pickPosition(component) {
        console.log("Picked position: " + component.id);
    }

    letterToColumn(letter) {
        return 7 - (letter.charCodeAt(0) - 65);
    }

    initGame() {
        this.game = new Game();

        this.blackPositions = new Map([
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

        this.whitePositions = new Map([
            [1, [0, 1]],
            [2, [0, 3]],
            [3, [0, 5]],
            [4, [0, 7]],
            [5, [1, 0]],
            [6, [1, 2]],
            [7, [1, 4]],
            [8, [1, 6]],
            [9, [2, 1]],
            [10, [2, 3]],
            [11, [2, 5]],
            [12, [2, 7]],
        ]);
    }
}
