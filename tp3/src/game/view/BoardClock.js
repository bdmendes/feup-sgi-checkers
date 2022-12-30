export class BoardClock {
    constructor(clockComponent) {
        this.clockComponent = clockComponent;

        this.blackMinutesComponent = this.clockComponent.children["minutePlayer1"];
        this.blackBigSecondsComponent = this.clockComponent.children["biggerSecondPlayer1"];
        this.blackSmallSecondsComponent = this.clockComponent.children["smallerSecondPlayer1"];

        this.whiteMinutesComponent = this.clockComponent.children["minutePlayer2"];
        this.whiteBigSecondsComponent = this.clockComponent.children["biggerSecondPlayer2"];
        this.whiteSmallSecondsComponent = this.clockComponent.children["smallerSecondPlayer2"];
    }

    update(blackRemainingSeconds, whiteRemainingSeconds) {
        const blackRemainingMinutes = Math.floor(blackRemainingSeconds / 60);
        const whiteRemainingMinutes = Math.floor(whiteRemainingSeconds / 60);
        const blackRemainingSecondsStripped = blackRemainingSeconds % 60;
        const whiteRemainingSecondsStripped = whiteRemainingSeconds % 60;

        this.blackMinutesComponent.children["displayNumber1"].text.text = blackRemainingMinutes.toString();
        this.blackBigSecondsComponent.children["displayNumber2"].text.text = Math.floor(blackRemainingSecondsStripped / 10).toString();
        this.blackSmallSecondsComponent.children["displayNumber3"].text.text = Math.floor(blackRemainingSecondsStripped % 10).toString();

        this.whiteMinutesComponent.children["displayNumber4"].text.text = whiteRemainingMinutes.toString();
        this.whiteBigSecondsComponent.children["displayNumber5"].text.text = Math.floor(whiteRemainingSecondsStripped / 10).toString();
        this.whiteSmallSecondsComponent.children["displayNumber6"].text.text = Math.floor(whiteRemainingSecondsStripped % 10).toString();
    }
}
