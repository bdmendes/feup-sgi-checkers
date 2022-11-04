export class GraphHighlight {
    constructor(scene, color, scaleH) {
        this.scene = scene;
        this.color = color;
        this.scaleH = scaleH;
        this.currentScale = scaleH;
    }

    updateCurrentScale(t) {
        t = t % this.scene.graph.highlightPulseDuration;
        if (t == 0) {
            t = 0.0001;
        }
        const ratio = Math.sin(Math.PI * (t / this.scene.graph.highlightPulseDuration));
        this.currentScale = (this.scaleH - 1.0) * ratio;
        console.log(this.currentScale);
    }
}