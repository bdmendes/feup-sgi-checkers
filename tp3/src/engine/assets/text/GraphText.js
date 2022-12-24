import { CGFtexture, CGFappearance } from "../../../../../lib/CGF.js";
import { MyRectangle } from "../primitives/MyRectangle.js";

/**
 * @export
 * @class GraphText: a white text that can be rendered in the scene
 */
export class GraphText {
    /**
     * @param {CGFscene} scene
     * @param {string} text String to be displayed
     * @param {number} xOffset x offset of the text relative to the current position
     * @param {number} yOffset y offset of the text relative to the current position
     * @param {number} scale Scale of the text
     * @param {string} fontTexturePath Path to the font texture
     *
     */
    constructor(scene, text, xOffset, yOffset, zOffset,
        scaleX = 1, scaleY = 1, forceFront = false,
        fontTexturePath = "src/engine/assets/text/oolite-font.trans.png") {
        this.scene = scene;
        this.text = text;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.zOffset = zOffset;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.forceFront = forceFront;
        this.fontTexture = new CGFtexture(scene, fontTexturePath);
        this.fontMaterial = new CGFappearance(scene);
        this.fontMaterial.setTexture(this.fontTexture);
        this.quad = new MyRectangle(scene, null, -0.5, 0.5, -0.5, 0.5);
    }

    draw(previousMaterial) {
        // Save the current shader
        const currentShader = this.scene.activeShader;

        // Switch to the text shader
        this.scene.setActiveShaderSimple(this.scene.textShader);

        // Set the font material
        this.fontMaterial.apply();

        // Disable depth test so that it is always in front
        if (this.forceFront) {
            this.scene.gl.disable(this.scene.gl.DEPTH_TEST);
        }

        // Draw the text
        this.scene.pushMatrix();
        this._drawText();
        this.scene.popMatrix();

        // Reeenable depth test
        if (this.forceFront) {
            this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
        }

        // Restore the previous material
        if (previousMaterial != null) {
            previousMaterial.apply();
        }

        // Switch back to the previous shader
        this.scene.setActiveShaderSimple(currentShader);
    }

    _drawText() {
        this.scene.translate(this.xOffset, this.yOffset, this.zOffset);
        this.scene.scale(this.scaleX, this.scaleY, 1);

        for (const char of this.text) {
            const charCood = this._charCoord(char);
            this.scene.textShader.setUniformsValues({ 'charCoords': charCood });
            this.quad.display();
            this.scene.translate(1, 0, 0);
        }
    }

    _charCoord(char) {
        const width = 16;
        const startPosition = [0, 2]; // The first relevant character is a space
        const charPosition = char.charCodeAt(0) - 32; // Offset to the Space character ASCII code
        const x = startPosition[0] + charPosition % width;
        const y = startPosition[1] + Math.floor(charPosition / width);
        return [x, y];
    }
}