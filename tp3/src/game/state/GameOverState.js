import { GameState } from './GameState.js';

export class GameOverState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    init() {
        for (const buttonsMap of [this.gameController.blackButtons, this.gameController.whiteButtons]) {
            for (let button in buttonsMap) {
                if (button === "startButton") {
                    buttonsMap[button].component.visible = true;
                    buttonsMap[button].setText("START");
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
