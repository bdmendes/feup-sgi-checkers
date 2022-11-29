import { CGFobject } from '../../../../../lib/CGF.js';
/**
 * MyRectangle primitive
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {

    /**
     * Creates an instance of MyRectangle.
     * @param {CGFscene} scene: the scene where the primitive will be displayed
     * @param {*} id: the id of the primitive
     * @param {*} x1: the x coordinate of the first corner point
     * @param {*} x2: the x coordinate of the second corner point
     * @param {*} y1: the y coordinate of the first corner point
     * @param {*} y2: the y coordinate of the second corner point
     * @memberof MyRectangle
     */
    constructor(scene, id, x1, x2, y1, y2) {
        super(scene);
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.id = id;

        this.a = Math.abs(this.x1 - this.x2);
        this.b = Math.abs(this.y1 - this.y2);

        this.initBuffers();
    }

    /**
     * initBuffers of MyRectangle primitive by calculating every vertice, normals, indices and texCoords
     * @memberof MyRectangle
     */
    initBuffers() {
        this.vertices = [
            this.x1, this.y1, 0,  // 0
            this.x2, this.y1, 0,  // 1
            this.x1, this.y2, 0,  // 2
            this.x2, this.y2, 0   // 3
        ];

        this.indices = [0, 1, 2, 1, 3, 2];

        this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

        this.texCoords = [0, 1, 1, 1, 0, 0, 1, 0];
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * @method updateTexCoords
     * Updates the list of texture coordinates of the rectangle
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(length_s, length_t) {
        this.texCoords = [0, this.b / length_t, this.a / length_s, this.b / length_t, 0, 0, this.a / length_s, 0];
        this.updateTexCoordsGLBuffers();
    }
}
