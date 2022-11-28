import { CGFappearance, CGFscene } from "../../../../../lib/CGF.js";
import { GraphTexture } from "../textures/GraphTexture.js";

/**
 * @export
 * @class GraphMaterial: an abstraction of a CGFappearance
 */
export class GraphMaterial {

    /**
     * Creates an instance of GraphMaterial.
     * @param {CGFscene} scene
     * @param {*} id
     * @param {*} shininess
     * @memberof GraphMaterial
     */
    constructor(scene, id, shininess) {
        this.id = id;
        this.scene = scene;
        this.shininess = shininess;
        this.material = new CGFappearance(scene);
        this.material.setShininess(shininess);
    }

    /**
     * Add a material component to this material
     * @param {*} type
     * @param {*} r
     * @param {*} g
     * @param {*} b
     * @param {*} a
     * @return {*} 
     * @memberof GraphMaterial
     */
    addComponent(type, r, g, b, a) {
        if (type === 'emission') {
            this.material.setEmission(r, g, b, a);
        } else if (type === 'ambient') {
            this.material.setAmbient(r, g, b, a);
        } else if (type === 'diffuse') {
            this.material.setDiffuse(r, g, b, a);
        } else if (type === 'specular') {
            this.material.setSpecular(r, g, b, a);
        } else {
            return 'invalid ' + type + ' for component with ID ' + this.id;
        }
        return null;
    }

    /**
     * Set texture to this material
     * @param {GraphTexture} texture: a GraphTexture object
     * @memberof GraphMaterial
     */
    setTexture(texture) {
        this.material.setTexture(texture);
    }


    /**
     * Apply material
     * @memberof GraphMaterial
     */
    apply() {
        this.material.apply();
    }
}