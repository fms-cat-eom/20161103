precision highp float;

uniform bool init;
uniform float add;
uniform vec2 resolution;
uniform sampler2D textureAdd;
uniform sampler2D textureBase;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 ret = texture2D( textureAdd, uv ).xyz * add;
  if ( !init ) {
    ret += texture2D( textureBase, uv ).xyz;
  }
  gl_FragColor = vec4( ret, 1.0 );
}
