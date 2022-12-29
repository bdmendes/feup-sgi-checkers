import { GameState } from './GameState.js';

export class GameOverState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}