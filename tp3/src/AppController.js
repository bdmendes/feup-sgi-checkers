import { CGFapplication } from '../../lib/CGF.js';
import { MyInterface } from './engine/MyInterface.js';
import { XMLscene } from './engine/XMLscene.js';
import { MySceneGraph } from './engine/MySceneGraph.js';
import { GameController } from './game/controller/GameController.js';

export class AppController {
    constructor(fileNames, graphNames) {
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
        this.graphNames = {};
        this.selectedGraph = null;
        this.lastSelectedGraph = "";
        for (const filename of fileNames) {
            const isActiveScene = filename === fileNames[0];
            const graph = new MySceneGraph(filename, this.scene, isActiveScene);
            this.graphs[filename] = graph;
            this.graphNames[filename] = graphNames[fileNames.indexOf(filename)];
            if (isActiveScene) {
                this.selectedGraph = filename;
            }
        }

        // Add graph switcher to the interface
        this.datInterface.gui.add(this, 'selectedGraph', Object.keys(this.graphs)).name('Current scene')
            .onChange(() => this.updateCurrentGraph(true));

        // Initialize game
        this.gameController = new GameController(this.scene, () => this.switchScene());

        // Hook start button to game initialization
        document.getElementById('modal').style.visibility = 'hidden';
        document.getElementById('startButton').onclick = () => {
            const hintValue = document.getElementById('hints').value;
            const scenarioValue = document.getElementById('scenario').value;
            const timeValue = parseInt(document.getElementById('game_time').value);

            this.switchScene(scenarioValue);

            this.gameController.start(hintValue == 'both' || hintValue == 'black', hintValue == 'both' || hintValue == 'white', timeValue);

            setTimeout(() => document.getElementById('modal').style.visibility = 'hidden', 100);
        };
    }

    start() {
        this.gameController.uiController.flashToast('Welcome to ' + this.graphNames[this.selectedGraph] + '! Press START to begin.', null, true);
        this.updateCurrentGraph(false);
        this.app.run();
    }

    updateCurrentGraph(forceUIUpdate = true, copyBoard = true) {
        if (this.lastSelectedGraph == this.selectedGraph) {
            return;
        }

        this.scene.graph = this.graphs[this.selectedGraph];
        this.datInterface.sceneGraph = this.graphs[this.selectedGraph];

        if (forceUIUpdate) {
            this.scene.onGraphLoaded();
            this.gameController.notifyGraphLoaded();
            document.getElementById('scenario').value = this.graphs[this.selectedGraph].filename;
        }

        if (copyBoard) {
            for (const [id, _] of this.gameController.pieces) {
                const animation = this.graphs[this.lastSelectedGraph].animations[id];
                if (animation != null) {
                    this.graphs[this.selectedGraph].components[id].animationID = animation.id;
                    this.graphs[this.selectedGraph].animations[id] = animation;
                } else {
                    this.graphs[this.selectedGraph].components[id].animationID = null;
                    delete this.graphs[this.selectedGraph].animations[id];
                }

                const tempTextureID = this.graphs[this.lastSelectedGraph].components[id].tempTextureID;
                this.graphs[this.selectedGraph].components[id].tempTextureID = tempTextureID;
            }
        }

        this.lastSelectedGraph = this.selectedGraph;
    }

    switchScene(filename = null) {
        if (filename != null) {
            this.selectedGraph = filename;
        } else {
            const fileNames = Object.keys(this.graphs);
            const index = fileNames.indexOf(this.selectedGraph);
            this.selectedGraph = fileNames[(index + 1) % fileNames.length];
        }

        if (this.lastSelectedGraph == this.selectedGraph) {
            return;
        }

        this.gameController.uiController.flashToast('Welcome to ' + this.graphNames[this.selectedGraph] + '!');
        this.updateCurrentGraph(true);
    }
}
