/*
    A simplified version of the Gouraud shading algorithm of the WebCGF.
    Adapted from lib/CGF/shaders/multiple_light-vertex.glsl
*/

#ifdef GL_ES
precision highp float;
#endif

struct lightProperties {
  vec4 position; // Default: (0, 0, 1, 0)
  vec4 ambient;  // Default: (0, 0, 0, 1)
  vec4 diffuse;  // Default: (0, 0, 0, 1)
  vec4 specular; // Default: (0, 0, 0, 1)
  vec4 half_vector;
  vec3 spot_direction;         // Default: (0, 0, -1)
  float spot_exponent;         // Default: 0 (possible values [0, 128]
  float spot_cutoff;           // Default: 180 (possible values [0, 90] or 180)
  float constant_attenuation;  // Default: 1 (value must be >= 0)
  float linear_attenuation;    // Default: 0 (value must be >= 0)
  float quadratic_attenuation; // Default: 0 (value must be >= 0)
  bool enabled;                // Default: false
};

struct materialProperties {
  vec4 ambient;    // Default: (0, 0, 0, 1)
  vec4 diffuse;    // Default: (0, 0, 0, 1)
  vec4 specular;   // Default: (0, 0, 0, 1)
  vec4 emission;   // Default: (0, 0, 0, 1)
  float shininess; // Default: 0 (possible values [0, 128])
};

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;
varying vec4 vLighting;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

#define NUMBER_OF_LIGHTS 8

uniform vec4 uGlobalAmbient;

uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform materialProperties uFrontMaterial;

uniform float scale;

vec4 lighting(vec4 vertex, vec3 E, vec3 N) {
  vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

  for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {
    if (uLight[i].enabled) {

      float att = 1.0;
      float spot_effect = 1.0;
      vec3 L = vec3(0.0);

      if (uLight[i].position.w == 1.0) {
        L = (uLight[i].position - vertex).xyz;
        float dist = length(L);
        L = normalize(L);

        if (uLight[i].spot_cutoff != 180.0) {
          vec3 sd = normalize(vec3(uLight[i].spot_direction));
          float cos_cur_angle = dot(sd, -L);
          float cos_inner_cone_angle =
              cos(radians(clamp(uLight[i].spot_cutoff, 0.0, 89.0)));

          spot_effect =
              pow(clamp(cos_cur_angle / cos_inner_cone_angle, 0.0, 1.0),
                  clamp(uLight[i].spot_exponent, 0.0, 128.0));
        }

        att = 1.0 / (uLight[i].constant_attenuation +
                     uLight[i].linear_attenuation * dist +
                     uLight[i].quadratic_attenuation * dist * dist);

      } else {
        L = normalize(uLight[i].position.xyz);
      }

      float lambertTerm = max(dot(N, L), 0.0);
      vec4 Ia = uLight[i].ambient * uFrontMaterial.ambient;
      vec4 Id = uLight[i].diffuse * uFrontMaterial.diffuse * lambertTerm;

      if (uLight[i].position.w == 1.0)
        result += att * max(spot_effect * (Id), Ia);
      else
        result += att * spot_effect * (Ia + Id);
    }
  }

  result += uGlobalAmbient * uFrontMaterial.ambient + uFrontMaterial.emission;
  result = clamp(result, vec4(0.0), vec4(1.0));

  return result;
}

/**
* Calculates lighting at the position to be used by the fragment shader.
* Offsets the vertex position according to a scale factor, to give it a appearance.
*/
void main() {
  // Transformed Vertex position
  vec3 scaledVertex = aVertexPosition * scale + aVertexPosition;
  vec4 vertex = uMVMatrix * vec4(scaledVertex, 1.0);

  // Transformed normal position
  vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));

  vec3 eyeVec = -vec3(vertex.xyz);
  vec3 E = normalize(eyeVec);

  vLighting = lighting(vertex, E, N);

  gl_Position = uPMatrix * vertex;
  vTextureCoord = aTextureCoord;
}
