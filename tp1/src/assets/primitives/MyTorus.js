import { CGFobject, CGFscene } from '../../../../lib/CGF.js';
import { crossProduct, normalizeVector, vectorDifference } from '../../utils/math.js';

/**
 * MyTorus primitive
 * @export
 * @class MyTorus
 * @extends {CGFobject}
 */
export class MyTorus extends CGFobject {
    /**
     * Creates an instance of MyTorus.
     * @param {CGFscene} scene - the scene where the primitive will be displayed
     * @param {*} id - the id of the primitive
     * @param {*} inner - the inner radius of the torus
     * @param {*} outer - the outer radius of the torus
     * @param {*} slices - the number of slices ("inside sides") of the torus
     * @param {*} loops - the number of loops ("outside sides") of the torus
     * @memberof MyTorus
     */
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        this.id = id;

        this.initBuffers();
    }

    /**
     * initBuffers of MyTorus primitive by calculating every vertice, normals, indices and texCoords
     * @memberof MyTorus
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const deltaLoops = 2 * Math.PI / this.loops;
        const deltaSlices = 2 * Math.PI / this.slices;

        // Vertices and texCoords
        for (let loop = 0; loop <= this.loops; loop++) {
            const currentLoopAngle = loop * deltaLoops;
            for (let slice = 0; slice <= this.slices; slice++) {
                const currentSliceAngle = slice * deltaSlices;
                const x = (this.outer + this.inner * Math.cos(currentSliceAngle)) * Math.cos(currentLoopAngle);
                const y = (this.outer + this.inner * Math.cos(currentSliceAngle)) * Math.sin(currentLoopAngle);
                const z = this.inner * Math.sin(currentSliceAngle);
                this.vertices.push(x, y, z);
                const normal = [x - this.outer * Math.cos(currentLoopAngle), y - this.outer * Math.sin(currentLoopAngle), z];
                this.normals.push(...normalizeVector(normal));
                this.texCoords.push(slice / this.slices, loop / this.loops);
            }
        }

        // Indices
        for (let loop = 0; loop < this.loops; loop++) {
            for (let slice = 0; slice <= this.slices; slice++) {
                const vertex1 = loop * (this.slices + 1) + slice;
                const vertex2 = vertex1 + 1;
                const vertex3 = vertex1 + this.slices + 1;
                const vertex4 = vertex1 + this.slices;
                this.indices.push(vertex2, vertex1, vertex3);
                this.indices.push(vertex4, vertex3, vertex1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
