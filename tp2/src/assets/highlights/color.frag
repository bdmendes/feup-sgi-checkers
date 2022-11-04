#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

struct lightProperties {
    vec4 position;          
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec3 spot_direction;
    float spot_exponent;
    float spot_cutoff;
    float constant_attenuation;
    float linear_attenuation;
    float quadratic_attenuation;
    bool enabled;
};

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];


void main() {
    vec2 bTextureCoord = vTextureCoord;

    vec4 color = texture2D(uSampler, bTextureCoord);

    gl_FragColor = color;
}
