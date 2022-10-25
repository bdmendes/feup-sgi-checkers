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
    }
}