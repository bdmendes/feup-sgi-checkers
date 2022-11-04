#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform sampler2D uSampler1;

uniform float scale;

void main() {
    vec3 positionOffset = aVertexPosition * scale;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + positionOffset, 1.0);

	vTextureCoord = aTextureCoord;
}
