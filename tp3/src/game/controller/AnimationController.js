import { MyPieceAnimation } from "../../engine/assets/animations/MyPieceAnimation.js";
import { MyCameraAnimation } from "../../engine/assets/animations/MyCameraAnimation.js";

export class AnimationController {
    constructor(scene, gameController) {
        this.scene = scene;
        this.gameController = gameController;
    }

    injectMoveAnimation(component, initialPos, finalPos, toKing, capturedPieces) {
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

        capturedPiece.isCaptured = true;

        let pos = [0, 0, 0];
        if (component.id.includes('black')) {
            pos = [
                this.gameController.stackState.whiteStackPos[0] + ((this.gameController.stackState.whiteStack % 2 == 0) ? -0.75 : 0.75),
                this.gameController.stackState.whiteStackPos[1],
                Math.floor(this.gameController.stackState.whiteStack / 2)
            ];
            this.gameController.stackState.whiteStack++;
        } else {
            pos = [
                this.gameController.stackState.blackStackPos[0] + ((this.gameController.stackState.blackStack % 2 == 0) ? 0.75 : -0.75),
                this.gameController.stackState.blackStackPos[1],
                Math.floor(this.gameController.stackState.blackStack / 2)
            ];
            this.gameController.stackState.blackStack++;
        }

        if (component.tempTextureID != null) {
            component.tempTextureID = null;
        }
        this.scene.graph.animations[component.id].addMidKeyframe(capturedPiece.position, pos, true, false);
    }

    injectCameraAnimation(isCapture, isMove = true) {
        const cameraAnimation = new MyCameraAnimation(this.scene, this.scene.graph.selectedCameraID, this.scene.camera, isCapture, isMove);
        this.scene.graph.animations[this.scene.graph.selectedCameraID] = cameraAnimation;
    }
}