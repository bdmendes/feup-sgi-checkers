/**
 * GraphComponent
 */
export class GraphComponent {
    constructor(scene, id) {
        this.id = id;
        this.scene = scene;
        this.children = {};
        this.materialIDs = []; // length >= 1
        this.transformations = []; // length >= 0
        this.textureID = null; // nonnull
    }

    display(parentMaterial, parentTexture = null) {
        this.scene.pushMatrix();
        const material = this.renderMaterial(parentMaterial);
        const texture = this.renderTexture(material, parentTexture);
        this.renderTransformations();
        this.renderChildren(material, texture);
        this.scene.popMatrix();
    }

    renderMaterial(parentMaterial) {
        const materialID = this.materialIDs[this.scene.graph.selectedMaterialIndex % this.materialIDs.length];
        if (materialID === "inherit") {
            parentMaterial.apply();
            return parentMaterial;
        }

        const material = this.scene.graph.materials[materialID];
        material.apply();
        return material;
    }

    renderTexture(material, parentTexture) {
        if (this.textureID === "inherit") {
            material.setTexture(parentTexture === null ? null : parentTexture.texture);
            material.apply();
            return parentTexture;
        }

        let texture = null;
        if (this.textureID === "none") {
            material.material.setTexture(texture);
        } else {
            texture = this.scene.graph.textures[this.textureID];
            material.setTexture(texture.texture);
        }
        material.apply();
        return texture;
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

    renderChildren(material, texture) {
        for (const key in this.children) {
            this.children[key].display(material, texture);
            if (typeof this.children[key].enableNormalViz === 'function') {
                //this.children[key].enableNormalViz();
            }
        }
    }
}
