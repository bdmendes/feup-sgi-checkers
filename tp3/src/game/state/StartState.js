import { GameState } from './GameState.js';
import { BLACK } from '../model/Game.js';

export class StartState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    init() {
        if (this.gameController.game == null) {
            return;
        }

        this.updateButtonsVisibility(null);

        // Switch camera to black
        if (this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename] != BLACK) {
            this.gameController.cameraController.switchCamera();
        }
    }

    onSceneChanged() {
        this.init();
    }

    updateButtonsVisibility(_) {
        // Set black buttons visible
        const buttonsMap = this.gameController.blackButtons;
        for (let button in this.gameController.blackButtons) {
            buttonsMap[button].component.visible = true;
            if (button === "startButton") {
                buttonsMap[button].setText("Start");
                buttonsMap[button].component.visible = true;
            } else if (button === "movieButton") {
                buttonsMap[button].component.visible = this.gameController.game?.moves.length > 0;
            } else if (button === "switchSceneButton") {
                buttonsMap[button].component.visible = true;
            } else {
                buttonsMap[button].component.visible = false;
            }
        }

        if (this.gameController.whiteButtons["startButton"] != null) {
            this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
            this.gameController.blackButtons["startButton"].parentConsole.visible = true;
        }
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}
