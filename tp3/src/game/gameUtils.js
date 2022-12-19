import { BLACK } from './Game.js';

const BLACK_PIECE_STR = 'blackPiece';
const WHITE_PIECE_STR = 'whitePiece';

export function columnToLetter(column) {
    return String.fromCharCode(65 + column);
}

export function letterToColumn(letter) {
    return (letter.charCodeAt(0) - 65);
}

export function rowToNumber(row) {
    return 7 - row;
}

export function parseID(currentPlayer, component) {
    return (currentPlayer === BLACK) ?
        parseInt(component.id.substring(component.id.indexOf(BLACK_PIECE_STR) + BLACK_PIECE_STR.length))
        :
        parseInt(component.id.substring(component.id.indexOf(WHITE_PIECE_STR) + WHITE_PIECE_STR.length));
}

export function parsePosition(component) {
    return [rowToNumber(component.id[component.id.length - 1]), letterToColumn(component.id[component.id.length - 2])];
}

export function checkValidPosition(possibleMoves, position) {
    for (let i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i][0] === position[0] && possibleMoves[i][1] === position[1]) {
            return true;
        }
    }
    return false;
}