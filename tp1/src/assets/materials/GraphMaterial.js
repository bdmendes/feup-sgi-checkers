import { CGFappearance } from "../../../../lib/CGF.js";

const materialTypes = ['emission', 'ambient', 'diffuse', 'specular'];

export class GraphMaterial {
    constructor(scene, id, shininess) {
        this.id = id;
        this.scene = scene;
        this.shininess = shininess;
        this.material = new CGFappearance(scene);
        this.material.setShininess(shininess);
    }

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

    setTexture(texture) {
        this.material.setTexture(texture);
    }

    apply() {
        // add logic to restore default appearance after applying
        this.material.apply();
    }
}