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

    setText(text) {
        const graphText = this.component.children[this.component.id + "Top"]?.text;
        if (graphText) {
            graphText.text = text;
        }
    }
}