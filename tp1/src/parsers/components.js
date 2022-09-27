/**
     * Parses the <components> block.
     * @param {MySceneGraph} sceneGraph
     * @param {components block element} componentsNode
     */
export function parseComponents(sceneGraph, componentsNode) {
    const children = componentsNode.children;
    sceneGraph.components = [];
    let grandChildren = [];
    let grandgrandChildren = [];
    let nodeNames = [];

    // Any number of components.
    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'component') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }

        // Get id of the current component.
        const componentID = sceneGraph.reader.getString(children[i], 'id');
        if (componentID == null) return 'no ID defined for componentID';

        // Checks for repeated IDs.
        if (sceneGraph.components[componentID] != null)
            return 'ID must be unique for each component (conflict: ID = ' +
                componentID + ')';

        grandChildren = children[i].children;

        nodeNames = [];
        for (let j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        const transformationIndex = nodeNames.indexOf('transformation');
        const materialsIndex = nodeNames.indexOf('materials');
        const textureIndex = nodeNames.indexOf('texture');
        const childrenIndex = nodeNames.indexOf('children');

        sceneGraph.onXMLMinorError('To do: Parse components.');
        // Transformations

        // Materials

        // Texture

        // Children
    }
}