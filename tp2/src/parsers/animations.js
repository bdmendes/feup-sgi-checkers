import { GraphKeyframe } from "../assets/animations/GraphKeyframe.js";
import { MyKeyframeAnimation } from "../assets/animations/MyKeyframeAnimation.js";
import { GraphTransformation } from "../assets/transformations/GraphTransformation.js";

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

function parseKeyframe(sceneGraph, keyframeNode, keyFrameAnimation) {
    const instant = sceneGraph.reader.getFloat(keyframeNode, 'instant');
    if (instant == null) {
        return "no instant defined for keyframe";
    } else if (instant < 0) {
        return "instant must be great or equal to zero";
    }

    const keyframe = new GraphKeyframe(sceneGraph.scene, instant);
    const transformation = new GraphTransformation(sceneGraph.scene);
    const keyframeChildren = keyframeNode.children;

    let foundTranslation = false;
    let foundRotation = false;
    let foundScale = false;
    // maintain order
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
            transformation.addTranslation(coordinates);
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
            transformation.addRotation(axis, angle);
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
            transformation.addScale(coordinates);
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