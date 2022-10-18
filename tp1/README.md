# SGI 2022/2023 - TP1

## Group: T05G04

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Bruno Mendes     | 201906166 | up201906166@edu.fe.up.pt |
| Fernando Rego    | 201905951 | up201905951@edu.fe.up.pt |

----
## Project information

### XML Parsing
We parsed the XML file according to the specifications. We allow referencing a later defined entity, too.

### Strong points (and discussion)

#### Primitives and Geometry
We paid special attention to our implementation of the required primitives, including the texture coordinates and normals.

#### Geometric Transformations
We chose (in the abscence of a clear indication in the requirements) to consider the component tranformations in its natural order. We made sure to apply the component transformations only after its children, of course.

> If, in the `xml` file, the user transforms a component with a `rotate` followed by a `translation`, the component is actually rotated first and then translated. This means that the transformation matrices are pushed in reverse order to the scene.

#### Materials
When materials are inherited, it means that the component applies the material that is currently applied in its parent. This was also a design choice, since the requirements are not totally clear in this regard (we could have interpreted that `inherit` meant "bring all my parent materials to my materials list"). This seemed more natural to us.

We switch to the next material of each component in reaction to a reception of a `m` key `make code`. This allows for the blinking of materials if the user keeps pressing the key, which we found quite fun.

Aside from this, we are confident that every detail is implemented smoothly.

#### Textures
The textures were broadly used across the scene to demonstrate its usage. `none` and `inherit` are implemented as required, as well as the scaling for quadric primitives.

#### Lights
We are satisfied with the lighting of our scene. We pointed two spotlights, to the dinner table and the sofa, a main strong omniscient light and a softer center, and one omniscient light for each lamp.

> We have made corrections to the original lights parsing code: we added attenuation, fixed the enabled lookup, calculated the direction from the target (for spotlights) and cleaned up the code.

#### 2D Interface
Our interface attempts to demonstrate the features of the project, so we allow, in a `Debug` folder, to toggle the visibility of development elements such as the axis, the lights location and the normals. Besides this, all lights are toggable individually, and the camera is changeable through a dropdown.


### Scene description
The scene represents a comfortable living room with a small donut on the dinner table and a modern center table, a sofa to watch TV and several lamps around the room to allow night entertainment. Two art paintings are present in the living room walls to give some life and colors to the scene.

Check out our scene: [here](https://paginas.fe.up.pt/~up201905951/sgi/tp1/)


----
## Issues/Problems

No problems were found.
