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

        this.lastKeyframe = null;
        this.nextKeyFrame = null;
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
        const beforeFirstInstant = t < this.keyframes[0].instant;
        const afterLastInstant = t > this.keyframes[this.keyframes.length - 1].instant;
        if (beforeFirstInstant || afterLastInstant) {
            return;
        }

        if (!this.isVisible) {
            this.isVisible = true;
        }

        // Find current keyframes
        for (let i = 0; i < this.keyframes.length; i++) {
            if (t >= this.keyframes[i].instant) {
                this.lastKeyframe = this.keyframes[i];
                this.nextKeyFrame = this.keyframes[i + 1];
            } else {
                break;
            }
        }

        // Calculate current transformation matrix
        this.interpolate(this.lastKeyframe, this.nextKeyFrame, (t - this.lastKeyframe.instant) / (this.nextKeyFrame.instant - this.lastKeyframe.instant));
    }

    apply() {
        this.scene.multMatrix(this.matrix);
    }

    interpolate(lastKeyframe, nextKeyFrame, t) {
        let newMatrix = mat4.create();

        // Interpolate translation
        let translationCoords = [0, 0, 0];
        vec3.lerp(translationCoords, lastKeyframe.transformation.translationCoords, nextKeyFrame.transformation.translationCoords, t);
        mat4.translate(newMatrix, newMatrix, translationCoords);

        // Interpolate rotation
        let rotateCoords = [0, 0, 0];
        let keyframeRotateCoords = (keyframe) => [keyframe.transformation.rotateX, keyframe.transformation.rotateY, keyframe.transformation.rotateZ];
        vec3.lerp(rotateCoords, keyframeRotateCoords(lastKeyframe), keyframeRotateCoords(nextKeyFrame), t);
        mat4.rotateX(newMatrix, newMatrix, rotateCoords[0]);
        mat4.rotateY(newMatrix, newMatrix, rotateCoords[1]);
        mat4.rotateZ(newMatrix, newMatrix, rotateCoords[2]);

        // Interpolate scale
        let scaleCoords = [0, 0, 0];
        vec3.lerp(scaleCoords, lastKeyframe.transformation.scaleCoords, nextKeyFrame.transformation.scaleCoords, t);
        mat4.scale(newMatrix, newMatrix, scaleCoords);

        this.matrix = newMatrix;
    }
}