import { CGFscene } from "../../../../lib/CGF.js";
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
    constructor(scene, id, pickable = false, visible = true) {
        this.id = id;
        this.scene = scene;
        this.children = {};
        this.materialIDs = []; // length >= 1
        this.transformations = []; // length >= 0
        this.textureID = null; // nonnull
        this.tempTextureID = null;
        this.length_s = null;
        this.length_t = null;
        this.animationID = null;
        this.highlight = null;
        this.enableHighlight = true;
        this.text = null;
        this.pickable = pickable;
        this.visible = visible;
    }

    /**
     * Render the component in the scene
     * @param {GraphMaterial} parentMaterial - the material of the parent component
     * @param {GraphTexture} [parentTexture=null] - the texture of the parent component
     * @param {number} [parent_length_s=1] - the length_s of the parent component
     * @param {number} [parent_length_t=1] - the length_t of the parent component
     * @memberof GraphComponent
     */
    display(parentMaterial, parentTexture = null, parent_length_s = 1, parent_length_t = 1, pickableParent = false) {
        if (!this.visible) {
            return;
        }

        if (this.pickable) {
            this.scene.registerForPick(this.scene.currentPickId++, this);
        } else if (!pickableParent) {
            this.scene.clearPickRegistration();
        }

        this.scene.pushMatrix();

        const material = this.renderMaterial(parentMaterial);
        const texture = this.renderTexture(material, parentTexture);
        this.renderHighlight(texture);

        this.renderTransformations();
        this.renderAnimation();

        this.renderText(material);

        this.renderChildren(material, texture, parent_length_s, parent_length_t, this.pickable || pickableParent);

        this.scene.popMatrix();
    }

    /**
     * Render the component highlight shader
     * @memberof GraphComponent
     */
    renderHighlight(texture) {
        if (this.highlight != null && this.enableHighlight && this.hasDirectPrimitiveDescendant()) {
            // Do not set external uniform if 2 shaders are used (e.g. when picking)
            const pickingShaderDisabled = this.scene.activeShader != this.scene.pickShader;
            if (pickingShaderDisabled) {
                this.scene.highlightShader.setUniformsValues({
                    scale: this.highlight.currentScale,
                    ratio: this.highlight.ratio,
                    r: this.highlight.color[0],
                    g: this.highlight.color[1],
                    b: this.highlight.color[2],
                });
            }

            texture?.texture.bind();
            if (!this.scene.graph.lastComponentNeededHighlight) {
                this.scene.graph.lastComponentNeededHighlight = true;
                this.scene.setActiveShader(this.scene.highlightShader);
            }
            return;
        }

        // Do not set same shader twice
        if (!this.scene.graph.lastComponentNeededHighlight) {
            return;
        }
        this.scene.graph.lastComponentNeededHighlight = false;

        // Lights are passed automatically by WebCGF to its default shader,
        // so let's skip that with the simple variant of setActiveShader
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
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
        let texture = null;

        if (this.tempTextureID != null) {
            texture = this.scene.graph.textures[this.tempTextureID];
            material.setTexture(texture.texture);
        } else {
            if (this.textureID === "inherit") {
                material.setTexture(parentTexture === null ? null : parentTexture.texture);
                material.apply();
                return parentTexture;
            }

            if (this.textureID === "none") {
                material.material.setTexture(texture);
            } else {
                texture = this.scene.graph.textures[this.textureID];
                material.setTexture(texture.texture);
            }
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
     * Render component animation
     * @memberof GraphComponent
     */
    renderAnimation() {
        if (this.animationID != null) {
            this.scene.graph.animations[this.animationID].apply();
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
    renderChildren(material, texture, parent_length_s, parent_length_t, pickableParent) {
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

            if (this.animationID == null || this.scene.graph.animations[this.animationID].isVisible) {
                this.children[key].display(material, texture, length_s, length_t, pickableParent);
            }
        }
    }

    renderText(material) {
        if (this.text != null) {
            this.text.draw(material);
        }
    }

    /**
     * Verifies if this component has a direct primitive child
     * @return {boolean}
     * @memberof GraphComponent
     */
    hasDirectPrimitiveDescendant() {
        for (const key in this.children) {
            if (!(this.children[key] instanceof GraphComponent)) {
                return true;
            }
        }
        return false;
    }
}
