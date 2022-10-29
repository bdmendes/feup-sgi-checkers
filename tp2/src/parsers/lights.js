/**
 * Parses the <light> node.
 * @param {MySceneGraph} sceneGraph - Reference to MySceneGraph object
 * @param {lights block element} lightsNode - lights block element
 */
export function parseLights(sceneGraph, lightsNode) {
    const children = lightsNode.children;
    let numLights = 0;
    let grandChildren = [];
    let nodeNames = [];

    // Any number of lights.
    for (let i = 0; i < children.length; i++) {
        // Storing light information
        const global = [];
        const attributeNames = [];
        const attributeTypes = [];

        // Check type of light
        if (children[i].nodeName != 'omni' && children[i].nodeName != 'spot') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        } else {
            attributeNames.push(...['location', 'ambient', 'diffuse', 'specular', 'attenuation']);
            attributeTypes.push(...['position', 'color', 'color', 'color', 'attenuation']);
        }

        // Get id of the current light.
        const lightId = sceneGraph.reader.getString(children[i], 'id');
        if (lightId == null) return 'no ID defined for light';

        // Checks for repeated IDs.
        if (sceneGraph.lights[lightId] != null)
            return 'ID must be unique for each light (conflict: ID = ' + lightId +
                ')';

        // Light enable/disable
        const enableLightProperty = sceneGraph.reader.getString(children[i], 'enabled');
        let enableLight;
        if (enableLightProperty == '0') {
            enableLight = false;
        } else if (enableLightProperty == '1') {
            enableLight = true;
        } else {
            sceneGraph.onXMLMinorError(
                'unable to parse value component of the \'enable light\' field for ID = ' +
                lightId + '; assuming \'value = 1\'');
            enableLight = true;
        }

        // Add enabled boolean and type name to light info
        global.push(enableLight);
        global.push(children[i].nodeName);

        grandChildren = children[i].children;
        // Specifications for the current light.

        nodeNames = [];
        for (let j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        for (let j = 0; j < attributeNames.length; j++) {
            const attributeIndex = nodeNames.indexOf(attributeNames[j]);
            let aux;

            if (attributeIndex != -1) {
                if (attributeTypes[j] == 'position') {
                    aux = sceneGraph.parseFloatProps(
                        grandChildren[attributeIndex],
                        'light position for ID' + lightId, ['x', 'y', 'z', 'w']);
                    if (aux.length == 0) {
                        return 'unable to parse light position values for ID = ' + lightId;
                    }
                } else if (attributeTypes[j] == 'attenuation') {
                    aux = sceneGraph.parseFloatProps(
                        grandChildren[attributeIndex],
                        'light attenuation for ID' + lightId, ['constant', 'linear', 'quadratic']);
                    if (aux.length == 0) {
                        return 'unable to parse light attenuation values for ID = ' + lightId;
                    }
                    if (aux.filter(x => x != 0).length != 1) {
                        return 'one and only one attenuation property can be set for light with ID = ' + lightId;
                    }
                } else {
                    aux = sceneGraph.parseFloatProps(
                        grandChildren[attributeIndex],
                        attributeNames[j] + ' illumination for ID' + lightId, ['r', 'g', 'b', 'a']);
                    if (aux.length == 0) {
                        return 'unable to parse light color values for ID = ' + lightId;
                    }
                }

                if (!Array.isArray(aux)) return aux;

                global.push(aux);
            } else {
                return attributeNames[j] +
                    ' not found for light with ID = ' + lightId;
            }
        }

        // Gets the additional attributes of the spot light
        if (children[i].nodeName == 'spot') {
            const angle = sceneGraph.reader.getFloat(children[i], 'angle');
            if (!(angle != null && !isNaN(angle)))
                return 'unable to parse angle of the light for ID = ' + lightId;
            if (angle != 180 && !(angle >= 0 && angle <= 90)) {
                return 'angle for light with ID = ' + lightId + ' must be between 0 and 90 degrees';
            }

            const exponent = sceneGraph.reader.getFloat(children[i], 'exponent');
            if (!(exponent != null && !isNaN(exponent)))
                return 'unable to parse exponent of the light for ID = ' + lightId;
            if (!(exponent >= 0 && exponent <= 128)) {
                return 'exponent for light with ID = ' + lightId + ' must be between 0 and 128';
            }

            const targetIndex = nodeNames.indexOf('target');

            // Retrieves the light target.
            let targetLight = [];
            if (targetIndex != -1) {
                const aux = sceneGraph.parseFloatProps(
                    grandChildren[targetIndex], 'target light for ID ' + lightId);
                if (!Array.isArray(aux)) return aux;

                targetLight = aux;
            } else
                return 'light target undefined for ID = ' + lightId;

            global.push(...[angle, exponent, targetLight])
        }

        sceneGraph.lights[lightId] = global;
        sceneGraph.enabledLights[lightId] = enableLight;
        numLights++;
    }

    if (numLights == 0)
        return 'at least one light must be defined';
    else if (numLights > 8)
        sceneGraph.onXMLMinorError(
            'too many lights defined; WebGL imposes a limit of 8 lights');

    console.log('Parsed lights');
    return null;
}