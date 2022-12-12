import { GraphKeyframe } from "../engine/assets/animations/GraphKeyframe.js";
import { MyPieceAnimation } from "../engine/assets/animations/MyPieceAnimation.js";
import { MyCameraAnimation } from "../engine/assets/animations/MyCameraAnimation.js";

export class AnimationController {
    constructor(scene) {
        this.scene = scene;
    }

    injectMoveAnimation(component, initial, final) {
        if (component.animationID == null) {
            let animation = new MyPieceAnimation(this.scene, component.id);
            this.scene.graph.animations[animation.id] = animation;
            component.animationID = animation.id;

            const midKeyframe = new GraphKeyframe(this.scene, 1);
            midKeyframe.transformation = { rotateX: 0, rotateY: 0, rotateZ: 0, translationCoords: [final[1] - initial[1], 0, final[0] - initial[0]], scaleCoords: [1, 1, 1] }
            this.scene.graph.animations[component.id].addKeyframe(midKeyframe);
        } else {
            const midKeyframe = new GraphKeyframe(this.scene, 1);
            midKeyframe.transformation = { rotateX: 0, rotateY: 0, rotateZ: 0, translationCoords: [final[1] - initial[1], 0, final[0] - initial[0]], scaleCoords: [1, 1, 1] }
            this.scene.graph.animations[component.id].addKeyframe(midKeyframe);
        }
    }

    injectCameraAnimation(camera, turn) {
        let camara_animation = new MyCameraAnimation(this.scene, this.scene.graph.selectedCameraID, camera, turn);
        this.scene.graph.animations[this.scene.graph.selectedCameraID] = camara_animation;
        this.scene.graph.cameraAnimation = this.scene.graph.selectedCameraID
    }
}