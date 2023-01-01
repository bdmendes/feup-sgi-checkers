const BOARD_POSITION_SIZE = 0.4;
const GAME_SPOTLIGHT_ID = "gameSpotlight";

export class LightController {
    constructor(scene) {
        this.scene = scene;
        this.initialLightPosition = null;
        this.disableUpdate = null;
    }

    hookSpotlight() {
        this.disableUpdate = true;
        this.initialLightPosition = this.scene.lights[this._getIndexFromKey(GAME_SPOTLIGHT_ID)].position;
        this.scene.lights[this._getIndexFromKey(GAME_SPOTLIGHT_ID)].disable();
    }

    enableSpotlight(piece) {
        this.disableUpdate = true;
        this.scene.graph.enabledLights[GAME_SPOTLIGHT_ID] = true;
        this.scene.graph.lights[GAME_SPOTLIGHT_ID][0] = true;

        const key = this._getIndexFromKey(GAME_SPOTLIGHT_ID);

        this.scene.lights[key].position = [
            this.initialLightPosition[0] + piece.position[1] * BOARD_POSITION_SIZE,
            this.initialLightPosition[1],
            this.initialLightPosition[2] + piece.position[0] * BOARD_POSITION_SIZE,
            1];
        this.scene.lights[key].enable();
        this.disableUpdate = false;
    }

    disableSpotlight() {
        this.disableUpdate = true;
        this.scene.graph.enabledLights[GAME_SPOTLIGHT_ID] = false;
        this.scene.graph.lights[GAME_SPOTLIGHT_ID][0] = false;
        this.scene.lights[this._getIndexFromKey(GAME_SPOTLIGHT_ID)].disable();
    }

    updateSpotlight(position) {
        if (this.disableUpdate) {
            return;
        }

        this.scene.lights[this._getIndexFromKey(GAME_SPOTLIGHT_ID)].position = [
            this.initialLightPosition[0] + position[1] * BOARD_POSITION_SIZE,
            this.initialLightPosition[1],
            this.initialLightPosition[2] + position[0] * BOARD_POSITION_SIZE,
            1];
    }

    _getIndexFromKey(key) {
        let i = 0;
        for (const k in this.scene.graph.lights) {
            if (k === key) return i;
            i++;
        }
        return -1;
    }
}
