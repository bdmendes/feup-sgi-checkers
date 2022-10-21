import { GraphComponent } from "../assets/GraphComponent.js";
import { GraphTransformation } from "../assets/transformations/GraphTransformation.js";

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

    const component = new GraphComponent(sceneGraph.scene, componentID);

    const nodeNames = [];
    for (let j = 0; j < node.children.length; j++) {
        nodeNames.push(node.children[j].nodeName);
    }

    const transformationIndex = nodeNames.indexOf('transformation');
    const materialsIndex = nodeNames.indexOf('materials');
    const textureIndex = nodeNames.indexOf('texture');
    const childrenIndex = nodeNames.indexOf('children');


    error = parseTransformations(componentID, sceneGraph, node, component, transformationIndex);
    if (error != null) { return error; }

    error = parseMaterials(componentID, sceneGraph, node, component, materialsIndex);
    if (error != null) { return error; }

    error = parseTexture(componentID, sceneGraph, node, component, textureIndex);
    if (error != null) { return error; }

    error = parseChildren(componentID, sceneGraph, node, component, childrenIndex);
    if (error != null) { return error; }

    sceneGraph.components[componentID] = component;
    return null;
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
        if (materialID == "inherit" && sceneGraph.idRoot == componentID) {
            return 'component ' + componentID + ' does not have a parent to inherit material from';
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
    if (textureID == "inherit" && sceneGraph.idRoot == componentID) {
        return 'component ' + componentID + ' does not have a parent to inherit texture from';
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
            } else {
                if (sceneGraph.primitives[id] == null) {
                    return 'component with ID ' + componentID + ' has a <primitiveref> with an invalid ID: ' + id;
                }
                component.children[id] = sceneGraph.primitives[id];
            }
        }
    }

    return null;
}