/**
 * Parses the <scene> block.
 * @param {MySceneGraph} sceneGraph
 * @param {scene block element} sceneNode
 */
export function parseScene(sceneGraph, sceneNode) {
    // Get root of the scene.
    var root = sceneGraph.reader.getString(sceneNode, 'root')
    if (root == null) return 'no root defined for scene';

    sceneGraph.idRoot = root;

    // Get axis length
    var axis_length = sceneGraph.reader.getFloat(sceneNode, 'axis_length');
    if (axis_length == null)
        sceneGraph.onXMLMinorError(
            'no axis_length defined for scene; assuming \'length = 1\'');

    sceneGraph.referenceLength = axis_length || 1;

    sceneGraph.log('Parsed scene');

    return null;
}