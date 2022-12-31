import { GameState } from './GameState.js';
import { BLACK, WHITE } from '../model/Game.js';

export class StartState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    init() {
        if (this.gameController.game == null) {
            return;
        }

        // Set black buttons visible
        for (let button in this.gameController.blackButtons) {
            buttonsMap[button].component.visible = true;
            if (button === "startButton") {
                buttonsMap[button].setText("Start");
                buttonsMap[button].component.visible = true;
            } else if (button === "switchSceneButton") {
                buttonsMap[button].component.visible = true;
            } else {
                buttonsMap[button].component.visible = false;
            }
        }
        this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
        this.gameController.blackButtons["startButton"].parentConsole.visible = true;

        // Switch camera to black
        if (this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename] === WHITE) {
            this.gameController.cameraController.switchCamera();
        }
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}