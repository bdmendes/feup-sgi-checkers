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
        this.scene.pushMatrix();

        for (const materialID of this.materialIDs) {
            this.scene.graph.materials[materialID].apply(); // TODO scroll through with m key
        }
        for (let i = this.transformationIDs.length - 1; i >= 0; i--) {
            this.scene.graph.transformations[this.transformationIDs[i]].apply();
        }
        for (const key in this.children) {

            this.children[key].display();
            if (typeof this.children[key].enableNormalViz() === 'function') {
                this.children[key].enableNormalViz();
            }
        }
        this.scene.popMatrix();
    }
}
