import { CGFscene, CGFshader } from '../../../lib/CGF.js';
import { CGFaxis, CGFcamera } from '../../../lib/CGF.js';
import { vectorDifference, milisToSeconds } from './utils/math.js';

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface - Reference to the interface
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.firstUpdateTimeMilis = null;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application - Reference to the CGFapplication object
     */
    init(application) {
        super.init(application);

        // For later use related to scene graph parsing
        this.sceneInited = false;

        // Set relevant graphic properties
        this.initCameras();
        this.initShaders();
        this.enableTextures(true);
        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        // Debug axis object
        this.axis = new CGFaxis(this);

        // Set refresh rate to 50 fps
        this.lastSecondInstant = -1;
        this.timeListeners = [];
        this.setUpdatePeriod(1000 / 50);

        // Enable picking
        this.pickListeners = [];
        this.setPickEnabled(true);

        // Enable load notifications
        this.graphLoadedListeners = [];
    }

    /**
     * Initializes the scene shaders.
     */
    initShaders() {
        this.highlightShader = new CGFshader(this.gl, "src/engine/shaders/highlight/scale.vert",
            "src/engine/shaders/highlight/color.frag");

        this.textShader = new CGFshader(this.gl, "src/engine/shaders/text/font.vert", "src/engine/shaders/text/font.frag");
        this.textShader.setUniformsValues({ 'dims': [16, 16] });
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        const hasParsedCameras = Object.keys(this.graph?.cameras ?? {}).length > 0;
        if (hasParsedCameras) {
            this.camera = this.graph.cameras[this.graph.selectedCameraID];
            this.interface.setActiveCamera(this.camera);
        } else {
            this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        }
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        let i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (let key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                const light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                const setAttenuation = (attenuation, light) => {
                    light.setConstantAttenuation(attenuation[0]);
                    light.setLinearAttenuation(attenuation[1]);
                    light.setQuadraticAttenuation(attenuation[2]);
                }
                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);
                    const direction = vectorDifference(light[9], light[2]);
                    this.lights[i].setSpotDirection(...direction);
                }
                setAttenuation(light[6], this.lights[i]);

                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                i++;
            }
        }
    }

    /**
     * Set default appearance
     * @memberof XMLscene
     */
    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.initCameras();

        // Debug options
        if (this.debugFolder) {
            this.gui.gui.removeFolder(this.debugFolder);
        }
        this.debugFolder = this.gui.gui.addFolder('Debug');
        this.debugFolder.open();
        this.debugFolder.add(this.graph, 'displayAxis').name('Display axis');
        this.debugFolder.add(this.graph, 'lightsAreVisible').name('Visible lights');
        this.debugFolder.add(this.graph, 'displayNormals').name('Display normals');
        this.debugFolder.add(this.graph, 'loopAnimations').name('Loop animations');

        // Camera interface setup
        if (this.selectedCameraController) {
            this.gui.gui.remove(this.selectedCameraController);
        }
        this.selectedCameraController = this.gui.gui.add(this.graph, 'selectedCameraID', Object.keys(this.graph.cameras)).name('Camera').onChange(() => {
            this.camera = this.graph.cameras[this.graph.selectedCameraID];
            this.interface.setActiveCamera(this.camera);
        });

        // Highlight pulse duration interface setup
        if (this.highlightPulseController) {
            this.gui.gui.remove(this.highlightPulseController);
        }
        this.highlightPulseController = this.gui.gui.add(this.graph, 'highlightPulseDuration', 0.5, 5).name('Pulse duration');

        // Lights interface setup
        if (this.lightsFolder) {
            this.gui.gui.removeFolder(this.lightsFolder);
        }
        this.lightsFolder = this.gui.gui.addFolder('Lights');
        this.lightsFolder.open();
        const getIndexFromKey = (key) => {
            let i = 0;
            for (const k in this.graph.lights) {
                if (k === key) return i;
                i++;
            }
            return -1;
        };
        for (const key in this.graph.lights) {
            this.lightsFolder.add(this.graph.enabledLights, key).name(key).onChange(() => {
                const index = getIndexFromKey(key);
                if (this.graph.enabledLights[key]) {
                    this.graph.lights[key][0] = true;
                    this.lights[index].enable();
                } else {
                    this.graph.lights[key][0] = false;
                    this.lights[index].disable();
                }
            });
        }

        // Highlights interface setup
        if (this.highlightsFolder) {
            this.gui.gui.removeFolder(this.highlightsFolder);
        }
        this.highlightsFolder = this.gui.gui.addFolder('Highlights');
        this.highlightsFolder.open();
        for (const key in this.graph.components) {
            const component = this.graph.components[key];
            if (component.highlight == null || !component.hasDirectPrimitiveDescendant()) {
                continue;
            }
            this.highlightsFolder.add(component, 'enableHighlight').name(key);
        }

        this.sceneInited = true;
        this.notifyGraphLoadedListeners();
    }

    /**
     * Function called each frame to update the scene and its animations
     * @param {number} t 
     */
    update(t) {
        if (this.firstUpdateTimeMilis == null) {
            this.firstUpdateTimeMilis = t;
        }

        const updateTimeSeconds = milisToSeconds(t - this.firstUpdateTimeMilis);
        if (Math.floor(updateTimeSeconds) != this.lastSecondInstant) {
            this.lastSecondInstant = Math.floor(updateTimeSeconds);
            this.notifyTimeListeners();
        }

        // Update highlights instant
        for (const key in this.graph.components) {
            const component = this.graph.components[key];
            if (component.highlight != null) {
                component.highlight.updateInstant(updateTimeSeconds);
            }
        }

        // Update animations instant
        for (const key in this.graph.animations) {
            this.graph.animations[key].update(updateTimeSeconds);
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        // Notify picking listeners
        this.notifyPickListeners();

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        for (let i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(this.graph.lightsAreVisible);
            this.lights[i].update();
        }

        if (this.graph.displayAxis) {
            this.axis.display();
        }

        if (this.sceneInited) {
            // Set pick id for use throughout the graph display
            this.currentPickId = 1;

            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    notifyTimeListeners() {
        for (const timeListener of this.timeListeners) {
            timeListener.notifyTime();
        }
    }

    notifyGraphLoadedListeners() {
        for (const graphLoadedListener of this.graphLoadedListeners) {
            graphLoadedListener.notifyGraphLoaded(this.graph.filename);
        }
    }

    notifyPickListeners() {
        if (this.pickMode) {
            // results can only be retrieved when picking mode is false
            return;
        }

        if (this.pickResults == null || this.pickResults.length == 0) {
            // no objects were picked on the last frame
            return;
        }

        for (let i = 0; i < this.pickResults.length; i++) {
            const component = this.pickResults[i][0];
            if (component) {
                for (const pickListener of this.pickListeners) {
                    pickListener.notifyPick(component);
                }
            }
        }
        this.pickResults.splice(0, this.pickResults.length);
    }

    addPickListener(listener) {
        if (this.pickListeners.indexOf(listener) === -1) {
            this.pickListeners.push(listener);
        }
    }

    addTimeListener(listener) {
        if (this.timeListeners.indexOf(listener) === -1) {
            this.timeListeners.push(listener);
        }
    }

    addGraphLoadedListener(listener) {
        if (this.graphLoadedListeners.indexOf(listener) === -1) {
            this.graphLoadedListeners.push(listener);
        }
    }
}
