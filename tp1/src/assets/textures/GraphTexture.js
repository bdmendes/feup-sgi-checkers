import { CGFappearance, CGFtexture } from "../../../../lib/CGF.js";

/**
 * @export
 * @class GraphTexture
 */
export class GraphTexture {

    /**
     * Creates an instance of GraphTexture.
     * @param {*} scene
     * @param {*} id
     * @param {*} file
     * @memberof GraphTexture
     */
    constructor(scene, id, file) {
        this.id = id;
        this.scene = scene;
        this.file = file;
        this.texture = new CGFtexture(scene, file);
    }
}