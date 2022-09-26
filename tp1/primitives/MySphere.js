import { CGFobject } from '../../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius of the sphere
 * @param slices - Number of slices (divisions around axis)
 * @param stacks - Number of stacks (divisions between poles)
 */
export class MySphere extends CGFobject {
    constructor(scene, id, radius, slices, stacks) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        const deltaTheta = 2 * Math.PI / this.slices;
        let theta = 0;
        for (let i = 0; i < this.slices; i++) {
            this.vertices.push([this.radius * Math.cos(theta), this.radius * Math.sin(theta), 0]);
            theta += deltaTheta;
        }
        console.log(this.vertices);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * @method updateTexCoords
     * Updates the list of texture coordinates of the sphere
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(coords) {
        this.texCoords = [...coords];
        this.updateTexCoordsGLBuffers();
    }
}
