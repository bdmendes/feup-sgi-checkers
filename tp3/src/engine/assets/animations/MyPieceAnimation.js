import { XMLscene } from '../../XMLscene.js';
import { GraphKeyframe } from './GraphKeyframe.js';
import { MyAnimation } from './MyAnimation.js';
import { MyKeyframeAnimation } from './MyKeyframeAnimation.js';
import { GraphTransformation } from '../transformations/GraphTransformation.js';

/**
 * @export
 * @class MyPieceAnimation
 * @extends {MyAnimation}
 */
export class MyPieceAnimation extends MyAnimation {
    /**
     * Creates an instance of MyKeyframeAnimation.
     * @param {XMLscene} scene 
     */
    constructor(scene, id) {
        super(id);
        this.scene = scene;
        this.currentTime = 0;
        this.startTime = -1;

        this.keyframeAnimation = new MyKeyframeAnimation(scene, "abc");

        const initialKeyframe = new GraphKeyframe(scene, 0);
        initialKeyframe.transformation = { rotateX: 0, rotateY: 0, rotateZ: 0, translationCoords: [0, 0, 0], scaleCoords: [1, 1, 1] }
        this.keyframeAnimation.addKeyframe(initialKeyframe);

        this.isVisible = true;
        this.pendingKeyframes = [];
    }

    addKeyframe(keyframe) {
        keyframe.transformation.translationCoords[0] = keyframe.transformation.translationCoords[0] + this.keyframeAnimation.keyframes[this.keyframeAnimation.keyframes.length - 1].transformation.translationCoords[0];
        keyframe.transformation.translationCoords[2] = keyframe.transformation.translationCoords[2] + this.keyframeAnimation.keyframes[this.keyframeAnimation.keyframes.length - 1].transformation.translationCoords[2];
        this.pendingKeyframes.push(keyframe);
    }

    /**
     * Update animation matrix for the current frame
     * @param {*} t
     * @memberof MyKeyframeAnimation
     */
    update(t) {
        if (this.pendingKeyframes.length > 0) {
            this.pendingKeyframes[0].instant = t + 1;
            this.keyframeAnimation.keyframes[this.keyframeAnimation.keyframes.length - 1].instant = t;
            this.keyframeAnimation.addKeyframe(this.pendingKeyframes[0]);
            this.pendingKeyframes.pop();
        }
        this.keyframeAnimation.update(t);
    }

    /**
     * Apply the animation matrix to the scene
     * @memberof MyKeyframeAnimation
     */
    apply() {
        this.keyframeAnimation.apply();
    }
}