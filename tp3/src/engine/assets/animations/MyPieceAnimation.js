import { XMLscene } from '../../XMLscene.js';
import { GraphKeyframe } from './GraphKeyframe.js';
import { MyAnimation } from './MyAnimation.js';
import { MyKeyframeAnimation } from './MyKeyframeAnimation.js';
import { distanceBetweenPoints } from "../../utils/math.js"

export const MY_PIECE_ANIMATION_TIME = 1;

/**
 * @export
 * @class MyPieceAnimation
 * @extends {MyAnimation}
 */
export class MyPieceAnimation extends MyKeyframeAnimation {
    /**
     * Creates an instance of MyKeyframeAnimation.
     * @param {XMLscene} scene 
     */
    constructor(animationController, id, initialPos, isCaptured = false) {
        super(animationController.scene, id);
        this.animationController = animationController;

        this.initialPos = initialPos;
        this.isCaptured = isCaptured;
        this.currentTime = 0;
        this.startTime = -1;

        this._addInitialKeyframe();

        this.isVisible = true;
        this.pendingKeyframes = [];
        this.capturedPieces = [];
    }

    setIsCaptured(isCaptured) {
        this.isCaptured = isCaptured;
    }

    _addInitialKeyframe() {
        const initialKeyframe = new GraphKeyframe(this.scene, 0);
        initialKeyframe.transformation = {
            rotateX: 0, rotateY: 0, rotateZ: 0,
            translationCoords: [0, 0, 0],
            scaleCoords: [1, 1, 1]
        }
        this.addKeyframe(initialKeyframe);
    }

    addMidKeyframe(initialPos, finalPos, capturedPieces = []) {
        this.capturedPieces.push(...capturedPieces);
        let lastKeyFrame = this.keyframes[this.keyframes.length - 1];

        const keyframe = new GraphKeyframe(this.scene, -1);
        keyframe.transformation = {
            rotateX: 0, rotateY: 0, rotateZ: 0,
            translationCoords: [
                finalPos[1] - initialPos[1] + lastKeyFrame.transformation.translationCoords[0],
                0,
                finalPos[0] - initialPos[0] + lastKeyFrame.transformation.translationCoords[2]
            ],
            scaleCoords: [1, 1, 1]
        };
        this.pendingKeyframes.push(keyframe);
    }

    /**
     * Update animation matrix for the current frame
     * @param {*} t
     * @memberof MyKeyframeAnimation
     */
    update(t) {
        if (this.pendingKeyframes.length > 0) {
            this.pendingKeyframes[0].instant = t + MY_PIECE_ANIMATION_TIME;
            this.keyframes[this.keyframes.length - 1].instant = t;
            this.addKeyframe(this.pendingKeyframes[0]);
            this.pendingKeyframes.pop();
            this.lastUpdate = false;
        }

        super.update(t);

        if (!this.lastUpdate) {
            if (this.isCaptured) {
                this._handleCaptureAnimation(t);
            } else {
                this._checkColision();
            }
        }
    }

    _handleCaptureAnimation(t) {
        let timePercentage = (t - this.lastKeyframe.instant) / MY_PIECE_ANIMATION_TIME;
        // reset y
        // need to implement stack logic
        this.matrix[13] = 0;
        this.matrix = mat4.translate(this.matrix, this.matrix, [0, this._calculateY(timePercentage), 0]);
    }

    _calculateY(timePercentage) {
        return -(Math.pow(timePercentage * 4 - 2, 2)) + 4
    }

    _checkColision() {
        let currentPosition = [this.initialPos[0] + this.matrix[14], this.initialPos[1] + this.matrix[12]];

        for (let i = 0; i < this.capturedPieces.length; i++) {
            if (this._isCollision(this.capturedPieces[i].getPosition(), currentPosition)) {
                if (!this.capturedPieces[i].IsCaptured()) {
                    this.animationController.injectCaptureAnimation(this.capturedPieces[i]);
                }
            }
        }
    }

    _isCollision(p1, p2) {
        return distanceBetweenPoints(p1[0], p1[1], p2[0], p2[1]) < 0.8;
    }
}