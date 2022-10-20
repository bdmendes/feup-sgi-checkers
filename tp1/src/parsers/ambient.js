/**
  * Parses the <ambient> node.
  * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object
  * @param {ambient block element} ambientsNode - ambient block element
  */
export function parseAmbient(sceneGraph, ambientsNode) {
    const children = ambientsNode.children;
    const nodeNames = [];

    for (let i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    const ambientIndex = nodeNames.indexOf('ambient');
    const backgroundIndex = nodeNames.indexOf('background');

    const ambientColor = sceneGraph.parseFloatProps(children[ambientIndex], 'ambient', ['r', 'g', 'b', 'a']);
    if (!Array.isArray(ambientColor)) {
        return ambientColor;
    } else {
        sceneGraph.ambient = ambientColor;
    }

    const backgroundColor = sceneGraph.parseFloatProps(children[backgroundIndex], 'background', ['r', 'g', 'b', 'a']);
    if (!Array.isArray(backgroundColor)) {
        return backgroundColor;
    } else {
        sceneGraph.background = backgroundColor;
    }

    console.log('Parsed ambient');
    return null;
}