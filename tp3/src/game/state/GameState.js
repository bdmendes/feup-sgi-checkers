import { BLACK } from '../model/Game.js';

export class GameState {
    constructor(gameController) {
        this.gameController = gameController;
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
        this.updateButtonsVisibility(this.gameController.game?.currentPlayer ?? BLACK);
    }

    updateButtonsVisibility(player) { }
}
