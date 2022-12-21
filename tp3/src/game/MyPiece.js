export class MyPiece {
    constructor(id, componentID, color, pos) {
        this.id = id;
        this.componentID = componentID; // component id in the xml
        this.color = color;
        this.pos = pos;
        this.possibleMoves = null;
        this.isCaptured = false;
    }

    getID() {
        return this.id;
    }

    getComponentID() {
        return this.componentID;
    }

    getPosition() {
        return this.pos;
    }

    IsCaptured() {
        return this.isCaptured;
    }

    setIsCaptured(isCaptured) {
        this.isCaptured = isCaptured;
    }

    setPosition(pos) {
        this.pos = pos;
    }

    getColor() {
        return this.color;
    }

    getPossibleMoves() {
        return this.possibleMoves;
    }

    setPossibleMoves(possibleMoves) {
        this.possibleMoves = possibleMoves;
    }
}