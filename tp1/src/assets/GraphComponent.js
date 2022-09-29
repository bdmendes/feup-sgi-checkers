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

        // Material and texture
        if (this.materialIDs.length > 0) {
            const selectedMaterialID = this.materialIDs[this.scene.graph.selectedMaterialIndex % this.materialIDs.length];
            if (selectedMaterialID !== "inherit") {
                const selectedMaterial = this.scene.graph.materials[selectedMaterialID];
                if (this.textureID === null) {
                    selectedMaterial.setTexture(null);
                } else if (this.textureID !== "inherit") {
                    this.scene.graph.textures[this.textureID].apply(selectedMaterial);
                }
                selectedMaterial.apply();
            }
        } else {
            this.scene.defaultMaterial.apply();
        }

        // Transformations
        for (let i = this.transformations.length - 1; i >= 0; i--) {
            if (typeof this.transformations[i] === 'string') {
                this.scene.graph.transformations[this.transformations[i]].apply();
            } else {
                this.transformations[i].apply();
            }
        }

        // Children
        for (const key in this.children) {
            this.children[key].display();
            if (typeof this.children[key].enableNormalViz === 'function') {
                this.children[key].enableNormalViz();
            }
        }


        this.scene.popMatrix();
    }
}
