export class MyPiece {
    constructor(id, componentID, color, position) {
        this.id = id;
        this.componentID = componentID;
        this.color = color;
        this.position = position;
        this.possibleMoves = null;
        this.isCaptured = false;
        this.kingPromotionMove = null;
    }
}