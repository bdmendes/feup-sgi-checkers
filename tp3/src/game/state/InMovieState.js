import { GameState } from './GameState.js';
import { BLACK } from '../model/Game.js';
import { capturedPieces } from '../view/Board.js';

export class InMovieState extends GameState {
    constructor(gameController) {
        super(gameController);
        this.currentMove = 0;
        this.currentToPlay = BLACK;
        this.flashedMovieEnd = false;
    }

    init() {
        this.gameController.reset();
        this.updateButtonsVisibility(this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename]);
        this.gameController.uiController.flashToast("Playing movie...", null, true);
    }

    onSceneChanged() {
        this.updateButtonsVisibility(this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename]);
    }

    updateButtonsVisibility(player) {
        if (player === BLACK) {
            this.gameController.blackButtons["startButton"].parentConsole.visible = true;
            this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
        } else {
            this.gameController.blackButtons["startButton"].parentConsole.visible = false;
            this.gameController.whiteButtons["startButton"].parentConsole.visible = true;
        }

        for (const buttonsMap of [this.gameController.blackButtons, this.gameController.whiteButtons]) {
            for (let button in buttonsMap) {
                if (button === "movieButton") {
                    buttonsMap[button].component.visible = true;
                    buttonsMap[button].setText("End");
                } else if (button === "switchCameraButton") {
                    buttonsMap[button].component.visible = true;
                } else if (button === "switchSceneButton") {
                    buttonsMap[button].component.visible = true;
                } else {
                    buttonsMap[button].component.visible = false;
                }
            }
        }
    }

    onTimeElapsed() {
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
            if (p.position[0] == from[0] && p.position[1] == from[1]) {
                pickedComponent = this.gameController.scene.graph.components[p.componentID];
                p.position = to;
                piece = p;
                break;
            }
        }

        // Enable piece spotlight and inject move animation
        this.gameController.lightController.enableSpotlight(piece);
        this.gameController.animationController.injectMoveAnimation(pickedComponent, from, to,
            this.currentToPlay == BLACK ? to[0] == 0 : to[0] == 7, captured);

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
        this.gameController.undoReset();

        for (const buttonsMap of [this.gameController.blackButtons, this.gameController.whiteButtons]) {
            for (let button in buttonsMap) {
                buttonsMap[button].component.visible = true;
                if (button === "movieButton") {
                    buttonsMap[button].component.visible = true;
                    buttonsMap[button].setText("Watch");
                }
            }
        }

        this.gameController.uiController.hideToast();
        this.gameController.uiController.flashToast("Back to the game!");
    }
}
