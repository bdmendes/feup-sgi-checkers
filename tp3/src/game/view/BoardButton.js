export class BoardButton {
    constructor(scene, component, parentConsole, player, handler = () => { }) {
        this.scene = scene;
        this.component = component;
        this.parentConsole = parentConsole;
        this.player = player;
        this.handler = handler;
    }

    pick() {
        this.handler();
    }

    updateVisibility(game) {
        this.parentConsole.visible = game.currentPlayer === this.player;

        // TODO: update visibility of the button based on game state
        this.component.visible = true;

        console.log("updateVisibility: " + this.component.id + " " + this.component.visible);
    }
}