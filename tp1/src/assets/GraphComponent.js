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
    }

    display() {
        for (const materialID of this.materialIDs) {
            this.scene.graph.materials[materialID].apply();
        }
        for (const key in this.children) {
            this.children[key].display();
            this.children[key].enableNormalViz();
        }
        for (const key in this.primitives) {
            this.children[key].display();
            this.children[key].enableNormalViz();
        }
    }
}
