import { CGFobject } from '../../../../lib/CGF.js';
import { hypothenus, normalizeVector } from '../../utils/math.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyCylinder extends CGFobject {
    constructor(scene, id, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.id = id;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let stack_height = this.height / this.stacks;
        let angle = (2 * Math.PI) / this.slices;
        let delta = (this.top - this.base) / this.stacks;

        let z_normal = (this.base - this.top) / this.height;
        let edges = this.slices + 1;

        for (let current_stack = 0; current_stack <= this.stacks; current_stack++) {
            let j = 0;
            let current_angle = 0;
            for (; ;) {
                this.vertices.push(Math.cos(current_angle) * (this.base + current_stack * delta),
                    Math.sin(current_angle) * (this.base + current_stack * delta),
                    current_stack * stack_height);

                this.normals.push(...normalizeVector([Math.cos(current_angle), Math.sin(current_angle), z_normal]));

                this.texCoords.push(j / this.slices, 1 - current_stack / this.stacks);

                if (current_stack < this.stacks && j < this.slices) {
                    this.indices.push(current_stack * edges + j, current_stack * edges + j + 1, (current_stack + 1) * edges + j);
                    this.indices.push((current_stack + 1) * edges + j, current_stack * edges + j + 1, (current_stack + 1) * edges + j + 1);
                }

                current_angle += angle;
                if (j === this.slices) { break; } else { j++; }
            }
        }
        console.log(this.vertices.length);
        console.log(this.indices.length);
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
