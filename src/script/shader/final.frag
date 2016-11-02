#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

// ------

precision highp float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;

float gray( vec3 _c ) {
  return _c.x * 0.299 + _c.y * 0.587 + _c.z * 0.114;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  vec3 col = texture2D( texture, uv ).xyz;

  float len = length( gl_FragCoord.xy - resolution / 2.0 ) / resolution.x * sqrt( 2.0 );
  vec3 vig = mix(
    col,
    gray( col ) * vec3( 0.4, 0.45, 0.5 ),
    len * 0.6
  );

  vec3 gamma = pow( vig, vec3( 1.0 / 1.0 ) );

  gl_FragColor = vec4( gamma, 1.0 );
}
