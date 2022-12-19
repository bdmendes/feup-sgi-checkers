import { GraphKeyframe } from "../engine/assets/animations/GraphKeyframe.js";
import { MyPieceAnimation } from "../engine/assets/animations/MyPieceAnimation.js";
import { MyCameraAnimation } from "../engine/assets/animations/MyCameraAnimation.js";

export class AnimationController {
    constructor(scene) {
        this.scene = scene;
    }

    injectMoveAnimation(component, initial_pos, final_pos) {
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this.scene, component.id);
            this.scene.graph.animations[animation.id] = animation;
            component.animationID = animation.id;
        }
        this.scene.graph.animations[component.id].addMidKeyframe(initial_pos, final_pos)
    }

    injectCameraAnimation() {
        let camara_animation = new MyCameraAnimation(this.scene, this.scene.graph.selectedCameraID, this.scene.camera);
        this.scene.graph.animations[this.scene.graph.selectedCameraID] = camara_animation;
    }
}