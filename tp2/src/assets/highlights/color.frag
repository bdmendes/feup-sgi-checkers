#ifdef GL_ES
precision highp float;
#endif

varying highp vec2 vTextureCoord;
varying highp vec4 vLighting;

uniform sampler2D uSampler;

void main() {
  vec4 scaleColor = texture2D(uSampler, vTextureCoord);
  gl_FragColor = scaleColor * vLighting;
}
