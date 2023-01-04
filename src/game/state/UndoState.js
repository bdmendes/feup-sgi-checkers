import { GameState } from "./GameState.js";
import { InGameState } from "./InGameState.js";
import { BLACK } from "../model/Game.js";

import { MY_PIECE_ANIMATION_TIME } from "../view/animations/MyPieceAnimation.js";

export class UndoState extends GameState {
    constructor(gameController) {
        super(gameController, new Map());
    }

    init() {
        this.updateButtonsVisibility();
        this._undo();
        setTimeout(() => this.gameController.switchState(new InGameState(this.gameController)), MY_PIECE_ANIMATION_TIME * 1000 + 100);
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
        const piece = getPieceInPosition(to);

        // Remove captured pieces from auxiliary board
        const capturedPieces = this.gameController.capturedPieces[this.gameController.game.moves.length - 1];
        if (piece.color != BLACK) {
            this.gameController.whiteAuxiliaryBoard.removeCapturedPieces(capturedPieces.length);
        } else {
            this.gameController.blackAuxiliaryBoard.removeCapturedPieces(capturedPieces.length);
        }

        // Animate undo
        const component = this.gameController.scene.graph.components[piece.componentID];
        this.gameController.lightController.enableSpotlight(piece);
        this.gameController.animationController.injectMoveAnimation(piece, component, to, from, false, [], this.gameController.game.moves.length - 1);
        for (let i = 0; i < capturedPieces.length; i++) {
            this.gameController.animationController.injectCaptureAnimation(this.gameController.pieces.get(capturedPieces[i]));
        }
        piece.position = from;

        // Undo move in game model
        this.gameController.game.undo();

        // Update clock
        this.gameController.whiteRemainingSeconds = this.gameController.gameTime;
        this.gameController.blackRemainingSeconds = this.gameController.gameTime;
        this.gameController.clock.update(this.gameController.blackRemainingSeconds, this.gameController.whiteRemainingSeconds);

        // Flip camera if turn changed
        if (this.gameController.game.currentPlayer != this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename]) {
            this.gameController.cameraController.switchCamera(false, true);
        }
    }
}
