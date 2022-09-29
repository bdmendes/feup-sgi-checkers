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
        this.transformations = [];
        this.textureID = null;
    }

    display() {
        this.scene.pushMatrix();

        for (const materialID of this.materialIDs) {
            if (this.textureID !== null) {
                this.scene.graph.materials[materialID].setTexture(this.scene.graph.textures[this.textureID].texture); // TODO scroll through with m key
            }

            this.scene.graph.materials[materialID].apply(); // TODO scroll through with m key
        }
        for (let i = this.transformations.length - 1; i >= 0; i--) {
            if (typeof this.transformations[i] === 'string') {
                this.scene.graph.transformations[this.transformations[i]].apply();
            } else {
                this.transformations[i].apply();
            }
        }
        for (const key in this.children) {
            this.children[key].display();
            if (typeof this.children[key].enableNormalViz === 'function') {
                this.children[key].enableNormalViz();
            }
        }
        this.scene.popMatrix();
    }
}
