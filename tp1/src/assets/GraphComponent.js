/**
 * GraphComponent
 */
export class GraphComponent {
    constructor(scene, id) {
        this.id = id;
        this.scene = scene;
        this.children = {};
        this.primitives = {};
        this.materialIDs = [];
        this.transformationIDs = [];
    }

    display() {
        for (const materialID of this.materialIDs) {
            this.scene.graph.materials[materialID].apply();
        }
        for (const transformationID of this.transformationIDs) {
            this.scene.graph.transformations[transformationID].apply();
        }
        for (const key in this.children) {
            this.children[key].display();
            this.children[key].enableNormalViz();
        }
        for (const key in this.primitives) { //add transformations here
            this.scene.pushMatrix();
            this.children[key].display();
            this.children[key].enableNormalViz();
            this.scene.popMatrix();
        }
    }
}
