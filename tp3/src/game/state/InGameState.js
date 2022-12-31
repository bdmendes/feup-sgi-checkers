import { GameState } from './GameState.js';
import { Game, BLACK, WHITE } from '../model/Game.js';
import { parsePosition, checkValidPosition, getInitialPositions, getInitialStack } from '../view/Board.js';
import { GameOverState } from './GameOverState.js';

export class InGameState extends GameState {
    constructor(gameController) {
        super(gameController);
        this.notifiedNoValidMovesOnce = false;
        this.notifiedClickDropOnce = false;
    }

    onPiecePicked(component) {
        if (this.gameController.selectedPiece != null) {
            this.gameController.cleanTextures();
            this.gameController.lightController.disableSpotlight();
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

        if (this.gameController.game.currentPlayer == BLACK ? this.gameController.hintBlack : this.gameController.hintWhite) {
            if (!this.notifiedClickDropOnce && this.gameController.selectedPiece.possibleMoves.length > 0) {
                this.gameController.uiController.flashToast("Awesome! Now click on a valid square to move!");
                this.notifiedClickDropOnce = true;
            } else if (this.gameController.selectedPiece.possibleMoves.length == 0 && !this.notifiedNoValidMovesOnce) {
                this.gameController.uiController.flashToast("No valid moves for this piece. Try another one!");
                this.notifiedNoValidMovesOnce = true;
            }
        }

        this.gameController.textureController.applyPossibleMoveTexture(this.gameController.selectedPiece.position, this.gameController.selectedPiece.possibleMoves,
            this.gameController.game.currentPlayer == BLACK ? this.gameController.hintBlack : this.gameController.hintWhite);
        this.gameController.lightController.enableSpotlight(this.gameController.selectedPiece);
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
        this.gameController.cameraController.setGameCamera(currentPlayer);
        if (currentPlayer != nextToPlay) {
            if (nextToPlay === BLACK) {
                this.gameController.whiteRemainingSeconds = 5 * 60;
            } else {
                this.gameController.blackRemainingSeconds = 5 * 60;
            }
            this.gameController.clock.update(this.gameController.blackRemainingSeconds, this.gameController.whiteRemainingSeconds);
            this.gameController.animationController.injectCameraAnimation(isCapture);

            if (this.gameController.game.winner() != null) {
                this.gameController.state.destruct();
                this.gameController.state = new GameOverState(this.gameController);
                this.gameController.state.init();
                const winner = this.gameController.game.winner() == WHITE ? "White" : "Black";
                this.gameController.uiController.flashToast(`The game is over! Congratulations, ${winner}`);
            }
        }

        this.gameController.selectedPiece = null;
    }

    onTimeElapsed() {
        const gameOver = (winningPlayer) => {
            const winning = winningPlayer == WHITE ? "White" : "Black";
            const loser = winningPlayer == WHITE ? "Black" : "White";
            this.gameController.state.destruct();
            this.gameController.state = new GameOverState(this.gameController);
            this.gameController.state.init();
            this.gameController.uiController.flashToast(`Time is up for ${loser}! ${winning} is the winner!`);
        };

        if (this.gameController.game.currentPlayer === BLACK) {
            this.gameController.blackRemainingSeconds -= 1;
            if (this.gameController.blackRemainingSeconds === 0) {
                gameOver(WHITE);
            }
        } else {
            this.gameController.whiteRemainingSeconds -= 1;
            if (this.gameController.blackRemainingSeconds === 0) {
                gameOver(BLACK);
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
                buttonsMap[button].setText("Abandon");
            } else if (button === "undoButton") {
                buttonsMap[button].component.visible = this.gameController.game.moves.length > 0;
            } else if (button === "movieButton") {
                buttonsMap[button].component.visible = this.gameController.game.moves.length > 0;
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
        this.gameController.lightController.enableSpotlight(piece);
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
