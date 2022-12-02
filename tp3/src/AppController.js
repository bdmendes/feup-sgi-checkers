import { CGFapplication } from '../../lib/CGF.js';
import { MyInterface } from './engine/MyInterface.js';
import { XMLscene } from './engine/XMLscene.js';
import { MySceneGraph } from './engine/MySceneGraph.js';

export class AppController {
    constructor(filenames) {
        // Initialize WebGL context
        this.app = new CGFapplication(document.body);
        this.app.init();

        // Initialize scene
        this.datInterface = new MyInterface();
        this.scene = new XMLscene(this.datInterface);
        this.app.setScene(this.scene);
        this.app.setInterface(this.datInterface);

        // Initialize graphs
        this.graphs = {};
        this.selectedGraph = "";
        for (const filename of filenames) {
            const activeScene = filename === filenames[0];
            const graph = new MySceneGraph(filename, this.scene, activeScene);
            this.graphs[filename] = graph;
            if (activeScene) {
                this.selectedGraph = filename;
                this.scene.graph = graph;
                this.datInterface.sceneGraph = graph;
            }
        }

        // Add graph switcher to the interface
        this.datInterface.gui.add(this, 'selectedGraph', Object.keys(this.graphs)).name('Current scene')
            .onChange(() => this.updateCurrentGraph(true));

        // Add pick listener (move this to GameController later)
        this.scene.addPickListener(this);
    }

    start() {
        this.updateCurrentGraph(false);
        this.app.run();
    }

    updateCurrentGraph(forceUIUpdate = true) {
        this.scene.graph = this.graphs[this.selectedGraph];
        this.datInterface.sceneGraph = this.graphs[this.selectedGraph];
        if (forceUIUpdate) {
            this.scene.onGraphLoaded();
        }
    }

    notifyPick(object, pickId) {
        console.log("Picked object: " + object + ", with pickId " + pickId);
    }
}
