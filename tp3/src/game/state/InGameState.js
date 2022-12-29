import { GameState } from './GameState.js';
import { Game, BLACK, WHITE } from '../model/Game.js';
import { parsePosition, checkValidPosition, getInitialPositions, getInitialStack } from '../view/Board.js';
import { GameOverState } from './GameOverState.js';

export class InGameState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    onPiecePicked(component) {
        if (this.gameController.selectedPiece != null) {
            this.gameController.cleanTextures();
        }

        const previousComponentID = this.gameController.selectedPiece != null ? this.gameController.selectedPiece.componentID : null;

        this.gameController.selectedPiece = this.gameController.pieces.get(component.id);

        if (this.gameController.game.currentPlayer != this.gameController.selectedPiece.color) {
            this.gameController.clean("Invalid piece to play. Turn: " + (this.gameController.game.currentPlayer === BLACK ? "black pieces" : "white pieces"));
            return;
        }

        if (previousComponentID === component.id) {
            this.gameController.clean();
            return;
        }

        this.gameController.selectedPiece.possibleMoves = this.gameController.game.possibleMoves(this.gameController.selectedPiece.position).map(move => move[1]);
        this.gameController.textureController.applyPossibleMoveTexture(this.gameController.selectedPiece.position, this.gameController.selectedPiece.possibleMoves,
            this.gameController.game.currentPlayer == BLACK ? this.gameController.hintBlack : this.gameController.hintWhite);
    }

    onPositionPicked(component) {
        if (this.gameController.selectedPiece == null) {
            this.gameController.clean("Invalid position. Firstly, choose a valid " + (this.gameController.game.currentPlayer === BLACK ? "black piece" : "white piece"))
            return;
        }

        if (this.gameController.selectedPiece != null) {
            this.gameController.cleanTextures();
        }

        let pickedPosition = parsePosition(component);

        if (!checkValidPosition(this.gameController.selectedPiece.possibleMoves, pickedPosition)) {
            this.gameController.clean("Invalid move");
            return;
        }

        let currentPlayer = this.gameController.game.currentPlayer;

        this.gameController.game.move(this.gameController.selectedPiece.position, pickedPosition);
        this.gameController.selectedPiece.position = pickedPosition;

        let [from, to, isCapture, nextToPlay] = this.gameController.game.moves[this.gameController.game.moves.length - 1];

        let capturedPieces = this.gameController.getCapturedPieces(from, to);

        this.gameController.capturedPieces[this.gameController.game.moves.length - 1] = capturedPieces.map(piece => piece.componentID);

        let pickedComponent = this.gameController.scene.graph.components[this.gameController.selectedPiece.componentID];
        this.gameController.animationController.injectMoveAnimation(pickedComponent, from, to,
            (this.gameController.selectedPiece.color == BLACK) ? to[0] == 0 : to[0] == 7, capturedPieces);

        // Update captured pieces marker
        if (currentPlayer === BLACK) {
            this.gameController.blackAuxiliaryBoard.addCapturedPieces(capturedPieces.length);
        } else {
            this.gameController.whiteAuxiliaryBoard.addCapturedPieces(capturedPieces.length);
        }

        // force game camera
        this.gameController.setGameCamera(currentPlayer);
        if (currentPlayer != nextToPlay) {
            if (nextToPlay === BLACK) {
                this.gameController.whiteRemainingSeconds = 5 * 60;
            } else {
                this.gameController.blackRemainingSeconds = 5 * 60;
            }
            this.gameController.clock.update(this.gameController.blackRemainingSeconds, this.gameController.whiteRemainingSeconds);
            this.gameController.animationController.injectCameraAnimation(isCapture);

            if (this.gameController.game.winner() != null) {
                alert("Winner: " + this.gameController.game.winner());
                this.gameController.state = new GameOverState(this.gameController);

                // TODO: Flash winner and reset game
            }
        }

        this.gameController.selectedPiece = null;
    }

    onTimeElapsed() {
        if (this.gameController.game.currentPlayer === BLACK) {
            this.gameController.blackRemainingSeconds -= 1;
            if (this.gameController.blackRemainingSeconds === 0) {
                this.gameController.state = new GameOverState(this.gameController);
                // TODO: Flash winner
            }
        } else {
            this.gameController.whiteRemainingSeconds -= 1;
            if (this.gameController.blackRemainingSeconds === 0) {
                this.gameController.state = new GameOverState(this.gameController);
                // TODO: Flash winner
            }
        }
        this.gameController.clock.update(this.gameController.blackRemainingSeconds,
            this.gameController.whiteRemainingSeconds);
        this._updateButtonsVisibility();
    }

    _updateButtonsVisibility() {
        if (this.gameController.game.currentPlayer === BLACK) {
            this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
            this.gameController.blackButtons["startButton"].parentConsole.visible = true;
        } else {
            this.gameController.blackButtons["startButton"].parentConsole.visible = false;
            this.gameController.whiteButtons["startButton"].parentConsole.visible = true;
        }

        const buttonsMap = this.gameController.game.currentPlayer === BLACK ? this.gameController.blackButtons : this.gameController.whiteButtons;
        for (let button in buttonsMap) {
            buttonsMap[button].component.visible = true;
            if (button === "startButton") {
                buttonsMap[button].setText("ABANDON");
            }
        }
    }

    undo() {
        if (this.gameController.game.moves.length === 0) {
            return;
        }

        let [from, to, _, __] = this.gameController.game.moves[this.gameController.game.moves.length - 1];

        let currentPlayer = this.gameController.game.currentPlayer;

        let piece = this.gameController.getPieceInPosition(to);

        let capturedPieces = this.gameController.capturedPieces[this.gameController.game.moves.length - 1];
        if (currentPlayer === BLACK) {
            this.gameController.whiteAuxiliaryBoard.removeCapturedPieces(capturedPieces.length);
        } else {
            this.gameController.blackAuxiliaryBoard.removeCapturedPieces(capturedPieces.length);
        }

        let component = this.gameController.scene.graph.components[piece.componentID];
        this.gameController.animationController.injectMoveAnimation(component, to, from, false, []);

        for (let i = 0; i < capturedPieces.length; i++) {
            this.gameController.animationController.injectCaptureAnimation(this.gameController.pieces.get(capturedPieces[i]));
        }

        this.gameController.game.undo();
        this.gameController.game.printBoard();
        piece.position = from;

        this.gameController.whiteRemainingSeconds = 5 * 60;
        this.gameController.blackRemainingSeconds = 5 * 60;
        this.gameController.clock.update(this.gameController.blackRemainingSeconds, this.gameController.whiteRemainingSeconds);

        if (this.gameController.game.currentPlayer != currentPlayer) {
            this.gameController.animationController.injectCameraAnimation(false);
        }
    }
}
