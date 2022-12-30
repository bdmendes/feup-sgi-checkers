const BOARD_POSITION_SIZE = 0.4;

export class LightController {
    constructor(scene) {
        this.scene = scene;
        this.key = null;
        this.initialLightPosition = null;
    }

    getIndexFromKey(key) {
        let i = 0;
        for (const k in this.scene.graph.lights) {
            if (k === key) return i;
            i++;
        }
        return -1;
    }

    setSpotlight(key = 'gameSpotlight') {
        this.key = key;
        this.initialLightPosition = this.scene.lights[this.getIndexFromKey(this.key)].position;
    }

    enableSpotlight(piece) {
        this.scene.graph.enabledLights[this.key] = true;
        this.scene.graph.lights[this.key][0] = true;
        this.scene.lights[this.getIndexFromKey(this.key)].position = [
            this.initialLightPosition[0] + piece.position[1] * BOARD_POSITION_SIZE,
            this.initialLightPosition[1],
            this.initialLightPosition[2] + piece.position[0] * BOARD_POSITION_SIZE,
            1];
        this.scene.lights[this.getIndexFromKey(this.key)].enable();
    }

    disableSpotlight() {
        this.scene.graph.enabledLights[this.key] = false;
        this.scene.graph.lights[this.key][0] = false;
        this.scene.lights[this.getIndexFromKey(this.key)].disable();
    }

    updateSpotlight(position) {
        this.scene.lights[this.getIndexFromKey(this.key)].position = [
            this.initialLightPosition[0] + position[1] * BOARD_POSITION_SIZE,
            this.initialLightPosition[1],
            this.initialLightPosition[2] + position[0] * BOARD_POSITION_SIZE,
            1];
    }
}