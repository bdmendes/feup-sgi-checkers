import { CGFapplication } from '../../../lib/CGF.js';
import { MyInterface } from '../engine/MyInterface.js';
import { XMLscene } from '../engine/XMLscene.js';
import { MySceneGraph } from '../engine/MySceneGraph.js';

export class GameController {
    /**
     * Creates an instance of GameController.
     */
    constructor(filenames) {
        // Init scenes
        this.scenes = [];
        for (const filename of filenames) {
            const datInterface = new MyInterface();
            const myScene = new XMLscene(datInterface);
            const myGraph = new MySceneGraph(filename, myScene);
            datInterface.sceneGraph = myGraph;
            datInterface.setActiveCamera(myScene.camera);
            this.scenes.push(myScene);
        }
    }

    start() {
        // Init CGFapplication with first scene
        this.app = new CGFapplication(document.body);
        this.app.init();
        this.app.setScene(this.scenes[0]);
        this.app.setInterface(this.scenes[0].interface);
        this.app.run();
    }
}