import { GameState } from './GameState.js';
import { BLACK } from '../model/Game.js';
import { capturedPieces } from '../view/hooks/Board.js';
import { MOVIE_BUTTON_ID, SWITCH_CAMERA_BUTTON_ID, SWITCH_SCENE_BUTTON_ID } from '../controller/GameController.js';

export class InMovieState extends GameState {
    constructor(gameController) {
        super(gameController, new Map([[MOVIE_BUTTON_ID, "End"], [SWITCH_CAMERA_BUTTON_ID, null], [SWITCH_SCENE_BUTTON_ID, null]]));
        this.currentMove = 0;
        this.currentToPlay = BLACK;
        this.flashedMovieEnd = false;
        this.resettingBoard = true;
    }

    init() {
        this.resettingBoard = true;
        this.gameController.reset();
        this.resettingBoard = false;

        this.updateButtonsVisibility();
        this.gameController.uiController.flashToast("Playing movie...", null, true);
    }

    onTimeElapsed() {
        // If resetting board, do not further animate
        if (this.resettingBoard) {
            return;
        }

        // If movie ended, flash toast and return
        if (this.currentMove >= this.gameController.game.moves.length) {
            if (!this.flashedMovieEnd) {
                this.flashedMovieEnd = true;
                this.gameController.uiController.flashToast("Movie ended! Press END to go back to the game.", null, true);
            }
            return;
        }

        // Get current move and captured pieces
        const [from, to, _, nextToPlay] = this.gameController.game.moves[this.currentMove];
        const captured = capturedPieces(from, to, this.gameController.pieces);
        let pickedComponent = null;
        let piece = null;
        for (const [_, p] of this.gameController.pieces) {
            if (!p.isCaptured && p.position[0] == from[0] && p.position[1] == from[1]) {
                pickedComponent = this.gameController.scene.graph.components[p.componentID];
                p.position = to;
                piece = p;
                break;
            }
        }

        // Enable piece spotlight and inject move animation
        this.gameController.lightController.enableSpotlight(piece);
        this.gameController.animationController.injectMoveAnimation(piece, pickedComponent, from, to,
            this.currentToPlay == BLACK ? to[0] == 0 : to[0] == 7, captured, this.currentMove + 1);

        // Update captured pieces marker
        if (this.currentToPlay === BLACK) {
            this.gameController.blackAuxiliaryBoard.addCapturedPieces(captured.length);
        } else {
            this.gameController.whiteAuxiliaryBoard.addCapturedPieces(captured.length);
        }

        // Prepare next move
        this.currentMove += 1;
        this.currentToPlay = nextToPlay;
    }

    destruct() {
        this.resettingBoard = true;

        this.gameController.undoReset();

        for (const buttonsMap of [this.gameController.blackButtons, this.gameController.whiteButtons]) {
            for (let button in buttonsMap) {
                if (button === MOVIE_BUTTON_ID) {
                    buttonsMap[button].setText("Watch");
                }
            }
        }

        this.gameController.uiController.hideToast();

        this.gameController.lightController.disableSpotlight();
    }
}
