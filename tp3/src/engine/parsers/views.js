import { CGFcamera, CGFcameraOrtho } from "../../../../lib/CGF.js";
import { degreesToRadians } from "../utils/math.js";

/**
 * Parses the <views> block.
 * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object.
 * @param {view block element} viewsNode - <views> block element.
 */
export function parseView(sceneGraph, viewsNode) {
    const defaultView = viewsNode.getAttribute('default');
    if (defaultView == null) {
        return 'no default view defined';
    }

    const children = viewsNode.children;
    for (const child of children) {
        if (child.nodeName === 'perspective') {
            const error = parsePerspectiveCamera(sceneGraph, child);
            if (error != null) {
                return error;
            }
        } else if (child.nodeName === 'ortho') {
            const error = parseOrthoCamera(sceneGraph, child);
            if (error != null) {
                return error;
            }
        } else {
            sceneGraph.onXMLMinorError('unknown view tag <' + child.nodeName + '>');
        }
    }

    if (sceneGraph.cameras[defaultView] == null) {
        return 'default view does not exist';
    }

    sceneGraph.selectedCameraID = defaultView;
    return null;
}


/**
 * Parses a <perspective> block.
 *
 * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object.
 * @param {*} perspectiveNode - <perspective> block element.
 * @return {*} 
 */
function parsePerspectiveCamera(sceneGraph, perspectiveNode) {
    // Parse ID
    const nodeID = perspectiveNode.getAttribute('id');
    if (nodeID == null) {
        return 'no ID defined for perspective camera';
    }

    // Checks for repeated IDs.
    if (sceneGraph.cameras[nodeID] != null) {
        return 'ID must be unique for each camera (conflict: ID = ' + nodeID + ')';
    }

    // Parse near, far, angle
    const [near, far, angle] = sceneGraph.parseFloatProps(perspectiveNode, 'perspective view with id=' + nodeID, ['near', 'far', 'angle']);
    if ([near, far, angle].includes(null)) {
        return 'unable to parse near, far or angle of perspective view with id=' + nodeID;
    }

    // Visit children
    const children = perspectiveNode.children;
    const nodeNames = sceneGraph.getNodeNames(children);

    // Parse from
    const fromNodeIndex = nodeNames.indexOf('from');
    if (fromNodeIndex === -1) {
        return 'perspective view missing <from> tag';
    }
    const fromNode = children[fromNodeIndex];
    const from = sceneGraph.parseFloatProps(fromNode, 'from perspective view with id=' + nodeID);
    if (from.length == 0) {
        return 'perspective view with id=' + nodeID + ' has invalid <from> tag';
    }

    // Parse to
    const toNodeIndex = nodeNames.indexOf('to');
    if (toNodeIndex === -1) {
        return 'perspective view missing <to> tag';
    }
    const toNode = children[toNodeIndex];
    const to = sceneGraph.parseFloatProps(toNode, 'to perspective view with id=' + nodeID);
    if (to.length == 0) {
        return 'perspective view with id=' + nodeID + ' has invalid <to> tag';
    }

    // Create camera
    const camera = new CGFcamera(degreesToRadians(angle), near, far,
        vec3.fromValues(from[0], from[1], from[2]), vec3.fromValues(to[0], to[1], to[2]));
    sceneGraph.cameras[nodeID] = camera;

    return null;
}


/**
 * Parses a <ortho> block.
 *
 * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object.
 * @param {*} orthoNode - <ortho> block element.
 * @return {*} 
 */
function parseOrthoCamera(sceneGraph, orthoNode) {
    // Parse ID
    const nodeID = orthoNode.getAttribute('id');
    if (nodeID == null) {
        return 'no ID defined for ortho camera';
    }

    // Checks for repeated IDs.
    if (sceneGraph.cameras[nodeID] != null) {
        return 'ID must be unique for each camera (conflict: ID = ' + nodeID + ')';
    }

    // Parse near, far, left, right, top, bottom
    const [near, far, left, right, top, bottom] = sceneGraph.parseFloatProps(orthoNode, 'ortho view with id=' + nodeID, ['near', 'far', 'left', 'right', 'top', 'bottom']);
    if ([near, far, left, right, top, bottom].includes(null)) {
        return 'unable to parse near, far, left, right, top or bottom of ortho view with id=' + nodeID;
    }

    // Visit children
    const children = orthoNode.children;
    const nodeNames = sceneGraph.getNodeNames(children);

    // Parse from
    const fromNodeIndex = nodeNames.indexOf('from');
    if (fromNodeIndex === -1) {
        return 'ortho view missing <from> tag';
    }
    const fromNode = children[fromNodeIndex];
    const from = sceneGraph.parseFloatProps(fromNode, 'from ortho view with id=' + nodeID);
    if (from.length == 0) {
        return 'ortho view with id=' + nodeID + ' has invalid <from> tag';
    }

    // Parse to
    const toNodeIndex = nodeNames.indexOf('to');
    if (toNodeIndex === -1) {
        return 'ortho view missing <to> tag';
    }
    const toNode = children[toNodeIndex];
    const to = sceneGraph.parseFloatProps(toNode, 'to ortho view with id=' + nodeID);
    if (to.length == 0) {
        return 'ortho view with id=' + nodeID + ' has invalid <to> tag';
    }

    // Parse up
    const upNodeIndex = nodeNames.indexOf('up');
    let up;
    if (upNodeIndex === -1) {
        up = [0, 1, 0];
    } else {
        const upNode = children[upNodeIndex];
        up = sceneGraph.parseFloatProps(upNode, 'up ortho view with id=' + nodeID);
        if (up.length == 0) {
            return 'ortho view with id=' + nodeID + ' has invalid <up> tag';
        }
    }

    // Create camera
    const camera = new CGFcameraOrtho(left, right, bottom, top, near, far,
        vec3.fromValues(from[0], from[1], from[2]),
        vec3.fromValues(to[0], to[1], to[2]),
        vec3.fromValues(up[0], up[1], up[2]));
    sceneGraph.cameras[nodeID] = camera;

    return null;
}