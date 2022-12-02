import { CGFXMLreader } from '../../../lib/CGF.js';

import { parseScene } from './parsers/scene.js';
import { parseView } from './parsers/views.js';
import { parsePrimitives } from './parsers/primitives.js';
import { parseComponents } from './parsers/components.js';
import { parseTextures } from './parsers/textures.js';
import { parseMaterials } from './parsers/materials.js';
import { parseLights } from './parsers/lights.js';
import { parseAmbient } from './parsers/ambient.js';
import { parseTransformations } from './parsers/tranformations.js';
import { parseAnimations } from './parsers/animations.js';
import { GraphMaterial } from './assets/materials/GraphMaterial.js';

// Order of the groups in the XML document.
const SCENE_INDEX = 0;
const VIEWS_INDEX = 1;
const AMBIENT_INDEX = 2;
const LIGHTS_INDEX = 3;
const TEXTURES_INDEX = 4;
const MATERIALS_INDEX = 5;
const TRANSFORMATIONS_INDEX = 6;
const PRIMITIVES_INDEX = 7;
const ANIMATIONS_INDEX = 8;
const COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {string} filename - the name of the file to be parsed
     */
    constructor(filename, scene) {
        // Not loaded until XML loading is finished
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        // Graph nodes
        this.components = {};
        this.primitives = {};
        this.idRoot = null;  // The id of the root component.

        // User controlled state
        this.selectedMaterialIndex = 0;
        this.selectedCameraID = null;
        this.enabledLights = {};
        this.displayAxis = false;
        this.lightsAreVisible = false;
        this.displayNormals = false;
        this.highlightPulseDuration = 3;
        this.loopAnimations = false;

        // Scene assets
        this.materials = {};
        this.lights = {};
        this.ambient = [];
        this.background = [];
        this.textures = {};
        this.transformations = {};
        this.cameras = {};
        this.animations = {};

        // Optimization variables
        this.lastComponentNeededHighlight = false;

        // Default material
        this.defaultMaterial = new GraphMaterial(this.scene, -1, 1);
        this.defaultMaterial.addComponent("diffuse", 0.5, 0.5, 0.7);

        // Setup default axis
        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading
         * and error handlers. After the file is read, the reader calls onXMLReady
         * on this object. If any error occurs, the reader calls onXMLError on this
         * object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        console.log('XML Loading finished.');
        const rootElement = this.reader.xmlDoc.documentElement;

        const error = this.parseXMLFile(rootElement);
        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional
        // initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    getNodeNames(nodes) {
        const nodeNames = [];
        for (let i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }
        return nodeNames;
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement - the root element of the XML document
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != 'sxs') return 'root tag <sxs> missing';

        const nodes = rootElement.children;
        const nodeNames = this.getNodeNames(nodes);

        // Processes each node, verifying errors.
        let error;

        // <scene>
        let index;
        if ((index = nodeNames.indexOf('scene')) == -1)
            return 'tag <scene> missing';
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError('tag <scene> out of order ' + index);

            // Parse scene block
            if ((error = parseScene(this, nodes[index])) != null) return error;
        }

        // <views>
        if ((index = nodeNames.indexOf('views')) == -1)
            return 'tag <views> missing';
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError('tag <views> out of order');

            // Parse views block
            if ((error = parseView(this, nodes[index])) != null) return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf('ambient')) == -1)
            return 'tag <ambient> missing';
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError('tag <ambient> out of order');

            // Parse ambient block
            if ((error = parseAmbient(this, nodes[index])) != null) return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf('lights')) == -1)
            return 'tag <lights> missing';
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError('tag <lights> out of order');

            // Parse lights block
            if ((error = parseLights(this, nodes[index])) != null) return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf('textures')) == -1)
            return 'tag <textures> missing';
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError('tag <textures> out of order');

            // Parse textures block
            if ((error = parseTextures(this, nodes[index])) != null) return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf('materials')) == -1)
            return 'tag <materials> missing';
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError('tag <materials> out of order');

            // Parse materials block
            if ((error = parseMaterials(this, nodes[index])) != null) return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf('transformations')) == -1)
            return 'tag <transformations> missing';
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError('tag <transformations> out of order');

            // Parse transformations block
            if ((error = parseTransformations(this, nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf('animations')) == -1)
            return 'tag <animations> missing';
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError('tag <animations> out of order');

            // Parse animations block
            if ((error = parseAnimations(this, nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf('primitives')) == -1)
            return 'tag <primitives> missing';
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError('tag <primitives> out of order');

            // Parse primitives block
            if ((error = parsePrimitives(this, nodes[index])) != null) return error;
        }

        // <components>
        if ((index = nodeNames.indexOf('components')) == -1)
            return 'tag <components> missing';
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError('tag <components> out of order');

            // Parse components block
            if ((error = parseComponents(this, nodes[index])) != null) return error;
        }

        console.log('all parsed');
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node - the node to be parsed
     * @param {message to be displayed in case of error} messageError - the message to be displayed in case of error
     * @param {array of strings} - the names of the properties to be parsed
     */
    parseFloatProps(node, messageError, props = ['x', 'y', 'z']) {
        const result = [];
        for (const prop of props) {
            const value = this.reader.getFloat(node, prop);
            if (value == null || isNaN(value)) {
                console.warn('unable to parse ' + prop + ' of the ' + messageError);
                return [];
            }
            result.push(value);
        }
        return result;
    }

    /**
     * Parse axis values returning an array with the coordinates values
     *
     * @param {*} node - the node to be parsed
     * @param {*} messageError - the message to be displayed in case of error
     * @return {*} 
     * @memberof MySceneGraph
     */
    parseAxis(node, messageError) {
        const result = [];
        const axis = this.reader.getString(node, 'axis');
        if (axis == null || !(['x', 'y', 'z'].includes(axis))) {
            console.warn('unable to parse axis of the ' + messageError);
            return [];
        }
        result.push([(axis === 'x') ? 1 : 0, (axis === 'y') ? 1 : 0, (axis === 'z') ? 1 : 0]);
        const value = this.reader.getFloat(node, 'angle');
        if (value == null || isNaN(value)) {
            console.warn('unable to parse angle of the ' + messageError);
            return [];
        }
        result.push(value);
        return result;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console,
     * a warning on the interface and aborting the current read.
     * @param {string} message - Message to be displayed.
     */
    onXMLError(message) {
        console.error('XML Loading Error: ' + message);
        alert('XML Loading Error: ' + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the
     * console.
     * @param {string} message - Message to be displayed.
     */
    onXMLMinorError(message) {
        console.warn('Warning: ' + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.components[this.idRoot].display(this.defaultMaterial);
    }
}