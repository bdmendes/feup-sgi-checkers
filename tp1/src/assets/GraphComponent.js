import { MyRectangle } from "./primitives/MyRectangle.js";
import { MyTriangle } from "./primitives/MyTriangle.js";

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
        this.length_s = null;
        this.length_t = null;
    }

    display(parentMaterial, parentTexture = null, parent_length_s = 1, parent_length_t = 1) {
        this.scene.pushMatrix();
        const material = this.renderMaterial(parentMaterial);
        const texture = this.renderTexture(material, parentTexture);
        this.renderTransformations();
        this.renderChildren(material, texture, parent_length_s, parent_length_t);
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

    renderChildren(material, texture, parent_length_s, parent_length_t) {
        for (const key in this.children) {
            let [length_s, length_t] = (this.textureID === "inherit") ? [parent_length_s, parent_length_t] : [this.length_s, this.length_t];

            if (this.children[key] instanceof MyTriangle || this.children[key] instanceof MyRectangle) {
                this.children[key].updateTexCoords(length_s, length_t);
            }
            this.children[key].display(material, texture, length_s, length_t);
        }
    }
}
