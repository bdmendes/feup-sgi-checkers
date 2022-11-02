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

    }

    /**
     * 
     * @param {GraphKeyframe} keyframe 
     */
    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
        if (keyframe.instant < this.startTime) {
            this.startTime = keyframe.instant;
        }
        if (keyframe.instant > this.endTime) {
            this.endTime = keyframe.instant;
        }
    }

    update(t) {
        if (t >= this.startTime) {
            this.isVisible = true;
        }
    }

    apply() {
        //this.scene.multMatrix(this.matrix);
    }
}