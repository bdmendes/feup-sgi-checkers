import { CGFapplication } from '../../lib/CGF.js';
import { MyInterface } from './engine/MyInterface.js';
import { XMLscene } from './engine/XMLscene.js';
import { MySceneGraph } from './engine/MySceneGraph.js';
import { GameController } from './game/controller/GameController.js';
import { UIController } from './game/controller/UIController.js';

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
        this.lastSelectedGraph = "";
        for (const filename of filenames) {
            const isActiveScene = filename === filenames[0];
            const graph = new MySceneGraph(filename, this.scene, isActiveScene);
            this.graphs[filename] = graph;
            if (isActiveScene) {
                this.selectedGraph = filename;
                this.lastSelectedGraph = filename;
            }
        }

        // Add graph switcher to the interface
        this.datInterface.gui.add(this, 'selectedGraph', Object.keys(this.graphs)).name('Current scene')
            .onChange(() => this.updateCurrentGraph(true));

        // Initialize game
        this.gameController = new GameController(this.scene);

        // Hook start button to game initialization
        document.getElementById('modal').style.display = 'none';

        document.getElementById('startButton').onclick = () => {
            this.gameController.start(); // TODO: Inject hints here
            document.getElementById('modal').style.display = 'none';
            (new UIController()).flashToast("Game started!", 3000);
        };
    }

    start() {
        this.updateCurrentGraph(false);
        this.app.run();
    }

    updateCurrentGraph(forceUIUpdate = true, copyBoard = true) {
        this.scene.graph = this.graphs[this.selectedGraph];
        this.datInterface.sceneGraph = this.graphs[this.selectedGraph];
        if (forceUIUpdate) {
            this.scene.onGraphLoaded();
        }
        if (copyBoard) {
            const board = this.graphs[this.lastSelectedGraph].components['board'];
            if (board) {
                this.graphs[this.selectedGraph].components['board'] = board.board;
                this.lastSelectedGraph = this.selectedGraph;
            }
        }
    }
}
