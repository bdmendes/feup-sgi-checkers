import { MyPieceAnimation } from "../engine/assets/animations/MyPieceAnimation.js";
import { MyCameraAnimation } from "../engine/assets/animations/MyCameraAnimation.js";

export class AnimationController {
    constructor(scene) {
        this.scene = scene;
    }

    injectMoveAnimation(component, initialPos, finalPos, capturedPieces) {
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this, component.id, initialPos);
            this.scene.graph.animations[animation.id] = animation;
            component.animationID = animation.id;
        }
        this.scene.graph.animations[component.id].addMidKeyframe(initialPos, finalPos, capturedPieces);
    }

    injectCaptureAnimation(componentID) {
        // TODO: implement
        this.scene.graph.animations[componentID].isVisible = false;
    }

    injectCameraAnimation() {
        let camara_animation = new MyCameraAnimation(this.scene, this.scene.graph.selectedCameraID, this.scene.camera);
        this.scene.graph.animations[this.scene.graph.selectedCameraID] = camara_animation;
    }
}