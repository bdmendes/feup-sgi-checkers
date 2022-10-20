import { MyRectangle } from "./primitives/MyRectangle.js";
import { MyTriangle } from "./primitives/MyTriangle.js";


/**
 * @export
 * @class GraphComponent
 */
export class GraphComponent {

    /**
     * Creates an instance of GraphComponent.
     * @param {*} scene
     * @param {*} id
     * @memberof GraphComponent
     */
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

    /**
     * Render everything needed to display children components
     * @param {*} parentMaterial
     * @param {*} [parentTexture=null]
     * @param {number} [parent_length_s=1]
     * @param {number} [parent_length_t=1]
     * @memberof GraphComponent
     */
    display(parentMaterial, parentTexture = null, parent_length_s = 1, parent_length_t = 1) {
        this.scene.pushMatrix();
        const material = this.renderMaterial(parentMaterial);
        const texture = this.renderTexture(material, parentTexture);
        this.renderTransformations();
        this.renderChildren(material, texture, parent_length_s, parent_length_t);
        this.scene.popMatrix();
    }

    /**
     * Render material of a component with special care about parent material
     * @param {*} parentMaterial
     * @return {*} 
     * @memberof GraphComponent
     */
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

    /**
     * Render and apply texture to a material of a component with special care about parent texture
     * @param {*} material
     * @param {*} parentTexture
     * @return {*} 
     * @memberof GraphComponent
     */
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

    /**
     * Render all transformations of a component
     * @memberof GraphComponent
     */
    renderTransformations() {
        for (let i = 0; i < this.transformations.length; i++) {
            if (typeof this.transformations[i] === 'string') {
                this.scene.graph.transformations[this.transformations[i]].apply();
            } else {
                this.transformations[i].apply();
            }
        }
    }

    /**
     * Render and display every children of a component
     * @param {*} material
     * @param {*} texture
     * @param {*} parent_length_s
     * @param {*} parent_length_t
     * @memberof GraphComponent
     */
    renderChildren(material, texture, parent_length_s, parent_length_t) {
        for (const key in this.children) {
            let length_s = this.length_s ?? parent_length_s;
            let length_t = this.length_t ?? parent_length_t;

            if (this.children[key] instanceof MyTriangle || this.children[key] instanceof MyRectangle) {
                this.children[key].updateTexCoords(length_s, length_t);
            }
            if (!(this.children[key] instanceof GraphComponent)) {
                if (this.scene.graph.displayNormals) {
                    this.children[key].enableNormalViz();
                } else {
                    this.children[key].disableNormalViz();
                }
            }

            this.children[key].display(material, texture, length_s, length_t);
        }
    }

}
