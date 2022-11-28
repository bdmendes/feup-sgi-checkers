import { CGFappearance, CGFscene } from "../../../../../lib/CGF.js";
import { degreesToRadians } from "../../utils/math.js";

/**
 * @export
 * @class GraphTransformation: an abstraction of a transformation matrix
 */
export class GraphTransformation {

    /**
     * Creates an instance of GraphTransformation.
     * @param {CGFscene} scene - the scene where the transformation will be applied
     * @param {string} [id=''] - the transformation id
     * @memberof GraphTransformation
     */
    constructor(scene, id = '') {
        this.id = id;
        this.scene = scene;
        this.transformationMatrix = mat4.create();
    }

    /**
     * Apply a translate transformation to this component transformation matrix
     * @param {*} coordinates - the coordinates to translate
     * @memberof GraphTransformation
     */
    addTranslation(coordinates) {
        this.transformationMatrix = mat4.translate(this.transformationMatrix, this.transformationMatrix, coordinates);
    }

    /**
     * Apply a scale transformation to this component transformation matrix
     * @param {*} coordinates - the coordinates to scale
     * @memberof GraphTransformation
     */
    addScale(coordinates) {
        this.transformationMatrix = mat4.scale(this.transformationMatrix, this.transformationMatrix, coordinates);
    }

    /**
     * Apply a rotation transformation to this component transformation matrix
     * @param {*} axis - the axis to rotate
     * @param {*} angle - the angle to rotate
     * @memberof GraphTransformation
     */
    addRotation(axis, angle) {
        this.transformationMatrix = mat4.rotate(this.transformationMatrix, this.transformationMatrix, degreesToRadians(angle), axis);
    }

    /**
     * Apply component transformations
     * @memberof GraphTransformation
     */
    apply() {
        this.scene.multMatrix(this.transformationMatrix);
    }
}