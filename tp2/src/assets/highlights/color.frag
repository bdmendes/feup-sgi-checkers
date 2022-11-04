#ifdef GL_ES
precision highp float;
#endif

varying highp vec2 vTextureCoord;
varying highp vec4 vLighting;

uniform sampler2D uSampler;

uniform float ratio;
uniform float r;
uniform float g;
uniform float b;

void main() {
  vec4 textureColor = texture2D(uSampler, vTextureCoord) * vLighting;
  vec4 highlightColor = vec4(r, g, b, 1.0);
  gl_FragColor =
      vec4(mix(textureColor.rgb, highlightColor.rgb, ratio), textureColor.a);
}
