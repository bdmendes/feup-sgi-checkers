import { CGFcamera } from '../../../../../lib/CGF.js';
import { MyAnimation } from '../../../engine/assets/animations/MyAnimation.js';
import { MY_PIECE_ANIMATION_TIME } from './MyPieceAnimation.js';

// stretch_factor = 1 => perfect circle
const CAMERA_STRETCH_FACTOR = 1.5;
export const CAMERA_ANIMATION_TIME = 1;

/**
 * @export
 * @class MyKeyframeAnimation
 * @extends {MyAnimation}
 */
export class MyCameraAnimation extends MyAnimation {
    /**
     * Creates an instance of MyKeyframeAnimation.
     * @param scene 
     */
    constructor(scene, id, camera, isCapture = false, isMove = true) {
        super(id);
        this.scene = scene;
        this.initialCamera = camera;
        this.camera = camera;
        this.isMove = isMove;

        this.initialTime = isCapture ? 0.5 : 0;
        this.finalTime = 0;
        this.radius = Math.abs(this.camera.position[2] - this.camera.target[2]);

        this.firstUpdate = false;
    }

    /**
     * Update animation matrix for the current frame
     * @param {*} t
     * @memberof MyKeyframeAnimation
     */
    update(t) {
        if (!this.firstUpdate) {
            this.initialTime += t + ((this.isMove) ? MY_PIECE_ANIMATION_TIME : 0);
            this.finalTime = this.initialTime + CAMERA_ANIMATION_TIME;
            this.firstUpdate = true;
        }

        if (t < this.initialTime) { return; }

        if (t > this.finalTime) {
            this._setNewCameraPosition(this._calculateCameraPosition(1))
            this.apply();
            delete this.scene.graph.animations[this.id];
            return;
        }

        this._setNewCameraPosition(this._calculateCameraPosition((CAMERA_ANIMATION_TIME - (this.finalTime - t)) / CAMERA_ANIMATION_TIME));
        this.apply();
    }

    /**
     * Apply the animation matrix to the scene
     * @memberof MyKeyframeAnimation
     */
    apply() {
        this.scene.camera = this.camera;
        this.scene.interface.setActiveCamera(this.camera);
    }

    _calculateCameraPosition(partial_time) {
        let angle = partial_time * Math.PI;
        return [
            (this.initialCamera.position[0] > this.initialCamera.target[0]) ?
                this.initialCamera.position[0] - CAMERA_STRETCH_FACTOR * this.radius * Math.sin(angle) :
                this.initialCamera.position[0] + CAMERA_STRETCH_FACTOR * this.radius * Math.sin(angle),
            this.initialCamera.position[1],
            (this.initialCamera.position[2] > this.initialCamera.target[2]) ?
                this.initialCamera.position[2] - 2 * this.radius * partial_time :
                this.initialCamera.position[2] + 2 * this.radius * partial_time
        ];
    }

    _setNewCameraPosition(position) {
        this.camera = new CGFcamera(this.camera.fov, this.camera.near, this.camera.far,
            vec3.fromValues(position[0], position[1], position[2]), this.camera.target);
    }
}