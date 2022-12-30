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

        const buttonsMap = this.gameController.game.currentPlayer === BLACK ? this.gameController.blackButtons : this.gameController.whiteButtons;
        for (let button in buttonsMap) {
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

        this.gameController.setGameCamera(BLACK);
        if (this.gameController.game.currentPlayer == WHITE) {
            this.gameController.switchCamera();
            this.gameController.reset();
        }
        this.gameController.whiteButtons["startButton"].parentConsole.visible = false;
        this.gameController.blackButtons["startButton"].parentConsole.visible = true;
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}