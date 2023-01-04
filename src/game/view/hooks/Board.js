import { BLACK } from '../../model/Game.js';

const BLACK_PIECE_STR = 'blackPiece';
const WHITE_PIECE_STR = 'whitePiece';

export function capturedPieces(from, to, pieces) {
    let capturedPieces = [];
    let xdelta = (to[0] > from[0]) ? 1 : -1;
    let ydelta = (to[1] > from[1]) ? 1 : -1;
    let current = from.slice();
    while (current[0] + xdelta != to[0] && current[1] + ydelta != to[1]) {
        current[0] += xdelta;
        current[1] += ydelta;
        pieces.forEach((piece, _) => {
            if (!piece.isCaptured && piece.position[0] === current[0] && piece.position[1] === current[1]) {
                capturedPieces.push(piece);
            }
        });
    }
    return capturedPieces;
}

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

export function getInitialPositions() {
    return [new Map([
        [1, [7, 0]],
        [2, [7, 2]],
        [3, [7, 4]],
        [4, [7, 6]],
        [5, [6, 1]],
        [6, [6, 3]],
        [7, [6, 5]],
        [8, [6, 7]],
        [9, [5, 0]],
        [10, [5, 2]],
        [11, [5, 4]],
        [12, [5, 6]],
    ]), new Map([
        [1, [0, 7]],
        [2, [0, 5]],
        [3, [0, 3]],
        [4, [0, 1]],
        [5, [1, 6]],
        [6, [1, 4]],
        [7, [1, 2]],
        [8, [1, 0]],
        [9, [2, 7]],
        [10, [2, 5]],
        [11, [2, 3]],
        [12, [2, 1]],
    ])];
}

export function getInitialStack() {
    return {
        blackStackPos: [6.5, 10.5],
        blackStack: 0,
        whiteStackPos: [0.5, 10.5],
        whiteStack: 0,
    };
}
