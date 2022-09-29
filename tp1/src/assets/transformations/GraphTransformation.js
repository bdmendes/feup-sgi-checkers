import { CGFappearance } from "../../../../lib/CGF.js";
import { degreesToRadians } from "../../utils/math.js";

const transformationTypes = ['translate', 'scale', 'rotate'];

export class GraphTransformation {
    constructor(scene, id = '') {
        this.id = id;
        this.scene = scene;
        this.transformationMatrix = mat4.create();
    }

    addTranslation(coordinates) {
        this.transformationMatrix = mat4.translate(this.transformationMatrix, this.transformationMatrix, coordinates);
    }

    addScale(coordinates) {
        this.transformationMatrix = mat4.scale(this.transformationMatrix, this.transformationMatrix, coordinates);
    }

    addRotation(axis, angle) {
        this.transformationMatrix = mat4.rotate(this.transformationMatrix, this.transformationMatrix, degreesToRadians(angle), axis);
    }

    apply() {
        this.scene.multMatrix(this.transformationMatrix);
    }
}