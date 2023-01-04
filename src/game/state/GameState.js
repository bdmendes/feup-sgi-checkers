import { START_BUTTON_ID } from '../controller/GameController.js';
import { BLACK } from '../model/Game.js';

export class GameState {
    constructor(gameController, visibleButtons) {
        this.gameController = gameController;
        this.visibleButtons = visibleButtons;
    }

    init() { }

    destruct() { }

    onPiecePicked(component) { }

    onPositionPicked(component) { }

    onButtonPicked(component) {
        const buttonsMap = this.gameController.game === null || this.gameController.game.currentPlayer === BLACK
            ? this.gameController.blackButtons
            : this.gameController.whiteButtons;
        const button = buttonsMap[component.id];
        button?.pick();
    }

    onTimeElapsed() { }

    onSceneChanged() {
        this.updateButtonsVisibility();
    }

    beforeSceneChanged() { }

    updateButtonsVisibility(forcedPlayer = null) {
        const player = forcedPlayer ?? (this.gameController.cameraController.facingPlayer[this.gameController.scene.graph.filename] ?? BLACK);
        if (player === BLACK) {
            this.gameController.whiteButtons[START_BUTTON_ID].parentConsole.visible = false;
            this.gameController.blackButtons[START_BUTTON_ID].parentConsole.visible = true;
        } else {
            this.gameController.blackButtons[START_BUTTON_ID].parentConsole.visible = false;
            this.gameController.whiteButtons[START_BUTTON_ID].parentConsole.visible = true;
        }

        for (let buttonsMap of [this.gameController.blackButtons, this.gameController.whiteButtons]) {
            for (let button in buttonsMap) {
                if (this.visibleButtons.has(button)) {
                    buttonsMap[button].component.visible = true;
                    const text = this.visibleButtons.get(button);
                    if (text != null) {
                        buttonsMap[button].setText(text);
                    }
                } else {
                    buttonsMap[button].component.visible = false;
                }
            }
        }
    }
}
