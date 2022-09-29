import { CGFappearance, CGFtexture } from "../../../../lib/CGF.js";

export class GraphTexture {
    constructor(scene, id, file) {
        this.id = id;
        this.scene = scene;
        this.file = file;
        this.texture = new CGFtexture(scene, file);
    }

    apply(material) {
        material.setTexture(this.texture);
    }
}