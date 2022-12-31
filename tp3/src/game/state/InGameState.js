import { GameState } from './GameState.js';
import { BLACK, WHITE } from '../model/Game.js';
import { parsePosition, checkValidPosition } from '../view/Board.js';
import { GameOverState } from './GameOverState.js';
import { GAME_TIME } from '../controller/GameController.js';
import { capturedPieces } from '../view/Board.js';

export class InGameState extends GameState {
    constructor(gameController) {
        super(gameController);
        this.selectedPiece = null;
        this.notifiedNoValidMovesOnce = false;
        this.notifiedClickDropOnce = false;
    }

    init() {
        if (this.gameController.game == null) {
            return;
        }

        // Switch game camera to current player
        const nextToPlay = this.gameController.game.moves.length == 0
            ? BLACK : this.gameController.game.moves[this.gameController.game.moves.length - 1][3];
        if (this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename] != nextToPlay) {
            this.gameController.cameraController.switchCamera();
        }

        // Update buttons visibility
        this.updateButtonsVisibility(this.gameController.game.currentPlayer);
    }

    onSceneChanged() {
        this.init();
    }

    onPiecePicked(component) {
        // Clear previous selection
        if (this.selectedPiece != null) {
            this._clearPossibleMoveTextures();
            this.gameController.lightController.disableSpotlight();
        }

        // Clear current selection if clicking on the same piece
        if (this.selectedPiece?.componentID === component.id) {
            this._clearPieceSelection();
            return;
        }

        // Select new piece
        this.selectedPiece = this.gameController.pieces.get(component.id);
        if (this.gameController.game.currentPlayer != this.selectedPiece.color) {
            this._clearPieceSelection("Invalid piece to play. Turn: "
                + (this.gameController.game.currentPlayer === BLACK ? "black pieces" : "white pieces"));
            return;
        }

        // Highlight possible moves and flash tip if hints are enabled
        this.selectedPiece.possibleMoves = this.gameController.game.possibleMoves(this.selectedPiece.position).map(move => move[1]);
        if (this.gameController.game.currentPlayer == BLACK ? this.gameController.hintBlack : this.gameController.hintWhite) {
            if (!this.notifiedClickDropOnce && this.selectedPiece.possibleMoves.length > 0) {
                this.gameController.uiController.flashToast("Awesome! Now click on a valid square to move!");
                this.notifiedClickDropOnce = true;
            } else if (!this.notifiedNoValidMovesOnce && this.selectedPiece.possibleMoves.length == 0) {
                this.gameController.uiController.flashToast("No valid moves for this piece. Try another one!");
                this.notifiedNoValidMovesOnce = true;
            }
        }
        this.gameController.textureController.applyPossibleMoveTexture(this.selectedPiece.position, this.selectedPiece.possibleMoves,
            this.gameController.game.currentPlayer == BLACK ? this.gameController.hintBlack : this.gameController.hintWhite);

        // Turn on game spotlight
        this.gameController.lightController.enableSpotlight(this.selectedPiece);
    }

    onPositionPicked(component) {
        // Error if no piece is selected
        if (this.selectedPiece == null) {
            this._clearPieceSelection("Invalid position. Firstly, choose a valid "
                + (this.gameController.game.currentPlayer === BLACK ? "black piece" : "white piece"))
            return;
        }

        // Clear move highlights
        this._clearPossibleMoveTextures();

        // Error if move is invalid
        const pickedPosition = parsePosition(component);
        if (!checkValidPosition(this.selectedPiece.possibleMoves, pickedPosition)) {
            this._clearPieceSelection("Invalid move");
            return;
        }

        // Update game model
        const currentPlayer = this.gameController.game.currentPlayer;
        this.gameController.game.move(this.selectedPiece.position, pickedPosition);
        this.selectedPiece.position = pickedPosition;

        // Update captured pieces history (for undoing)
        const [from, to, isCapture, nextToPlay] = this.gameController.game.moves[this.gameController.game.moves.length - 1];
        const captured = capturedPieces(from, to, this.gameController.pieces);
        this.gameController.capturedPieces[this.gameController.game.moves.length - 1] = captured.map(piece => piece.componentID);

        // Animate move
        const pickedComponent = this.gameController.scene.graph.components[this.selectedPiece.componentID];
        this.gameController.animationController.injectMoveAnimation(pickedComponent, from, to,
            (this.selectedPiece.color == BLACK) ? to[0] == 0 : to[0] == 7, captured);

        // Update captured pieces marker
        if (currentPlayer === BLACK) {
            this.gameController.blackAuxiliaryBoard.addCapturedPieces(captured.length);
        } else {
            this.gameController.whiteAuxiliaryBoard.addCapturedPieces(captured.length);
        }

        // End if game is over
        const winner = this.gameController.game.winner();
        if (winner != null) {
            this.gameController.switchState(new GameOverState(this.gameController));
            const winnerString = winner == WHITE ? "White" : "Black";
            this.gameController.uiController.flashToast(`The game is over! Congratulations, ${winnerString}`);
            return;
        }

        // Update view for next player
        if (currentPlayer != nextToPlay) {
            // Update clock
            if (nextToPlay === BLACK) {
                this.gameController.whiteRemainingSeconds = GAME_TIME;
            } else {
                this.gameController.blackRemainingSeconds = GAME_TIME;
            }
            this.gameController.clock.update(this.gameController.blackRemainingSeconds, this.gameController.whiteRemainingSeconds);

            // Rotate camera for current player
            if (this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename] != nextToPlay) {
                this.gameController.cameraController.switchCamera(isCapture, true);
            }
        }

        // Clear piece selection
        this.selectedPiece = null;
    }

    onTimeElapsed() {
        const gameOver = (winningPlayer) => {
            const winning = winningPlayer == WHITE ? "White" : "Black";
            const loser = winningPlayer == WHITE ? "Black" : "White";
            this.gameController.switchState(new GameOverState(this.gameController));
            this.gameController.uiController.flashToast(`Time is up for ${loser}! ${winning} is the winner!`);
        };

        // Switch state and flash winner if time is up
        if (this.gameController.game.currentPlayer === BLACK) {
            this.gameController.blackRemainingSeconds -= 1;
            if (this.gameController.blackRemainingSeconds === 0) {
                gameOver(WHITE);
            }
        } else {
            this.gameController.whiteRemainingSeconds -= 1;
            if (this.gameController.whiteRemainingSeconds === 0) {
                gameOver(BLACK);
            }
        }

        // Update clock
        this.gameController.clock.update(this.gameController.blackRemainingSeconds,
            this.gameController.whiteRemainingSeconds);
    }

    updateButtonsVisibility(player) {
        if (player === BLACK) {
            this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
            this.gameController.blackButtons["startButton"].parentConsole.visible = true;
        } else {
            this.gameController.blackButtons["startButton"].parentConsole.visible = false;
            this.gameController.whiteButtons["startButton"].parentConsole.visible = true;
        }

        const buttonsMap = player === BLACK ? this.gameController.blackButtons : this.gameController.whiteButtons;
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

    _clearPieceSelection(flashMessageText = null) {
        if (flashMessageText != null) {
            this.gameController.uiController.flashToast(flashMessageText);
        }
        this.selectedPiece = null;
        this.gameController.lightController.disableSpotlight();
    }

    _clearPossibleMoveTextures() {
        if (this.selectedPiece != null) {
            this.gameController.textureController.cleanPossibleMoveTexture(this.selectedPiece.position, this.selectedPiece.possibleMoves);
        }
    }

    destruct() {
        this._clearPossibleMoveTextures();
        this._clearPieceSelection();
    }
}
