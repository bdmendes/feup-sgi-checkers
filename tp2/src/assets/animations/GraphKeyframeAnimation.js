import { XMLscene } from '../../XMLscene.js';
import { GraphKeyframe } from './GraphKeyframe.js';

export class GraphKeyframeAnimation {

    /**
     * Creates an instance of GraphKeyframeAnimation.
     * @param {XMLscene} scene 
     */
    constructor(scene, id) {
        this.id = id;
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