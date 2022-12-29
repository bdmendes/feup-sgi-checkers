import { Game, BLACK, WHITE } from '../model/Game.js';

export class GameState {
    constructor(gameController) {
        this.gameController = gameController;
    }

    onPiecePicked(component) { }

    onPositionPicked(component) { }

    onButtonPicked(component) {
        const buttonsMap = this.gameController.game.currentPlayer === BLACK ? this.gameController.blackButtons : this.gameController.whiteButtons;
        const button = buttonsMap[component.id];
        button.pick();
    }

    onTimeElapsed() { }

    updateButtonsVisibility() { }
}