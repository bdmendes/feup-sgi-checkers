import { CGFcamera } from "../../../../lib/CGF.js";
import { BLACK, WHITE } from "../model/Game.js";

const GAME_CAMERA_ID = "gameCamera";

export class CameraController {
    constructor(gameController) {
        this.gameController = gameController;
        this.cameraAnimation = 0;
        this.cameraTarget = null;
        this.cameraBlackPosition = null;
        this.cameraWhitePosition = null;
    }

    hookSceneCamera() {
        this.cameraTarget = vec3.fromValues(this.gameController.scene.graph.cameras["gameCamera"].target[0],
            this.gameController.scene.graph.cameras["gameCamera"].target[1], this.gameController.scene.graph.cameras["gameCamera"].target[2]);
        this.cameraBlackPosition = vec3.fromValues(...this.gameController.scene.graph.cameras["gameCamera"].position);
        this.cameraWhitePosition = vec3.fromValues(this.cameraBlackPosition[0], this.cameraBlackPosition[1],
            this.cameraBlackPosition[2] + 2 * (this.cameraTarget[2] - this.cameraBlackPosition[2]));
    }

    setGameCamera(player) {
        const camera = new CGFcamera(this.gameController.scene.camera.fov, this.gameController.scene.camera.near,
            this.gameController.scene.camera.far, player === BLACK ? this.cameraBlackPosition : this.cameraWhitePosition, this.cameraTarget);

        this.gameController.scene.graph.selectedCameraID = GAME_CAMERA_ID;
        this.gameController.scene.graph.cameras[GAME_CAMERA_ID] = camera;
        this.gameController.scene.camera = this.gameController.scene.graph.cameras[GAME_CAMERA_ID];
        this.gameController.scene.interface.setActiveCamera(this.gameController.scene.camera);
    }

    switchCamera() {
        if (this.cameraAnimation++ % 2 == 0) {
            this.setGameCamera(this.gameController.game.currentPlayer);
        } else {
            this.setGameCamera(this.gameController.game.currentPlayer == BLACK ? WHITE : BLACK);
        }

        this.gameController.animationController.injectCameraAnimation(false, false);
    }
}
