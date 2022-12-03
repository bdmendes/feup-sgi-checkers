export function columnToLetter(column) {
    return String.fromCharCode(65 + column);
}

export function letterToColumn(letter) {
    return (letter.charCodeAt(0) - 65);
}

export function rowToNumber(row) {
    return 7 - row;
}