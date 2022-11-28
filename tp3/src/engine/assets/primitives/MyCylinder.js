import { CGFobject, CGFscene } from '../../../../../lib/CGF.js';
import { normalizeVector } from '../../utils/math.js';

/**
 * MyCylinder primitive
 * @export
 * @class MyCylinder
 * @extends {CGFobject}
 */
export class MyCylinder extends CGFobject {

    /**
     * Creates an instance of MyCylinder.
     * @param {CGFscene} scene: the scene where the primitive will be displayed
     * @param {*} id: the id of the primitive
     * @param {*} base: the base radius of the cylinder
     * @param {*} top: the top radius of the cylinder
     * @param {*} height: the height of the cylinder
     * @param {*} slices: the number of slices of the cylinder
     * @param {*} stacks: the number of stacks of the cylinder
     * @memberof MyCylinder
     */
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

    /**
     * initBuffers of MyCylinder primitive by calculating every vertice, normals, indices and texCoords
     * @memberof MyCylinder
     */
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
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
