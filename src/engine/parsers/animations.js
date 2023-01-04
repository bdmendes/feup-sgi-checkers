import { GraphKeyframe } from "../assets/animations/GraphKeyframe.js";
import { MyKeyframeAnimation } from "../assets/animations/MyKeyframeAnimation.js";
import { degreesToRadians } from "../utils/math.js";

/**
  * Parses the <animations> node.
  * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object
  * @param {animations block element} ambientsNode - animations block element
  */
export function parseAnimations(sceneGraph, animationsNode) {
    const children = animationsNode.children;

    for (const child of children) {
        if (child.nodeName !== 'keyframeanim') {
            sceneGraph.onXMLMinorError("unknown tag <" + child.nodeName + ">");
            continue;
        }
        const id = sceneGraph.reader.getString(child, 'id');
        if (id == null) {
            return "no ID defined for keyframeanim";
        }

        const keyframeAnimation = new MyKeyframeAnimation(sceneGraph.scene, id);
        const grandChildren = child.children;
        let foundKeyFrame = false;
        for (const grandChild of grandChildren) {
            if (grandChild.nodeName === 'keyframe') {
                foundKeyFrame = true;
                const error = parseKeyframe(sceneGraph, grandChild, keyframeAnimation);
                if (error) {
                    return error;
                }
            } else {
                sceneGraph.onXMLMinorError("unknown tag <" + grandChild.nodeName + ">");
            }
        }
        if (!foundKeyFrame) {
            return "no keyframe defined for keyframeanim with ID = " + id;
        }
        sceneGraph.animations[id] = keyframeAnimation;
    }

    console.log('Parsed animations');
    return null;
}

/**
 * Parses the <keyframe> node.
 * @param {MySceneGraph} sceneGraph 
 * @param {*} keyframeNode 
 * @param {*} keyFrameAnimation 
 * @returns 
 */
function parseKeyframe(sceneGraph, keyframeNode, keyFrameAnimation) {
    const instant = sceneGraph.reader.getFloat(keyframeNode, 'instant');
    if (instant == null) {
        return "no instant defined for keyframe";
    } else if (instant < 0) {
        return "instant must be great or equal to zero";
    }

    const keyframe = new GraphKeyframe(sceneGraph.scene, instant);
    const transformation = { rotateX: 0, rotateY: 0, rotateZ: 0, translationCoords: [0, 0, 0], scaleCoords: [1, 1, 1] };
    const keyframeChildren = keyframeNode.children;

    let foundTranslation = false;
    let foundRotation = false;
    let foundScale = false;

    let foundRotationZ = false;
    let foundRotationY = false;
    let foundRotationX = false;

    for (const keyframeChild of keyframeChildren) {
        if (keyframeChild.nodeName === 'translation') {
            if (foundRotation || foundScale) {
                return "translation must be the first transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            }
            const coordinates = sceneGraph.parseFloatProps(
                keyframeChild,
                "translate transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id);
            if (coordinates.length == 0) {
                return "invalid coordinates defined for translation in keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            }
            transformation.translationCoords = coordinates;
            foundTranslation = true;
        } else if (keyframeChild.nodeName === 'rotation') {
            if (!foundTranslation || foundScale) {
                return "rotation must be the second transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            }
            const [axis, angle] = sceneGraph.parseAxis(keyframeChild,
                "scale transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id);
            if (axis == null || angle == null) {
                return "invalid axis or angle defined for rotation in keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            }
            if (axis[2] == 1 && !foundRotationZ && !foundRotationY && !foundRotationX) {
                transformation.rotateZ = degreesToRadians(angle);
                foundRotationZ = true;
            } else if (axis[1] == 1 && foundRotationZ && !foundRotationY && !foundRotationX) {
                transformation.rotateY = degreesToRadians(angle);
                foundRotationY = true;
            } else if (axis[0] == 1 && foundRotationZ && foundRotationY && !foundRotationX) {
                transformation.rotateX = degreesToRadians(angle);
                foundRotationX = true;
            } else {
                return "invalid rotation axis order for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            }
            foundRotation = true;
        } else if (keyframeChild.nodeName === 'scale') {
            if (!foundTranslation || !foundRotation) {
                return "scale must be the third transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            }
            const coordinates = sceneGraph.parseFloatProps(
                keyframeChild,
                "scale transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id, ['sx', 'sy', 'sz']);
            if (coordinates.length == 0) {
                return "invalid coordinates for scale transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
            };
            transformation.scaleCoords = coordinates;
            foundScale = true;
        } else {
            sceneGraph.onXMLMinorError("unknown tag <" + keyframeChild.nodeName + ">");
        }
    }

    if (!foundTranslation || !foundRotation || !foundScale) {
        return "missing transformation for keyframe with instant = " + instant + " in animation with id = " + keyFrameAnimation.id;
    }

    keyframe.transformation = transformation;
    keyFrameAnimation.addKeyframe(keyframe);
}