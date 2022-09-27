import { GraphTransformation } from "../assets/transformations/GraphTransformation.js";

/**
  * Parses the <transformations> block.
  * @param {MySceneGraph} sceneGraph
  * @param {transformations block element} transformationsNode
  */
export function parseTransformations(sceneGraph, transformationsNode) {
    const children = transformationsNode.children;
    let grandChildren = [];

    // Any number of transformations.
    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'transformation') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }

        // Get id of the current transformation.
        const transformationID = sceneGraph.reader.getString(children[i], 'id');
        if (transformationID == null) return 'no ID defined for transformation';

        // Checks for repeated IDs.
        if (sceneGraph.transformations[transformationID] != null)
            return 'ID must be unique for each transformation (conflict: ID = ' +
                transformationID + ')';

        grandChildren = children[i].children;
        // Specifications for the current transformation.

        const transformation = new GraphTransformation(sceneGraph.scene, transformationID);
        for (let j = 0; j < grandChildren.length; j++) {
            switch (grandChildren[j].nodeName) {
                case 'translate':
                    const coordinates = sceneGraph.parseFloatProps(
                        grandChildren[j],
                        'translate transformation for ID ' + transformationID);
                    if (coordinates == []) return coordinates;

                    transformation.addTranslation(coordinates);

                    break;
                case 'scale':
                    sceneGraph.onXMLMinorError('To do: Parse scale transformations.');
                    break;
                case 'rotate':
                    // angle
                    sceneGraph.onXMLMinorError('To do: Parse rotate transformations.');
                    break;
            }
        }
        sceneGraph.transformations[transformationID] = transformation;
    }

    console.log('Parsed transformations');
    return null;
}