import { GameState } from './GameState.js';
import { BLACK } from '../model/Game.js';

export class GameOverState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    init() {
        this.updateButtonsVisibility(this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename]);
    }

    updateButtonsVisibility(player) {
        if (player === BLACK) {
            this.gameController.blackButtons["startButton"].parentConsole.visible = true;
            this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
        } else {
            this.gameController.blackButtons["startButton"].parentConsole.visible = false;
            this.gameController.whiteButtons["startButton"].parentConsole.visible = true;
        }

        for (const buttonsMap of [this.gameController.blackButtons, this.gameController.whiteButtons]) {
            for (let button in buttonsMap) {
                if (button === "startButton") {
                    buttonsMap[button].component.visible = true;
                    buttonsMap[button].setText("Start");
                } else if (button === "movieButton" || button === "switchSceneButton") {
                    buttonsMap[button].component.visible = true;
                } else {
                    buttonsMap[button].component.visible = false;
                }
            }
        }
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}
