import { columnToLetter, rowToNumber } from './gameUtils.js';

const POSSIBLE_MOVE_TEXTURE = 'possibleMoveTexture';
const SELECTED_PIECE_TEXTURE = 'selectedPieceTexture';

export class TextureController {
    constructor(scene) {
        this.scene = scene;
    }

    applyPossibleMoveTexture(position, possibleFinalPositions) {
        let positionID = 'position' + columnToLetter(position[1]) + rowToNumber(position[0]);
        this.scene.graph.components[positionID].tempTextureID = SELECTED_PIECE_TEXTURE;

        for (let i = 0; i < possibleFinalPositions.length; i++) {
            let move = possibleFinalPositions[i];
            let positionID = 'position' + columnToLetter(move[1]) + rowToNumber(move[0]);

            this.scene.graph.components[positionID].tempTextureID = POSSIBLE_MOVE_TEXTURE;
        }
    }

    cleanPossibleMoveTexture(position, possibleFinalPositions) {
        let positionID = 'position' + columnToLetter(position[1]) + rowToNumber(position[0]);
        this.scene.graph.components[positionID].tempTextureID = null;
        for (let i = 0; i < possibleFinalPositions.length; i++) {
            let move = possibleFinalPositions[i];
            let positionID = 'position' + columnToLetter(move[1]) + rowToNumber(move[0]);

            this.scene.graph.components[positionID].tempTextureID = null;
        }
    }
}