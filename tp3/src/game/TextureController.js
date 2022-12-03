const POSSIBLE_MOVE_TEXTURE = 'possibleMoveTexture';
const SELECTED_PIECE_TEXTURE = 'selectedPieceTexture';

export class TextureController {
    constructor(scene) {
        this.scene = scene;
    }

    applyPossibleMoveTexture(position, possibleFinalPositions) {
        let positionID = 'position' + this.columnToLetter(position[1]) + this.rowToNumber(position[0]);
        this.scene.graph.components[positionID].tempTextureID = SELECTED_PIECE_TEXTURE;

        for (let i = 0; i < possibleFinalPositions.length; i++) {
            let move = possibleFinalPositions[i];
            let positionID = 'position' + this.columnToLetter(move[1]) + this.rowToNumber(move[0]);

            this.scene.graph.components[positionID].tempTextureID = POSSIBLE_MOVE_TEXTURE;
        }
    }

    clearPossibleMoveTexture(position, possibleFinalPositions) {
        let positionID = 'position' + this.columnToLetter(position[1]) + this.rowToNumber(position[0]);
        this.scene.graph.components[positionID].tempTextureID = null;
        for (let i = 0; i < possibleFinalPositions.length; i++) {
            let move = possibleFinalPositions[i];
            let positionID = 'position' + this.columnToLetter(move[1]) + this.rowToNumber(move[0]);

            this.scene.graph.components[positionID].tempTextureID = null;
        }
    }

    columnToLetter(column) {
        return String.fromCharCode(65 + column);
    }

    rowToNumber(row) {
        return 7 - row;
    }
}