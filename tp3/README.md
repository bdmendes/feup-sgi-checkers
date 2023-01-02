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

### Game development

#### Selection of pieces and positions

#### Piece movements

### Visualization

#### Illumination

#### Game scenes

### Generic game features

#### Undo

#### Camera rotation

#### Movie

#### Move hints

#### Time measure

### Challenges faced (and solutions employed)

- The chosen code architecture reflects our belief that it was not maintainble to inject application specific artifacts in the developed engine. It was already challenging enough to deal with a big codebase that was loosely coupled.
- While Javascript "exposes" a single threaded interface to the user, its callback nature allows for several race conditions. In the context of this work, it is mainly related to graph switching and loading: when it happens, the controller needs to hook the graphical objects to its model, but there might already be work being done to the scene. Some problems and its solutions:
    - A turned on spotlight is being updated to follow the piece movement while the user switches the scene and switches itself off a bit later on the new scene. When returning to the old scene, its graph still has that light on, confusing the game controller. We worked around this by disabling the spotlight when switching the scene and let the next movement use the newly hooked spotlight.
    - Every graph as a different instance of the board. This means that if an animation is being updated on one graph and the user travels, the scene now makes no sense since the object was stationary, there, before, and the initial positions are different. This means that the game is basically unplayable if this issue was not tackled. We solved this by copying the reference to active animations and textures from the old to the new graph every time it is switched.

### Conclusions and future work

This pratical work was the most interesting and challenging of the three, requiring us to code a very interactive system that responds very differently depending on the state. This, coupled with new graphical/mathematical challenges, such as detecting collisions or animating objects, made it a challenging although very rewarding project.

In the end, we cannot help not to mention that we'd love to have more time to further improve on this project, perhaps working on an artificial intelligence or a proper, separate backend, to implement AJAX calls.