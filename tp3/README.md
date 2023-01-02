# SGI 2022/2023 - TP3

## Group: T05G04

| Name          | Number    | E-Mail                   |
| ------------- | --------- | ------------------------ |
| Bruno Mendes  | 201906166 | up201906166@edu.fe.up.pt |
| Fernando Rego | 201905951 | up201905951@edu.fe.up.pt |

---

## Project information

### Code architecture

![code_arch](./readme_assets/sgi_arch.png)

Starting from TP2's work, a powerful but non interactable graphics engine, we felt that it would be of great benefit to make only needed adjustments to its abilites, for example, to accomodate for text spritesheets, and keep it completely agnostic to its usage.

This decision means that the developed game is bundled in a package that "orchestrates" the scene and its selected graph without it knowing about it. This reduces code coupling and contributes to a great development experience.

The main class, *AppController*, is responsible for switching the graph used in the scene and injects its scene switcher function in the *GameController* it creates. The *GameController* instanciates other controllers, injecting itself as the context for other controllers' usage. It is responsible for receiving user events, such as picking an object, and dispatching an appropriate action depending on the [state](https://en.wikipedia.org/wiki/State_pattern). These might include changing the *Game* model and animating a piece, for example, in response to a move.

The scene cannot call directly *GameController* functions, since it does not depend on it. To surpass this, it is [observable](https://en.wikipedia.org/wiki/Observer_pattern) by interested classes, notifying them in case of events.

### Graphical engine changes

The graphics engine ported from TP2 had its XML specification updated to support more features, without breaking backwards compatibility:

- The `component` tag has now two new optional properties: `visible` and `pickable`, which default, respectively to 1 and 0. These are self explanatory and are very useful for dynamic orchestration of the scene.
- The `text` tag is now an optional child of `component`. It represents text to be drawn, centered, on top of the component (using the text shader). `scale_y`, `scale_x`, `x_off`, `y_off` and `gap` are optional properties that allow micro adjustments to the spacing and positioning of the text.
- The `highlight` tag now has an optional `enabled` property that defaults to 1.
- The new optional `includes` top-level tag (that must sit, if exists, before the `views` tag) allows to `include` other graphs' primitives, components, materials and textures in the current one. When encountering this tag, the parser loads the included graphs into the current one before continuing the parsing, so that external referenced assets exist in the time of their read.

As the relevant actions for the application usage can be made using the board's pickable buttons, we are closing the `dat.GUI` interface by default to provide an immersive experience. It can still be opened manually to play with all TP2's scene settings, such as lights or highlights toggling. It is refreshed automatically every time the graph changes, but we did notice that the properties do not auto update if changed via game and not the interface (for example, "travelling" via board button does not update the selected scene field on `dat.GUI`.). Also, even closed by default, its label's text is *Close Controls* instead of *Open Controls*. We are assuming that these are bugs related to this library's version shipped with `WebCGF`.

Note that on game development (explained below) we rely solely on semantic ID names for hooking scene components to view models. This makes sure that the graphics engine layer, where the parser resides, stays agnostic. The `board` is included in the three scenes using the `include` tag so that any change to `board.xml` is reflected in all scenes.

### Game development

#### Selection of pieces and positions

#### Piece movements

### Visualization

#### Illumination

#### Game scenes

### Generic game features

#### Undo

One can undo if playing an active game with 1 or more moves, via the pickable board button for the effect. The game model stores the list of the moves and the board after each move, so undoing there is straightforward. On the graphical side of things, an animation is injected on the last played piece from the final position to the initial position of the last move, and captured pieces, if any, are returned to the board, similarly to how they left, but on reverse. The text marker is also updated to remove the now in game pieces.

#### Camera rotation

One can rotate the camera to the other side of the board, via the pickable board button for the effect. The camera is also switched automatically to the next to play side, while playing. This is done by rotating the camera 180 degrees around the board's center, which should be the camera's target specificed in the XML. Some things that we kept in mind to make the switching consistent:

- The rotation should make sense, in the way that the board stays visible in the screen and that it lands on the desired position. This means that we need to "put" the camera in front of the board, in its original position (when the graph loaded), discarding previous camera movement by dragging the mouse around the scene.
- If the user switches the camera manually to the player that is not to play and plays the current player's move from that side, there is no need to switch the camera back, since it is facing the correct side after the move.
- The cameras differ from graph to graph, so the positions are stored per graph. This also means that when switching scenes, while playing, we need to put the camera to the player that is to play, currently. If an active game is not being played, the camera is not touched when switching scenes.

#### Movie

As per requirements, one can watch the movie of the game at any time while playing an active game with 1 or more moves, via the pickable board button for the effect. On the model side of things, we can just iterate over the list of moves and execute them over an initial board. On the graphical side of things, things get complicated, since we need to reset all hooked objects and "undo" the reset when stopping the movie, so that the game can be played again. This goes as follows:

- When entering the *InMovieState*, the view is reset to its initial state: piece animations, piece textures, captured pieces marker, game time are saved and reset to their initial state.
- One time per second, the state is notified to make a move. It injects move animation and increments the current move index. When the last move is reached, this time elapsed handler does nothing.
- When the user ends the movie, the saved state is restored and the game may resume, if it was active.

#### Move hints

To improve the user experience, when tapping a piece, if the game is set up to do that (on the `Start Game` popup), the view will highlight the possible moves for that piece, in the current position, provided by the game model, by changing the texture of the square to a green one. After making a move or selecting another piece, the controller removes the temporary texture from the board.

#### Time measure

When a new game is started, it stores the black and white remaining seconds to the set up time (on the `Start Game` popup), updating the hooked clock component. Each second, the current player remaining time decreases, as seen in the board clock. When the time is up, the game ends and the winner is the opponent. After a move is made, the time resets to the set up time and starts counting for the next to play player. The time is not stored in the game model, as it is not relevant to the game logic.

### Challenges faced (and solutions employed)

- The chosen code architecture reflects our belief that it was not maintainble to inject application specific artifacts in the developed engine. It was already challenging enough to deal with a big codebase that was loosely coupled.
- While Javascript "exposes" a single threaded interface to the user, its callback nature allows for several race conditions. In the context of this work, it is mainly related to graph switching and loading: when it happens, the controller needs to hook the graphical objects to its model, but there might already be work being done to the scene. Some problems and its solutions:
    - A turned on spotlight is being updated to follow the piece movement while the user switches the scene and switches itself off a bit later on the new scene. When returning to the old scene, its graph still has that light on, confusing the game controller. We worked around this by disabling the spotlight when switching the scene and let the next movement use the newly hooked spotlight.
    - Every graph has a different instance of the board. This means that if an animation is being updated on one graph and the user travels, the scene now makes no sense since the object was stationary, there, before, and the initial positions are different. This means that the game is basically unplayable if this issue was not tackled. We solved this by copying the reference to active animations and textures from the old to the new graph every time it is switched.
- Using traditional spritesheets to draw text raises some issues, such as the letters not having the same width, which results in weird spacing between letters when drawn. There are some workarounds that could have been explored, such as centering the text on each character box on the font asset, or even determining the frame of the letter with a color detecting algorithm, but this was not the scope of this work. We resorted to avoiding using tiny letters such as `I`, which is a bit naive, but works quite well in maintaing a good text look.

### Conclusions and future work

This pratical work was the most interesting and challenging of the three, requiring us to code a very interactive system that responds very differently depending on the state. This, coupled with new graphical/mathematical challenges, such as detecting collisions or animating objects, made it a challenging although very rewarding project.

In the end, we cannot help not to mention that we'd love to have more time to further improve on this project, perhaps working on an artificial intelligence or a proper, separate backend, to implement AJAX calls.