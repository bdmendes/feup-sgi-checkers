import { CGFinterface, CGFapplication, dat } from '../../../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        this.gui = new dat.GUI({ 'closed': true });
        this.initKeys();
        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    /**
     * Handle key press down event 
     * @param {*} event - the event that triggered the function
     * @memberof MyInterface
     */
    processKeyDown(event) {
        if (event.code === "KeyM") {
            this.sceneGraph.selectedMaterialIndex += 1;
        }
        this.activeKeys[event.code] = true;
    };

    /**
     * Handle key press up event
     * @param {*} event - the event that triggered the function
     * @memberof MyInterface
     */
    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    /**
     * Checks if a  key is pressed
     * @param {*} keyCode - the key code
     * @return {*}
     * @memberof MyInterface
     */
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}