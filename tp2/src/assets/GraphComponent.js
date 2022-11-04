import { CGFscene } from "../../../lib/CGF.js";
import { GraphMaterial } from "./materials/GraphMaterial.js";
import { MyRectangle } from "./primitives/MyRectangle.js";
import { MyTriangle } from "./primitives/MyTriangle.js";
import { GraphTexture } from "./textures/GraphTexture.js";


/**
 * @export
 * @class GraphComponent: a node of the scene graph, with children,
 * a transformation matrix, a material and a texture
 */
export class GraphComponent {

    /**
     * Creates an instance of GraphComponent.
     * @param {CGFscene} scene - the scene where the component will be rendered
     * @param {*} id - the component id
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
        this.animationID = null;
        this.highlight = null;
    }

    /**
     * Render the component in the scene
     * @param {GraphMaterial} parentMaterial - the material of the parent component
     * @param {GraphTexture} [parentTexture=null] - the texture of the parent component
     * @param {number} [parent_length_s=1] - the length_s of the parent component
     * @param {number} [parent_length_t=1] - the length_t of the parent component
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
     * Render component's material considering parent's material
     * @param {GraphMaterial} parentMaterial - the material of the parent component
     * @return {GraphMaterial} 
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
     * Render component's texture considering parent's texture
     * @param {GraphMaterial} material - the material of the component
     * @param {GraphTexture} parentTexture - the texture of the parent component
     * @return {GraphTexture} 
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
     * @param {GraphMaterial} material - the material of the component
     * @param {GraphTexture} texture - the texture of the component
     * @param {*} parent_length_s - the length_s of the parent component
     * @param {*} parent_length_t - the length_t of the parent component
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

            if (this.animationID != null) {
                this.scene.graph.animations[this.animationID].apply();
            }

            if (this.animationID == null || this.scene.graph.animations[this.animationID].isVisible) {
                this.children[key].display(material, texture, length_s, length_t);
            }
        }
    }

}
