import { CGFnurbsSurface, CGFobject, CGFnurbsObject } from "../../../../lib/CGF.js";

export class MyPatch extends CGFobject {
    constructor(scene, id, degreeU, degreeV, partsU, partsV, controlPoints) {
        super(scene);
        this.id = id;
        this.degreeU = degreeU;
        this.degreeV = degreeV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = controlPoints;
        this.initBuffers();
    }

    initBuffers() {
        const vertices = [];
        for (let u = 0; u < this.degreeU + 1; u++) {
            const subarray = [];
            for (let v = 0; v < this.degreeV + 1; v++) {
                subarray.push([...this.controlPoints[v * (this.degreeU + 1) + u], 1]);
            }
            vertices.push(subarray);
        }

        const nurbsSurface = new CGFnurbsSurface(this.degreeU, this.degreeV, vertices);
        this.obj = new CGFnurbsObject(this.scene, this.partsU, this.partsV, nurbsSurface);
        this.normals = this.obj.normals;
        this.vertices = this.obj.vertices;
        this.indices = this.obj.indices;
        this.texCoords = this.obj.texCoords;
    }

    display() {
        this.obj.display();
    }
}