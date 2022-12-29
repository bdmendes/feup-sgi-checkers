import { WHITE } from '../model/Game.js';

export class AuxiliaryBoard {
    constructor(scene, component, player) {
        this.scene = scene;
        this.component = component;
        this.player = player;
    }

    addCapturedPieces(numberOfPieces) {
        const graphText = this.component.children["supportBlockFace4" + (this.player === WHITE ? 'White' : 'Black')]?.text;
        if (graphText) {
            graphText.text = (parseInt(graphText.text) + numberOfPieces).toString();
        }
    }

    setCapturedPieces(numberOfPieces) {
        const graphText = this.component.children["supportBlockFace4" + (this.player === WHITE ? 'White' : 'Black')]?.text;
        if (graphText) {
            graphText.text = numberOfPieces.toString();
        }
    }

    getCapturedPieces(player) {
        const graphText = this.component.children["supportBlockFace4" + (player === WHITE ? 'White' : 'Black')]?.text;
        if (graphText) {
            return parseInt(graphText.text);
        }
        return 0;
    }
}
