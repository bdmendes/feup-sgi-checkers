import { GameController } from './game/GameController.js';

function main() {
    const gameController = new GameController(["demo.xml"]);
    gameController.start();
}

main();
