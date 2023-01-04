#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 black = vec4(0.0, 0.0, 0.0, 1.0);

	if (color.a < 0.4)
		discard;
	else if (color.a < 0.8)
		gl_FragColor = mix(white, black, 0.9);
	else
		gl_FragColor = mix(white, black, 0.25);
}
