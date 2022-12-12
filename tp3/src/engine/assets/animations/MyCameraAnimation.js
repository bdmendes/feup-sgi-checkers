import { CGFcamera } from '../../../../../lib/CGF.js';
import { XMLscene } from '../../XMLscene.js';
import { GraphKeyframe } from './GraphKeyframe.js';
import { MyAnimation } from './MyAnimation.js';
import { degreesToRadians } from '../../../engine/utils/math.js';
import { BLACK, WHITE } from '../../../game/Game.js';

const CAMERA_P1 = [3, 6.5, -4.5];
const CAMERA_P2 = [3, 6.5, -9.5];
const CAMERA_TO_BOARD = [3, 3.3, -7];

/**
 * @export
 * @class MyKeyframeAnimation
 * @extends {MyAnimation}
 */
export class MyCameraAnimation extends MyAnimation {
    /**
     * Creates an instance of MyKeyframeAnimation.
     * @param {XMLscene} scene 
     */
    constructor(scene, id, camera, turn) {
        super(id);
        this.scene = scene;
        this.camera = camera;
        this.turn = turn;
        this.firstUpdate = true;
        this.initialTime = 0;
        this.lastUpdate = false;
        this.finalTime = 0;
    }

    /**
     * Update animation matrix for the current frame
     * @param {*} t
     * @memberof MyKeyframeAnimation
     */
    update(t) {
        let from = (this.turn == BLACK) ? CAMERA_P1 : CAMERA_P2;

        if (this.firstUpdate) {
            this.initialTime = t + 1;
            this.finalTime = t + 2;
            this.firstUpdate = false;
        }

        if (t < this.initialTime) { return; }
        if (t > this.finalTime) {
            if (!this.lastUpdate) {
                this.camera = new CGFcamera(this.camera.fov, this.camera.near, this.camera.far,
                    vec3.fromValues(from[0], from[1], from[2]), vec3.fromValues(CAMERA_TO_BOARD[0], CAMERA_TO_BOARD[1], CAMERA_TO_BOARD[2]));
                this.lastUpdate = true;
                this.scene.graph.cameraAnimations = null;
            }
            return;
        }

        if (this.turn == BLACK) {
            this.camera = new CGFcamera(this.camera.fov, this.camera.near, this.camera.far,
                vec3.fromValues(from[0], from[1], from[2] - 5 * (this.finalTime - t)), vec3.fromValues(CAMERA_TO_BOARD[0], CAMERA_TO_BOARD[1], CAMERA_TO_BOARD[2]));
        } else {
            this.camera = new CGFcamera(this.camera.fov, this.camera.near, this.camera.far,
                vec3.fromValues(from[0], from[1], from[2] + 5 * (this.finalTime - t)), vec3.fromValues(CAMERA_TO_BOARD[0], CAMERA_TO_BOARD[1], CAMERA_TO_BOARD[2]));
        }
        return;
    }

    /**
     * Apply the animation matrix to the scene
     * @memberof MyKeyframeAnimation
     */
    apply() {
        this.scene.camera = this.camera;
        this.scene.interface.setActiveCamera(this.camera);
    }
}