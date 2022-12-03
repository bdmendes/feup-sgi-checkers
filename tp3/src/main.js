import { AppController } from './AppController.js';
import { Game } from './game/Game.js';

/**
 * Parse url variables to get the right file
 * @return {*} 
 */
function getUrlVars() {
    const vars = {};
    const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

function main() {
    // Test game
    const game = new Game();
    game.printBoard();

    console.log(game.move([5, 2], [4, 3]));
    game.printBoard();

    console.log(game.move([2, 5], [3, 4]));
    game.printBoard();

    console.log(game.move([4, 3], [2, 5]));
    game.printBoard();

    //console.log(game.move([1, 6], [3, 4]))
    console.log(game.move([1, 4], [3, 6]));
    game.printBoard();

    console.log("Now undoing...");

    console.log(game.undo());
    game.printBoard();

    console.log(game.undo());
    game.printBoard();

    console.log(game.undo());
    game.printBoard();

    console.log(game.undo());
    game.printBoard();

    console.log(game.undo());
    game.printBoard();

    //////////////////////////////////////////////
    const file = getUrlVars()["file"];
    const gameController = new AppController(file ? [file] : ["house.xml", "board.xml"]);
    gameController.start();
}

main();
