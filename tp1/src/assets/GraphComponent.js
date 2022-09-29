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
        this.renderMaterial();
        this.renderTexture();
        this.renderTransformations();
        this.renderChildren();
        this.scene.popMatrix();
    }

    renderMaterial() {
        if (this.materialIDs.length === 0) {
            return;
        }

        const materialID = this.materialIDs[this.scene.graph.selectedMaterialIndex % this.materialIDs.length];
        if (materialID === "inherit") {
            return;
        }

        const material = this.scene.graph.materials[materialID];
        this.scene.graph.lastAppliedMaterialID = materialID;
        material.apply();
    }

    renderTexture() {
        if (this.textureID === null || this.textureID === "inherit") {
            return;
        }
        const materialID = this.materialIDs[this.scene.graph.selectedMaterialIndex % this.materialIDs.length];
        const material = this.materialIDs.length === 0 || materialID === "inherit"
            ? this.scene.graph.materials[this.scene.graph.lastAppliedMaterialID]
            : this.scene.graph.materials[materialID];
        if (this.textureID === "none") {
            material.material.setTexture(null);
        } else {
            const texture = this.scene.graph.textures[this.textureID];
            texture.apply(material);
        }
        material.apply();
    }

    renderTransformations() {
        for (let i = this.transformations.length - 1; i >= 0; i--) {
            if (typeof this.transformations[i] === 'string') {
                this.scene.graph.transformations[this.transformations[i]].apply();
            } else {
                this.transformations[i].apply();
            }
        }
    }

    renderChildren() {
        for (const key in this.children) {
            this.children[key].display();
            if (typeof this.children[key].enableNormalViz === 'function') {
                //this.children[key].enableNormalViz();
            }
        }
    }
}
