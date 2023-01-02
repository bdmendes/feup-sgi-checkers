import { columnToLetter, rowToNumber } from '../view/hooks/Board.js';

const POSSIBLE_MOVE_TEXTURE = 'possibleMoveTexture';
const SELECTED_PIECE_TEXTURE = 'selectedPieceTexture';

export class TextureController {
    constructor(scene) {
        this.scene = scene;
    }

    applyPossibleMoveTexture(position, possibleFinalPositions, hint = true) {
        let positionID = this._getPositionID(position[0], position[1]);
        this.scene.graph.components[positionID].tempTextureID = SELECTED_PIECE_TEXTURE;

        if (!hint) {
            return;
        }

        for (let i = 0; i < possibleFinalPositions.length; i++) {
            let move = possibleFinalPositions[i];
            positionID = this._getPositionID(move[0], move[1]);

            this.scene.graph.components[positionID].tempTextureID = POSSIBLE_MOVE_TEXTURE;
        }
    }

    cleanPossibleMoveTexture(position, possibleFinalPositions) {
        let positionID = this._getPositionID(position[0], position[1]);
        this.scene.graph.components[positionID].tempTextureID = null;

        for (let i = 0; i < possibleFinalPositions.length; i++) {
            let move = possibleFinalPositions[i];
            positionID = this._getPositionID(move[0], move[1]);

            this.scene.graph.components[positionID].tempTextureID = null;
        }
    }

    _getPositionID(x, y) {
        return 'position' + columnToLetter(y) + rowToNumber(x);
    }
}