import { CGFscene } from '../../lib/CGF.js';
import { CGFaxis, CGFcamera } from '../../lib/CGF.js';
import { normalizeVector, vectorDifference, degreesToRadians } from './utils/math.js';

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
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application - Reference to the CGFapplication object
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
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
        const debugFolder = this.gui.gui.addFolder('Debug');
        debugFolder.open();
        debugFolder.add(this.graph, 'displayAxis').name('Display axis');
        debugFolder.add(this.graph, 'lightsAreVisible').name('Visible lights');
        debugFolder.add(this.graph, 'displayNormals').name('Display normals');

        // Camera interface setup
        this.gui.gui.add(this.graph, 'selectedCameraID', Object.keys(this.graph.cameras)).name('Camera').onChange(() => {
            this.camera = this.graph.cameras[this.graph.selectedCameraID];
            this.interface.setActiveCamera(this.camera);
        });

        // Lights interface setup
        const lightsFolder = this.gui.gui.addFolder('Lights');
        lightsFolder.open();
        const getIndexFromKey = (key) => {
            let i = 0;
            for (const k in this.graph.lights) {
                if (k === key) return i;
                i++;
            }
            return -1;
        };
        for (const key in this.graph.lights) {
            lightsFolder.add(this.graph.enabledLights, key).name(key).onChange(() => {
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
        const highlightsFolder = this.gui.gui.addFolder('Highlights');
        highlightsFolder.open();
        for (const key in this.graph.components) {
            const component = this.graph.components[key];
            if (component.highlight == null || !component.hasDirectPrimitiveDescendant()) {
                continue;
            }
            highlightsFolder.add(component, 'enableHighlight').name(key);
        }

        this.sceneInited = true;
    }

    /**
     * Displays the scene.
     */
    display() {
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
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}