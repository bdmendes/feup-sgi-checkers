import { GraphKeyframe } from '../../../engine/assets/animations/GraphKeyframe.js';
import { MyAnimation } from '../../../engine/assets/animations/MyAnimation.js';
import { MyKeyframeAnimation } from '../../../engine/assets/animations/MyKeyframeAnimation.js';
import { distanceBetweenPoints } from "../../../engine/utils/math.js"

export const MY_PIECE_ANIMATION_TIME = 0.8;
const PIECE_HEIGHT = 0.25;
const BLACK_KING_TEXTURE = 'blackPieceKingTexture';
const WHITE_KING_TEXTURE = 'whitePieceKingTexture';

/**
 * @export
 * @class MyPieceAnimation
 * @extends {MyAnimation}
 */
export class MyPieceAnimation extends MyKeyframeAnimation {
    /**
     * Creates an instance of MyKeyframeAnimation.
     */
    constructor(animationController, id, initialPos) {
        super(animationController.scene, id);
        this.animationController = animationController;

        this.initialPos = initialPos;
        this.currentTime = 0;
        this.startTime = -1;

        this._addInitialKeyframe();

        this.isVisible = true;
        this.pendingKeyframes = [];
        this.capturedPieces = [];

        this.finalUpdate = false;
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

    addMidKeyframe(initialPos, finalPos, isJump, toKing, capturedPieces = []) {
        this.capturedPieces.push(...capturedPieces);
        const lastKeyFrame = this.keyframes[this.keyframes.length - 1];

        const keyframe = new GraphKeyframe(this.scene, -1);
        keyframe.isJump = isJump;
        keyframe.toKing = toKing;
        keyframe.transformation = {
            rotateX: 0, rotateY: 0, rotateZ: 0,
            translationCoords: [
                finalPos[1] - initialPos[1] + lastKeyFrame.transformation.translationCoords[0],
                (finalPos.length == 2) ? 0 : (finalPos[2] * PIECE_HEIGHT),
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
            super.lastUpdate = this.finalUpdate = false;
        }

        super.update(t, false);

        if (this.finalUpdate) {
            return;
        }

        if (this.lastUpdate) {
            if (this.nextKeyFrame.toKing && this.scene.graph.components[this.id].tempTextureID == null) {
                this.scene.graph.components[this.id].tempTextureID = this.id.includes('black') ? BLACK_KING_TEXTURE : WHITE_KING_TEXTURE;
            }
            this.capturedPieces = [];
            this.finalUpdate = true;
            if (!this.nextKeyFrame.isJump) {
                this.animationController.gameController.lightController.disableSpotlight();
            }
            return;
        }

        if (this.nextKeyFrame.isJump) {
            this._handleCaptureAnimation(t);
        } else {
            const currentPosition = [this.initialPos[0] + this.matrix[14], this.initialPos[1] + this.matrix[12]];
            this._checkColision(currentPosition);
            this.animationController.gameController.lightController.updateSpotlight(currentPosition);
        }
    }

    _handleCaptureAnimation(t) {
        const timePercentage = (t - this.lastKeyframe.instant) / MY_PIECE_ANIMATION_TIME;

        // reset y
        this.matrix[13] = 0;
        const y_offset = this.nextKeyFrame.transformation.translationCoords[1] * timePercentage;
        this.matrix = mat4.translate(this.matrix, this.matrix, [0, this._calculateY(timePercentage) + y_offset, 0]);
    }

    _calculateY(timePercentage) {
        return -(Math.pow(timePercentage * 4 - 2, 2)) + 4
    }

    _checkColision(currentPosition) {
        for (let i = 0; i < this.capturedPieces.length; i++) {
            if (this._isCollision(this.capturedPieces[i].position, currentPosition)) {
                if (!this.capturedPieces[i].isCaptured) {
                    this.animationController.injectCaptureAnimation(this.capturedPieces[i]);
                }
            }
        }
    }

    _isCollision(p1, p2) {
        return distanceBetweenPoints(p1[0], p1[1], p2[0], p2[1]) < 1;
    }
}
