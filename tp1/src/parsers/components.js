/**
     * Parses the <components> block.
     * @param {MySceneGraph} sceneGraph
     * @param {components block element} componentsNode
     */
export function parseComponents(sceneGraph, componentsNode) {
    var children = componentsNode.children;

    sceneGraph.components = [];

    var grandChildren = [];
    var grandgrandChildren = [];
    var nodeNames = [];

    // Any number of components.
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'component') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }

        // Get id of the current component.
        var componentID = sceneGraph.reader.getString(children[i], 'id');
        if (componentID == null) return 'no ID defined for componentID';

        // Checks for repeated IDs.
        if (sceneGraph.components[componentID] != null)
            return 'ID must be unique for each component (conflict: ID = ' +
                componentID + ')';

        grandChildren = children[i].children;

        nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var transformationIndex = nodeNames.indexOf('transformation');
        var materialsIndex = nodeNames.indexOf('materials');
        var textureIndex = nodeNames.indexOf('texture');
        var childrenIndex = nodeNames.indexOf('children');

        sceneGraph.onXMLMinorError('To do: Parse components.');
        // Transformations

        // Materials

        // Texture

        // Children
    }
}