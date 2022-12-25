import { MyPieceAnimation } from "../engine/assets/animations/MyPieceAnimation.js";
import { MyCameraAnimation } from "../engine/assets/animations/MyCameraAnimation.js";

export class AnimationController {
    constructor(scene, stackState) {
        this.scene = scene;
        this.stackState = stackState;
    }

    injectMoveAnimation(component, initialPos, finalPos, capturedPieces) {
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this, component.id, initialPos);
            this.scene.graph.animations[component.id] = animation;
            component.animationID = component.id;
        }
        this.scene.graph.animations[component.id].addMidKeyframe(initialPos, finalPos, false, capturedPieces);
    }

    injectCaptureAnimation(capturedPiece) {
        let component = this.scene.graph.components[capturedPiece.componentID];
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this, component.id, capturedPiece.position);
            this.scene.graph.animations[component.id] = animation;
            component.animationID = component.id;
        }

        capturedPiece.isCaptured = true;
        this.scene.graph.animations[component.id].addMidKeyframe(capturedPiece.position,
            (component.id.includes('black')) ? this.stackState.blackStackPos : this.stackState.whiteStackPos, true);
    }

    injectCameraAnimation(isCapture) {
        let camara_animation = new MyCameraAnimation(this.scene, this.scene.graph.selectedCameraID, this.scene.camera, isCapture);
        this.scene.graph.animations[this.scene.graph.selectedCameraID] = camara_animation;
    }
}