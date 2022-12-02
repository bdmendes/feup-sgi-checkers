import { CGFapplication } from '../../lib/CGF.js';
import { MyInterface } from './engine/MyInterface.js';
import { XMLscene } from './engine/XMLscene.js';
import { MySceneGraph } from './engine/MySceneGraph.js';
import { GameController } from './game/GameController.js';

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
            const isActiveScene = filename === filenames[0];
            const graph = new MySceneGraph(filename, this.scene, isActiveScene);
            this.graphs[filename] = graph;
            if (isActiveScene) {
                this.selectedGraph = filename;
            }
        }

        // Add graph switcher to the interface
        this.datInterface.gui.add(this, 'selectedGraph', Object.keys(this.graphs)).name('Current scene')
            .onChange(() => this.updateCurrentGraph(true));

        // Initialize game
        this.gameController = new GameController(this.scene);
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
}
