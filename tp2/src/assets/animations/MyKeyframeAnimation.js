import { CGFscene } from "../../../../lib/CGF.js";
import { XMLscene } from '../../XMLscene.js';
import { GraphKeyframe } from './GraphKeyframe.js';
import { MyAnimation } from './MyAnimation.js';

export class MyKeyframeAnimation extends MyAnimation {
    /**
     * Creates an instance of MyKeyframeAnimation.
     * @param {XMLscene} scene 
     */
    constructor(scene, id) {
        super(id);
        this.scene = scene;
        this.keyframes = [];

        this.keyframe1 = null;
        this.keyframe2 = null;
        this.lastUpdate = false;
    }

    /**
     * 
     * @param {GraphKeyframe} keyframe 
     */
    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
        this.keyframes.sort((a, b) => a.instant - b.instant);
    }

    update(t) {
        if (t < this.keyframes[0].instant || (t >= this.keyframes[this.keyframes.length - 1].instant && this.lastUpdate)) {
            return;
        } else if (t >= this.keyframes[this.keyframes.length - 1].instant) {
            this.lastUpdate = true;
            this.interpolate(this.keyframe1, this.keyframe2, 1);
            return;
        } else if (!this.isVisible && t >= this.keyframes[0].instant && t < this.keyframes[this.keyframes.length - 1].instant) {
            this.isVisible = true;
        }

        for (let i = 0; i < this.keyframes.length; i++) {
            if (t >= this.keyframes[i].instant) {
                this.keyframe1 = this.keyframes[i];
                this.keyframe2 = this.keyframes[i + 1];
            }
        }

        this.interpolate(this.keyframe1, this.keyframe2, (t - this.keyframe1.instant) / (this.keyframe2.instant - this.keyframe1.instant));
    }

    apply() {
        this.scene.multMatrix(this.matrix);
    }

    interpolate(keyframe1, keyframe2, t) {
        let new_matrix = mat4.create();

        let translation_coords = [0, 0, 0];
        vec3.lerp(translation_coords, keyframe1.transformation.translation_coords, keyframe2.transformation.translation_coords, t);
        mat4.translate(new_matrix, new_matrix, translation_coords);

        let rotate_coords = [0, 0, 0];
        vec3.lerp(rotate_coords, this.getKeyframeRotateCoords(keyframe1), this.getKeyframeRotateCoords(keyframe2), t);

        mat4.rotateX(new_matrix, new_matrix, rotate_coords[0]);
        mat4.rotateY(new_matrix, new_matrix, rotate_coords[1]);
        mat4.rotateZ(new_matrix, new_matrix, rotate_coords[2]);

        let scale_coords = [0, 0, 0];
        vec3.lerp(scale_coords, keyframe1.transformation.scale_coords, keyframe2.transformation.scale_coords, t);
        mat4.scale(new_matrix, new_matrix, scale_coords);

        this.matrix = new_matrix;
    }

    getKeyframeRotateCoords(keyframe) {
        return [keyframe.transformation.rotate_x, keyframe.transformation.rotate_y, keyframe.transformation.rotate_z];
    }
}