export class MyPiece {
    constructor(id, componentID, color, position) {
        this.id = id;
        this.componentID = componentID; // component id in the xml
        this.color = color;
        this.position = position;
        this.possibleMoves = null;
        this.isCaptured = false;
    }
}