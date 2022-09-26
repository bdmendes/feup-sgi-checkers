/**
  * Parses the <ambient> node.
  * @param {MySceneGraph} sceneGraph
  * @param {ambient block element} ambientsNode
  */
export function parseAmbient(sceneGraph, ambientsNode) {
    var children = ambientsNode.children;

    sceneGraph.ambient = [];
    sceneGraph.background = [];

    var nodeNames = [];

    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    var ambientIndex = nodeNames.indexOf('ambient');
    var backgroundIndex = nodeNames.indexOf('background');

    var color = sceneGraph.parseFloatProps(children[ambientIndex], 'ambient', ['r', 'g', 'b', 'a']);
    if (!Array.isArray(color))
        return color;
    else
        sceneGraph.ambient = color;

    color = sceneGraph.parseFloatProps(children[backgroundIndex], 'background', ['r', 'g', 'b', 'a']);
    if (!Array.isArray(color))
        return color;
    else
        sceneGraph.background = color;

    console.log('Parsed ambient');

    return null;
}