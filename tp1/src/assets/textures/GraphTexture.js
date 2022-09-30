import { CGFappearance, CGFtexture } from "../../../../lib/CGF.js";

export class GraphTexture {
    constructor(scene, id, file, length_s, length_t) {
        // TODO: Work with length_s and length_t
        this.id = id;
        this.scene = scene;
        this.file = file;
        this.texture = new CGFtexture(scene, file);
    }
}