import { GraphTexture } from "../assets/textures/GraphTexture.js";
/**
 * Parses the <textures> block.
 * @param {MySceneGraph} sceneGraph
 * @param {textures block element} texturesNode
 */
export function parseTextures(sceneGraph, texturesNode) {
    const children = texturesNode.children;

    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'texture') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }

        // Get id of the current texture.
        const textureID = sceneGraph.reader.getString(children[i], 'id');
        if (textureID == null) return 'no ID defined for texture';

        // Checks for repeated IDs.
        if (sceneGraph.textures[textureID] != null)
            return 'ID must be unique for each light (conflict: ID = ' +
                textureID + ')';

        // Get shininess of the current texture.
        const file = sceneGraph.reader.getString(children[i], 'file');
        if (file == null) return 'no file defined for texture';

        // Create texture
        const texture = new GraphTexture(sceneGraph.scene, textureID, file, null, null);
        sceneGraph.textures[textureID] = texture;

        // TODO: Parse length_s and length_t
    }

    console.log("Parsed textures");
    return null;
}