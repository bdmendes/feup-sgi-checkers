import { CGFobject } from '../../../lib/CGF.js';
import { hypothenus, normalizeVector } from '../utils/math.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyTorus extends CGFobject {
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let loop_angle = (2 * Math.PI) / this.slices;
        let slice_edges = this.loops * 2;
        let slice_angle = (2 * Math.PI) / (slice_edges);
        let current_loop_angle = 0;

        for (let current_slice = 0; current_slice <= this.slices; current_slice++) {
            let current_loop = 0;
            let current_slice_angle = 0;
            let center = [Math.cos(current_loop_angle) * this.outer, Math.sin(current_loop_angle) * this.outer, 0];
            for (; ;) {
                let x = Math.cos(current_slice_angle) * this.inner * Math.cos(current_loop_angle);
                let y = Math.cos(current_slice_angle) * this.inner * Math.sin(current_loop_angle);
                let z = Math.sin(current_slice_angle) * this.inner;

                this.vertices.push(center[0] + x, center[1] + y, center[2] + z);
                this.normals.push(x, y, z);

                if (current_slice < this.slices && current_loop < slice_edges) {
                    this.indices.push(current_slice * slice_edges + current_loop + 1,
                        current_slice * slice_edges + current_loop,
                        (current_slice + 1) * slice_edges + current_loop);

                    this.indices.push(current_slice * slice_edges + current_loop,
                        (current_slice + 1) * slice_edges + current_loop - 1,
                        (current_slice + 1) * slice_edges + current_loop);
                }

                current_slice_angle += slice_angle;
                if (current_loop + 1 === slice_edges) { break; } else { current_loop++; }
            }

            current_loop_angle += loop_angle;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
