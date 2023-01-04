import { GameState } from './GameState.js';
import { BLACK } from '../model/Game.js';
import { MOVIE_BUTTON_ID, START_BUTTON_ID, SWITCH_SCENE_BUTTON_ID } from '../controller/GameController.js';

export class StartState extends GameState {
    constructor(gameController) {
        super(gameController, null);
    }

    init() {
        // Remove onbeforeunload event
        window.onbeforeunload = null;

        if (this.gameController.game == null) {
            return;
        }

        // Update buttons visibility
        this.updateButtonsVisibility();

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
            if (button === START_BUTTON_ID) {
                buttonsMap[button].setText("Start");
                buttonsMap[button].component.visible = true;
            } else if (button === MOVIE_BUTTON_ID) {
                buttonsMap[button].component.visible = this.gameController.game?.moves.length > 0;
                buttonsMap[button].setText("Watch");
            } else if (button === SWITCH_SCENE_BUTTON_ID) {
                buttonsMap[button].component.visible = true;
            } else {
                buttonsMap[button].component.visible = false;
            }
        }

        if (this.gameController.whiteButtons[START_BUTTON_ID] != null) {
            this.gameController.whiteButtons[START_BUTTON_ID].parentConsole.visible = false;
            this.gameController.blackButtons[START_BUTTON_ID].parentConsole.visible = true;
        }
    }

    onPiecePicked(_) {
        this.gameController.uiController.flashToast("Eager, aren't you? Start a new game first!");
    }
}
