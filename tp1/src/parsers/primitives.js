import { MyRectangle } from "../primitives/MyRectangle.js";
import { MySphere } from "../primitives/MySphere.js";
import { MyTorus } from "../primitives/MyTorus.js";
import { MyTriangle } from "../primitives/MyTriangle.js";
import { MyCylinder } from "../primitives/MyCylinder.js";

/**
 * Parses the <primitives> block.
 * @param {MySceneGraph} sceneGraph
 * @param {primitives block element} primitivesNode
 */
export function parsePrimitives(sceneGraph, primitivesNode) {
    var children = primitivesNode.children;

    sceneGraph.primitives = [];

    var grandChildren = [];

    // Any number of primitives.
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'primitive') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }

        // Get id of the current primitive.
        var primitiveId = sceneGraph.reader.getString(children[i], 'id');
        if (primitiveId == null) return 'no ID defined for texture';

        // Checks for repeated IDs.
        if (sceneGraph.primitives[primitiveId] != null)
            return 'ID must be unique for each primitive (conflict: ID = ' +
                primitiveId + ')';

        grandChildren = children[i].children;

        // Validate the primitive type
        if (grandChildren.length != 1 ||
            (grandChildren[0].nodeName != 'rectangle' &&
                grandChildren[0].nodeName != 'triangle' &&
                grandChildren[0].nodeName != 'cylinder' &&
                grandChildren[0].nodeName != 'sphere' &&
                grandChildren[0].nodeName != 'torus')) {
            return 'There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)'
        }

        // Specifications for the current primitive.
        var primitiveType = grandChildren[0].nodeName;

        // Retrieves the primitive coordinates.
        if (primitiveType == 'rectangle') {
            // x1
            var x1 = sceneGraph.reader.getFloat(grandChildren[0], 'x1');
            if (!(x1 != null && !isNaN(x1)))
                return 'unable to parse x1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // y1
            var y1 = sceneGraph.reader.getFloat(grandChildren[0], 'y1');
            if (!(y1 != null && !isNaN(y1)))
                return 'unable to parse y1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // x2
            var x2 = sceneGraph.reader.getFloat(grandChildren[0], 'x2');
            if (!(x2 != null && !isNaN(x2) && x2 > x1))
                return 'unable to parse x2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // y2
            var y2 = sceneGraph.reader.getFloat(grandChildren[0], 'y2');
            if (!(y2 != null && !isNaN(y2) && y2 > y1))
                return 'unable to parse y2 of the primitive coordinates for ID = ' +
                    primitiveId;

            var rect = new MyRectangle(sceneGraph.scene, primitiveId, x1, x2, y1, y2);

            sceneGraph.primitives[primitiveId] = rect;
        } else if (primitiveType == 'triangle') {
            // x1
            var x1 = sceneGraph.reader.getFloat(grandChildren[0], 'x1');
            if (!(x1 != null && !isNaN(x1)))
                return 'unable to parse x1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // y1
            var y1 = sceneGraph.reader.getFloat(grandChildren[0], 'y1');
            if (!(y1 != null && !isNaN(y1)))
                return 'unable to parse y1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // z1
            var z1 = sceneGraph.reader.getFloat(grandChildren[0], 'z1');
            if (!(z1 != null && !isNaN(y1)))
                return 'unable to parse z1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // x2
            var x2 = sceneGraph.reader.getFloat(grandChildren[0], 'x2');
            if (!(x2 != null && !isNaN(x2)))
                return 'unable to parse x2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // y2
            var y2 = sceneGraph.reader.getFloat(grandChildren[0], 'y2');
            if (!(y2 != null && !isNaN(y2)))
                return 'unable to parse y2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // z2
            var z2 = sceneGraph.reader.getFloat(grandChildren[0], 'z2');
            if (!(z2 != null && !isNaN(y1)))
                return 'unable to parse z2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // x3
            var x3 = sceneGraph.reader.getFloat(grandChildren[0], 'x3');
            if (!(x3 != null && !isNaN(x3)))
                return 'unable to parse x3 of the primitive coordinates for ID = ' +
                    primitiveId;

            // y3
            var y3 = sceneGraph.reader.getFloat(grandChildren[0], 'y3');
            if (!(y3 != null && !isNaN(y3)))
                return 'unable to parse y3 of the primitive coordinates for ID = ' +
                    primitiveId;

            // z3
            var z3 = sceneGraph.reader.getFloat(grandChildren[0], 'z3');
            if (!(z3 != null && !isNaN(y1)))
                return 'unable to parse z3 of the primitive coordinates for ID = ' +
                    primitiveId;

            var triangle = new MyTriangle(sceneGraph.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3);
            sceneGraph.primitives[primitiveId] = triangle;
        } else if (primitiveType == 'cylinder') {
            // base
            var base = sceneGraph.reader.getFloat(grandChildren[0], 'base');
            if (!(base != null && !isNaN(base)))
                return 'unable to parse x1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // top
            var top = sceneGraph.reader.getFloat(grandChildren[0], 'top');
            if (!(top != null && !isNaN(top)))
                return 'unable to parse y1 of the primitive coordinates for ID = ' +
                    primitiveId;

            // height
            var height = sceneGraph.reader.getFloat(grandChildren[0], 'height');
            if (!(height != null && !isNaN(height)))
                return 'unable to parse x2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // slices
            var slices = sceneGraph.reader.getFloat(grandChildren[0], 'slices');
            if (!(slices != null && !isNaN(slices)))
                return 'unable to parse y2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // stacks
            var stacks = sceneGraph.reader.getFloat(grandChildren[0], 'stacks');
            if (!(stacks != null && !isNaN(stacks)))
                return 'unable to parse y2 of the primitive coordinates for ID = ' +
                    primitiveId;

            var cylinder = new MyCylinder(sceneGraph.scene, primitiveId, base, top, height, slices, stacks);

            sceneGraph.primitives[primitiveId] = cylinder;
        } else if (primitiveType == 'cylinder') {
            var radius = sceneGraph.reader.getFloat(grandChildren[0], 'radius');
            if (!(radius != null && !isNaN(radius)))
                return 'unable to parse radius of the primitive coordinates for ID = ' +
                    primitiveId;

            var slices = sceneGraph.reader.getInteger(grandChildren[0], 'slices');
            if (!(slices != null && !isNaN(slices)))
                return 'unable to parse slices of the primitive coordinates for ID = ' +
                    primitiveId;

            var stacks = sceneGraph.reader.getInteger(grandChildren[0], 'stacks');
            if (!(stacks != null && !isNaN(stacks)))
                return 'unable to parse stacks of the primitive coordinates for ID = ' +
                    primitiveId;

            const sphere = new MySphere(sceneGraph.scene, primitiveId, radius, slices, stacks);
            sceneGraph.primitives[primitiveId] = sphere;
        } else if (primitiveType == 'sphere') {
            var radius = sceneGraph.reader.getFloat(grandChildren[0], 'radius');
            if (!(radius != null && !isNaN(radius)))
                return 'unable to parse radius of the primitive coordinates for ID = ' +
                    primitiveId;

            var slices = sceneGraph.reader.getInteger(grandChildren[0], 'slices');
            if (!(slices != null && !isNaN(slices)))
                return 'unable to parse slices of the primitive coordinates for ID = ' +
                    primitiveId;

            var stacks = sceneGraph.reader.getInteger(grandChildren[0], 'stacks');
            if (!(stacks != null && !isNaN(stacks)))
                return 'unable to parse stacks of the primitive coordinates for ID = ' +
                    primitiveId;

            const sphere = new MySphere(sceneGraph.scene, primitiveId, radius, slices, stacks);
            sceneGraph.primitives[primitiveId] = sphere;
        } else if (primitiveType == 'torus') {
            //inner
            var inner = sceneGraph.reader.getFloat(grandChildren[0], 'inner');
            if (!(inner != null && !isNaN(inner)))
                return 'unable to parse radius of the primitive coordinates for ID = ' +
                    primitiveId;

            //outer
            var outer = sceneGraph.reader.getInteger(grandChildren[0], 'outer');
            if (!(outer != null && !isNaN(outer)))
                return 'unable to parse slices of the primitive coordinates for ID = ' +
                    primitiveId;

            // slices
            var slices = sceneGraph.reader.getFloat(grandChildren[0], 'slices');
            if (!(slices != null && !isNaN(slices)))
                return 'unable to parse y2 of the primitive coordinates for ID = ' +
                    primitiveId;

            // stacks
            var loops = sceneGraph.reader.getFloat(grandChildren[0], 'loops');
            if (!(loops != null && !isNaN(loops)))
                return 'unable to parse y2 of the primitive coordinates for ID = ' +
                    primitiveId;

            const sphere = new MyTorus(sceneGraph.scene, primitiveId, inner, outer, slices, loops);
            sceneGraph.primitives[primitiveId] = sphere;
        } else {
            console.warn('To do: Parse other primitives.');
        }
    }

    console.log('Parsed primitives');
    return null;
}