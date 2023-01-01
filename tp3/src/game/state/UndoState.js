import { GameState } from "./GameState.js";
import { InGameState } from "./InGameState.js";
import { BLACK } from "../model/Game.js";
import { GAME_TIME } from "../controller/GameController.js";

export class UndoState extends GameState {
    constructor(gameController) {
        super(gameController, null);
    }

    init() {
        this._undo();
        this.gameController.switchState(new InGameState(this.gameController));
    }

    _undo() {
        if (this.gameController.game.moves.length === 0) {
            return;
        }

        const getPieceInPosition = (position) => {
            let piece = null;
            this.gameController.pieces.forEach((p, _) => {
                if (!p.isCaptured && p.position[0] === position[0] && p.position[1] === position[1]) {
                    piece = p;
                }
            });
            return piece;
        };

        // Get piece in final position
        const [from, to, _, __] = this.gameController.game.moves[this.gameController.game.moves.length - 1];
        const currentPlayer = this.gameController.game.currentPlayer;
        const piece = getPieceInPosition(to);

        // Remove captured pieces from auxiliary board
        const capturedPieces = this.gameController.capturedPieces[this.gameController.game.moves.length - 1];
        if (currentPlayer === BLACK) {
            this.gameController.whiteAuxiliaryBoard.removeCapturedPieces(capturedPieces.length);
        } else {
            this.gameController.blackAuxiliaryBoard.removeCapturedPieces(capturedPieces.length);
        }

        // Animate undo
        let component = this.gameController.scene.graph.components[piece.componentID];
        this.gameController.lightController.enableSpotlight(piece);
        this.gameController.animationController.injectMoveAnimation(component, to, from, false, []);
        for (let i = 0; i < capturedPieces.length; i++) {
            this.gameController.animationController.injectCaptureAnimation(this.gameController.pieces.get(capturedPieces[i]));
        }
        piece.position = from;

        // Undo move in game model
        this.gameController.game.undo();

        // Update clock
        this.gameController.whiteRemainingSeconds = GAME_TIME;
        this.gameController.blackRemainingSeconds = GAME_TIME;
        this.gameController.clock.update(this.gameController.blackRemainingSeconds, this.gameController.whiteRemainingSeconds);

        // Flip camera if turn changed
        if (this.gameController.game.currentPlayer != currentPlayer) {
            this.gameController.cameraController.switchCamera(false, true);
        }
    }

    updateButtonsVisibility() { }
}
