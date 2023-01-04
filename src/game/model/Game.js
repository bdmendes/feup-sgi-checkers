const EMPTY = 0;
const WHITE_MAN = 1;
const BLACK_MAN = 2;
const WHITE_KING = 3;
const BLACK_KING = 4;
export const WHITE = 1;
export const BLACK = 2;

export class Game {
    constructor() {
        // Initialize game board
        this.board = Array.from({ length: 8 }, _ => Array(8).fill(EMPTY));
        this.board[0][1] = this.board[0][3] = this.board[0][5] = this.board[0][7] = WHITE_MAN;
        this.board[1][0] = this.board[1][2] = this.board[1][4] = this.board[1][6] = WHITE_MAN;
        this.board[2][1] = this.board[2][3] = this.board[2][5] = this.board[2][7] = WHITE_MAN;
        this.board[5][0] = this.board[5][2] = this.board[5][4] = this.board[5][6] = BLACK_MAN;
        this.board[6][1] = this.board[6][3] = this.board[6][5] = this.board[6][7] = BLACK_MAN;
        this.board[7][0] = this.board[7][2] = this.board[7][4] = this.board[7][6] = BLACK_MAN;

        // Initialize game state
        this.currentPlayer = BLACK;
        this.moves = []; // (from, to, isCapture, nextToPlay) tuples eg. [[2, 1], [4, 0], false, WHITE]
        this.previousBoards = [];
    }

    printBoard() {
        console.log(this.board.map(row => row.map(cell => {
            switch (cell) {
                case EMPTY: return ' ';
                case WHITE_MAN: return 'w';
                case WHITE_KING: return 'W';
                case BLACK_KING: return 'B';
                case BLACK_MAN: return 'b';
            }
        }).concat('\n')).join(''));
    }

    undo() {
        if (this.moves.length === 0) {
            return false;
        }
        this.board = this.previousBoards.pop();
        this.moves.pop();
        this.currentPlayer = this.moves.length > 0 ? this.moves[this.moves.length - 1][3] : BLACK;
        return true;
    }

    possibleMoves(from, forceCaptures = true) {
        // If no captures are available from this position but there are captures available, discard this move
        if (forceCaptures) {
            const captureStarts = [];
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const moves = this._possibleMovesSingle([i, j]);
                    for (const move of moves) {
                        const isCapture = move[2];
                        if (isCapture) {
                            captureStarts.push(move[0]);
                        }
                    }
                }
            }
            const capturesStartingFrom = captureStarts.filter(start => start[0] === from[0] && start[1] === from[1]);
            if (capturesStartingFrom.length === 0 && captureStarts.length > 0) {
                return [];
            }
        }

        // Return all possible moves from the given position
        return this._possibleMovesSingle(from);
    }

    _possibleMovesSingle(from) {
        const [row, col] = from;
        const piece = this.board[row][col];
        const player = piece === WHITE_KING || piece === WHITE_MAN ? WHITE : BLACK;

        if (piece === EMPTY || player !== this.currentPlayer) {
            return [];
        }

        // Utilitary functions
        const insideBoard = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;
        const isEnemy = (row, col) => player === WHITE
            ? this.board[row][col] === BLACK_KING || this.board[row][col] === BLACK_MAN
            : this.board[row][col] === WHITE_KING || this.board[row][col] === WHITE_MAN;
        const isPiece = (row, col) => this.board[row][col] !== EMPTY;
        const ownPiece = (row, col) => insideBoard(row, col) && isPiece(row, col) && !isEnemy(row, col);
        const enemyPiece = (row, col) => insideBoard(row, col) && isPiece(row, col) && isEnemy(row, col);

        // Calculate possible valid moves
        let to = [], toCaptures = [], toNonCaptures = [];
        if (piece == WHITE_MAN) {
            to = [[row + 1, col - 1], [row + 1, col + 1]];
        } else if (piece == BLACK_MAN) {
            to = [[row - 1, col - 1], [row - 1, col + 1]];
        } else if (piece == BLACK_KING || piece == WHITE_KING) {
            for (let rowDiff of [-1, 1]) {
                for (let colDiff of [-1, 1]) {
                    let enemyJumps = 0;
                    for (let i = 1; i < 8; i++) {
                        const position = [row + rowDiff * i, col + colDiff * i];
                        const isJumpOverOwnPiece = ownPiece(position[0], position[1]);
                        const isJumpOverSecondEnemyPiece = enemyPiece(position[0], position[1]) && ++enemyJumps > 1;
                        if (isJumpOverOwnPiece || isJumpOverSecondEnemyPiece) {
                            break;
                        }
                        to.push([position[0], position[1]]);
                    }
                }
            }
        } else {
            throw new Error("Invalid piece");
        }

        // Discard out of bounds moves (first pass)
        to = to.filter(([row, col]) => insideBoard(row, col));

        // Convert enemy taps to captures
        to.filter(([row, col]) => isEnemy(row, col, player)).forEach(([row, col]) => {
            const [rowDiff, colDiff] = [Math.sign(row - from[0]), Math.sign(col - from[1])];
            if (piece === WHITE_KING || piece === BLACK_KING) {
                for (let i = 1; i < 7; i++) {
                    if (ownPiece(row + i * rowDiff, col + i * colDiff) || enemyPiece(row + i * rowDiff, col + i * colDiff)) {
                        break;
                    }
                    toCaptures.push([row + i * rowDiff, col + i * colDiff]);
                }
            } else {
                toCaptures.push([row + rowDiff, col + colDiff]);
            }
        });
        toNonCaptures = to.filter(([row, col]) => !isEnemy(row, col, player));

        // Discard out of bounds moves (second pass)
        toCaptures = toCaptures.filter(([row, col]) => insideBoard(row, col));

        // Discard moves that land on a piece
        toCaptures = toCaptures.filter(([row, col]) => !isPiece(row, col));
        toNonCaptures = toNonCaptures.filter(([row, col]) => !isPiece(row, col));

        // If there are captures, discard all other moves; else return all moves
        if (toCaptures.length > 0) {
            return toCaptures.map(([row, col]) => [[from[0], from[1]], [row, col], true, null]);
        }

        return toNonCaptures.map(([row, col]) => [[from[0], from[1]], [row, col], false, null]);
    }

    move(from, to, checkValid = false) {
        // Discard if it is not the current player's turn
        const piece = this.board[from[0]][from[1]];
        const player = piece === WHITE_KING || piece === WHITE_MAN ? WHITE : BLACK;
        if (player !== this.currentPlayer || this.board[from[0]][from[1]] === EMPTY) {
            return false;
        }

        // Discard if the move is not valid
        if (checkValid) {
            const possibleMoves = this.possibleMoves(from, true, true);
            if (!possibleMoves.some(move => move[1][0] === to[0] && move[1][1] === to[1])) {
                return false;
            }
        }

        // Save previous board
        this.previousBoards.push(this.board.map(row => row.slice()));

        // Move piece, considering promotions
        this.board[to[0]][to[1]] = this.board[from[0]][from[1]];
        if (this.board[to[0]][to[1]] === WHITE_MAN && to[0] === 7) {
            this.board[to[0]][to[1]] = WHITE_KING;
        } else if (this.board[to[0]][to[1]] === BLACK_MAN && to[0] === 0) {
            this.board[to[0]][to[1]] = BLACK_KING;
        }
        this.board[from[0]][from[1]] = EMPTY;

        // Capture opponent pieces if it is a capture and check for double captures
        let isCapture = false;
        let nextToPlay = this.currentPlayer === WHITE ? BLACK : WHITE;
        if (Math.abs(to[0] - from[0]) >= 2) {
            // Capture pieces on the way
            const [rowDiff, colDiff] = [to[0] - from[0], to[1] - from[1]];
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                const position = [from[0] + i * rowDiff / Math.abs(rowDiff), from[1] + i * colDiff / Math.abs(colDiff)];
                const piece = this.board[position[0]][position[1]];
                if (piece != EMPTY) {
                    isCapture = true;
                }
                this.board[position[0]][position[1]] = EMPTY;
            }

            if (isCapture) {
                // Check if there is a double capture available for the current player
                const moves = this._possibleMovesSingle(to);
                for (const move of moves) {
                    if (move[2]) {
                        nextToPlay = this.currentPlayer;
                        break;
                    }
                }
            }
        }

        // Add move, update player and return
        this.moves.push([from, to, isCapture, nextToPlay]);
        this.currentPlayer = nextToPlay;
        return true;
    }

    winner() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this._possibleMovesSingle([i, j], true).length > 0) {
                    return null;
                }
            }
        }
        return this.currentPlayer === WHITE ? BLACK : WHITE;
    }
}
