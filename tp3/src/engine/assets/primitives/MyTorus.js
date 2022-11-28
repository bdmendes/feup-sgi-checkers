import { CGFobject, CGFscene } from '../../../../../lib/CGF.js';
import { normalizeVector } from '../../utils/math.js';

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
     * @param {*} slices - the number of slices of the torus
     * @param {*} loops - the number of loops of the torus
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

        let loop_angle = (Math.PI * 2) / this.slices;
        let slice_edges = this.loops * 2 + 1;
        let slice_angle = (Math.PI * 2) / (this.loops * 2);
        let current_loop_angle = 0;

        for (let slice = 0; slice <= this.slices; slice++) {
            let current_slice_angle = 0;
            let center = [Math.cos(current_loop_angle) * this.outer, Math.sin(current_loop_angle) * this.outer, 0];

            for (let edge = 0; edge < slice_edges; edge++) {
                let x = Math.cos(current_slice_angle) * this.inner * Math.cos(current_loop_angle);
                let y = Math.cos(current_slice_angle) * this.inner * Math.sin(current_loop_angle);
                let z = Math.sin(current_slice_angle) * this.inner;

                this.vertices.push(center[0] + x, center[1] + y, center[2] + z);
                this.normals.push(...normalizeVector([x, y, z]));
                this.texCoords.push(edge / slice_edges, slice / this.slices);

                if (slice < this.slices && edge + 1 < slice_edges) {
                    this.indices.push(slice * slice_edges + edge, (slice + 1) * slice_edges + edge, slice * slice_edges + edge + 1);
                    this.indices.push(slice * slice_edges + edge + 1, (slice + 1) * slice_edges + edge, (slice + 1) * slice_edges + edge + 1);
                }

                current_slice_angle += slice_angle;
            }

            current_loop_angle += loop_angle;
        }
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
