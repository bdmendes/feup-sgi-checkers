import { CGFobject, CGFscene } from '../../../../../lib/CGF.js';
import { crossProduct, normalizeVector } from '../../utils/math.js';


/**
 *
 * @export
 * @class MyTriangle
 * @extends {CGFobject}
 */
export class MyTriangle extends CGFobject {

    /**
     * Creates an instance of MyTriangle.
     * @param {CGFscene} scene - the scene where the primitive will be displayed
     * @param {*} id - the id of the primitive
     * @param {*} x1 - the x coordinate of the first vertice
     * @param {*} y1 - the y coordinate of the first vertice
     * @param {*} z1 - the z coordinate of the first vertice
     * @param {*} x2 - the x coordinate of the second vertice
     * @param {*} y2 - the y coordinate of the second vertice
     * @param {*} z2 - the z coordinate of the second vertice
     * @param {*} x3 - the x coordinate of the third vertice
     * @param {*} y3 - the y coordinate of the third vertice
     * @param {*} z3 - the z coordinate of the third vertice
     * @memberof MyTriangle
     */
    constructor(scene, id, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        super(scene);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        this.id = id;

        this.a = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2) + Math.pow(this.z2 - this.z1, 2));
        this.b = Math.sqrt(Math.pow(this.x3 - this.x2, 2) + Math.pow(this.y3 - this.y2, 2) + Math.pow(this.z3 - this.z2, 2));
        this.c = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2) + Math.pow(this.z1 - this.z3, 2));

        this.cos_alpha = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);
        this.sin_alpha = Math.sqrt(1 - Math.pow(this.cos_alpha, 2));

        this.initBuffers();
    }

    /**
     * initBuffers of MyTriangle primitive by calculating every vertice, normals, indices and texCoords
     * @memberof MyTriangle
     */
    initBuffers() {
        this.vertices = [
            this.x1, this.y1, this.z1,  // 0
            this.x2, this.y2, this.z2,  // 1
            this.x3, this.y3, this.z3,  // 2
        ];

        this.indices = [0, 1, 2];

        const normal =
            normalizeVector(crossProduct([this.x1 - this.x2, this.y1 - this.y2, this.z1 - this.z2],
                [this.x1 - this.x3, this.y1 - this.y3, this.z1 - this.z3]));
        this.normals =
            [...normal, ...normal, ...normal];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }


    /**
     *
     *
     * @param {*} length_s - the length of the texture in the s direction
     * @param {*} length_t - the length of the texture in the t direction
     * @memberof MyTriangle
     */
    updateTexCoords(length_s, length_t) {
        this.texCoords = [0, 0,
            this.a / length_s, 0,
            (this.c * this.cos_alpha) / length_s, (this.c * this.sin_alpha) / length_t
        ];
        this.updateTexCoordsGLBuffers();
    }
}
