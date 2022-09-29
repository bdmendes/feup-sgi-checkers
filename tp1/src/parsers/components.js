import { GraphComponent } from "../assets/GraphComponent.js";
import { GraphTransformation } from "../assets/transformations/GraphTransformation.js";

/**
     * Parses the <components> block.
     * @param {MySceneGraph} sceneGraph
     * @param {components block element} componentsNode
     */
export function parseComponents(sceneGraph, componentsNode) {
    const children = componentsNode.children;

    // Any number of components.
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
}

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

    sceneGraph.onXMLMinorError('To do: Parse components.');
    // Transformations
    error = parseTransformations(componentID, sceneGraph, node, component, transformationIndex);
    if (error != null) { return error; }
    // Materials
    error = parseMaterials(componentID, sceneGraph, node, component, materialsIndex);
    if (error != null) { return error; }
    // Texture

    // Children
    error = parseChildren(componentID, sceneGraph, node, component, childrenIndex);
    if (error != null) { return error; }
    // Add component to scene
    sceneGraph.components[componentID] = component;
    return null;
}

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

function parseTransformations(componentID, sceneGraph, node, component, transformationIndex) {
    if (transformationIndex == -1) {
        return 'component ' + componentID + ' must have a transformation block';
    }
    const transformationList = node.children[transformationIndex].children;

    let byRef = false;
    if (transformationList.length > 0) {
        byRef = transformationList[0].nodeName === 'transformationref';
    }


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
                let coordinates = sceneGraph.parseFloatProps(transformationList[i], 'translate transformation ');
                if (coordinates == []) return coordinates;

                translate.addTranslation(coordinates);
                component.transformations.push(translate);
                break;
            case 'scale':
                if (byRef) { return 'component ' + componentID + ' cannot have transformations by reference and explicit transformations at the same time'; }
                const scale = new GraphTransformation(sceneGraph.scene);
                coordinates = sceneGraph.parseFloatProps(transformationList[i], 'translate transformation ');
                if (coordinates == []) return coordinates;

                scale.addTranslation(coordinates);
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
        if (materialID == "inherit") {
            continue; // inject default?
        }
        if (sceneGraph.materials[materialID] == null) {
            return 'component ' + componentID + ' must have a materials block with valid id';
        }
        component.materialIDs.push(materialID);
    }

    return null;
}


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
            if (sceneGraph.components[id] == null) {
                return 'component with ID ' + componentID + ' has a <componentref> with an invalid ID';
            }
            component.children[id] = sceneGraph.components[id];
        } else {
            if (sceneGraph.primitives[id] == null) {
                return 'component with ID ' + componentID + ' has a <primitiveref> with an invalid ID';
            }
            component.children[id] = sceneGraph.primitives[id];
        }
    }

    return null;
}
