import { GraphComponent } from "../assets/GraphComponent.js";

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
    const [error, componentID] = getID(sceneGraph, node);
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

    // Materials
    parseMaterials(componentID, sceneGraph, node, component, materialsIndex);

    // Texture

    // Children
    parseChildren(componentID, sceneGraph, node, component, childrenIndex);

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
}
