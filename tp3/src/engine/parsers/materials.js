import { GraphMaterial } from "../assets/materials/GraphMaterial.js";

/**
 * Parses the <materials> node.
 * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object
 * @param {materials block element} materialsNode - materials block element
 */
export function parseMaterials(sceneGraph, materialsNode) {
    const children = materialsNode.children;

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
            return 'ID must be unique for each material (conflict: ID = ' +
                materialID + ')';

        // Get shininess of the current material.
        const shininess = sceneGraph.reader.getFloat(children[i], 'shininess');
        if (shininess == null) return 'no shininess defined for material';

        // Create material
        const material = new GraphMaterial(sceneGraph.scene, materialID, shininess);
        const components = children[i].children;
        for (const component of components) {
            const type = component.nodeName;
            const [r, g, b, a] = sceneGraph.parseFloatProps(component, materialID, ['r', 'g', 'b', 'a']);
            const error = material.addComponent(type, r, g, b, a);
            if (error != null) {
                return error;
            }
        }
        sceneGraph.materials[materialID] = material;
    }

    console.log("Parsed materials");
    return null;
}