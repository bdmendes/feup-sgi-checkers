/**
 * Parses the <scene> block.
 * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object
 * @param {scene block element} sceneNode - scene block element
 */
export function parseScene(sceneGraph, sceneNode) {
    // Get root of the scene.
    const root = sceneGraph.reader.getString(sceneNode, 'root')
    if (root == null) return 'no root defined for scene';

    sceneGraph.idRoot = root;

    // Get axis length
    const axis_length = sceneGraph.reader.getFloat(sceneNode, 'axis_length');
    if (axis_length == null)
        sceneGraph.onXMLMinorError(
            'no axis_length defined for scene; assuming \'length = 1\'');

    sceneGraph.referenceLength = axis_length || 1;

    console.log('Parsed scene');

    return null;
}