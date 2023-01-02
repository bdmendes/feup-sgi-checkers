import { GraphComponent } from "../assets/GraphComponent.js";
import { GraphHighlight } from "../assets/highlights/GraphHighlight.js";
import { GraphTransformation } from "../assets/transformations/GraphTransformation.js";
import { GraphText } from "../assets/text/GraphText.js";

/**
     * Parses the <components> block
     * @param {MySceneGraph} sceneGraph - The scene graph
     * @param {components block element} componentsNode - The components block element
     */
export function parseComponents(sceneGraph, componentsNode) {
    const children = componentsNode.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'component') {
            sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
            continue;
        }
        const error = parseComponent(sceneGraph, children[i]);
        if (error != null) {
            return error;
        }
    }

    const error = referenceComponentChildren(sceneGraph);
    if (error != null) {
        return error;
    }
}


/**
 * Parses the <component> block.
 *
 * @param {MySceneGraph} sceneGraph - The scene graph
 * @param {*} node - The <component> block
 * @return {*} 
 */
function parseComponent(sceneGraph, node) {
    let [error, componentID] = getID(sceneGraph, node);
    if (error) return componentID;

    const pickable = getIntegerBooleanProperty(sceneGraph, node, componentID, 'pickable', false);
    const visible = getIntegerBooleanProperty(sceneGraph, node, componentID, 'visible', true);

    const component = new GraphComponent(sceneGraph.scene, componentID, pickable, visible);

    const nodeNames = [];
    for (let j = 0; j < node.children.length; j++) {
        nodeNames.push(node.children[j].nodeName);
    }

    const transformationIndex = nodeNames.indexOf('transformation');
    const materialsIndex = nodeNames.indexOf('materials');
    const textureIndex = nodeNames.indexOf('texture');
    const childrenIndex = nodeNames.indexOf('children');
    const animationIndex = nodeNames.indexOf('animation');
    const highlightedIndex = nodeNames.indexOf('highlighted');
    const textIndex = nodeNames.indexOf('text');

    error = parseTransformations(componentID, sceneGraph, node, component, transformationIndex);
    if (error != null) { return error; }

    error = parseMaterials(componentID, sceneGraph, node, component, materialsIndex);
    if (error != null) { return error; }

    error = parseTexture(componentID, sceneGraph, node, component, textureIndex);
    if (error != null) { return error; }

    error = parseChildren(componentID, sceneGraph, node, component, childrenIndex);
    if (error != null) { return error; }

    error = parseAnimation(componentID, sceneGraph, node, component, animationIndex);
    if (error != null) { return error; }

    error = parseHighlighted(componentID, sceneGraph, node, component, highlightedIndex);
    if (error != null) { return error; }

    error = parseText(componentID, sceneGraph, node, component, textIndex);
    if (error != null) { return error; }

    sceneGraph.components[componentID] = component;
    return null;
}

function getIntegerBooleanProperty(sceneGraph, node, id, propertyName, defaultValue) {
    const property = sceneGraph.reader.getString(node, propertyName, false);
    let res;
    if (property == '0') {
        res = false;
    } else if (property == '1') {
        res = true;
    } else {
        if (property != null) {
            sceneGraph.onXMLMinorError(
                'unable to parse \'' + propertyName + '\' field for component with ID = ' +
                id + '; assuming \'value = ' + defaultValue + '\'');
        }
        res = defaultValue;
    }
    return res;
}


/**
 * Parses the component id.
 *
 * @param {*} sceneGraph - The scene graph
 * @param {*} node - The <component> block
 * @return {*} 
 */
function getID(sceneGraph, node) {
    // Get id of the current component.
    let componentID = sceneGraph.reader.getString(node, 'id');
    if (componentID == null) return [true, 'no ID defined for componentID'];

    // Checks for repeated IDs.
    if (sceneGraph.components[componentID] != null)
        return [true, 'ID must be unique for each component (conflict: ID = ' +
            componentID + ')'];

    return [false, componentID];
}


/**
 * Parses the component's <transformations> block.
 *
 * @param {*} componentID - The component's id
 * @param {*} sceneGraph - The scene graph
 * @param {*} node - The <component> block
 * @param {*} component - The component to push transformations into
 * @param {*} transformationIndex - The index of the <transformation> block
 * @return {*} 
 */
function parseTransformations(componentID, sceneGraph, node, component, transformationIndex) {
    if (transformationIndex == -1) {
        return 'component ' + componentID + ' must have a transformation block';
    }
    const transformationList = node.children[transformationIndex].children;

    let byRef = false;
    if (transformationList.length > 0) {
        byRef = transformationList[0].nodeName === 'transformationref';
    }

    let coordinates = null;
    for (let i = 0; i < transformationList.length; i++) {
        switch (transformationList[i].nodeName) {
            case 'transformationref':
                if (!byRef) { return 'component ' + componentID + ' cannot have transformations by reference and explicit transformations at the same time'; }
                let transformationID = sceneGraph.reader.getString(transformationList[i], 'id');
                if (transformationID == null) {
                    return 'component ' + componentID + ' must have a transformation block with non null id';
                }
                if (sceneGraph.transformations[transformationID] == null) {
                    return 'component ' + componentID + ' must have a transformation block with valid id';
                }
                component.transformations.push(transformationID);
                break;
            case 'translate':
                if (byRef) { return 'component ' + componentID + ' cannot transformations by reference and explicit transformations at the same time'; }
                const translate = new GraphTransformation(sceneGraph.scene);
                coordinates = sceneGraph.parseFloatProps(transformationList[i], 'translate transformation ');
                if (coordinates.length == 0) return coordinates;

                translate.addTranslation(coordinates);
                component.transformations.push(translate);
                break;
            case 'scale':
                if (byRef) { return 'component ' + componentID + ' cannot have transformations by reference and explicit transformations at the same time'; }
                const scale = new GraphTransformation(sceneGraph.scene);
                coordinates = sceneGraph.parseFloatProps(transformationList[i], 'translate transformation ');
                if (coordinates.length == 0) return coordinates;

                scale.addScale(coordinates);
                component.transformations.push(scale);
                break;
            case 'rotate':
                if (byRef) { return 'component ' + componentID + ' cannot have transformations by reference and explicit transformations at the same time'; }
                const rotate = new GraphTransformation(sceneGraph.scene);
                let [axis, angle] = sceneGraph.parseAxis(transformationList[i],
                    'rotate transformation ');

                if (axis === undefined || angle === undefined) return '';

                rotate.addRotation(axis, angle);
                component.transformations.push(rotate);
                break;
            default:
                return 'component ' + componentID + ' must have a transformation block';
        }
    }

    return null;
}


/**
 * Parses the component's <materials> block.
 *
 * @param {*} componentID - The component's id
 * @param {*} sceneGraph - The scene graph
 * @param {*} node - The <component> block
 * @param {*} component - The component to push materials into
 * @param {*} materialsIndex - The index of the <material> block
 * @return {*} 
 */
function parseMaterials(componentID, sceneGraph, node, component, materialsIndex) {
    if (materialsIndex == -1) {
        return 'component ' + componentID + ' must have a materials block';
    }
    const materialsList = node.children[materialsIndex].children;
    for (let i = 0; i < materialsList.length; i++) {
        if (materialsList[i].nodeName != 'material') {
            return 'component ' + componentID + ' must have a materials block';
        }
        const materialID = sceneGraph.reader.getString(materialsList[i], 'id');
        if (materialID == null) {
            return 'component ' + componentID + ' must have a materials block with non null id';
        }
        if (materialID !== "inherit" && sceneGraph.materials[materialID] == null) {
            return 'component ' + componentID + ' has a <material> with an invalid ID: ' + materialID;
        }
        component.materialIDs.push(materialID);
    }

    return null;
}


/**
 * Parses the component's <textures> block.
 *
 * @param {*} componentID - The component's id
 * @param {MySceneGraph} sceneGraph - The scene graph
 * @param {*} node - The <component> block
 * @param {*} component - The component to push textures into
 * @param {*} textureIndex - The index of the <texture> block
 * @return {*} 
 */
function parseTexture(componentID, sceneGraph, node, component, textureIndex) {
    if (textureIndex == -1) {
        return 'component ' + componentID + ' must have a textures block';
    }
    const texture = node.children[textureIndex];

    if (texture.nodeName != 'texture') {
        return 'component ' + componentID + ' must have a textures block';
    }
    const textureID = sceneGraph.reader.getString(texture, 'id');
    if (textureID == null) {
        return 'component ' + componentID + ' must have a textures block with non null id';
    }
    if (textureID !== "inherit" && textureID !== "none" && sceneGraph.textures[textureID] == null) {
        return 'component ' + componentID + ' has a <texture> with an invalid ID: ' + textureID;
    }
    if (textureID !== "none") {
        const length_s = sceneGraph.reader.getString(texture, 'length_s', false);
        const length_t = sceneGraph.reader.getString(texture, 'length_t', false);
        if (textureID !== "inherit" && (length_s == null || length_t == null)) {
            return 'component ' + componentID + ' must have a textures block with non null length_s and length_t';
        }
        component.length_s = length_s;
        component.length_t = length_t;
    }
    component.textureID = textureID;

    return null;
}


/**
 * Parses the component's <children> block, using ids for referencing the children
 *
 * @param {*} componentID - The component's id
 * @param {MySceneGraph} sceneGraph - The scene graph
 * @param {*} node - The <component> block
 * @param {*} component - The component to push children into
 * @param {*} childrenIndex - The index of the <children> block
 * @return {*} 
 */
function parseChildren(componentID, sceneGraph, node, component, childrenIndex) {
    if (childrenIndex == -1) {
        return 'component with ID ' + componentID + ' must have a <children> tag';
    }
    const childrenList = node.children[childrenIndex].children;
    for (let i = 0; i < childrenList.length; i++) {
        if (childrenList[i].nodeName != 'componentref' && childrenList[i].nodeName != 'primitiveref') {
            return 'component with ID ' + componentID + ' must have a <componentref> or <primitiveref> tag';
        }
        const id = sceneGraph.reader.getString(childrenList[i], 'id');
        if (childrenList[i].nodeName == 'componentref') {
            component.children[id] = "componentref";
        } else {
            component.children[id] = "primitiveref";
        }
    }

    return null;
}


/**
 * Replace component's children by their respective components
 *
 * @param {MySceneGraph} sceneGraph - The scene graph
 * @return {*} 
 */
function referenceComponentChildren(sceneGraph) {
    for (const key in sceneGraph.components) {
        const component = sceneGraph.components[key];
        const componentID = component.id;

        for (const id in component.children) {
            const element = component.children[id];
            if (element == "componentref") {
                if (sceneGraph.components[id] == null) {
                    return 'component with ID ' + componentID + ' has a <componentref> with an invalid ID: ' + id;
                }
                component.children[id] = sceneGraph.components[id];
            } else if (element == "primitiveref") {
                if (sceneGraph.primitives[id] == null) {
                    console.log(element)
                    return 'component with ID ' + componentID + ' has a <primitiveref> with an invalid ID: ' + id;
                }
                component.children[id] = sceneGraph.primitives[id];
            } else {
                component.children[id] = element;
            }
        }
    }

    return null;
}

/**
 * Parses the component's <animation> block
 * 
 * @param {*} componentID 
 * @param {MySceneGraph} sceneGraph 
 * @param {*} node 
 * @param {*} component 
 * @param {*} animationIndex 
 * @returns 
 */
function parseAnimation(componentID, sceneGraph, node, component, animationIndex) {
    if (animationIndex == -1) {
        return null;
    }

    const animationNode = node.children[animationIndex];

    const animationID = sceneGraph.reader.getString(animationNode, 'id');
    if (animationID == null) {
        return 'component ' + componentID + ' must have a animations block with non null id';
    }
    if (sceneGraph.animations[animationID] == null) {
        return 'component ' + componentID + ' has a <animation> with an invalid ID: ' + animationID;
    }
    component.animationID = animationID;

    return null;
}

/**
 * Parses the component's <highlighted> block
 * 
 * @param {*} componentID 
 * @param {MySceneGraph} sceneGraph 
 * @param {*} node 
 * @param {*} component 
 * @param {*} highlightIndex 
 * @returns 
 */
function parseHighlighted(componentID, sceneGraph, node, component, highlightIndex) {
    if (highlightIndex == -1) {
        return null;
    }

    const highlightedNode = node.children[highlightIndex];

    const color = sceneGraph.parseFloatProps(highlightedNode, 'color for highlight of component with ID = ' + componentID, ['r', 'g', 'b']);
    if (color.length == 0) {
        return '<highlight> block of component with ID = ' + componentID + ' must have a valid color';
    }

    const scaleH = sceneGraph.reader.getFloat(highlightedNode, 'scale_h');
    if (scaleH == null) {
        return 'component ' + componentID + ' must have a highlight block with non null scale_h';
    }

    const enableHighlight = getIntegerBooleanProperty(sceneGraph, highlightedNode, componentID, 'enabled', true);

    component.highlight = new GraphHighlight(sceneGraph.scene, color, scaleH);
    component.enableHighlight = enableHighlight;

    return null;
}

function parseText(componentID, sceneGraph, node, component, textIndex) {
    if (textIndex == -1) {
        return null;
    }

    const textNode = node.children[textIndex];

    const string = sceneGraph.reader.getString(textNode, 'string');
    if (string == null) {
        return 'component ' + componentID + ' text block must have non null string';
    }

    let xOffset = sceneGraph.reader.getFloat(textNode, 'x_off', false);
    let yOffset = sceneGraph.reader.getFloat(textNode, 'y_off', false);
    let zOffset = sceneGraph.reader.getFloat(textNode, 'z_off', false);
    let scaleX = sceneGraph.reader.getFloat(textNode, 'scale_x', false);
    let scaleY = sceneGraph.reader.getFloat(textNode, 'scale_y', false);
    let gap = sceneGraph.reader.getFloat(textNode, 'gap', false);

    const forceFront = getIntegerBooleanProperty(sceneGraph, textNode, componentID, 'front', false);

    const graphText = new GraphText(sceneGraph.scene, string, xOffset, yOffset, zOffset, gap, scaleX, scaleY, forceFront);
    component.text = graphText;
    return null;
}
