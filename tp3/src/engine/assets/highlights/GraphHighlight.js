/**
 * @export
 * @class GraphHighlight:
 */
export class GraphHighlight {

    /**
     * Creates an instance of GraphHighlight.
     * @param {CGFscene} scene 
     * @param {*} color 
     * @param {*} scaleH 
     */
    constructor(scene, color, scaleH) {
        this.scene = scene;
        this.color = color;
        this.scaleH = scaleH;
        this.currentScale = scaleH;
        this.ratio = 0;
    }

    /**
     * Update values that shall be used in the shader for the current frame
     * @param {number} t 
     */
    updateInstant(t) {
        t = t % this.scene.graph.highlightPulseDuration;
        if (t == 0) {
            t = 0.0001;
        }
        this.ratio = Math.sin(Math.PI * (t / this.scene.graph.highlightPulseDuration));
        this.currentScale = (this.scaleH - 1.0) * this.ratio;
    }
}
