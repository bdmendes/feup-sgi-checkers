import { MyPieceAnimation } from "../engine/assets/animations/MyPieceAnimation.js";
import { MyCameraAnimation } from "../engine/assets/animations/MyCameraAnimation.js";
import { BLACK, WHITE } from "./Game.js";

export class AnimationController {
    constructor(scene, stackState) {
        this.scene = scene;
        this.stackState = stackState;
    }

    injectMoveAnimation(component, initialPos, finalPos, capturedPieces) {
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this, component.id, initialPos);
            this.scene.graph.animations[animation.id] = animation;
            component.animationID = animation.id;
        }
        this.scene.graph.animations[component.id].addMidKeyframe(initialPos, finalPos, capturedPieces);
    }

    injectCaptureAnimation(capturedPiece) {
        let component = this.scene.graph.components[capturedPiece.componentID];
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this, component.id, capturedPiece.position);
            this.scene.graph.animations[animation.id] = animation;
            component.animationID = animation.id;
        }

        let color = component.id.includes('black') ? BLACK : WHITE;
        capturedPiece.isCaptured = true;
        this.scene.graph.animations[component.id].addMidKeyframe(capturedPiece.position, (color == BLACK) ? this.stackState.blackStackPos : this.stackState.whiteStackPos);
        this.scene.graph.animations[capturedPiece.componentID].setIsCaptured(true);
    }

    injectCameraAnimation(isCapture) {
        let camara_animation = new MyCameraAnimation(this.scene, this.scene.graph.selectedCameraID, this.scene.camera, isCapture);
        this.scene.graph.animations[this.scene.graph.selectedCameraID] = camara_animation;
    }
}