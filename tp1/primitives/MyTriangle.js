import { CGFobject } from '../../lib/CGF.js';
import { crossProduct, normalizeVector } from '../utils/math.js';

/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x1 - X coordinate of first vertex
 * @param y1 - Y coordinate of first vertex
 * @param z3 - Z coordinate of first vertex
 * @param x2 - X coordinate of second vertex
 * @param y2 - Y coordinate of second vertex
 * @param z2 - Z coordinate of second vertex
 * @param x3 - X coordinate of third vertex
 * @param y3 - Y coordinate of third vertex
 * @param z3 - Z coordinate of third vertex
 */
export class MyTriangle extends CGFobject {
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

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            this.x1, this.y1, this.z1,  // 0
            this.x2, this.y2, this.z2,  // 1
            this.x3, this.y3, this.z3,  // 2
        ];

        // Counter-clockwise reference of vertices
        this.indices = [0, 1, 2];

        // Normals are the same for all vertices
        const normal =
            normalizeVector(crossProduct([this.x1 - this.x2, this.y1 - this.y2, this.z1 - this.z2],
                [this.x1 - this.x3, this.y1 - this.y3, this.z1 - this.z3]));
        this.normals =
            [...normal, ...normal, ...normal];

        /*
        Texture coords (s,t)
        +----------> s
    |
    |
        |
        v
    t
    */

        //this.texCoords = [0, 1, 1, 1, 0, 0, 1, 0];
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * @method updateTexCoords
     * Updates the list of texture coordinates of the triangle
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(coords) {
        this.texCoords = [...coords];
        this.updateTexCoordsGLBuffers();
    }
}
