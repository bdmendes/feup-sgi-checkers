import { AnimationController } from './AnimationController.js';
import { Game, BLACK, WHITE } from './Game.js';
import { TextureController } from './TextureController.js';
import { rowToNumber, letterToColumn } from './util.js';

const BLACK_PIECE_STR = 'blackPiece';
const WHITE_PIECE_STR = 'whitePiece';

export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);
        this.textureController = new TextureController(scene);
        this.animationController = new AnimationController(scene);
        this.blackPositions = null;
        this.whitePositions = null;
        this.game = null;
        this.selectedComponent = null;
        this.selectedPossibleMoves = null;
        this.selectedPosition = null;
        this.selectedId = null;

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
        if (this.selectedComponent != null) {
            this.textureController.clearPossibleMoveTexture(this.selectedPosition, this.selectedPossibleMoves);
        }

        if (!((this.game.currentPlayer === BLACK && component.id.includes('black')) ||
            (this.game.currentPlayer === WHITE && component.id.includes('white')))) {
            console.log("Invalid piece to play. Turn: " + (this.game.currentPlayer === BLACK ? "black pieces" : "white pieces"));
            this.clean();
            return;
        }
        this.selectedId = (this.game.currentPlayer === BLACK) ?
            parseInt(component.id.substring(component.id.indexOf(BLACK_PIECE_STR) + BLACK_PIECE_STR.length))
            :
            parseInt(component.id.substring(component.id.indexOf(WHITE_PIECE_STR) + WHITE_PIECE_STR.length));

        this.selectedPosition = (this.game.currentPlayer === BLACK) ?
            this.blackPositions.get(this.selectedId) :
            this.whitePositions.get(this.selectedId);

        if (this.selectedComponent != null && this.selectedComponent.id === component.id) {
            this.clean()
            return;
        }

        this.selectedComponent = component;
        this.selectedPossibleMoves = this.game.possibleMoves(this.selectedPosition).map(move => move[1]);
        this.textureController.applyPossibleMoveTexture(this.selectedPosition, this.selectedPossibleMoves);
    }

    pickPosition(component) {
        if (this.selectedComponent == null) {
            console.log("Invalid position. Firstly, choose a valid " + (this.game.currentPlayer === BLACK ? "black piece" : "white piece"));
            return;
        }

        if (this.selectedComponent != null) {
            this.textureController.clearPossibleMoveTexture(this.selectedPosition, this.selectedPossibleMoves);
        }

        let position = [rowToNumber(component.id[component.id.length - 1]), letterToColumn(component.id[component.id.length - 2])];
        let possible = false;

        for (let i = 0; i < this.selectedPossibleMoves.length; i++) {
            if (this.selectedPossibleMoves[i][0] === position[0] && this.selectedPossibleMoves[i][1] === position[1]) {
                possible = true;
                break;
            }
        }

        if (!possible) {
            this.clean();
            return;
        }

        this.animationController.injectMoveAnimation(this.selectedComponent, this.selectedPosition, position);
        if (this.game.currentPlayer === BLACK) {
            this.blackPositions.set(this.selectedId, position);
        } else {
            this.whitePositions.set(this.selectedId, position);
        }
        this.game.move(this.selectedPosition, position);
        this.game.printBoard();
    }

    clean() {
        this.selectedComponent = null;
        this.selectedPossibleMoves = null;
        this.selectedPosition = null;
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
    }
}
