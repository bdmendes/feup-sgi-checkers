/**
 * Parses the <materials> node.
 * @param {MySceneGraph} sceneGraph
 * @param {materials block element} materialsNode
 */
export function parseMaterials(sceneGraph, materialsNode) {
    const children = materialsNode.children;
    const grandChildren = [];
    const nodeNames = [];

    // Any number of materials.
    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'material') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }

        // Get id of the current material.
        const materialID = sceneGraph.reader.getString(children[i], 'id');
        if (materialID == null) return 'no ID defined for material';

        // Checks for repeated IDs.
        if (sceneGraph.materials[materialID] != null)
            return 'ID must be unique for each light (conflict: ID = ' +
                materialID + ')';

        // Continue here
        sceneGraph.onXMLMinorError('To do: Parse materials.');
    }

    // console.log("Parsed materials");
    return null;
}