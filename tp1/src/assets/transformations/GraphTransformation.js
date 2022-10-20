import { CGFappearance } from "../../../../lib/CGF.js";
import { degreesToRadians } from "../../utils/math.js";

/**
 * @export
 * @class GraphTransformation
 */
export class GraphTransformation {

    /**
     * Creates an instance of GraphTransformation.
     * @param {*} scene
     * @param {string} [id='']
     * @memberof GraphTransformation
     */
    constructor(scene, id = '') {
        this.id = id;
        this.scene = scene;
        this.transformationMatrix = mat4.create();
    }

    /**
     * Apply a translate transformation to this component transformation matrix
     * @param {*} coordinates
     * @memberof GraphTransformation
     */
    addTranslation(coordinates) {
        this.transformationMatrix = mat4.translate(this.transformationMatrix, this.transformationMatrix, coordinates);
    }

    /**
     * Apply a scale transformation to this component transformation matrix
     * @param {*} coordinates
     * @memberof GraphTransformation
     */
    addScale(coordinates) {
        this.transformationMatrix = mat4.scale(this.transformationMatrix, this.transformationMatrix, coordinates);
    }

    /**
     * Apply a rotation transformation to this component transformation matrix
     * @param {*} axis
     * @param {*} angle
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