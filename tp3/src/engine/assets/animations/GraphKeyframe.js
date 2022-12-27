import { GraphTransformation } from '../transformations/GraphTransformation.js';
import { XMLscene } from '../../XMLscene.js';

/**
 * @export
 * @class GraphKeyframe
 */
export class GraphKeyframe {
    /**
     * Creates an instance of GraphKeyframe.
     * @param {XMLscene} scene
     * @param {*} instant
     * @param {GraphTransformation} transformation
     * @memberof GraphMaterial
     */
    constructor(scene, instant, transformation = []) {
        this.scene = scene;
        this.instant = instant;
        this.transformation = transformation;
        this.isJump = false;
        this.toKing = false;
    }
}