import { CGFapplication } from '../../../lib/CGF.js';
import { MyInterface } from '../engine/MyInterface.js';
import { XMLscene } from '../engine/XMLscene.js';
import { MySceneGraph } from '../engine/MySceneGraph.js';

export class GameController {
    /**
     * Creates an instance of GameController.
     */
    constructor(filenames) {
        // Initialize WebGL context
        this.app = new CGFapplication(document.body);
        this.app.init();

        // Init scenes
        this.scenes = [];
        for (const filename of filenames) {
            const datInterface = new MyInterface();
            const myScene = new XMLscene(datInterface);
            this.app.setScene(myScene);
            this.app.setInterface(datInterface);

            const myGraph = new MySceneGraph(filename, myScene);
            datInterface.sceneGraph = myGraph;
            this.scenes.push(myScene);
            myScene.addPickListener(this);
        }
    }

    start() {
        // TODO: Investigate scene switching and initialization order

        // Init CGFapplication with first scene
        //this.app.setScene(this.scenes[0]);
        //this.app.setInterface(this.scenes[0].interface);
        this.app.run();
    }

    notifyPick(object, pickId) {
        console.log("Picked object: " + object + ", with pickId " + pickId);
    }
}