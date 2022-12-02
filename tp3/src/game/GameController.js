import { Game } from './Game.js';

export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.scene.addPickListener(this);

        this.game = new Game();
    }

    notifyPick(component) {
        console.log("Picked object: " + component.id);
    }
}
