import { CGFscene, CGFtexture } from "../../../../../lib/CGF.js";

/**
 * @export
 * @class GraphTexture: an abstraction of a CGFtexture
 */
export class GraphTexture {

    /**
     * Creates an instance of GraphTexture.
     * @param {CGFscene} scene - the scene where the texture will be applied
     * @param {*} id - the texture id
     * @param {*} file - the texture file path
     * @memberof GraphTexture
     */
    constructor(scene, id, file) {
        this.id = id;
        this.scene = scene;
        this.file = file;
        this.texture = new CGFtexture(scene, file);
    }
}