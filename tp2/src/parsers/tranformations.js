import { GraphTransformation } from "../assets/transformations/GraphTransformation.js";

/**
  * Parses the <transformations> block.
  * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object
  * @param {transformations block element} transformationsNode - transformations block element
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
        let coordinates;
        const transformation = new GraphTransformation(sceneGraph.scene, transformationID);
        for (let j = 0; j < grandChildren.length; j++) {
            switch (grandChildren[j].nodeName) {
                case 'translate':
                    coordinates = sceneGraph.parseFloatProps(
                        grandChildren[j],
                        'translate transformation for ID ' + transformationID);
                    if (coordinates.length == 0) return coordinates;

                    transformation.addTranslation(coordinates);

                    break;
                case 'scale':
                    coordinates = sceneGraph.parseFloatProps(
                        grandChildren[j],
                        'scale transformation for ID ' + transformationID);
                    if (coordinates.length == 0) return coordinates;

                    transformation.addScale(coordinates);
                    break;
                case 'rotate':
                    let [axis, angle] = sceneGraph.parseAxis(grandChildren[j],
                        'rotate transformation for ID ' + transformationID);

                    if (axis === undefined || angle === undefined) return '';

                    transformation.addRotation(axis, angle);
                    break;
            }
        }
        sceneGraph.transformations[transformationID] = transformation;
    }

    console.log('Parsed transformations');
    return null;
}