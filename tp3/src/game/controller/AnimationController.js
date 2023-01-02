import { MyPieceAnimation } from "../view/animations/MyPieceAnimation.js";

export class AnimationController {
    constructor(scene, gameController) {
        this.scene = scene;
        this.gameController = gameController;
    }

    injectMoveAnimation(piece, component, initialPos, finalPos, toKing, capturedPieces, moveNumber = 0) {
        if (toKing && piece.kingPromotionMove == null) {
            piece.kingPromotionMove = moveNumber;
        } else if (!toKing && piece.kingPromotionMove != null && piece.kingPromotionMove > moveNumber) {
            component.tempTextureID = null;
            piece.kingPromotionMove = null;
        }

        if (component.animationID == null) {
            const animation = new MyPieceAnimation(this, component.id, initialPos);
            this.scene.graph.animations[component.id] = animation;
            component.animationID = component.id;
        }

        this.scene.graph.animations[component.id].addMidKeyframe(initialPos, finalPos, false, toKing, capturedPieces);
    }

    injectCaptureAnimation(capturedPiece) {
        const component = this.scene.graph.components[capturedPiece.componentID];
        if (component.animationID == null) {
            const animation = new MyPieceAnimation(this, component.id, capturedPiece.position);
            this.scene.graph.animations[component.id] = animation;
            component.animationID = component.id;
        }

        let pos = [0, 0, 0];
        if (component.id.includes('black')) {
            if (capturedPiece.isCaptured) {
                this.gameController.stackState.whiteStack--;
            }
            pos = [
                this.gameController.stackState.whiteStackPos[0] + ((this.gameController.stackState.whiteStack % 2 == 0) ? -0.75 : 0.75),
                this.gameController.stackState.whiteStackPos[1],
                Math.floor(this.gameController.stackState.whiteStack / 2)
            ];
            if (!capturedPiece.isCaptured) {
                this.gameController.stackState.whiteStack++;
            }
        } else {
            if (capturedPiece.isCaptured) {
                this.gameController.stackState.blackStack--;
            }
            pos = [
                this.gameController.stackState.blackStackPos[0] + ((this.gameController.stackState.blackStack % 2 == 0) ? 0.75 : -0.75),
                this.gameController.stackState.blackStackPos[1],
                Math.floor(this.gameController.stackState.blackStack / 2)
            ];
            if (!capturedPiece.isCaptured) {
                this.gameController.stackState.blackStack++;
            }
        }

        if (!capturedPiece.isCaptured) {
            this.scene.graph.animations[component.id].addMidKeyframe(capturedPiece.position, pos, true, false);
            capturedPiece.isCaptured = true;
        } else {
            this.scene.graph.animations[component.id].addMidKeyframe(pos, capturedPiece.position, true, false);
            capturedPiece.isCaptured = false;
        }
    }
}
