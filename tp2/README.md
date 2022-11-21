# SGI 2022/2023 - TP2

## Group: T05G04

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Bruno Mendes     | 201906166 | up201906166@edu.fe.up.pt |
| Fernando Rego    | 201905951 | up201905951@edu.fe.up.pt |

----
## Project information

### XML Parsing
We parsed the XML file according to the updated specification. As in the first delivery, we allow referencing entities via their `id` even if they are defined later in the file.

### Strong points (and discussion)

#### NURBS

As suggested, we implemented the `MyPatch` class as a wrapper for `CGFnurbsObject`. We made sure the former has the behavior of any other primitive previously implemented, such as `MyCylinder` or `MyTriangle`. This allows us to keep the same code structure for displaying the scene.

#### Shaders

The proposed highlight behavior is to interpolate the original color and scale factor with the provided ones, throughout an arbitrary time period. We are defaulting this "pulse" duration to 3 seconds, but we made this value changeable via the GUI.

We resorted to the Gouraud shading model, using CGF's `multiple_light-vertex.glsl` as a base and adding upon it to calculate the color and vertex scale factor along the cycle. This allows highlighted objects to keep their proper material characteristics, namely the lighting and the texture.

Performance is a thing that we kept in mind, since we are aware of the computational cost of switching the active scene shader While iterating the graph, the program does not change the active shader if the currently applied one is the appropriate for displaying the current object: for example, if the previous displayed object was highlighted and the current one also is, there is no need to change the scene shader.

Highlights are toggleable via the GUI, as required.

#### Animations

Keyframe animations are implemented based on effective elapsed time, to account for possible delays in the animation loop, for example, due to the user's computer being busy with other tasks. This is done by keeping track of the time elapsed since the last frame was rendered, and adding it to the animation's current time. This way, the animation will always be in sync with the user's computer, regardless of its performance.

Interpolation between keyframes' instants is linear, for the three transformation types: translation, rotation and scaling. This is done by calculating the difference between the current and the next keyframe's values, and dividing it by the difference between the current and the next keyframe's instants. This way, we can calculate the amount of change that should be applied to the current value, in order to reach the next keyframe's value, in the next frame.

The animation loop instant is updated in the scene `update` method.

As an added bonus, we allow the user to keep the animations in a loop, if they desire to do so, via the GUI. This is implemented by simply resetting to the initial animation instant when its end is reached, via the modulo operator.

### Scene description
The scene represents a comfortable living room with a small donut on the dinner table and a modern center table, a sofa to watch TV and several lamps around the room to allow night entertainment. Two art paintings are present in the living room walls to give some colors to the scene.

For this second delivery, we are showcasing the `MyPatch` primitive via the new barrel next to the sofa, the fireplace (the "tent") next to the TV, the bowl above the center table and the glass above the TV-facing table. We also changed the window primitive from `MyRectangle` to `MyPatch`, stretching its top control points to give it a more modern look.

The TV-facing table, the donut and the glass on top of the TV-facing table are highlighted, showcasing scale and color changes.

Lastly, animations are intended to make the scene more lively. We are displaying a paper plane flying around the room, while also moving its "wings" and going up and down. An orange is falling from the dinner table, just like magic. The TV is moving towards the sofa, for a lively movie night. The fireplace is stretching, to give the impression that flames are burning. Chairs around the dinner table are moving around it, to give the impression that the family is having a buffet, having to move around the table to get their food.

Check out our project [in this page](https://paginas.fe.up.pt/~up201905951/sgi/tp2/).

Check out some screenshots [here](screenshots/).

### Issues

No problems were found.
