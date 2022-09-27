/**
 * GraphComponent
 */
export class GraphComponent {
    constructor(scene, id) {
        this.id = id;
        this.scene = scene;
        this.children = {};
        this.primitives = {};
    }

    display() {
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
