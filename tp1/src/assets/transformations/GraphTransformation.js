import { CGFappearance } from "../../../../lib/CGF.js";

const transformationTypes = ['translate', 'scale', 'rotate'];

export class GraphTransformation {
    constructor(scene, id) {
        this.id = id;
        this.scene = scene;
        this.transformationMatrix = mat4.create();
    }

    addTranslation(coordinates) {

        this.transformationMatrix = mat4.translate(this.transformationMatrix, this.transformationMatrix, coordinates);
        console.log(coordinates);
        console.log(this.transformationMatrix);
    }

    apply() {
        //this.scene.pushMatrix();
        this.scene.multMatrix(this.transformationMatrix);
        //this.scene.popMatrix();
    }
}