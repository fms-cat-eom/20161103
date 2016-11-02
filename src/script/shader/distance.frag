#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

precision highp float;

uniform vec2 resolution;
uniform bool isVert;
uniform sampler2D texture;

bool isSameSide( float _col, bool _inside ) {
  return ( _col < 0.0 ) == _inside;
}

float getDist( vec4 _i ) {
  return isVert ? ( _i.x - _i.y ) * 255.0 : ( _i.w < 0.5 ? 1E3 : -1E3 );
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 gap = isVert ? V.xy : V.yx;

  float dist = getDist( texture2D( texture, p / resolution ) );
  bool inside = isSameSide( dist, true );

  dist = abs( dist );

  for ( int iLoop = 1; iLoop < 256; iLoop ++ ) {
    float i = float( iLoop );
    if ( dist < i ) { break; }

    for ( int iiLoop = -1; iiLoop < 2; iiLoop += 2 ) {
      float ii = float( iiLoop );
      vec2 tCoord = p + ii * i * gap;
      if ( 0.0 <= tCoord.x && tCoord.x < resolution.x && 0.0 <= tCoord.y && tCoord.y < resolution.y ) {
        float col = getDist( texture2D( texture, tCoord / resolution ) );
        dist = min(
          dist,
          length( vec2( i, isSameSide( col, inside ) ? col : 0.0 ) )
        );
      }
    }
  }

  dist = inside ? -dist : dist;
  gl_FragColor = vec4( max( 0.0, dist ) / 255.0, -min( dist, 0.0 ) / 255.0, 0.0, 1.0 );
}
