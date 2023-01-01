import { CGFcamera } from "../../../../lib/CGF.js";
import { BLACK, WHITE } from "../model/Game.js";
import { MyCameraAnimation } from "../view/animations/MyCameraAnimation.js";

const GAME_CAMERA_ID = "gameCamera";

export class CameraController {
    constructor(gameController) {
        this.gameController = gameController;

        // Per graph values
        this.cameraTarget = {};
        this.cameraBlackPosition = {};
        this.cameraWhitePosition = {};
        this.facingPlayer = {};
    }

    hookSceneCamera() {
        const graph = this.gameController.scene.graph.filename;

        // Do not hook camera if it's already hooked; else maintain position
        if (!(graph in this.facingPlayer)) {
            this.cameraTarget[graph] = vec3.fromValues(this.gameController.scene.graph.cameras[GAME_CAMERA_ID].target[0],
                this.gameController.scene.graph.cameras[GAME_CAMERA_ID].target[1], this.gameController.scene.graph.cameras[GAME_CAMERA_ID].target[2]);
            this.cameraBlackPosition[graph] = vec3.fromValues(...this.gameController.scene.graph.cameras[GAME_CAMERA_ID].position);
            this.cameraWhitePosition[graph] = vec3.fromValues(this.cameraBlackPosition[graph][0], this.cameraBlackPosition[graph][1],
                this.cameraBlackPosition[graph][2] + 2 * (this.cameraTarget[graph][2] - this.cameraBlackPosition[graph][2]));
            this.facingPlayer[graph] = BLACK;
        } else {
            this.setGameCamera(this.facingPlayer[graph]);
        }
    }

    setGameCamera(player, updateButtons = true) {
        const graph = this.gameController.scene.graph.filename;
        const camera = new CGFcamera(this.gameController.scene.camera.fov,
            this.gameController.scene.camera.near, this.gameController.scene.camera.far,
            player === BLACK ? this.cameraBlackPosition[graph] : this.cameraWhitePosition[graph], this.cameraTarget[graph]);

        // Set active camera
        this.gameController.scene.graph.selectedCameraID = GAME_CAMERA_ID;
        this.gameController.scene.graph.cameras[GAME_CAMERA_ID] = camera;
        this.gameController.scene.camera = this.gameController.scene.graph.cameras[GAME_CAMERA_ID];
        this.gameController.scene.interface.setActiveCamera(this.gameController.scene.camera);
        this.facingPlayer[this.gameController.scene.graph.filename] = player;

        // Update buttons visibility
        if (updateButtons) {
            this.gameController.state.updateButtonsVisibility(player);
        }
    }

    switchCamera(isCapture = false, isMove = false) {
        const graph = this.gameController.scene.graph.filename;
        const player = this.facingPlayer[graph];

        // Put the camera in the right position for rotating
        this.setGameCamera(player ?? BLACK, false);

        // Inject camera animation
        const cameraAnimation = new MyCameraAnimation(this.gameController.scene,
            this.gameController.scene.graph.selectedCameraID, this.gameController.scene.camera, isCapture, isMove);
        this.gameController.scene.graph.animations[this.gameController.scene.graph.selectedCameraID] = cameraAnimation;
        const newPlayer = player === WHITE ? BLACK : WHITE;
        this.facingPlayer[graph] = newPlayer;
        this.gameController.state.updateButtonsVisibility(newPlayer);
    }
}
