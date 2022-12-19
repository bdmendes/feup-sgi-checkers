export class MyPiece {
    constructor(id, componentID, color, pos) {
        this.id = id;
        this.componentID = componentID; // component id in the xml
        this.color = color;
        this.pos = pos;
        this.possibleMoves = null;
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