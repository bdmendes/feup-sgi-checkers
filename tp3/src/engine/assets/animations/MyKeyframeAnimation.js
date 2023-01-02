import { XMLscene } from '../../XMLscene.js';
import { GraphKeyframe } from './GraphKeyframe.js';
import { MyAnimation } from './MyAnimation.js';

/**
 * @export
 * @class MyKeyframeAnimation
 * @extends {MyAnimation}
 */
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
        this.lastUpdate = false;
    }

    /**
     * Add keyframe to the animation
     * @param {GraphKeyframe} keyframe 
     */
    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
        this.keyframes.sort((a, b) => a.instant - b.instant);
    }


    /**
     * Update animation matrix for the current frame
     * @param {*} t
     * @memberof MyKeyframeAnimation
     */
    update(t, allowLoop = true) {
        if (this.keyframes.length == 0 || (this.lastUpdate && !this.scene.graph.loopAnimations)) {
            return;
        }

        if (this.scene.graph.loopAnimations && allowLoop) {
            t = t % this.keyframes[this.keyframes.length - 1].instant;
        }

        const beforeFirstInstant = t < this.keyframes[0].instant;
        const afterLastInstant = t > this.keyframes[this.keyframes.length - 1].instant;
        if (beforeFirstInstant || afterLastInstant) {
            if (afterLastInstant && !this.isVisible) {
                this.isVisible = true;
            }
            if ((!this.scene.graph.loopAnimations || !allowLoop) && !this.lastUpdate && afterLastInstant && this.keyframes.length > 1) {
                this.matrix = this.interpolate(this.keyframes[this.keyframes.length - 2], this.keyframes[this.keyframes.length - 1], 1);
                this.lastUpdate = true;
            }
            return;
        }

        if (!this.isVisible) {
            this.isVisible = true;
        }

        // Find current keyframes
        for (let i = 0; i < this.keyframes.length; i++) {
            if (t >= this.keyframes[i].instant) {
                this.lastKeyframe = this.keyframes[i];
                this.nextKeyFrame = this.keyframes[i + 1 < this.keyframes.length ? i + 1 : 0];
            } else {
                break;
            }
        }

        // Calculate current transformation matrix
        this.matrix = this.interpolate(this.lastKeyframe, this.nextKeyFrame, (t - this.lastKeyframe.instant) / (this.nextKeyFrame.instant - this.lastKeyframe.instant));
    }

    /**
     * Apply the animation matrix to the scene
     * @memberof MyKeyframeAnimation
     */
    apply() {
        if (this.matrix == null) {
            return;
        }
        this.scene.multMatrix(this.matrix);
    }

    /**
     * Interpolate between two keyframes according to the current frame
     * @param {*} lastKeyframe
     * @param {*} nextKeyFrame
     * @param {*} t
     * @memberof MyKeyframeAnimation
     */
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
        mat4.rotateZ(newMatrix, newMatrix, rotateCoords[2]);
        mat4.rotateY(newMatrix, newMatrix, rotateCoords[1]);
        mat4.rotateX(newMatrix, newMatrix, rotateCoords[0]);

        // Interpolate scale
        let scaleCoords = [0, 0, 0];
        vec3.lerp(scaleCoords, lastKeyframe.transformation.scaleCoords, nextKeyFrame.transformation.scaleCoords, t);
        mat4.scale(newMatrix, newMatrix, scaleCoords);

        return newMatrix;
    }
}