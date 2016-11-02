#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)
#define PI 3.14159265
#define SAMPLES 40

// ------

precision highp float;

uniform vec2 resolution;
uniform bool isVert;
uniform sampler2D texture;
uniform sampler2D textureBase;

uniform float gaussVar;

float gaussian( float _x, float _v ) {
  return 1.0 / sqrt( 2.0 * PI * _v ) * exp( - _x * _x / 2.0 / _v );
}

float smin( float _a, float _b, float _k ) {
  float h = clamp( 0.5 + 0.5 * ( _b - _a ) / _k, 0.0, 1.0 );
  return mix( _b, _a, h ) - _k * h * ( 1.0 - h );
}

float smax( float _a, float _b, float _k ) {
  return -smin( -_a, -_b, _k );
}

vec3 preBloom( vec3 _col ) {
  return pow( vec3(
    smax( 0.0, _col.x - 0.5, 0.1 ),
    smax( 0.0, _col.y - 0.5, 0.1 ),
    smax( 0.0, _col.z - 0.5, 0.1 )
  ), 0.5 * V.yyy );
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 bv = ( isVert ? vec2( 0.0, 1.0 ) : vec2( 1.0, 0.0 ) ) / resolution;

  vec3 sum = V.xxx;
  for ( int i = -SAMPLES; i <= SAMPLES; i ++ ) {
    vec2 v = saturate( uv + bv * float( i ) );
    vec3 tex = preBloom( texture2D( texture, v ).xyz );
    float mul = gaussian( float( i ), gaussVar );
    sum += tex * mul;
  }

  sum *= 0.3;

  if ( isVert ) {
    sum += texture2D( textureBase, uv ).xyz;
  }

  gl_FragColor = vec4( sum, 1.0 );
}
