import { GameState } from './GameState.js';

export class StartState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}